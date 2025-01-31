import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// Parse the Redis URL
if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL environment variable is not defined');
}
const redisUrl = new URL(process.env.REDIS_URL);

// Extract connection details
const redisOptions = {
 
  host: redisUrl.hostname, // e.g., 'junction.proxy.rlwy.net'
  port: parseInt(redisUrl.port, 10), // e.g., 56489
  password: redisUrl.password, // e.g., 'TYnGCAxQOuQcLKnoQpIZFLEwRxAlEAlu'
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// Create Redis client
const redisClient = new IORedis(redisOptions);

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('ready', () => {
  console.log('Redis is ready');
});

redisClient.on('end', () => {
  console.log('Redis connection ended');
});

console.log('Inside queue.ts');

// Initialize the queue
export const postQueue = new Queue('postQueue', {
  connection: redisClient,
});