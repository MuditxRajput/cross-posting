const Redis = require('ioredis');

// Connect to your Redis instance using the host and port provided
const redis = new Redis({
  host: process.env.REDIS_URL, // Your Redis host
  port: 6379, // Redis port
  db: 0, // Optionally, specify the Redis database number
});

// Test the connection
redis.on('connect', () => {
  console.log('Connected to Redis!');
});

// Example of setting and getting a value
async function testRedis() {
  await redis.set('myKey', 'Hello Redis');
  const value = await redis.get('myKey');
  console.log('Value from Redis:', value); // Should print 'Hello Redis'
}

testRedis().catch(console.error);
