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
        enum:["video","image","text"],
        required:true,
    },

},{timestamps:true})

export const Media = mongoose.models.Media ||  mongoose.model("Media",mediaSchema)
// export const Media =  mongoose.model("Media",mediaSchema)