// apps/worker/src/index.ts
import { Worker } from 'bullmq';
import express from 'express';
import IORedis, { RedisOptions } from 'ioredis';

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Add startup logging
console.log('🚀 Initializing worker service...');
console.log('🔍 Environment Variables:', {
  NODE_ENV: process.env.NODE_ENV,
  REDIS_URL: process.env.REDIS_URL?.substring(0, 20) + '...', // Log partial URL
  REDIS_PUBLIC_URL: process.env.REDIS_PUBLIC_URL?.substring(0, 20) + '...'
});

// 2. Enhanced Redis configuration
interface RedisConfig extends RedisOptions {
  host: string;
  port: number;
  username: string;
  password: string;
  maxRetriesPerRequest: null;
  enableReadyCheck: boolean;
  reconnectOnError: (err: Error) => boolean;
  retryStrategy: (times: number) => number;
}

const redisConfig: RedisConfig = {
  host: process.env.REDIS_URL!.split('@')[1].split(':')[0],
  port: parseInt(redisUrl.port || '6379'),
  username: 'default',
  password: process.env.REDIS_URL!.split(':')[2].split('@')[0],
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  reconnectOnError: (err: Error) => {
    console.log('🔁 Reconnecting on error:', err.message);
    return true;
  },
  retryStrategy: (times: number) => {
    console.log(`♻️ Redis reconnect attempt ${times}`);
    return Math.min(times * 100, 3000);
  }
};

const redisConnection = new IORedis(redisConfig);

// 3. Worker initialization with explicit checks
let worker: Worker;

async function initializeWorker() {
  console.log('🔧 Creating BullMQ worker...');
  
  worker = new Worker('postQueue', async job => {
    console.log(`🔔 Received job ${job.id} [${job.name}]`);
    console.log('📦 Job data:', JSON.stringify(job.data, null, 2));
    
    // Your job processing logic here
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true };
  }, {
    connection: redisConnection,
    concurrency: 5,
    autorun: true // Ensure worker starts automatically
  });

  // 4. Add worker event listeners
  worker
    .on('ready', () => console.log('👷 Worker is ready'))
    .on('closing', () => console.log('🛑 Worker closing'))
    .on('active', (job) => console.log(`🏃 Job ${job.id} active`))
    .on('completed', (job) => console.log(`🎉 Job ${job.id} completed`))
    .on('failed', (job, err) => console.error(`💥 Job ${job?.id} failed:`, err));

  console.log('✅ Worker initialized successfully');
}

// 5. Add connection checks
redisConnection
  .on('connect', () => console.log('🔗 Redis connection established'))
  .on('close', () => console.log('🔌 Redis connection closed'))
  .on('end', () => console.log('🔚 Redis connection ended'));

// 6. Initialize the worker with error handling
initializeWorker().catch(err => {
  console.error('🔥 Worker initialization failed:', err);
  process.exit(1);
});

// 7. Enhanced health check endpoint
app.get('/health', async (req, res) => {
  try {
    const [workerStatus, queueCount] = await Promise.all([
      worker.isRunning(),
      redisConnection.xlen('bull:postQueue:wait')
    ]);

    res.json({
      status: 'ok',
      worker: workerStatus ? 'running' : 'stopped',
      pending_jobs: queueCount,
      redis_status: redisConnection.status
    });
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

app.listen(PORT, () => {
  console.log(`📊 Health check available on port ${PORT}/health`);
});

// 8. Handle uncaught errors
process
  .on('unhandledRejection', (reason, promise) => {
    console.error('🤯 Unhandled Rejection at:', promise, 'reason:', reason);
  })
  .on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
  });

// 9. Graceful shutdown
async function shutdown() {
  console.log('\n🛑 Received shutdown signal');
  await worker.close();
  await redisConnection.quit();
  console.log('👋 Services stopped gracefully');
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// 10. Add startup check for existing jobs
async function checkExistingJobs() {
  try {
    const count = await redisConnection.xlen('bull:postQueue:wait');
    console.log(`📊 Queue status: ${count} pending jobs`);
    
    if (count > 0) {
      console.log('⏳ Processing existing jobs...');
    }
  } catch (error) {
    console.error('⚠️ Failed to check queue status:', error);
  }
}

// Initial check after 5 seconds
setTimeout(checkExistingJobs, 5000);