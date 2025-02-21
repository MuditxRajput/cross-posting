import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { processJob } from './scheduling/processJob'; // Import your processJob function

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
  'postQueue', // Queue name (must match the queue name in your Lambda)
  async (job) => {
    try {
      console.log(`🚀 Processing job: ${job.id}`);
      console.log('📦 Job Data:', job.data);

      // Call your processJob function to handle the job
      await processJob(job);

      console.log(`✅ Job ${job.id} completed successfully!`);
    } catch (error) {
      console.error(`❌ Error processing job ${job.id}:`, error);
      throw error; // Re-throw the error to mark the job as failed
    }
  },
  {
    connection: redis, // Use the Redis Cluster connection
    concurrency: 5, // Number of jobs to process concurrently
    removeOnComplete: { count: 100 }, // Keep up to 100 completed jobs
    removeOnFail: { count: 100 }, // Keep up to 100 failed jobs
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