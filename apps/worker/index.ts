require('dotenv').config(); // Load environment variables from .env file

const Redis = require('ioredis');

// Connect to your Redis instance using the host and port provided
const redis = new Redis({
  host: process.env.REDIS_URL ? process.env.REDIS_URL.split(':')[0] : 'localhost', // Your Redis host (e.g., 'post-19d1vz.serverless.use1.cache.amazonaws.com')
  port: process.env.REDIS_URL ? parseInt(process.env.REDIS_URL.split(':')[1], 10) : 6379, // Redis port (e.g., '6379')
  tls: process.env.REDIS_URL ? {} : undefined, // Add TLS if Redis URL is used (for encrypted connections)
});

// Listen for successful Redis connection
redis.on('connect', () => {
  console.log('Connected to Redis!');
});

// Example of setting and getting a value from Redis
async function testRedis() {
  try {
    // Set a value in Redis
    await redis.set('myKey', 'Hello Redis');
    
    // Get the value from Redis
    const value = await redis.get('myKey');
    
    // Print the value from Redis
    console.log('Value from Redis:', value); // Should print 'Hello Redis'
  } catch (err) {
    console.error('Error interacting with Redis:', err);
  }
}

// Test Redis connection and operations
testRedis().catch(console.error);
