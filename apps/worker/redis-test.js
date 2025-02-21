import Redis from 'ioredis';

const redis = new Redis({
  host: 'redisposting-19d1vz.serverless.use1.cache.amazonaws.com',
  port: 6379,
  tls: {} // Required for AWS Valkey/ElastiCache
});

redis.on('connect', () => console.log('✅ Connected to Redis'));
redis.on('error', (error) => console.error('❌ Redis Error:', error));

async function testRedis() {
  try {
    const pong = await redis.ping();
    console.log('Redis Ping Response:', pong);
  } catch (error) {
    console.error('Ping Error:', error);
  } finally {
    redis.quit();
  }
}

testRedis();
