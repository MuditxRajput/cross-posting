import { dbConnection } from "@database/database";
import { User } from "@database/models/user.model";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../services/lib/auth";

// Initialize OAuth2 client with credentials and redirect URL
const oauth2Client = new OAuth2Client(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  "https://cross-posting-web.vercel.app/api/youtube/callback"
);

export async function GET(request: NextRequest) {
  try {

    // Get session information
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    await dbConnection();

    // Extract the authorization code from the request URL
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    if (!code) {
      return NextResponse.json({ error: "No authorization code provided" }, { status: 400 });
    }

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Retrieve YouTube channel information
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const channelResponse = await youtube.channels.list({
      part: ["snippet"],
      mine: true,
    });

    // Retrieve user info (email) from Google
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfoResponse = await oauth2.userinfo.get();

    // Validate responses
    if (!channelResponse.data.items?.[0] || !userInfoResponse.data.email) {
      throw new Error("Failed to fetch channel or user information");
    }

    const channelData = channelResponse.data.items[0];
    const email = session.user?.email;
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("User not found");
    }

    // Check if this channel already exists in the user's social accounts
    const existingChannel = user.socialAccounts?.find(
      (account) => account.socialName === "YouTube" && account.accountsId === channelData.id
    );

    if (existingChannel) {
      // Update existing channel's tokens
      existingChannel.accessToken = tokens.access_token;
      existingChannel.refreshToken = tokens.refresh_token;
    } else {
      // Add a new entry for the YouTube channel
      user.connectedPlatform = [...(user.connectedPlatform || []), "Youtube"];
      user.socialAccounts?.push({
        socialName: "YouTube",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        accounts: channelData.snippet?.title || "",
        accountsId: channelData.id || "",
      });
    }

    // Save the updated user document
    await user.save();
    console.log("User social accounts saved successfully");

    // Return an HTML response to close the popup
    return new NextResponse(
      `<script>
        window.opener.postMessage({ success: true, message: "YouTube linked successfully" }, "*");
        window.close();
      </script>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (error) {
    console.error("YouTube OAuth callback error:", error);
    return new NextResponse(
      `<script>
        window.opener.postMessage({ success: false, message: "Authentication failed",error:error }, "*");
        window.close();
      </script>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }
}
