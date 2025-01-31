import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { processJob } from './scheduling/processJob';

// Validate REDIS_URL early
if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL environment variable is missing!");
}

// Configure Redis client
const redisClient = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableTLSForSentinelMode: false, // Add this if Railway Redis doesn't use TLS
  tls: {}, // Uncomment this if Railway Redis requires TLS (SSL)
  family: 0,
});

// Connection event handlers
redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Connected to Redis ✅'));

// Initialize worker
const worker = new Worker(
  'postQueue',
  async (job) => {
    console.log(`Processing job ${job.id}`);
    await processJob(job);
  },
  { connection: redisClient }
);

// Worker event listeners
worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error:`, err);
});