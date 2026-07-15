import { ThemeMap } from '../const/theme';
import { getLeetCodeLanguageData } from '../leetcode-api/problems-per-language';
import { createDonutChartCard } from '../templates/donut-chart-card-leetcode';
import { writeSVG } from '../utils/file-writer';

export const createLeetCodeLanguagesCard = async function (username: string, exclude: Array<string>) {
    const langData = await getLeetCodeLanguageData(username, exclude);

    for (const themeName of ThemeMap.keys()) {
        const svgString = createDonutChartCard('Top Languages by Problems', langData, ThemeMap.get(themeName)!);
        writeSVG(themeName, '1-leetcode-languages', svgString);
    }
};

export const getLeetCodeLanguageSVGWithThemeName = async function (
    username: string,
    themeName: string,
    exclude: Array<string>
) {
    if (!ThemeMap.has(themeName)) throw new Error('Theme does not exist');
    const langData = await getLeetCodeLanguageData(username, exclude);
    return createDonutChartCard('Top Languages by Problems', langData, ThemeMap.get(themeName)!);
};