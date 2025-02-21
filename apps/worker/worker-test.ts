import { Worker } from 'bullmq';
import Redis from 'ioredis';

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
    clusterRetryStrategy: (times) => Math.min(times * 50, 2000),
    enableOfflineQueue: true,
    showFriendlyErrorStack: true,
  }
);

const worker = new Worker(
  'testQueue',
  async (job) => {
    console.log(`✅ Worker received job: ${job.id}`);
    console.log('📦 Job data:', job.data);
  },
  {
    connection: redis
  }
);

worker.on('ready', () => {
  console.log('🚀 Worker is READY!');
});

worker.on('error', (err) => {
  console.error('❌ Worker Error:', err);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job failed: ${job?.id}`, err);
});
