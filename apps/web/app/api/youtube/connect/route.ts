import { OAuth2Client } from "google-auth-library";
import { NextResponse } from "next/server";

// // Initialize OAuth2Client
const oauth2Client = new OAuth2Client(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  "https://cross-posting-web.vercel.app/api/youtube/callback"
);

export async function POST() {
  console.log("YouTube OAuth callback initiated");

  // Log environment variables for debugging
  console.log("Client ID:", process.env.YOUTUBE_CLIENT_ID);
  console.log("Client Secret:", process.env.YOUTUBE_CLIENT_SECRET);
  //  return NextResponse.json({message: "Hello", status: 200, id : process.env.YOUTUBE_CLIENT_ID , secret : process.env.YOUTUBE_CLIENT_SECRET});
   
  try {
    // Generate the OAuth URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/youtube.channel-memberships.creator",
        "profile",
        "email"
      ],
      prompt: "consent"
    });

    console.log("Generated Auth URL:", authUrl);
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    return NextResponse.json(
      { error: "Failed to generate authentication URL" },
      { status: 500 }
    );
  }
}