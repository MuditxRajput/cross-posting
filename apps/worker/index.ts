import Redis from 'ioredis';

const redis = new Redis.Cluster(
  [
    {
      host: "redisposting-19d1vz.serverless.use1.cache.amazonaws.com",
      port: 6379,
    },
  ],
  {
    redisOptions: {
      tls: { rejectUnauthorized: false }, // Remove if TLS is not required
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    },
  }
);

redis.on('connect', () => {
  console.log('✅ Connected to Redis Cluster!');
});

redis.on('error', (err) => {
  console.error('❌ Redis Error:', err);
});