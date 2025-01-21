import { Worker } from 'bullmq';
import { processJob } from './scheduling/processJob';

const worker = new Worker(
  'postQueue',
  async (job) => {

    processJob(job);
 
  },
  {
    connection: {
      host: 'localhost',
      port: 6379,
    },
  }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
  console.error( err);
});