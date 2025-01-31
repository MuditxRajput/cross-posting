import { dbConnection, User } from "@database/database";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Validate environment
    if (!process.env.WORKER_ENDPOINT) {
      throw new Error('WORKER_ENDPOINT not configured');
    }

    // Database connection
    await dbConnection();

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

    // Update user
    user.cycle = (user.cycle as number) - 1;
    await user.save();

    // Forward to worker
    const workerResponse = await fetch(`${process.env.WORKER_ENDPOINT}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'schedulePost',
        payload: { formData, email, mediaType },
        delay
      })
    });

    if (!workerResponse.ok) {
      throw new Error('Worker service failed');
    }

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