// apps/worker/src/index.ts
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { User } from "@database/database";
import { processJob } from './scheduling/processJob';

// Validate REDIS_URL early
if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL environment variable is missing!");
}

// Configure Redis client for Railway
const redisClient = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  family: 0, 
  connectTimeout: 10000,
  retryStrategy: (times) => Math.min(times * 100, 3000),
  enableAutoPipelining: true,
});

// Connection event handlers
redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Connected to Redis ✅'));

// Initialize worker with error handling
const worker = new Worker(
  'postQueue',
  async (job) => {
    try {
      console.log(`Starting processing job ${job.id}`);
      await processJob(job);
      console.log(`Completed processing job ${job.id}`);
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);
      throw error; // Ensure failure is propagated
    }
  },
  { 
    connection: redisClient,
    removeOnComplete: { count: 1000 }, // Keep 1000 completed jobs
    removeOnFail: { count: 5000 } // Keep 5000 failed jobs
  }
);

// Worker event listeners
worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error:`, err);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});