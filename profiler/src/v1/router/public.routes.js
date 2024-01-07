const express = require('express');
const { getReqGitHubProfileInfo, homeRouter } = require('../controller/githubApi.ctrl');

const router = express.Router();

router.get('/', homeRouter)
router.get('/githubDetail/:userName', getReqGitHubProfileInfo)

module.exports = router
