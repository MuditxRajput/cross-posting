import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { processJob } from './scheduling/processJob';

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL is not set');
}

const redisUrl = new URL(process.env.REDIS_URL);

const redisConfig = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port),
  username: redisUrl.username || 'default',
  password: decodeURIComponent(redisUrl.password),
  tls: undefined  // ❌ Remove TLS
};

const redisConnection = new IORedis(redisConfig);

const queueWorker = new Worker('postQueue', processJob, {
  connection: redisConnection,
  concurrency: 5
});

queueWorker.on('completed', (job) => console.log(`✅ Job ${job.id} completed`));
queueWorker.on('failed', (job, err) => console.error(`❌ Job ${job?.id} failed:`, err));

process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await queueWorker.close();
  await redisConnection.quit();
  process.exit(0);
});
