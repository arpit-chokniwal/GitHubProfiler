require("dotenv").config({ path: ".env" });
const express = require("express");
const app = express();
const cors = require("cors");
const v1Apis = require("./src/v1/router/public.routes");
const { redisServer } = require("./src/config/redis.config");
const { PORT } = require("./constants");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send(
        "Hello, \nThis repository is specifically designed for retrieving GitHub user profile data. \nPlease initiate a request to `/api/v1/githubDetail/{userName}` to access this information."
    );
});

app.use("/api/v1", v1Apis);


app.listen(PORT, async () => {
    await redisServer();
    console.log(`Server is running on port ${PORT}`);
});
