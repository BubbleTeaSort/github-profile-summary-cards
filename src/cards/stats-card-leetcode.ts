import { ThemeMap, ThemeColorOverride, resolveTheme } from '../const/theme';
import { Icon } from '../const/icon';
import { createStatsCard } from '../templates/stats-card-leetcode';
import { getLeetCodeProfileStats } from '../leetcode-api/stats-leetcode';
import { writeSVG } from '../utils/file-writer';

export const createLeetCodeStatsCard = async function (username: string) {
    const statsData = await getLeetCodeStatsData(username);
    for (const themeName of ThemeMap.keys()) {
        const svgString = getLeetCodeStatsSVG(statsData, themeName);
        writeSVG(themeName, '3-leetcode-stats', svgString);
    }
};

export const getLeetCodeStatsSVGWithThemeName = async function (
    username: string,
    themeName: string,
    override?: ThemeColorOverride
) {
    if (!ThemeMap.has(themeName)) throw new Error('Theme does not exist');
    const statsData = await getLeetCodeStatsData(username);
    return getLeetCodeStatsSVG(statsData, themeName, override);
};

const getLeetCodeStatsSVG = function (
    statsData: any,
    themeName: string,
    override?: ThemeColorOverride
) {
    return createStatsCard('LeetCode Stats', statsData, resolveTheme(themeName, override));
};

const getLeetCodeStatsData = async function (username: string) {
    const user = await getLeetCodeProfileStats(username);
    const allStats = user.submitStatsGlobal.acSubmissionNum.find((s: any) => s.difficulty === "All");
    const languages = user.languageProblemCount;

    // LeetCode API returns the value "5000001" for the display value "~5,000,000" (including the tilde) for users over rank 5 million
    let ranking = user.profile.ranking >= 5000001 ? "~5,000,000" : user.profile.ranking.toLocaleString();

    const favoriteLanguage =
        languages.length === 0
            ? "N/A"
            : languages.reduce((best: any, current: any) =>
                current.problemsSolved > best.problemsSolved ? current : best
            ).languageName;

    return [
        { index: 0, icon: Icon.PEOPLE, name: "Rank:", value: ranking },
        { index: 1, icon: Icon.ISSUE, name: "Solved:", value: allStats.count.toString() },
        { index: 2, icon: Icon.COMMIT, name: "Submissions:", value: allStats.submissions.toString() },
        { index: 3, icon: Icon.STAR, name: "Reputation:", value: user.profile.reputation.toString() },
        { index: 4, icon: Icon.CODE_REVIEW, name: "Most Used:", value: favoriteLanguage }
    ];
};
