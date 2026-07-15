import {getGitHubToken} from './github-token-updater';
import {getErrorMsgCard} from './error-card';
import {waitUntil} from '@vercel/functions';
import {sendAnalytics, resolveSource} from '../../src/utils/analytics';
import {CONST_CACHE_CONTROL} from '../../src/const/cache';
import {resolveThemeName, parseThemeColorOverride, ThemeColorOverride} from '../../src/const/theme';
import {parseAnimation, applyAnimation} from '../../src/utils/animation';
import type {VercelRequest, VercelResponse} from '@vercel/node';

// A card renderer receives the already-validated username, the resolved theme
// name, the parsed color override and a GitHub token, and returns the SVG.
export type CardRenderer = (
    username: string,
    theme: string,
    override: ThemeColorOverride,
    token: string
) => Promise<string>;

// Errors that mean "this token can't serve the request — try the next one":
// 401/403 (auth or REST primary rate limit), 429 (secondary rate limit), and
// GraphQL RATE_LIMITED (flagged by assertNoGraphQLErrors, which has no HTTP
// status). The previous 401/403-only check missed 429 and the GraphQL-200 case,
// so the multi-token rotation never engaged under real rate limits.
function isRotatableError(err: any): boolean {
    const status = err?.response?.status;
    return status === 401 || status === 403 || status === 429 || err?.isRateLimit === true;
}

// Map an internal error to a generic, user-facing message. The raw error (e.g.
// "API rate limit already exceeded for user ID 20241522") can leak the backing
// account/implementation, so it's logged server-side but never shown on the card
// — the card only ever shows one of these safe, actionable messages.
function safeErrorMessage(err: any): string {
    const raw = String(err?.message ?? '').toLowerCase();
    const status = err?.response?.status;
    // Rate limited: only on explicit evidence (429, our GraphQL isRateLimit flag, or
    // message text). Note 403 alone is NOT rate limiting — it's usually auth/permission.
    if (err?.isRateLimit === true || status === 429 || raw.includes('rate limit')) {
        return 'Cards are temporarily rate limited. Please try again in a few minutes.';
    }
    // Not found: explicit 404, or GitHub's "could not resolve to a User/Organization".
    if (status === 404 || raw.includes('could not resolve') || raw.includes('not found') || raw.includes('not exist')) {
        return 'Could not find that user or organization — please check the username.';
    }
    // Everything else (auth/permission incl. 401/403, token/config problems): stay
    // generic so we don't hint at the backing setup.
    return 'This card is temporarily unavailable. Please try again later.';
}

// Shared request handler for every card endpoint: validates username/theme,
// resolves the theme + color overrides, runs the renderer while rotating GitHub
// tokens on rate-limit/auth errors, sets headers, fires analytics, and renders a
// friendly error card on failure.
export async function handleCard(
    req: VercelRequest,
    res: VercelResponse,
    eventName: string,
    render: CardRenderer,
    extraAnalytics: Record<string, unknown> = {}
): Promise<void> {
    const {username, theme: rawTheme = 'default'} = req.query;
    if (typeof rawTheme !== 'string') {
        res.status(400).send('theme must be a string');
        return;
    }
    if (typeof username !== 'string') {
        res.status(400).send('username must be a string');
        return;
    }
    const theme = resolveThemeName(rawTheme);
    const override = parseThemeColorOverride(req.query);
    const animation = parseAnimation(req.query.animation);

    try {
        let tokenIndex = 0;
        let token = getGitHubToken(tokenIndex);
        // Rotate through the configured tokens until one succeeds or getGitHubToken
        // throws (no token at the next index).
        while (true) {
            try {
                const cardSVG = await render(username, theme, override, token);
                res.setHeader('Content-Type', 'image/svg+xml');
                res.setHeader('Cache-Control', CONST_CACHE_CONTROL);
                res.send(applyAnimation(cardSVG, animation, req.query.duration));
                // Don't block the response on analytics, but keep the invocation
                // alive until the GA call settles — a bare `void` promise gets
                // frozen with the lambda after res.send and aborts on the next
                // thaw. Tag the source (demo page vs README embed vs other) for
                // GA segmentation.
                const source = resolveSource(req.query.source, String(req.headers['user-agent'] ?? ''));
                waitUntil(sendAnalytics(eventName, {username, theme, source, ...extraAnalytics}, req.headers));
                return;
            } catch (err: any) {
                console.log(err.message);
                if (isRotatableError(err)) {
                    tokenIndex += 1;
                    token = getGitHubToken(tokenIndex);
                } else {
                    throw err;
                }
            }
        }
    } catch (err: any) {
        // Log the real error for debugging; show only a generic message to clients.
        // Log only a redacted summary — never the raw error object, which for axios
        // failures carries the request config/headers (incl. the Authorization token)
        // and response body.
        console.log(`card error [${eventName}] status=${err?.response?.status ?? 'n/a'}: ${err?.message ?? 'unknown'}`);
        res.setHeader('Content-Type', 'image/svg+xml');
        // Cache errors long enough that repeat views don't re-invoke the function
        // while we're rate limited (GitHub's GraphQL window is a full hour), but
        // short enough to recover promptly once the quota resets.
        res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
        res.send(getErrorMsgCard(safeErrorMessage(err), theme));
    }
}
