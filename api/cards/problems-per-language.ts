import { getLeetCodeLanguageSVGWithThemeName } from '../../src/cards/problems-per-language-card';
import { getErrorMsgCard } from '../utils/error-card';
import { sendAnalytics } from '../../src/utils/analytics';
import { CONST_CACHE_CONTROL } from '../../src/const/cache';
import { translateLanguage } from '../../src/utils/translator';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {
    const { username, theme = 'default', exclude = '' } = req.query;

    if (typeof theme !== 'string') {
        res.status(400).send('theme must be a string');
        return;
    }
    if (typeof username !== 'string') {
        res.status(400).send('username must be a string');
        return;
    }
    if (typeof exclude !== 'string') {
        res.status(400).send('exclude must be a string');
        return;
    }

    const excludeArr = exclude.split(',').map(val =>
        translateLanguage(val).toLowerCase()
    );

    try {
        const cardSVG = await getLeetCodeLanguageSVGWithThemeName(username, theme, excludeArr);

        await sendAnalytics('leetcode-languages-card', { username, theme }, req.headers);

        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', CONST_CACHE_CONTROL);
        res.send(cardSVG);
    } catch (err: any) {
        res.send(getErrorMsgCard(err.message, theme));
    }
};