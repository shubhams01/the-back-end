const redisClient = require("./redis-client");

function cacheDecorator(prefix, duration) {
  return function (fn) {
    return async function (...args) {
      
      // We will assume that the entry id is the first argument,
      // all arguments to form a nested key

      const key = args?.[0] ?? "";

      const cacheKey = [prefix, key].join(":");

      const cachedEntry = await redisClient.get(cacheKey);

      if (cachedEntry) {
        return JSON.parse(cachedEntry);
      }

      const data = await fn.call(this, ...args);

      if (data) {
        await redisClient.setEx(cacheKey, JSON.stringify(data), duration);
        return data;
      }

      return data;
    };
  };
}

module.exports = cacheDecorator;
