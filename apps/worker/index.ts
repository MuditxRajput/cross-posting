import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { processJob } from './scheduling/processJob'; // Import your processJob function

// Use a hash tag to ensure all keys hash to the same slot
const PREFIX = '{bull}:postQueue';

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
  }
);

redis.on('connect', () => {
  console.log('✅ Connected to Redis Cluster!');
});

redis.on('error', (err) => {
  console.error('❌ Redis Error:', err);
});

// Worker configuration
const worker = new Worker(
  'postQueue',
  async (job) => {
    try {
      console.log(`🚀 Processing job: ${job.id}`);
      console.log('📦 Job Data:', job.data);

      await processJob(job);

      console.log(`✅ Job ${job.id} completed successfully!`);
    } catch (error) {
      console.error(`❌ Error processing job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection: redis,
    prefix: PREFIX, // Add the prefix here
    concurrency: 5,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 100 },
  }
);

// Worker event listeners
worker.on('ready', () => {
  console.log('🚀 Worker is ready and listening for jobs...');
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