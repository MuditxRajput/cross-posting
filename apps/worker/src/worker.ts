import { Worker } from 'bullmq';

const worker = new Worker(
  'postQueue',
  async (job) => {
    console.log("job",job.data.formData.platform);

 
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
