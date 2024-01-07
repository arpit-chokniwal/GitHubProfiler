const { default: axios } = require("axios");
const { GITHUB_BASE_API_URL, GITHUB_CONTRIBUTIONS_API, GITHUB_TOKEN } = require("../../../constants");
const { getRedisData, setRedisData } = require("../utils/redisHelperFunc.utils");
const { processGitHubData } = require("../utils/helperfunction");

async function getGithubUserDetailAndContributions(token, username) {
    const headers = {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
    };
    const body = {
        query: `query {
              user(login: "${username}") {
                  login
                  name
                  email
                  bio
                  url
                  avatarUrl
                  websiteUrl
                  twitterUsername
                  company
                  location
                  createdAt
                  updatedAt
                  followers {
                      totalCount
                  }
                  following {
                      totalCount
                  }
                  starredRepositories {
                      totalCount
                  }
                  repositories(first: 60, orderBy: {field: STARGAZERS, direction: DESC}) {
                      totalCount
                      nodes {
                          name
                          createdAt
                          primaryLanguage {
                              name
                          }
                          languages(first: 100) {
                              totalCount
                              edges {
                                  size
                                  node {
                                      name
                                  }
                              }
                          }
                          stargazers {
                              totalCount
                          }
                          defaultBranchRef {
                              target {
                                  ... on Commit {
                                      history {
                                          totalCount
                                      }
                                  }
                              }
                          }
                      }
                  }
              }
          }`,
    };

    const [response, contributionResponse] = await Promise.all([
        axios.post(`${GITHUB_BASE_API_URL}/graphql`, body, { headers: headers }),
        axios.get(`${GITHUB_CONTRIBUTIONS_API}/${username}`),
    ]);
    return {
        contributionResponse: contributionResponse.data,
        userDetails: response.data,
    };
}

const getGitHubProfileInfo = async (username) => {
    try {
        const userInRedis = await getRedisData(username)
        if (userInRedis) {
            return JSON.parse(userInRedis)
        } else {
            const { contributionResponse, userDetails } = await getGithubUserDetailAndContributions(
                GITHUB_TOKEN,
                username
            );
            const processGitHubData_ = processGitHubData(
                userDetails.data,
                contributionResponse
            );
            await setRedisData(username, JSON.stringify(processGitHubData_))
            return processGitHubData_;
        }
    } catch (error) {
        return;
    }
};

module.exports= {
    getGitHubProfileInfo
}
