import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// Create a Redis client
const redisClient = new IORedis({
  username: 'default', // Use environment variable
  password: process.env.REDIS_PASSWORD, // Use environment variable
  host: process.env.REDIS_HOST, // Use environment variable
  port: parseInt(process.env.REDIS_PORT || '16805', 10), // Use environment variable
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
// Initialize the queue with the Redis client
export const postQueue = new Queue('postQueue', {
  connection: redisClient,
});

// Connect to Redis and log the connection status
redisClient.connect().then(() => {
  console.log('Connected to Redis');
});