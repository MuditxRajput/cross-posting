import { dbConnection } from '@database/database';
import { Worker, Queue } from 'bullmq';
import express from 'express';
import IORedis from 'ioredis';
import { processJob } from './scheduling/processJob';

// Config
const app = express();
const PORT = process.env.PORT || 3001;

// Redis setup
const redisUrl = new URL(process.env.REDIS_URL!);
const redisConfig = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port),
  username: redisUrl.username || 'default',
  password: decodeURIComponent(redisUrl.password),
  tls: redisUrl.protocol === 'rediss:' ? { rejectUnauthorized: false } : undefined
};

const redisConnection = new IORedis(redisConfig);

// BullMQ Worker
const queue = new Queue('postQueue', {
  connection: redisConnection
});

const queueWorker = new Worker('postQueue', processJob, {
  connection: redisConnection,
  concurrency: 5
});

// Express setup
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Job endpoint
app.post('/job', async (req, res) => {
  try {
    const { type, payload, delay } = req.body;
    await queue.add(type, payload, { delay });
    
    // Removed invalid queueWorker.add line
    
    res.status(202).json({
      status: 'scheduled',
      delay: `${delay}ms`
    });
  } catch (error) {
    console.error('Job submission failed:', error);
    res.status(500).json({ error: 'Job scheduling failed' });
  }
});

// Start server
app.listen(PORT, async () => {
  await dbConnection();
  console.log(`Worker running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await queueWorker.close();
  await redisConnection.quit();
  process.exit(0);
});