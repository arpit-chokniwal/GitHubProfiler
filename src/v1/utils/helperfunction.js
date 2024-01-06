const axios = require("axios");
const {
  GITHUB_BASE_API_URL,
  GITHUB_CONTRIBUTIONS_API,
} = require("./constants");
const { getRedisData, setRedisData, deleteRedisData } = require("./redisHelperFunc.utils");

async function getContributions(token, username) {
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

function processGitHubData(data, contributionResponse) {
  // commitsPerLanguage - { primaryLangOfRepo : totalCommitOfDefaultBranch  }
  // languagePercentages - (calculating overall size of that language) / (overall size)
  // starsPerLanguage - { primaryLangOfRepo : totalStarsOfRepo }
  // reposPerLanguage - { primaryLangOfRepo : totalReposOfRepo }
  // startPerRepo - { repoName : startOnThatRepo }

  if (!isValidData(data)) return {};

  const userDetails = extractUserDetails(data.user, contributionResponse.total);
  const quarterGraphData = calculateQuarterlyContributions(
    contributionResponse.contributions
  );
  const languageData = processRepositories(data.user.repositories.nodes);

  return {
    userDetails,
    quarterGraphData,
    ...calculateLanguageMetrics(languageData),
  };
}

function isValidData(data) {
  return data?.user?.repositories?.nodes;
}

function extractUserDetails(user, totalContributions) {
  return {
    login: user.login,
    name: user.name,
    email: user.email,
    bio: user.bio,
    url: user.url,
    avatarUrl: user.avatarUrl,
    websiteUrl: user.websiteUrl,
    twitterUsername: user.twitterUsername,
    company: user.company,
    location: user.location,
    createdAt: user.createdAt,
    lastActive: user.updatedAt,
    followersCount: user.followers.totalCount,
    followingCount: user.following.totalCount,
    starredRepositoriesCount: user.starredRepositories.totalCount,
    totalContributions,
  };
}

function calculateQuarterlyContributions(contributionsData) {
  const quarterlyContributions = {};

  contributionsData.forEach((contribution) => {
    const date = new Date(contribution.date);
    const year = date.getFullYear();
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    const yearQuarter = `${year}-Q${quarter}`;

    if (!quarterlyContributions[yearQuarter]) {
      quarterlyContributions[yearQuarter] = 0;
    }

    quarterlyContributions[yearQuarter] += contribution.count;
  });

  return quarterlyContributions;
}

function processRepositories(repositories) {
  const languageData = {};
  const languageSizes = {};
  const starsPerRepo = {};

  repositories.forEach((repo) => {
    const { name, primaryLanguage, stargazers, defaultBranchRef, languages } =
      repo;
    const language = primaryLanguage ? primaryLanguage.name : "Unknown";
    const stars = stargazers.totalCount;
    const commits = defaultBranchRef
      ? defaultBranchRef.target.history.totalCount
      : 0;

    updateLanguageData(languageData, language, stars, commits);
    updateLanguageSizes(languageSizes, languages.edges);

    starsPerRepo[name] = stars;
  });

  return { languageData, languageSizes, starsPerRepo };
}

function calculateLanguageMetrics({
  languageData,
  languageSizes,
  starsPerRepo,
}) {
  const totalSize = Object.values(languageSizes).reduce(
    (acc, size) => acc + size,
    0
  );
  const languagePercentages = {};

  for (const language in languageSizes) {
    languagePercentages[language] = (
      (languageSizes[language] / totalSize) *
      100
    ).toFixed(2);
  }

  return {
    reposPerLanguage: filterZeroCounts(languageData, "repos"),
    starsPerLanguage: filterZeroCounts(languageData, "stars"),
    commitsPerLanguage: filterZeroCounts(languageData, "commits"),
    languagePercentages: filterZeroCounts(languagePercentages),
    starsPerRepo: filterZeroCounts(starsPerRepo),
  };
}

function updateLanguageData(languageData, language, stars, commits) {
  if (!languageData[language]) {
    languageData[language] = { repos: 0, stars: 0, commits: 0 };
  }

  languageData[language].repos += 1;
  languageData[language].stars += stars;
  languageData[language].commits += commits;
}

function updateLanguageSizes(languageSizes, edges) {
  edges.forEach((edge) => {
    const langName = edge.node.name;
    const size = edge.size;

    languageSizes[langName] = (languageSizes[langName] || 0) + size;
  });
}

function filterZeroCounts(data, key) {
  const result = {};
  for (const [language, value] of Object.entries(data)) {
    const count = key ? value[key] : value;
    if (count !== 0 && count !== "0.00") {
      result[language] = count;
    }
  }
  return result;
}

const getGitHubProfileInfo = async (username) => {
  try {
    const userInRedis = await getRedisData(username)
    if (userInRedis) {
      return JSON.parse(userInRedis)
    } else {
      const { contributionResponse, userDetails } = await getContributions(
        process.env.GITHUB_TOKEN,
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

module.exports = {
  getGitHubProfileInfo,
};
