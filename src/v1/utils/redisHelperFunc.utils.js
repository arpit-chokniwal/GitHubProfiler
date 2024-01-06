const { getRedisClient } = require("../../config/redis.config");

const getRedisData = async (key) => {
    const redisClient = await getRedisClient();
    return await redisClient.get(key);
}

const setRedisData = async (key, value) => {
    const redisClient = await getRedisClient();
    // 5 hours (18000 seconds)
    await redisClient.set(key, value, 'EX', 18000);
}

const deleteRedisData = async (key) => {
    const redisClient = await getRedisClient();
    return await redisClient.del(key);
}

module.exports = {
    getRedisData,
    setRedisData,
    deleteRedisData
}