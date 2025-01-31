import { postQueue } from "@/app/services/queue";
import { dbConnection, User } from "@database/database";
import { NextResponse } from "next/server";

export async function POST(req:any) {
  try {
    await dbConnection();
    const val = await req.json();    
    const {formData,email,mediaType} = val;
    const dateTime = new Date(formData.dateTime);
    const queueData = {
      formData,
      email,
      mediaType
    }
    console.log("queueData",queueData);
    
    if (isNaN(dateTime.getTime())) {
      return NextResponse.json({ message: "Invalid dateTime format", success: false });
    }

    // Calculate delay
    const delay = dateTime.getTime() - Date.now();
    if (delay <= 0) {
      return NextResponse.json({ message: "DateTime must be in the future", success: false });
    }
    const existedUser = await User.findOne({email:email});
    console.log("existedUser",existedUser);
    try {
      if (existedUser && typeof existedUser.cycle === 'number' && existedUser.cycle > 0) {
        existedUser.cycle = existedUser.cycle - 1;
        await existedUser.save();
        await postQueue.add("schedulePost", queueData, { delay });
        console.log("Post scheduled successfully");
        
        return NextResponse.json({ message: "Post scheduled successfully", success: true,queueData });
      }
    } catch (error) {
      console.log("error",error);
       return NextResponse.json({msg:"cycle complete",success:false});
      
    }
    
   
  } catch (error) {
    console.error("Error scheduling post:", error);
    return NextResponse.json({ message: "Failed to schedule post", success: false ,error});
  }
}
