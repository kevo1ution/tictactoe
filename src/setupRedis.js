const redis = require('redis');

const logger = require('./logger');

const pubClient = redis.createClient({
  url: process.env.REDIS_CONNECTION_URL,
});
const subClient = pubClient.duplicate();

pubClient.on('ready', () => {
  logger.info('redis client is ready');
});

pubClient.on('error', (error) => {
  logger.error('redis error', { error });
});

module.exports = { pubClient, subClient };
