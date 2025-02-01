import { Queue } from 'bullmq';
import IORedis, { RedisOptions } from 'ioredis';

if (!process.env.REDIS_PUBLIC_URL) {
  throw new Error('REDIS_PUBLIC_URL environment variable is not defined');
}

const redisUrl = new URL(process.env.REDIS_PUBLIC_URL);

// ✅ Use correct Redis connection settings
const redisOptions: RedisOptions = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port, 10),
  username: redisUrl.username || 'default',
  password: redisUrl.password ? decodeURIComponent(redisUrl.password) : undefined,
  tls: undefined,  // ❌ Remove TLS
  maxRetriesPerRequest: null,
  enableReadyCheck: false
};

const redisConnection = new IORedis(redisOptions);

redisConnection.on('connect', () => console.log('🟡 Connecting to Redis...'));
redisConnection.on('ready', async () => console.log('✅ Redis Ready!'));
redisConnection.on('error', (err) => console.error('❌ Redis connection error:', err));

export const postQueue = new Queue('postQueue', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 1000,
    removeOnFail: 5000
  }
});
