import 'dotenv/config';
import mongoose from 'mongoose';
export const  dbConnection=async()=>{
    try {
        const response = await mongoose.connect(process.env.MONGO_URL || "");
        if(response)
        {
            console.log("database is connected");
            
            return true;
        }
        return false;
    } catch (error) {
        console.log("Error in database",error);
        
        return false
    }
}
dbConnection();