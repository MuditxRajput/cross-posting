import mongoose from "mongoose";
const subscriptionSchema = new mongoose.Schema({
    userId :{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    paymentId:{
        type:String
    },
    subscriptionStatus:{
        type: String,
      enum: ['active', 'inactive', 'trial', 'canceled'], 
      default: 'inactive', 
    },
    paymentDate:{
        type:Date,
        
        required:true,
    },
    renewelDate:{
        type:Date,
        
        required:true,

    }

},{timestamps:true})

export const Subscription = mongoose.model("Subscription",subscriptionSchema);