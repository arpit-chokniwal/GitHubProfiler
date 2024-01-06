const redis = require("redis");

let redisClient;
const redisServer = async () => {
    redisClient = redis.createClient({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    })
    redisClient.on("error", (error) => console.error(`Error : ${error}`));
    redisClient.on("connect", (error) => console.log(`Redis client connected at port ${process.env.REDIS_PORT}`));
    await redisClient.connect()
}

const getRedisClient = async () => {
    if (!redisClient) {
        await redisServer();
    }
    return redisClient;
};

module.exports = { getRedisClient, redisServer }
