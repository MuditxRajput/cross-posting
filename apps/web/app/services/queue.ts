// import { Queue } from 'bullmq';
// import IORedis from 'ioredis';

// if (!process.env.REDIS_PUBLIC_URL) {
//   throw new Error('❌ REDIS_PUBLIC_URL is not set');
// }

// // Create Redis connection
// const redisConnection = new IORedis(process.env.REDIS_PUBLIC_URL, {
//   maxRetriesPerRequest: null,
//   enableReadyCheck: false,
// });

// redisConnection.on('connect', () => console.log('🟡 Connecting to Redis...'));
// redisConnection.on('ready', () => console.log('✅ Redis Ready!'));
// redisConnection.on('error', (err) => console.error('❌ Redis connection error:', err));

// // Create the BullMQ queue
// const postQueue = new Queue('postQueue', {
//   connection: redisConnection,
//   defaultJobOptions: {
//     removeOnComplete: 1000,
//     removeOnFail: 5000,
//   },
// });

// export { postQueue };
