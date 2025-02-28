import { Queue } from "bullmq";
import IORedis from "ioredis";

let redisConnection: IORedis | null = null;
let postQueue: Queue | null = null;

if (typeof window === 'undefined') {
  const initializeQueue = () => {
    if (process.env.NODE_ENV === 'production') {
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

  initializeQueue();
}

export { postQueue };