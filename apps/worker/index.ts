import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { processJob } from './scheduling/processJob';

// 1. Parse the Redis URL from environment variables
const redisUrl = new URL(process.env.REDIS_URL!);

// 2. Configure Redis connection
const redisConnection = new IORedis({
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port || '6379'),
  username: 'default', // Replace with your Valkey username if required
  password: redisUrl.password, // Replace with your Valkey password
  tls: {}, // Enable TLS for secure connections
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// 3. Initialize the BullMQ worker
const worker = new Worker(
  'scheduledQueue', // Queue name for scheduled jobs
  processJob, // Job processor function
  {
    connection: redisConnection,
    concurrency: 5, // Number of jobs to process concurrently
  }
);

// 4. Worker event listeners
worker
  .on('ready', () => console.log('👷 Worker is ready'))
  .on('active', (job) => console.log(`🏃 Job ${job.id} active`))
  .on('completed', (job) => console.log(`🎉 Job ${job.id} completed`))
  .on('failed', (job, err) => console.error(`💥 Job ${job?.id} failed:`, err));

// 5. Graceful shutdown
async function shutdown() {
  console.log('\n🛑 Received shutdown signal');
  await worker.close();
  await redisConnection.quit();
  console.log('👋 Services stopped gracefully');
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// 6. Log Redis connection status
redisConnection
  .on('connect', () => console.log('🔗 Redis connection established'))
  .on('close', () => console.log('🔌 Redis connection closed'))
  .on('end', () => console.log('🔚 Redis connection ended'));