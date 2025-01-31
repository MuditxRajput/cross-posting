import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { processJob } from './scheduling/processJob';

// Create the Redis client with maxRetriesPerRequest set to null
const redisClient = new IORedis(process.env.REDIS_URL || '', {
  maxRetriesPerRequest: null, // Add this line
});

// Handle Redis connection events
redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

// Create and configure the worker
const worker = new Worker(
  'postQueue',
  async (job) => {
    console.log(`Processing job ${job.id}`);
    await processJob(job);
  },
  {
    connection: redisClient, 
  }
);

// Worker event listeners
worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error:`, err);
});