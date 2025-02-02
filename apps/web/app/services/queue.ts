import { Queue } from "bullmq";
import IORedis from "ioredis";

// Declare types for better type safety
let redisConnection: IORedis | null = null;
let postQueue: Queue | null = null;
console.log(process.env.REDIS_PUBLIC_URL);
// Only initialize if we're on the server side
if (typeof window === 'undefined') {
  const initializeQueue = () => {
    if (process.env.NODE_ENV === 'production') {
      console.log("Initializing Redis in Node.js runtime...");
      redisConnection = new IORedis(process.env.REDIS_PUBLIC_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      });
      postQueue = new Queue("postQueue", { connection: redisConnection });
    } else {
      console.log("Skipping Redis initialization in non-production environment...");
    }
  };

  // Initialize queue
  initializeQueue();
}

export { postQueue };