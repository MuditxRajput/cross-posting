import { Worker } from 'bullmq';
import { processJob } from './scheduling/processJob';

// Ensure Redis URL is set
if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL environment variable is not defined');
}

// Parse Redis URL from Railway
const redisUrl = new URL(process.env.REDIS_URL);

const redisOptions = {
  host: redisUrl.hostname, 
  port: parseInt(redisUrl.port, 10), 
  password: redisUrl.password ? decodeURIComponent(redisUrl.password) : undefined, // Ensure password is decoded
};

// ✅ Initialize the BullMQ worker
const worker = new Worker('postQueue', async (job) => {
  console.log(`Processing job ${job.id}`);
  await processJob(job);
}, { connection: redisOptions });

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error:`, err);
});
