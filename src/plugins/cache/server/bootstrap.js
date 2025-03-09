"use strict";

const { client } = require("./services/redis-client");

module.exports = async () => {
  try {
    await client.connect();
  } catch (e) {
    console.log('Error connecting to Redis: ', e.message);
  }
};