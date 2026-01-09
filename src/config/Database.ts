// Dependencies
const { Sequelize } = require("sequelize");
const mongoose = require("mongoose");
import { TypeOrmConfig } from "../Contexts/Shared/infrastructure/typeorm/TypeOrmConfig";
// Env variables
import {
  database_name,
  database_host,
  database_password,
  database_port,
  database_user,
  endpoint_database,
  mongo_url,
  environment,
  database_url,
} from "./Constants";

export const database = new Sequelize({
  host: database_host,
  database: database_name,
  username: database_user,
  password: database_password,
  port: database_port,
  dialect: "postgres",
  logging: false,
  ...(() => {
    if (environment !== "dev") {
      return {
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
      };
    }
    return {};
  })(),
  connection: {
    options: `project=${endpoint_database}`,
  },
});

export const databaseConfigProps: TypeOrmConfig = {
  host: database_host!,
  port: database_port,
  username: database_user!,
  password: database_password!,
  database: database_name!,
  url: database_url!,
};

// MongoDB connection with Railway-optimized configuration
export const mongoDB = (() => {
  if (!mongo_url) {
    console.log("MONGO_URL not set, skipping MongoDB connection");
    return Promise.resolve();
  }
  
  console.log("Attempting to connect to MongoDB:", mongo_url.replace(/\/\/.*@/, '//***:***@')); // Log without credentials
  
  return mongoose.connect(mongo_url, {
    // Updated MongoDB 6.x compatible options
    serverSelectionTimeoutMS: environment === 'production' ? 15000 : 10000,
    connectTimeoutMS: environment === 'production' ? 20000 : 15000,
    socketTimeoutMS: environment === 'production' ? 45000 : 30000,
    maxPoolSize: environment === 'production' ? 1 : 2,
    minPoolSize: 0,
    maxIdleTimeMS: environment === 'production' ? 15000 : 10000,
    retryWrites: true,
    retryReads: true,
    // MongoDB 6.x compatible options
    bufferCommands: false,
    // Handle Railway's network quirks
    heartbeatFrequencyMS: environment === 'production' ? 15000 : 10000,
    // Production-specific options
    ...(environment === 'production' && {
      authSource: 'admin',
      ssl: false,
      tls: false,
    }),
  })
  .then(() => {
    console.log("✅ Connected to MongoDB successfully");
    // Set up connection event handlers
    mongoose.connection.on('error', (error: any) => {
      console.error("MongoDB connection error:", error.message);
    });
    mongoose.connection.on('disconnected', () => {
      console.warn("MongoDB disconnected");
    });
    mongoose.connection.on('reconnected', () => {
      console.log("MongoDB reconnected");
    });
  })
  .catch((error: any) => {
    console.error("❌ MongoDB connection failed:", error.message);
    console.log("Application will continue with PostgreSQL only");
    
    // In production, don't retry MongoDB connection to avoid resource waste
    if (environment === 'production') {
      console.log("Production mode: MongoDB disabled to prevent connection issues");
    }
    
    // Don't exit the process, just log the error
    // The app can still work with PostgreSQL/TypeORM
  });
})();
