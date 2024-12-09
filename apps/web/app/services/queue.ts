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
    host: 'localhost',
    port: 6379,
  },
});

console.log('Post queue initialized.');
