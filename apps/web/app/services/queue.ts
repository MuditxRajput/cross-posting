import { Queue } from 'bullmq';
import IORedis, { RedisOptions } from 'ioredis';

let redisConnection: IORedis | null = null;
let postQueue: Queue | null = null;

// Function to initialize the Redis connection and queue
async function initializeRedis() {
  if (!redisConnection) {
    if (!process.env.REDIS_PUBLIC_URL) {
      throw new Error('REDIS_PUBLIC_URL environment variable is not defined');
    }

    const redisUrl = new URL(process.env.REDIS_PUBLIC_URL);
    
    const redisOptions: RedisOptions = {
      host: redisUrl.hostname,
      port: parseInt(redisUrl.port, 10),
      username: redisUrl.username || 'default',
      password: redisUrl.password ? decodeURIComponent(redisUrl.password) : undefined,
      tls: undefined,  // Remove TLS if not needed
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    };

    redisConnection = new IORedis(redisOptions);

    redisConnection.on('connect', () => console.log('🟡 Connecting to Redis...'));
    redisConnection.on('ready', () => console.log('✅ Redis Ready!'));
    redisConnection.on('error', (err) => console.error('❌ Redis connection error:', err));
  }

  if (redisConnection) {
    postQueue = new Queue('postQueue', {
      connection: redisConnection,
      defaultJobOptions: {
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    });
  }
}

// Initialize Redis connection and queue globally on application startup
initializeRedis().catch((error) => {
  console.error('Error initializing Redis:', error);
});

export { postQueue };
