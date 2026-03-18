import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  swaggerPath: process.env.SWAGGER_PATH ?? 'docs',
  apiBaseUrl:
    process.env.API_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`,
  queueConcurrency: Number(process.env.QUEUE_CONCURRENCY ?? 10),
}));

export const databaseConfig = registerAs('database', () => ({
  uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/push-mvp',
}));

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
  password: process.env.REDIS_PASSWORD || undefined,
}));

export const queueConfig = registerAs('queue', () => ({
  name: process.env.PUSH_QUEUE_NAME ?? 'push-queue',
  sendCampaignJobName: process.env.SEND_CAMPAIGN_JOB ?? 'send-campaign',
}));

export const vapidConfig = registerAs('vapid', () => ({
  subject: process.env.VAPID_SUBJECT ?? '',
  publicKey: process.env.VAPID_PUBLIC_KEY ?? '',
  privateKey: process.env.VAPID_PRIVATE_KEY ?? '',
}));
