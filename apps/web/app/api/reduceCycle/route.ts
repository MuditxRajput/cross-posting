import { authOptions } from "@/app/lib/auth";
import { User } from "@database/models/user.model";
import { getServerSession } from "next-auth";
export async function POST(res:any)
{
 try {
    const serverSession = await getServerSession(authOptions);
    const email = serverSession?.user?.email;

    const existedUser = await User.findOne({email});
    const cycle = existedUser?.cycle;
    if(cycle && cycle.valueOf() > 0)
    {
        await User.updateOne({email},{cycle: Number(cycle) - 1});
        return res.json({success:true});
    }
    else
    {
        return res.json({success:false});
    }
    
 } catch (error) {
    return res.json({success:false});
 }
}