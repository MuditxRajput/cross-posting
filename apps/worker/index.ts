// redis-test.js
require('dotenv').config();
import { Worker } from 'bullmq';
import { processJob } from './scheduling/processJob';
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_URL,
  port: 6379,
  tls: {},
  retryStrategy(times:any) {
    return Math.min(times * 50, 2000);
  }
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis!');
});

redis.on('error', (error:any) => {
  console.error('Redis Error:', error);
});



const worker = new Worker(
  'postingQueue', // Queue name
  async (job) => {
    console.log(`Processing job ${job.id}`);
    await processJob(job); // Use the processJob function to handle the job
  },
  {
    connection: redis, // Use the Redis connection
    concurrency: 5, // Number of jobs to process concurrently
    removeOnComplete: { count: 100 }, // Keep the last 100 completed jobs
    removeOnFail: { count: 100 }, // Keep the last 100 failed jobs
  }
);