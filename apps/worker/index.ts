import { Worker, Queue } from 'bullmq';
import 'dotenv/config';
import Redis from 'ioredis';
import { processJob } from './scheduling/processJob';

// Match the exact Redis configuration from Lambda
const redisOptions = {
  host: "redisposting-19d1vz.serverless.use1.cache.amazonaws.com",
  port: 6379,
  tls: { 
    rejectUnauthorized: false 
  },
  maxRetriesPerRequest: null,  // Fix deprecation warning
  enableReadyCheck: false,
  useRedisCluster: true  // Important for AWS ElastiCache cluster mode
};

const redis = new Redis(redisOptions);

redis.on('connect', () => console.log('✅ Successfully connected to AWS Valkey!'));
redis.on('error', (error) => console.error('❌ Redis Error:', error));

const queue = new Queue('postQueue', { connection: redis });

const worker = new Worker(
  'postQueue',
  async (job) => {
    console.log(`Processing job: ${job.id}`);
    console.log('Job data:', job.data);  // Add this to see job data
    await processJob(job);
  },
  {
    connection: redis,
    prefix: '{bull}',
    concurrency: 5,
    stalledInterval: 30000,     // Check for stalled jobs every 30 seconds
    maxStalledCount: 2,         // Consider a job stalled after 2 checks
    lockDuration: 30000,        // Lock the job for 30 seconds
    drainDelay: 5000,          // Check for new jobs every 5 seconds
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 100 },
  }
);

// Add more detailed logging
worker.on('completed', job => {
  console.log(`✅ Job completed: ${job.id}`);
  console.log('Completed job data:', job.data);
});

worker.on('active', job => {
  console.log(`🚀 Job started: ${job.id}`);
  console.log('Active job data:', job.data);
});

worker.on('error', error => {
  console.error('❌ Worker error:', error);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job failed: ${job?.id}`, err);
  console.error('Failed job data:', job?.data);
});

// Add monitoring for delayed jobs
// Removed 'delayed' event listener as it is not a valid event for Worker class

worker.on('stalled', job => {
  console.log(`⚠️ Stalled job detected: ${job}`);
});

console.log('🚀 Worker is ready and listening for jobs...');

// Periodic check for queue health
setInterval(async () => {
  try {
    const counts = await queue.getJobCounts('active', 'completed', 'failed', 'delayed', 'wait');
    console.log('Queue status:', counts);
  } catch (error) {
    console.error('Failed to get queue status:', error);
  }
}, 60000); // Check every minute