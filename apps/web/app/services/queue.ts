import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// Create Redis client
const redisClient = new IORedis({
  password: process.env.REDIS_PASSWORD, // Use environment variable
  host: process.env.REDIS_HOST, // Use environment variable
  port: parseInt(process.env.REDIS_PORT || '16805', 10), // Use environment variable
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Connected to Redis ha'));
console.log("inside queue.ts");
// Initialize the queue
export const postQueue = new Queue('postQueue', {
  connection: redisClient,
});
