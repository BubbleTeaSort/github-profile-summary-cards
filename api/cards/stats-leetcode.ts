import { getLeetCodeStatsSVGWithThemeName } from '../../src/cards/stats-card-leetcode';
import { getErrorMsgCard } from '../utils/error-card';
import { sendAnalytics } from '../../src/utils/analytics';
import { CONST_CACHE_CONTROL } from '../../src/const/cache';
import { resolveThemeName, parseThemeColorOverride } from '../../src/const/theme';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {
    const { username, theme: rawTheme = 'default' } = req.query;

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

    try {
        const cardSVG = await getLeetCodeStatsSVGWithThemeName(username, theme, override);

        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', CONST_CACHE_CONTROL);
        res.send(cardSVG);

        void sendAnalytics('leetcode_stats_card', { username, theme }, req.headers);
    } catch (err: any) {
        console.log(err);
        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(getErrorMsgCard(err.message, theme));
    }
};