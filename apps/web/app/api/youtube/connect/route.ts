// app/api/youtube/connect/route.ts
import { OAuth2Client } from "google-auth-library";
import { NextResponse } from "next/server";

// Define environment variables with proper type checking
const clientId = process.env.YOUTUBE_CLIENT_ID;
const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
const redirectUri = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}/api/youtube/callback`
  : "http://localhost:3000/api/youtube/callback";

// Configure OAuth client
const oauth2Client = new OAuth2Client({
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUri: redirectUri,
});

export async function GET() {
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "OAuth credentials not configured" },
      { status: 500 }
    );
  }

  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/youtube.download",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "openid"
      ],
      include_granted_scopes: true
    });

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    return NextResponse.json(
      { error: "Failed to generate auth URL" },
      { status: 500 }
    );
  }
}