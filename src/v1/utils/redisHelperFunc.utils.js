const { getRedisClient } = require("../../config/redis.config");

const getRedisData = async (key) => {
    const redisClient = await getRedisClient();
    return await redisClient.get(key);
}

const setRedisData = async (key, value) => {
    const redisClient = await getRedisClient();
    await redisClient.set(key, value);

    // 12 hours (18000 seconds)
    await redisClient.expire(key, 24*60*60);
    return { message: "successfully set key and value", status: 200 };
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