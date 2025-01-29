import { Worker } from 'bullmq';
import { processJob } from './scheduling/processJob';
import IORedis from 'ioredis';

// Use the same Redis client as in queue.ts
const redisClient = new IORedis({
  username: 'default', // Use environment variable
  password: process.env.REDIS_PASSWORD, // Use environment variable
  host: process.env.REDIS_HOST, // Use environment variable
  port: parseInt(process.env.REDIS_PORT || '16805', 10), // Use environment variable
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

const worker = new Worker(
  'postQueue',
  async (job) => {
    await processJob(job);
  },
  {
    connection: redisClient,
  }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error:`, err);
});