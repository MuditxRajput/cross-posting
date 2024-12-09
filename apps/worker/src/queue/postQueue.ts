import { Queue } from 'bullmq';

// Create a BullMQ queue
export const postQueue = new Queue('postQueue', {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});

console.log('Post queue initialized.');
