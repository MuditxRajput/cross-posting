import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from './models/user.model';

export { User };

export const  dbConnection=async()=>{
    try {
        console.log(process.env.MONGO_URL);
        
        const response = await mongoose.connect(process.env.MONGO_URL || "");
        console.log("Database connected successfully");
        return mongoose;
    } catch (error) {
        console.error("Error in database", error);
        throw new Error("Database connection failed");
    }
}
dbConnection();
// export { User } from './models/user.model';