import { postQueue } from "@/app/services/queue";
import { dbConnection, User } from "@database/database";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    if (process.env.NODE_ENV !== 'production') {
      // Prevent DB/queue connection logic from running during build time
      console.log('Running in non-production, skipping database connection...');
    } else {
      // Database connection
      await dbConnection();  // Only runs during runtime
    }

    const { formData, email, mediaType } = await req.json();
    const dateTime = new Date(formData.dateTime);

    // Validation
    if (isNaN(dateTime.getTime())) {
      return NextResponse.json(
        { message: "Invalid date format", success: false },
        { status: 400 }
      );
    }

    const delay = dateTime.getTime() - Date.now();
    if (delay <= 0) {
      return NextResponse.json(
        { message: "Date must be in future", success: false },
        { status: 400 }
      );
    }

    // User check
    const user = await User.findOne({ email });
    if (!user?.cycle || user.cycle.valueOf() <= 0) {
      return NextResponse.json(
        { message: "No cycles available", success: false },
        { status: 403 }
      );
    }

    // Update user cycle count
    user.cycle = (user.cycle as number) - 1;
    await user.save();
    const queueSize = await postQueue.getJobCounts();
    console.log("Queue Status:", queueSize);

    // ✅ Add job directly to Redis queue instead of making an HTTP request
    await postQueue.add("schedulePost", { formData, email, mediaType }, { delay });

    return NextResponse.json({
      message: "Post scheduled",
      success: true,
      scheduledAt: dateTime.toISOString()
    });

  } catch (error) {
    console.error("Scheduling error:", error);
    return NextResponse.json(
      { message: "Internal error", success: false },
      { status: 500 }
    );
  }
}
