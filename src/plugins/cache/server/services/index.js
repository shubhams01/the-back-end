"use strict";

const redisClient = require("./redis-client");
const caching = require("./redis-cache-decorator");

module.exports = {
  redisClient,
  caching,
};