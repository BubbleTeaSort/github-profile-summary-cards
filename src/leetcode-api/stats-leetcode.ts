import requestLeetCode from '../utils/request-leetcode';

export const getLeetCodeProfileStats = async function (username: string) {
    const res = await requestLeetCode({
        query: `
        query($u: String!) {
            matchedUser(username: $u) {
                submitStatsGlobal {
                    acSubmissionNum {
                        difficulty
                        count
                        submissions
                    }
                }
                profile {
                    ranking
                    reputation
                }
                languageProblemCount {
                    languageName
                    problemsSolved
                }
            }
        }`,
        variables: { u: username }
    });

    if (res.data.errors) {
        throw Error(res.data.errors[0].message || 'GetLeetCodeStats fail');
    }

    return res.data.data.matchedUser;
};