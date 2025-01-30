import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// Parse the Redis URL
const redisUrl = new URL(process.env.REDIS_URL || 'redis://default:TYnGCAxQOuQcLKnoQpIZFLEwRxAlEAlu@junction.proxy.rlwy.net:56489');

// Extract connection details
const redisOptions = {
  host: redisUrl.hostname, // e.g., 'junction.proxy.rlwy.net'
  port: parseInt(redisUrl.port, 10), // e.g., 56489
  password: redisUrl.username, // e.g., 'TYnGCAxQOuQcLKnoQpIZFLEwRxAlEAlu'
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