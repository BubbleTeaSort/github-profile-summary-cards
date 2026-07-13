import requestLeetCode from '../utils/request-leetcode';
import { getLanguageColor } from '../utils/language-colors-leetcode';

export interface LeetCodeLanguage {
    name: string;
    value: number;
    color: string;
}

export async function getLeetCodeLanguageData(username: string, exclude: Array<string>): Promise<LeetCodeLanguage[]> {
    const res = await requestLeetCode({
        query: `
        query($u: String!) {
            matchedUser(username: $u) {
                languageProblemCount {
                    languageName
                    problemsSolved
                }
            }
        }`,
        variables: { u: username }
    });

    if (res.data.errors) {
        throw Error(res.data.errors[0].message || 'GetLeetCodeLanguage fail');
    }

    const rawData = res.data.data.matchedUser.languageProblemCount;

    return rawData
        .filter((item: any) => !exclude.includes(item.languageName.toLowerCase()))
        .map((item: any) => ({
            name: item.languageName,
            value: item.problemsSolved,
            color: getLanguageColor(item.languageName)
        }))
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 5);
}