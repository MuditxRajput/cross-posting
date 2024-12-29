import { dbConnection } from "@database/database";
import { Media } from '@database/models/media.model';
import { Post } from '@database/models/post.model';
// import { User } from "@database/models/user.model";
import { User } from '@database/database/models/user.model';
import { NextResponse } from "next/server";

export async function POST(req : any,res:any)
{
  try {
     await dbConnection()
    const val = await req.json();
    const {data,urlData,email} = val;
    const{platforms,description,dateTime} = data;
    console.log("platform",platforms);
    console.log("content",description);
    console.log("dateTime",dateTime);
    console.log("urlData",urlData);
    console.log("email",email);
    if(!data || !urlData || !email)
    {
      return NextResponse.json({msg:"Incomplete info",success:false});
    }
    
    
    if(!email) return NextResponse.json({msg:"Something went wrong",success:false})
    const UserId = await User.findOne({email:email});
  
    if(!dateTime || !urlData)
        { 
            return NextResponse.json({msg:"Incomplete info",success:false});
}
    // add the data in the database;
    const post = new Post({
      UserId : UserId?._id,
      platform : platforms.map((val: { name: any; })=>val.name),
      content : description,
      scheduleTime :dateTime,
    });
    await post.save();

    const media  = new Media({
      userId : UserId?._id,
      url :urlData,

    })
    await media.save();
    //  await session.commitTransaction();
    //  session.endSession();
    return NextResponse.json({msg:"Image is saved in database",success:true,image:urlData})
  } catch (error) {
    return NextResponse.json({msg:"error",error,success:false})
  }
}