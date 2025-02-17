import { Worker } from 'bullmq';
import 'dotenv/config';
import Redis from 'ioredis';
import { processJob } from './scheduling/processJob';

const redisOptions = {
  host: process.env.REDIS_URL,
  port: 6379,
  tls: {}, 
  retryStrategy: (times: number) => Math.min(times * 50, 2000),
  keyPrefix: '{bull}' // Match Lambda's prefix
};

const redis = new Redis(redisOptions);

redis.on('connect', () => console.log('✅ Successfully connected to AWS Valkey!'));
redis.on('error', (error) => console.error('❌ Redis Error:', error));

// Update queue name to match Lambda
const worker = new Worker(
  'postQueue',  // Changed from 'postingQueue' to match Lambda
  async (job) => {
    console.log(`Processing job: ${job.id}`);
    await processJob(job);
  },
  {
    connection: redisOptions,
    // Remove prefix here since it's in redisOptions
    concurrency: 5,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 100 },
  }
);

// Add more logging to debug
worker.on('completed', job => {
  console.log(`✅ Job completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job failed: ${job?.id}`, err);
});

console.log('🚀 Worker is ready and listening for jobs...');