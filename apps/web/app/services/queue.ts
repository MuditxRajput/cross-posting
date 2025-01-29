import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// Create a singleton Redis client
const redisClient = new IORedis({
  username: 'default', // Use environment variable
  password: process.env.REDIS_PASSWORD, // Use environment variable
  host: process.env.REDIS_HOST, // Use environment variable
  port: parseInt(process.env.REDIS_PORT || '16805', 10), // Use environment variable
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

// Initialize the queue with the Redis client
export const postQueue = new Queue('postQueue', {
  connection: redisClient,
});