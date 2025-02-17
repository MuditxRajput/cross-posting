import { Worker } from 'bullmq';
import 'dotenv/config';
import Redis from 'ioredis';
import { processJob } from './scheduling/processJob';

// ✅ Configure Redis (Valkey) Connection
const redisOptions = {
  host: 'redisposting-19d2vz.serverless.use1.cache.amazonaws.com',
  port: 6379,
  tls: {}, // Required for AWS Valkey
  retryStrategy: (times: number) => Math.min(times * 50, 2000),
};

const redis = new Redis(redisOptions);

redis.on('connect', () => console.log('✅ Successfully connected to AWS Valkey!'));
redis.on('error', (error) => console.error('❌ Redis Error:', error));

// ✅ Create BullMQ Worker
const worker = new Worker(
  'postingQueue', 
  async (job) => {
    console.log(`Processing job: ${job.id}`);
    await processJob(job); // Process the job
  },
  {
    connection: redisOptions, // Pass Redis config instead of instance
    prefix: '{postingQueue}',
    concurrency: 5, // Process 5 jobs in parallel
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 100 },
  }
);

console.log('🚀 Worker is ready and listening for jobs...');
