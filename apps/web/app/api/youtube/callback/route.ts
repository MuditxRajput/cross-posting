// api/youtube/callback/route.ts
import { dbConnection } from "@database/database";
import { User } from "@database/models/user.model";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth";

const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const REDIRECT_URI = "https://cross-posting-web.vercel.app/api/youtube/callback";

if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET) {
  throw new Error("Missing required YouTube OAuth credentials");
}

const oauth2Client = new OAuth2Client(
  YOUTUBE_CLIENT_ID,
  YOUTUBE_CLIENT_SECRET,
  REDIRECT_URI
);

export async function GET(request: NextRequest) {
  try {
    console.log("YouTube OAuth callback initiated");
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    await dbConnection();

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    if (!code) {
      return NextResponse.json({ error: "No authorization code provided" }, { status: 400 });
    }

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get YouTube channel info
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const channelResponse = await youtube.channels.list({
      part: ["snippet"],
      mine: true,
    });

    // Get user info
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfoResponse = await oauth2.userinfo.get();

    if (!channelResponse.data.items?.[0]) {
      return NextResponse.json({ error: "Failed to fetch channel information" }, { status: 400 });
    }

    const channelData = channelResponse.data.items[0];
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update social accounts
    const existingChannel = user.socialAccounts?.find(
      (account) => account.socialName === "YouTube" && account.accountsId === channelData.id
    );

    if (existingChannel) {
      existingChannel.accessToken = tokens.access_token;
      existingChannel.refreshToken = tokens.refresh_token;
    } else {
      // Ensure arrays exist before updating
      user.connectedPlatform = user.connectedPlatform || [];
      user.socialAccounts = user.socialAccounts || [];
      
      if (!user.connectedPlatform.includes("Youtube")) {
        user.connectedPlatform.push("Youtube");
      }

      user.socialAccounts.push({
        socialName: "YouTube",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        accounts: channelData.snippet?.title || "",
        accountsId: channelData.id || "",
      });
    }

    await user.save();
    
    // Return success response with HTML to close window and message parent
    return new NextResponse(
      `
      <html>
        <head><title>Authorization Success</title></head>
        <body>
          <script>
            window.opener.postMessage({ type: 'YOUTUBE_AUTH_SUCCESS' }, '*');
            window.close();
          </script>
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );

  } catch (error) {
    console.error("YouTube OAuth callback error:", error);
    return NextResponse.json({ 
      error: "Authentication failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}