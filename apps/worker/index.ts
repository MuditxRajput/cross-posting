import { Worker } from 'bullmq';
import 'dotenv/config';
import Redis from 'ioredis';
import { processJob } from './scheduling/processJob';

const redisOptions = {
  host: "redisposting-19d1vz.serverless.use1.cache.amazonaws.com",
  port: 6379,
  tls: { rejectUnauthorized: false },
  retryStrategy: (times: number) => Math.min(times * 50, 2000),
  // Remove keyPrefix from here
};

const redis = new Redis(redisOptions);

redis.on('connect', () => console.log('✅ Successfully connected to AWS Valkey!'));
redis.on('error', (error) => console.error('❌ Redis Error:', error));

const worker = new Worker(
  'postQueue',
  async (job) => {
    console.log(`Processing job: ${job.id}`);
    await processJob(job);
  },
  {
    connection: redis,
    prefix: '{bull}', // Move the prefix here
    concurrency: 5,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 100 },
  }
);

// Add more logging to debug
worker.on('completed', job => {
  console.log(`✅ Job completed: ${job.id}`);
});

worker.on('active', (job) => {
  console.log(`🚀 Job started: ${job.id}`);
});

worker.on('error', (error) => {
  console.error('❌ Worker error:', error);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job failed: ${job?.id}`, err);
});

console.log('🚀 Worker is ready and listening for jobs...');