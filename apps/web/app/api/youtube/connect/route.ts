// api/youtube/connect/route.ts
import { OAuth2Client } from "google-auth-library";
import { NextResponse } from "next/server";

const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const REDIRECT_URI = "https://cross-posting-web.vercel.app/api/youtube/callback";

if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET) {
  throw new Error("Missing required YouTube OAuth credentials in environment variables");
}

const oauth2Client = new OAuth2Client(
  YOUTUBE_CLIENT_ID,
  YOUTUBE_CLIENT_SECRET,
  REDIRECT_URI
);

export async function GET() {
  console.log("YouTube OAuth connect initiated");
  try {
    // Validate client configuration
    if (!oauth2Client._clientId || !oauth2Client._clientSecret) {
      throw new Error("OAuth client not properly configured");
    }

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        // Updated scopes to match exactly what's shown in the Google Console
        "https://www.googleapis.com/auth/youtube.download",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "openid"
      ],
      prompt: "consent",
      include_granted_scopes: true
    });

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error("Error in YouTube OAuth connect:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate authentication URL",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}