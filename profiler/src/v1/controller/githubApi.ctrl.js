const { successResponse, errorResponse } = require("../utils/helperfunction");
const { getGitHubProfileInfo } = require("./githubApiHelper");

const homeRouter = (req, res) => {
    return res
        .status(200)
        .send(
            "Please proceed to initiate an API request by navigating to /api/v1/githubDetail/{userName} \nSubstituting {userName} with the desired GitHub username to retrieve their profile data."
        );
};

const getReqGitHubProfileInfo = async (req, res) => {
    const { userName } = req.params;
    if (!userName)
        return res.status(400).send(errorResponse("username is required", {}));

    const userDetail = await getGitHubProfileInfo(userName);
    if (!userDetail)
        return res.status(404).send(errorResponse("user not found", {}));

    return res.status(200).send(successResponse(userDetail));
};


module.exports = {
    homeRouter,
    getReqGitHubProfileInfo,
};
