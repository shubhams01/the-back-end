const { createClient } = require("redis");

const client = createClient({
  url: process.env.REDIS_URL,
  database: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : 0,
});

client.on("error", (err) => {
  console.error("Redis error:", err);
});

client.on("connect", () => {
  console.log("Redis client connected");
});

client.on("end", () => {
  console.log("Redis client disconnected");
});

module.exports = {
  client,

  async get(key) {
    return client.get(key);
  },

  async setEx(key, value, duration = 30 * 24 * 60 * 60) {
    return client.setEx(key, duration, value);
  },

  async set(key, value) {
    return client.set(key, value);
  },

  async del(key) {
    return client.del(key);
  },
};
