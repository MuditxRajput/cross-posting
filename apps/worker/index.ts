// apps/worker/src/index.ts
import { Worker } from 'bullmq';
import IORedis, { RedisOptions } from 'ioredis';
import { processJob } from './scheduling/processJob';

// Validate environment variables
if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL environment variable is not defined');
}
if (!process.env.MONGO_URL) {
  throw new Error('MONGO_URL environment variable is not defined');
}

// Parse Redis URL
const redisUrl = new URL(process.env.REDIS_URL);

// Configure Redis connection
const redisOptions: RedisOptions = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port, 10),
  username: redisUrl.username || 'default',
  password: redisUrl.password ? decodeURIComponent(redisUrl.password) : undefined,
  tls: redisUrl.protocol === 'rediss:' ? { 
    rejectUnauthorized: false // Required for Railway's TLS
  } : undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false
};

// Create Redis connection with health check
const redisConnection = new IORedis(redisOptions);

// Connection event listeners
redisConnection.on('connect', () => {
  console.log('🟡 Connecting to Redis...');
});

redisConnection.on('ready', () => {
  console.log('✅ Redis connection established');
});

redisConnection.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

// Initialize BullMQ Worker
const worker = new Worker('postQueue', processJob, { 
  connection: redisConnection,
  concurrency: 5,
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 5000 }
});

// Worker event listeners
worker.on('ready', () => {
  console.log('🚀 Worker is ready to process jobs');
});

worker.on('active', (job) => {
  console.log(`🔵 Job ${job.id} started`);
});

worker.on('completed', (job) => {
  console.log(`🟢 Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`🔴 Job ${job?.id} failed:`, err);
});

worker.on('error', (err) => {
  console.error('🔥 Worker error:', err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM. Closing worker...');
  await worker.close();
  await redisConnection.quit();
  process.exit(0);
});