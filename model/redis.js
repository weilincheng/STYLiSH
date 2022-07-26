const createClient = require("redis").createClient;
require("dotenv").config();

const client = createClient({
  url: `redis://${process.env.REDIS_USER}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

client.connect();
module.exports = client;
