const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const PORT = process.env.PORT;
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_URL = process.env.REDIS_URL;
const GITHUB_BASE_API_URL = "https://api.github.com";
const GITHUB_CONTRIBUTIONS_API =
    "https://github-contributions-api.jogruber.de/v4";


module.exports = {
    GITHUB_TOKEN,
    PORT,
    REDIS_PORT,
    REDIS_URL,
    GITHUB_BASE_API_URL,
    GITHUB_CONTRIBUTIONS_API,
};
