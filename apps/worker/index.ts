import { Worker } from 'bullmq';
import 'dotenv/config';
import Redis from 'ioredis';
import { processJob } from './scheduling/processJob';

// Ensure consistent prefix with hash tags
const PREFIX = '{bull}';  // This ensures all keys are in the same hash slot

const redisOptions = {
  host: "redisposting-19d1vz.serverless.use1.cache.amazonaws.com",
  port: 6379,
  tls: { 
    rejectUnauthorized: false 
  },
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  enableOfflineQueue: true,
  showFriendlyErrorStack: true,
  clusterRetryStrategy: (times: number) => Math.min(times * 50, 2000),
  redisOptions: {
    enableReadyCheck: false,
    maxRetriesPerRequest: null
  }
};

// Create Redis cluster client
const redis = new Redis.Cluster(
  [
    {
      host: "redisposting-19d1vz.serverless.use1.cache.amazonaws.com",
      port: 6379
    }
  ],
  {
    redisOptions: {
      tls: { rejectUnauthorized: false },
      enableReadyCheck: false,
      maxRetriesPerRequest: null
    },
    clusterRetryStrategy: (times: number) => Math.min(times * 50, 2000),
    enableOfflineQueue: true,
    showFriendlyErrorStack: true,
  }
);

redis.on('connect', () => console.log('✅ Successfully connected to AWS ElastiCache Cluster!'));
redis.on('error', (error) => console.error('❌ Redis Error:', error));

const worker = new Worker(
  'postQueue',
  async (job) => {
    console.log(`Processing job: ${job.id}`);
    console.log('Job data:', job.data);
    await processJob(job);
  },
  {
    connection: redis,
    prefix: PREFIX,
    concurrency: 5,
    stalledInterval: 30000,
    maxStalledCount: 2,
    lockDuration: 30000,
    drainDelay: 5000,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 100 },
  }
);

// Event handlers
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

// Removed 'delayed' event listener as it is not a valid event for Worker class

worker.on('stalled', (jobId: string, prev: string) => {
  console.log(`⚠️ Stalled job detected: ${jobId}`);
});

console.log('🚀 Worker is ready and listening for jobs...');

// Custom queue status check that's cluster-safe
const checkQueueStatus = async () => {
  try {
    const statusChecks = ['active', 'completed', 'failed', 'delayed', 'wait'].map(async (state) => {
      const key = `${PREFIX}:postQueue:${state}`;
      try {
        if (state === 'delayed' || state === 'completed' || state === 'failed') {
          const count = await redis.zcard(key);
          return { [state]: count };
        } else {
          const count = await redis.llen(key);
          return { [state]: count };
        }
      } catch (err) {
        console.error(`Error checking ${state} status:`, err);
        return { [state]: 0 };
      }
    });

    const results = await Promise.all(statusChecks);
    console.log('Queue status:', Object.assign({}, ...results));
  } catch (error) {
    console.error('Failed to get queue status:', error);
  }
};

// Check queue status periodically
setInterval(checkQueueStatus, 60000);