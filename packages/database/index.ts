import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from './models/user.model';

export { User };

export const dbConnection = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            console.log("Already connected to MongoDB ✅");
            return;
        }

        console.log("Connecting to MongoDB...", process.env.MONGO_URL);

        await mongoose.connect(process.env.MONGO_URL || "", {
       
            serverSelectionTimeoutMS: 30000, // Wait 30s before failing
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        });

        console.log("✅ Database connected successfully!");
    } catch (error) {
        console.error("❌ Error in database connection:", error);
        throw new Error("Database connection failed");
    }
};

// Only connect when running the app
dbConnection();
