import { Queue } from 'bullmq';

// Parse the Redis URL
const redisUrl = new URL('redis://default:TYnGCAxQOuQcLKnoQpIZFLEwRxAlEAlu@junction.proxy.rlwy.net:56489');

// Extract connection details
const redisOptions = {
  host: redisUrl.hostname, 
  port: parseInt(redisUrl.port, 10), 
  password: redisUrl.password,
};

// ✅ Correct: Pass Redis options directly
export const postQueue = new Queue('postQueue', {
  connection: redisOptions,
});
