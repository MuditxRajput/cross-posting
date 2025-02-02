// redis-test.js
require('dotenv').config();
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_URL,
  port: 6379,
  tls: {},
  retryStrategy(times:any) {
    return Math.min(times * 50, 2000);
  }
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis!');
});

redis.on('error', (error:any) => {
  console.error('Redis Error:', error);
});

async function testRedisOperations() {
  try {
    // Test setting a value
    await redis.set('test-key', 'Hello from EC2!');
    console.log('Successfully set test-key');

    // Test getting the value
    const value = await redis.get('test-key');
    console.log('Retrieved value:', value);

    // Clean up
    await redis.quit();
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error during Redis operations:', error);
    process.exit(1);
  }
}

testRedisOperations();