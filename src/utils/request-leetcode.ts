import core from '@actions/core';
import rax from 'retry-axios';
import axios, { AxiosPromise } from 'axios';

rax.attach();

export default function requestLeetCode(data: any): AxiosPromise<any> {
    return axios({
        url: 'https://leetcode.com/graphql',
        method: 'post',
        data: data,
        raxConfig: {
            retry: 3,
            noResponseRetries: 3,
            retryDelay: 1000,
            backoffType: 'linear',
            httpMethodsToRetry: ['POST'],
            onRetryAttempt: err => {
                const cfg = rax.getConfig(err);
                core.warning(err);
                core.warning(`Retry attempt #${cfg?.currentRetryAttempt}`);
            }
        }
    });
}

/* Output structure for reference:
   ===============================
PS C:\> (Invoke-RestMethod -Uri "https://leetcode.com/graphql" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"query":"query($u:String!){matchedUser(username:$u){username profile{realName userAvatar aboutMe reputation ranking starRating company school countryName websites skillTags} submitStatsGlobal{acSubmissionNum{difficulty count submissions}} languageProblemCount{languageName problemsSolved} badges{id displayName icon} activeBadge{displayName icon}} userContestRanking(username:$u){attendedContestsCount rating globalRanking totalParticipants topPercentage badge{name}} userContestRankingHistory(username:$u){attended rating ranking problemsSolved totalProblems finishTimeInSeconds contest{title startTime}} recentSubmissionList(username:$u){title titleSlug statusDisplay lang timestamp}}","variables":{"u":"angiebaby"}}') | ConvertTo-Json -Depth 100
{
    "data":  {
                 "matchedUser":  {
                                     "username":  "angiebaby",
                                     "profile":  {
                                                     "realName":  "Angelina",
                                                     "userAvatar":  "https://assets.leetcode.com/users/angiebaby/avatar_1783841867.png",
                                                     "aboutMe":  "My super awesome coding partner is Snorelaxrules! \u003c3 and he has 1 C solution \u0026 1 C# solution",
                                                     "reputation":  0,
                                                     "ranking":  5000001,
                                                     "starRating":  0.5,
                                                     "company":  null,
                                                     "school":  null,
                                                     "countryName":  "Canada",
                                                     "websites":  [

                                                                  ],
                                                     "skillTags":  [
                                                                       "Backend",
                                                                       "C#",
                                                                       "Systems Engineering",
                                                                       "Python"
                                                                   ]
                                                 },
                                     "submitStatsGlobal":  {
                                                               "acSubmissionNum":  [
                                                                                       {
                                                                                           "difficulty":  "All",
                                                                                           "count":  5,
                                                                                           "submissions":  24
                                                                                       },
                                                                                       {
                                                                                           "difficulty":  "Easy",
                                                                                           "count":  2,
                                                                                           "submissions":  11
                                                                                       },
                                                                                       {
                                                                                           "difficulty":  "Medium",
                                                                                           "count":  2,
                                                                                           "submissions":  7
                                                                                       },
                                                                                       {
                                                                                           "difficulty":  "Hard",
                                                                                           "count":  1,
                                                                                           "submissions":  6
                                                                                       }
                                                                                   ]
                                                           },
                                     "languageProblemCount":  [
                                                                  {
                                                                      "languageName":  "Java",
                                                                      "problemsSolved":  2
                                                                  },
                                                                  {
                                                                      "languageName":  "C",
                                                                      "problemsSolved":  1
                                                                  },
                                                                  {
                                                                      "languageName":  "C#",
                                                                      "problemsSolved":  1
                                                                  },
                                                                  {
                                                                      "languageName":  "Python3",
                                                                      "problemsSolved":  4
                                                                  }
                                                              ],
                                     "badges":  [

                                                ],
                                     "activeBadge":  null
                                 },
                 "userContestRanking":  null,
                 "userContestRankingHistory":  [

                                               ],
                 "recentSubmissionList":  [

                                          ]
             }
}

*/