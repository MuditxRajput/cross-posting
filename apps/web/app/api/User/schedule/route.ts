import { postQueue } from "@/app/services/queue";
import { dbConnection } from "@database/database";
import { NextResponse } from "next/server";

export async function POST(req:any) {
  try {
    dbConnection();
    const formData = await req.json();    
    const dateTime = new Date(formData.dateTime);
    
    if (isNaN(dateTime.getTime())) {
      return NextResponse.json({ message: "Invalid dateTime format", success: false });
    }

    // Calculate delay
    const delay = dateTime.getTime() - Date.now();
    if (delay <= 0) {
      return NextResponse.json({ message: "DateTime must be in the future", success: false });
    }

    // Add job to queue
    await postQueue.add("schedulePost", formData, { delay });

    return NextResponse.json({ message: "Post scheduled successfully", success: true });
  } catch (error) {
    console.error("Error scheduling post:", error);
    return NextResponse.json({ message: "Failed to schedule post", success: false });
  }
}
