import { User } from "@database/database";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET()
{   
   
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    try {
        const existedUser = await User.findOne({email:email});
        const connectedaccount = existedUser?.socialAccounts;
         return NextResponse.json({connectedaccount,success:true});
    } catch (error) {
        return NextResponse.json({success:false});
    }
    
    

}