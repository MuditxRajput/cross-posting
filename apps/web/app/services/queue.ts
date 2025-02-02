import { Queue } from "bullmq";
import IORedis from "ioredis";

// Declare types for better type safety
let redisConnection: IORedis | null = null;
let postQueue: Queue | null = null;

// Only initialize if we're on the server side
if (typeof window === 'undefined') {
  const initializeQueue = () => {
    if (process.env.NODE_ENV === 'production') {
      // Type assertion to tell TypeScript that we know this will exist at runtime
      const redisUrl = process.env.REDIS_PUBLIC_URL as string;
      
      try {
        console.log("Initializing Redis in Node.js runtime...");
        redisConnection = new IORedis(redisUrl, {
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        });
        postQueue = new Queue("postQueue", { connection: redisConnection });
      } catch (error) {
        console.error("Failed to initialize Redis connection:", error);
        redisConnection = null;
        postQueue = null;
      }
    } else {
      console.log("Skipping Redis initialization in non-production environment...");
    }
  };

  // Initialize queue
  initializeQueue();
}

export { postQueue };