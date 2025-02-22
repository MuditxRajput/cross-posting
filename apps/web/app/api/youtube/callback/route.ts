// app/api/youtube/callback/route.ts
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

// Type definitions
interface UserDocument {
  email: string;
  socialAccounts: Array<{
    socialName: string;
    accessToken: string;
    refreshToken: string;
    accounts: string;
    accountsId: string;
  }>;
  connectedPlatform: string[];
  save: () => Promise<void>;
}

const clientId = process.env.YOUTUBE_CLIENT_ID;
const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
const redirectUri = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}/api/youtube/callback`
  : "http://localhost:3000/api/youtube/callback";

const oauth2Client = new OAuth2Client({
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUri: redirectUri,
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "No authorization code provided" },
        { status: 400 }
      );
    }

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "OAuth credentials not configured" },
        { status: 500 }
      );
    }

    // Get tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    // Close the window with a success message
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><title>Authorization Successful</title></head>
        <body>
          <script>
            window.opener.postMessage({ 
              type: 'YOUTUBE_AUTH_SUCCESS',
              data: ${JSON.stringify({
                accessToken: tokens.access_token,
                email: userInfo.data.email
              })}
            }, '*');
            window.close();
          </script>
        </body>
      </html>`,
      {
        headers: {
          "Content-Type": "text/html",
        },
      }
    );

  } catch (error) {
    console.error("YouTube OAuth callback error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}