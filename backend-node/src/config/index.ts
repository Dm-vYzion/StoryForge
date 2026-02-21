import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  mongo: {
    uri:
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      'mongodb://localhost:27017/storyforge',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  ai: {
    providerApiKey: process.env.AI_PROVIDER_API_KEY || '',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  planLimits: {
    free: parseInt(process.env.FREE_PLAN_AI_LIMIT || '100', 10),
    pro: parseInt(process.env.PRO_PLAN_AI_LIMIT || '1000', 10),
    lifetime: parseInt(process.env.LIFETIME_PLAN_AI_LIMIT || '5000', 10),
    admin: Infinity,
  },
} as const;

export type Config = typeof config;
