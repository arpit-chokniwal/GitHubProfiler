const { getGitHubProfileInfo } = require("../utils/helperfunction");

const homeRouter = (req, res) => {
    res
        .status(200)
        .send(
            "Please proceed to initiate an API request by navigating to /api/v1/githubDetail/{userName} \nSubstituting {userName} with the desired GitHub username to retrieve their profile data."
        );
};

const getReqGitHubProfileInfo = async (req, res) => {
    const { userName } = req.params;
    if (!userName)
        return res.status(400).send({ message: "username is required" });

    const userDetail = await getGitHubProfileInfo(userName);
    if (!userDetail)
        return res.status(404).send({ message: "user not found", userDetail });

    return res.status(200).send(userDetail);
};


module.exports = {
    homeRouter,
    getReqGitHubProfileInfo,
};
