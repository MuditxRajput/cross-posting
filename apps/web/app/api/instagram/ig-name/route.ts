import { User } from "@database/models/user.model";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
export async function POST(req:any)
{
   try {
     const data = await req.json();
     const {id,token} = data;
     
     const res = await fetch(`https://graph.facebook.com/v12.0/${id}?fields=ig_id,name,username&access_token=${token}`)
     const val = await res.json();
     const session = await getServerSession(authOptions);
     // here have to store the token in database and user data into database ....
    //  const user = await User.findOne({email:session?.user})

    const existedUser = await User.findOneAndUpdate(
      { 
        email: session?.user?.email, 
        "socialAccounts.accountsId": { $ne: val.ig_id } // Ensure the accountId is not already in the socialAccounts array
      },
      {
        $addToSet:{

          connectedPlatform : ["Instagram"],
          socialAccounts:{
            socialName : "Instagram",
            accessToken :token,
            refreshToken : token,
            accounts :val.username ,
            accountsId :val.ig_id ,
          }
        }
      },
      { new: true }
    );
    
    if (!existedUser) {
      return NextResponse.json({ msg: "User not found", success: false });
    }

    // Return response with success
    return new NextResponse(
      `
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage(
                {
                  type: 'INSTAGRAM_AUTH_SUCCESS',
                  platform: 'Instagram',
                  accountName : ${val.username}
                },
                '*'
              );
              window.close();
            } else {
              window.location.href = '/dashboard';  // You can customize this to a different path
            }
          </script>
          <p>Authentication successful! You can close this window.</p>
        </body>
      </html>
    `,
      {
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
    //  return NextResponse.json({msg:"get",val,success:true})
   } catch (error) {
    return new NextResponse(
      `
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage(
                { 
                  type: 'INSTAGRAM_AUTH_ERROR',
                  error: 'Authentication failed'
                },
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
      {
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
   }
}