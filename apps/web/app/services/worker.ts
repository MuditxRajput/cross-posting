import { Job, Worker } from "bullmq";

const worker = new Worker(
    'postQueue',
    async(job:Job)=>{
        console.log(`job data`,job.data);  
    },
    {
        connection:{
            host:'localhost',
            port :6379,
        },
        concurrency: 10
    }
);
// worker.on('completed',(job))
worker.on('completed', (job) => {
    console.log(`Job with ID ${job.id} completed successfully.`);
  });