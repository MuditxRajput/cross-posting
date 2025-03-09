import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from './models/user.model';

export { User };

// Track connection promise to avoid multiple connection attempts
let connectionPromise: Promise<typeof mongoose> | null = null;

export const dbConnection = async () => {
    try {
        // If already connected, return immediately
        if (mongoose.connection.readyState === 1) {
            console.log("Already connected to MongoDB ✅");
            return mongoose;
        }
        
        // If connection is in progress, wait for it
        if (connectionPromise) {
            return connectionPromise;
        }

        console.log("Connecting to MongoDB...");
        
        // Store the connection promise to reuse
        connectionPromise = mongoose.connect(process.env.MONGO_URL || "", {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            // Add these options for better serverless performance:
            maxPoolSize: 10, // Limit pool size for serverless
            minPoolSize: 1,  // Keep at least one connection in the pool
            maxIdleTimeMS: 30000, // Close idle connections after 30s
            // Add exponential backoff for connection retries:
            retryWrites: true,
            retryReads: true,
        });
        
        try {
            await connectionPromise;
            console.log("✅ Database connected successfully!");
            return connectionPromise;
        } catch (error) {
            connectionPromise = null; // Reset on failure
            throw error;
        }
    } catch (error) {
        console.error("❌ Error in database connection:", error);
        // Wait before retrying to avoid rapid retry loops
        await new Promise(resolve => setTimeout(resolve, 1000));
        throw new Error("Database connection failed");
    }
};

// Don't auto-connect when importing - let the application call dbConnection explicitly
// dbConnection(); <- Remove this line