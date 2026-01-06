import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  mongodbUri: process.env.MONGODB_URI,
  openrouterApiKey: process.env.OPENROUTER_API_KEY,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};

if (!config.openrouterApiKey) {
  console.error('❌ OPENROUTER_API_KEY is required in .env file');
  process.exit(1);
}

if (!config.mongodbUri) {
  console.error('❌ MONGODB_URI is required in .env file');
  process.exit(1);
}

console.log('✅ Environment variables loaded:', {
  nodeEnv: config.nodeEnv,
  port: config.port,
  openrouterApiKey: config.openrouterApiKey ? 'Set' : 'Not set',
});

export default config;