import 'dotenv/config';
import mongoose from 'mongoose';
export const  dbConnection=async()=>{
    try {
        const response = await mongoose.connect(process.env.MONGO_URL || "");
        return mongoose;
    } catch (error) {
        console.error("Error in database", error);
        throw new Error("Database connection failed");
    }
}
dbConnection();