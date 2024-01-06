const redis = require("redis");

let redisClient;
const redisServer = async () => {
    redisClient = redis.createClient({ url: 'redis://redisserver:6379' })
    redisClient.on("error", (error) => console.error(`Error : ${error}`));
    redisClient.on("connect", (error) => console.log("Redis client connected at port 6379"));
    await redisClient.connect()
}

const getRedisClient = async () => {
    if (!redisClient) {
        await redisServer();
    }
    return redisClient;
};

module.exports = { getRedisClient, redisServer }
