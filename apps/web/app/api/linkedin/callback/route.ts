// src/app/api/linkedin/callback/route.ts
import { dbConnection } from "@database/database";
import { User } from "@database/models/user.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = request.nextUrl;
    const code = searchParams.get("code");
    
    if (!code) {
      return NextResponse.json(
        { error: "No authorization code provided" },
        { status: 400 }
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://www.linkedin.com/oauth/v2/accessToken",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: "http://localhost:3000/api/linkedin/callback",
          client_id: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!,
          client_secret: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_SECRET!,
        }),
      }
    );

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;
    // Fetch LinkedIn profile data
    const profileResponse = await fetch(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    const profileData = await profileResponse.json();
 


    // Store LinkedIn data in the user's record
    await dbConnection();

    
      const user = await User.findOneAndUpdate(
        { email: session?.user?.email, "socialAccounts.accountsId": { $ne: profileData.sub } },
        {
          $addToSet: {
            connectedPlatform: "LinkedIn",
            socialAccounts: {
              socialName: "LinkedIn",
              accessToken: access_token,
              refreshToken: access_token,
              accounts: profileData.name,
              accountsId: profileData.sub,
              expiresIn: tokenData.expires_in,
            },
          },
        },
        { new: true }
      );

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    // }


    // Close popup with success message
    return new NextResponse(
      `
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage(
                { 
                  type: 'LINKEDIN_AUTH_SUCCESS',
                  platform: 'Linkedin',
                  accountName: '${(profileData.name)}'
                  
                }, 
                '*'
              );
              window.close();
            } else {
              window.location.href = '/dashboard';
            }
          </script>
          <p>Authentication successful! You can close this window.</p>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
    

  } catch (error) {
    console.error("LinkedIn OAuth callback error:", error);
    return new NextResponse(
      `
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage(
                { type: 'LINKEDIN_AUTH_ERROR', error: 'Authentication failed' },
                '*'
              );
              window.close();
            } else {
              window.location.href = '/error?message=Authentication failed';
            }
          </script>
          <p>Authentication failed. You can close this window.</p>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
  }
}
