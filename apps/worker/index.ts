import { Worker } from 'bullmq';
import { processJob } from './scheduling/processJob';

const worker = new Worker(
  'postQueue',
  async (job) => {

    processJob(job);
 
  },
  {
    connection: {
      host: process.env.HOST || "localhost",
      port: parseInt(process.env.PORT || "6379", 10),
    },
  }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
  console.error( err);
});