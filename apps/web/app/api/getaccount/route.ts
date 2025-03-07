import { User } from "@database/database";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../services/lib/auth";

export async function GET()
{   
   
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!session || !email) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }

    try {
        const existedUser = await User.findOne({email:email});
        if(!existedUser)
        {
            return NextResponse.json({success:false});
        }
        const connectedaccount = existedUser?.socialAccounts;
        const connectedPlatform = existedUser?.connectedPlatform;
        const cycle = existedUser?.cycle;
        const premium = existedUser?.premium;
         return NextResponse.json({connectedaccount,success:true,cycle,connectedPlatform,premium});
    } catch (error) {
        return NextResponse.json({success:false});
    }
    
    

}