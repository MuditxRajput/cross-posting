import { Worker } from 'bullmq';
import Redis from 'ioredis';

// Redis Cluster configuration
const redis = new Redis.Cluster(
  [
    {
      host: "redisposting-19d1vz.serverless.use1.cache.amazonaws.com",
      port: 6379,
    },
  ],
  {
    redisOptions: {
      tls: { rejectUnauthorized: false }, // Remove if TLS is not required
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    },
    clusterRetryStrategy: (times) => Math.min(times * 50, 2000),
    enableOfflineQueue: true,
    showFriendlyErrorStack: true,
  }
);

// Create a worker to process jobs from the 'postQueue'
const worker = new Worker(
  'postQueue',
  async (job) => {
    console.log(`✅ Worker received job: ${job.id}`);
    console.log('📦 Job data:', job.data);

    // Simulate job processing
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate 2 seconds of work
    console.log(`🚀 Job ${job.id} processed successfully!`);
  },
  {
    connection: redis, // Use the Redis Cluster connection
  }
);

// Event listeners for the worker
worker.on('ready', () => {
  console.log('🚀 Worker is READY and listening for jobs...');
});

worker.on('active', (job) => {
  console.log(`🔧 Job ${job.id} is now active!`);
});

worker.on('completed', (job) => {
  console.log(`🎉 Job ${job.id} completed successfully!`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed with error:`, err);
});

worker.on('error', (err) => {
  console.error('❌ Worker encountered an error:', err);
});

worker.on('stalled', (jobId) => {
  console.warn(`⚠️ Job ${jobId} is stalled!`);
});