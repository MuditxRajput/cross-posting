import { Worker } from 'bullmq';
import { processJob } from './scheduling/processJob';

const worker = new Worker(
  'postQueue',
  async (job) => {
    processJob(job);
  },
  {
    connection: {
      username: process.env.REDIS_USERNAME || 'default', // Use environment variable
      password: process.env.REDIS_PASSWORD || 'e8IHtwdiLothIIYXKyNIf203U7AbLCAH', // Use environment variable
      host: process.env.REDIS_HOST || 'redis-16805.c277.us-east-1-3.ec2.redns.redis-cloud.com', // Use environment variable
      port: parseInt(process.env.REDIS_PORT || '16805', 10), // Use environment variable
    },
  }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error:`, err);
});