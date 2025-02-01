// apps/worker/src/index.ts
import { Worker } from 'bullmq';
import express from 'express';
import IORedis, { RedisOptions } from 'ioredis';

// Initialize Express for health checks
const app = express();
const PORT = process.env.PORT || 3000;

// Validate environment variables
const REQUIRED_ENV = ['REDIS_URL', 'REDIS_PUBLIC_URL'];
REQUIRED_ENV.forEach(env => {
  if (!process.env[env]) throw new Error(`${env} environment variable is required`);
});

// Use internal URL for Railway-to-Redis communication
const redisInternalUrl = new URL(process.env.REDIS_URL!);
const redisPublicUrl = new URL(process.env.REDIS_PUBLIC_URL!);

// Configure Redis connection for internal network
const redisConfig: RedisOptions = {
  host: redisInternalUrl.hostname,
  port: Number(redisInternalUrl.port),
  username: redisInternalUrl.username || 'default',
  password: decodeURIComponent(redisInternalUrl.password),
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  family: 0 // Dual stack IP support
};

// Initialize Redis connection
const redisConnection = new IORedis(redisConfig);

// Redis connection events
redisConnection
  .on('connect', () => console.log('🟡 Connecting to Railway Internal Redis...'))
  .on('ready', () => console.log('✅ Redis connection established'))
  .on('error', (err) => console.error('❌ Redis error:', err));

// BullMQ Worker Setup
const worker = new Worker('postQueue', async job => {
  try {
    console.log(`🏁 Starting job ${job.id} (${job.name})`);
    console.log('📦 Job data:', job.data);
    
    // Simulate job processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`✅ Completed job ${job.id}`);
    return { success: true };
  } catch (error) {
    console.error(`🔥 Failed job ${job.id}:`, error);
    throw error;
  }
}, {
  connection: redisConnection,
  concurrency: 5,
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 5000 }
});

// Worker event listeners
worker
  .on('active', (job) => console.log(`⚡ Job ${job.id} active`))
  .on('completed', (job) => console.log(`🎉 Job ${job.id} completed`))
  .on('failed', (job, err) => console.error(`❌ Job ${job?.id} failed:`, err))
  .on('error', (err) => console.error('🚨 Worker error:', err));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    redis: redisConnection.status,
    worker: worker.isRunning()
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚦 Health check available on port ${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down...');
  await worker.close();
  await redisConnection.quit();
  process.exit(0);
});