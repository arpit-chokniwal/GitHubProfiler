const redis = require("redis");
const { REDIS_URL, REDIS_PORT } = require("../../constants");

let redisClient;
const redisServer = async () => {
    redisClient = redis.createClient({ url: REDIS_URL });
    redisClient.on("error", (error) => console.error(`Error : ${error}`));
    redisClient.on("connect", (error) => console.log(`Redis client connected at port ${REDIS_PORT}`));
    await redisClient.connect()
}

const getRedisClient = async () => {
    if (!redisClient) {
        await redisServer();
    }
    return redisClient;
};

module.exports = { getRedisClient, redisServer }
