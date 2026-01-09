/**
 * Environment Configuration
 * Handles different environments (development, production, etc.)
 */

// Development configuration
const development = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'COBRIA',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  DEBUG: import.meta.env.VITE_DEBUG === 'true' || true
};

// Production configuration
const production = {
  API_URL: import.meta.env.VITE_API_URL || 'https://your-backend.railway.app',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'COBRIA',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  DEBUG: import.meta.env.VITE_DEBUG === 'true' || false
};

// Get current environment
const getEnvironment = () => {
  const env = import.meta.env.MODE || 'development';
  return env === 'production' ? production : development;
};

// Export configuration
export const config = getEnvironment();

// Export individual values for convenience
export const API_URL = config.API_URL;
export const APP_NAME = config.APP_NAME;
export const VERSION = config.VERSION;
export const DEBUG = config.DEBUG;

// Log configuration in development
if (DEBUG) {
  console.log('🔧 Environment Configuration:', {
    mode: import.meta.env.MODE,
    apiUrl: API_URL,
    appName: APP_NAME,
    version: VERSION,
    allEnvVars: import.meta.env
  });
}
