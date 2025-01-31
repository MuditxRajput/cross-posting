import { Queue } from 'bullmq';
import IORedis, { RedisOptions } from 'ioredis';

// Validate environment variable
if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL environment variable is not defined');
}

// Parse Redis URL from environment variable
const redisUrl = new URL(process.env.REDIS_URL);

// Configure Redis connection options
const redisOptions: RedisOptions = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port, 10),
  username: redisUrl.username || 'default',
  password: redisUrl.password ? decodeURIComponent(redisUrl.password) : undefined,
  tls: redisUrl.protocol === 'rediss:' ? { 
    rejectUnauthorized: false // Required for Railway's TLS setup
  } : undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false
};

// Create shared Redis connection instance
const redisConnection = new IORedis(redisOptions);

// Add connection event listeners
redisConnection.on('connect', () => {
  console.log('🟡 Connecting to Redis from web...');
});

redisConnection.on('ready', () => {
  console.log('✅ Web Redis connection established');
});

redisConnection.on('error', (err) => {
  console.error('❌ Web Redis connection error:', err);
});

// Create Queue instance
export const postQueue = new Queue('postQueue', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 1000,
    removeOnFail: 5000
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Closing web queue connection...');
  await postQueue.close();
  await redisConnection.quit();
});