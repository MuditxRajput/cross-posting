import mongoose from "mongoose";
const mediaSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    url:{
        type:String,
        required:true,
    },
    mediaType:{
        type: String,
        enum:["Video","Image","Text"],
        // required:true,
    },

},{timestamps:true})

export const Media = mongoose.models.Media ||  mongoose.model("Media",mediaSchema)