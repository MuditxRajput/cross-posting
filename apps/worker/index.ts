import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { processJob } from './scheduling/processJob';

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL is not set');
}

const redisUrl = new URL(process.env.REDIS_URL);

// Append '?family=0' to enable dual stack lookup (IPv4 and IPv6)
const redisConfig = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port),
  username: redisUrl.username || 'default',
  password: decodeURIComponent(redisUrl.password),
  tls: undefined,  // Remove TLS if not needed
  family: 0        // Dual stack lookup (both IPv4 and IPv6)
};

const redisConnection = new IORedis(redisConfig);

// Log when Redis is connected
redisConnection.on('connect', () => {
  console.log('✅ Redis is connected');
});



const queueWorker = new Worker(
  'postQueue', // Queue name
  async job => {
    console.log('Starting job:', job.name);
    // Add your job processing logic here
    const { email, formData, mediaType } = job.data;
    if (job.name === 'schedulePost') {
      console.log('Processing post:', formData);
      // Your job processing logic (e.g., post to Instagram)
    }
    return 'Job completed successfully';
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);


queueWorker.on('completed', (job) => console.log(`✅ Job ${job.id} completed`));
queueWorker.on('failed', (job, err) => console.error(`❌ Job ${job?.id} failed:`, err));

process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await queueWorker.close();
  await redisConnection.quit();
  process.exit(0);
});
