import { Worker } from 'bullmq';
// import { processPost } from './jobs/processPost';

const worker = new Worker(
  'postQueue',
  async (job) => {
    console.log(`Job received:`, job.data);
 
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
