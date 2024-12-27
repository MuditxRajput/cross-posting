import { User } from "@database/models/user.model";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

async function getIGAccountID(accessToken:any) {
  try {
    const response = await fetch(`https://graph.facebook.com/v12.0/me/accounts?access_token=${accessToken}`);
    const data = await response.json();
    if (!data.data || data.data.length === 0) {
      throw new Error("Unable to retrieve page ID. Check if the access token has the necessary permissions.");
    }
    const pageId = data.data[0].id;

    const igAccountResponse = await fetch(`https://graph.facebook.com/v12.0/${pageId}?fields=instagram_business_account&access_token=${accessToken}`);
    const igData = await igAccountResponse.json();

    if (!igData.instagram_business_account) {
      throw new Error("Instagram business account not found. Please ensure the page is connected to an Instagram account.");
    }
    
    return igData.instagram_business_account.id;
  } catch (error) {
    console.error("Error retrieving Instagram account ID:", error);
    throw error;
  }
}

export async function POST(req:any) {
  try {
    const data = await req.json();
    const { access_token } = data;

     
    // Step 1: Get Instagram User ID using the access token
    const igUserId = await getIGAccountID(access_token);

    // Step 2: Fetch Instagram account details using the user ID
    const igUserDetailsResponse = await fetch(`https://graph.facebook.com/v12.0/${igUserId}?fields=ig_id,name,username&access_token=${access_token}`);
    const igUserDetails = await igUserDetailsResponse.json();
   
    
    if (!igUserDetails.ig_id || !igUserDetails.username) {
      return NextResponse.json({ message: "Invalid Instagram user details.", success: false }, { status: 400 });
    }

    // Step 3: Get session data
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "User session not found", success: false }, { status: 400 });
    }

    // Step 4: Check if the Instagram account is already linked
    const user = await User.findOne({
      email: session.user.email,
      "socialAccounts.accountsId": igUserDetails.ig_id,
    });

    if (user) {
      return NextResponse.json({ msg: "Instagram account is already connected.", success: false });
    }
   const longlivedToken = await fetch(`https://graph.facebook.com/v12.0/oauth/access_token?grant_type=fb_exchange_token&client_id=4196765553928348&client_secret=f1e86ae43a659bcec80deb92928a4717&fb_exchange_token=${access_token}`);
   const val = await longlivedToken.json();
   const updatedUser = await User.findOneAndUpdate(
    {
      email: session.user.email,
      "socialAccounts.accountsId": { $ne: igUserId }, // Check if the Instagram ID is not already present
    },
    {
      $addToSet: {
        connectedPlatform: "Instagram",
        socialAccounts: {
          socialName: "Instagram",
          accessToken: val.access_token,
          refreshToken: val.access_token,
          accounts: igUserDetails.username,
          accountsId: igUserId,
          expiresIn: Date.now()+ 60*60*24*60*1000,
        },
      },
    },
    { new: true }
  );
  

    if (!updatedUser) {
      return NextResponse.json({ message: "User update failed.", success: false }, { status: 500 });
    }

    // Step 6: Safely access socialAccounts to get Instagram data
    const igData = updatedUser.socialAccounts?.find((val) => val.socialName === "Instagram")?.accounts || null;
    return NextResponse.json({
      success: true,
      message: "Instagram authentication successful",
      userData: igData,
    });
  } catch (error) {
    console.error("Error processing Instagram authentication:", error);
    return NextResponse.json({
      success: false,
      message: error || "Account is already there",
    });
  }
}

