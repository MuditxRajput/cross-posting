import { Worker } from "bullmq";
import Redis from "ioredis";

// Redis configuration (same as in Lambda)
const redisConfig = {
  host: "redisposting-19d1vz.serverless.use1.cache.amazonaws.com",
  port: 6379,
  tls: {},  // TLS enabled for AWS ElastiCache
  maxRetriesPerRequest: null,
  enableReadyCheck: false
};

// Connect to Redis Cluster
const connection = new Redis.Cluster([redisConfig]);

// Process function
const processJob = async (job:any) => {
  try {
    console.log(`🔄 Processing job: ${job.id}`);
    
    const { formData, email, mediaType } = job.data;

    // Simulate processing
    console.log(`✅ Job Data:`, { formData, email, mediaType });

    // Here you can add the logic to handle the job, like posting to social media or storing in DB.
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate async work
    
    console.log(`✅ Job ${job.id} processed successfully!`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error processing job ${job.id}:`, error);
    throw error;
  }
};

// Create a worker to listen for jobs
const worker = new Worker(
  "postQueue",
  async (job) => await processJob(job),
  {
    connection,
    prefix: "{bull}", // Ensure keys are in the same slot
    limiter: {
      max: 5,  // Process 5 jobs at a time
      duration: 1000 // Every second
    }
  }
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed!`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job} failed:`, err);
});

worker.on("error", (err) => {
  console.error("❌ Worker error:", err);
});

console.log("🚀 Worker is running and listening for jobs...");
