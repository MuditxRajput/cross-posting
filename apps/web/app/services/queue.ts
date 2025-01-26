import { createClient } from 'redis';

const client = createClient({
  username:  'default', // Use environment variable
  password: process.env.REDIS_PASSWORD,  // Use environment variable
  socket: {
    host: process.env.REDIS_HOST || 'redis-16805.c277.us-east-1-3.ec2.redns.redis-cloud.com', // Use environment variable
    port: parseInt(process.env.REDIS_PORT || '16805', 10), // Use environment variable
  },
});

client.on('error', (err) => console.log('Redis Client Error', err));

await client.connect();

await client.set('foo', 'bar');
const result = await client.get('foo');
console.log(result); // >>> bar