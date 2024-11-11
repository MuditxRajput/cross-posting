
import { NextRequest, NextResponse } from "next/server";

async function getIGAccountID(accessToken: any) {
  const response = await fetch(`https://graph.facebook.com/v12.0/me/accounts?access_token=${accessToken}`);
  const data = await response.json();
  const pageId = data.data[0].id;

  const igAccountResponse = await fetch(`https://graph.facebook.com/v12.0/${pageId}?fields=instagram_business_account&access_token=${accessToken}`);
  const igData = await igAccountResponse.json();

  return igData.instagram_business_account.id;
}
export async function POST(req: NextRequest) {
  try {
    const { accessToken} = await req.json();
      try {
          const igUserId = await getIGAccountID(accessToken);
  
          return NextResponse.json({ message: "sucessfully get the ig id",igUserId,success:true });
      } catch (error) {
        console.log("Fail to get the id",error);
        
      }
    return NextResponse.json({msg:"Error getting ig id",success:false})
    // const result = await publishImageToInstagram(igUserId, accessToken, imageUrl, caption);

  } catch (error) {
    console.error("Error publishing image to Instagram:", error);
    return NextResponse.json({ message: "Failed to publish image" }, { status: 500 });
  }
}
