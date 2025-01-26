import { Worker } from 'bullmq';
import { processJob } from './scheduling/processJob';

const worker = new Worker(
  'postQueue',
  async (job) => {
    processJob(job);
  },
  {
    connection: {
      username: 'default', // Use environment variable
      password: process.env.REDIS_PASSWORD , // Use environment variable
      host: process.env.REDIS_HOST , // Use environment variable
      port: parseInt(process.env.REDIS_PORT || '16805', 10), // Use environment variable
    },
  }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job} failed with error:`, err);
});