import * as Joi from 'joi';

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  MONGODB_URI: Joi.string().uri().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().port().required(),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  QUEUE_CONCURRENCY: Joi.number().integer().min(1).default(10),
  PUSH_QUEUE_NAME: Joi.string().default('push-queue'),
  SEND_CAMPAIGN_JOB: Joi.string().default('send-campaign'),
  SWAGGER_PATH: Joi.string().default('docs'),
  API_BASE_URL: Joi.string().uri().required(),
  VAPID_SUBJECT: Joi.string().required(),
  VAPID_PUBLIC_KEY: Joi.string().required(),
  VAPID_PRIVATE_KEY: Joi.string().required(),
});

export function validateEnvironment(config: Record<string, unknown>) {
  const validationResult = envSchema.validate(config, {
    abortEarly: false,
    allowUnknown: true,
  });
  const error = validationResult.error;
  const value = validationResult.value as Record<string, unknown>;

  if (error) {
    throw new Error(`Environment validation failed: ${error.message}`);
  }

  return value;
}
