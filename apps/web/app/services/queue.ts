import { Queue } from 'bullmq';
import { createClient } from 'redis';

// Redis connection setup
const redisUrl = 'redis://localhost:6379';
const redisClient = createClient({ url: redisUrl });
redisClient.connect().catch((err) => {
  console.error('Error connecting to Redis:', err);
});

// Create the queue
export const postQueue = new Queue('postQueue', {
  connection: {
    host: process.env.HOST,
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
  },
});

console.log('Post queue initialized.');
