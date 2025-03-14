import mongoose from "mongoose";
const postSchema = new mongoose.Schema({
    UserId :{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    platform:{
        type:[String],
        required:true,
    },
    content:{
        type:Object,
        required:true,
    },
    scheduleTime:{
        type : Date,
        required : true,
    }


},{timestamps:true})

export const Post = mongoose.models.Post || mongoose.model("Post",postSchema);