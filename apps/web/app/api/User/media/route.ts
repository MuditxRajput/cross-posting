import { dbConnection } from "@database/database";
import { Media } from '@database/models/media.model';
import { Post } from '@database/models/post.model';
import { NextResponse } from "next/server";

export async function POST(req : any,res:any)
{
  try {
    console.log("inside the database upload api");
    
     await dbConnection()
    // session.startTransaction();
    console.log("still inside the api");
    
    const val = await req.json();
    const {data,urlData} = val;
    console.log("this is data",data);
    console.log("this is url",urlData);
    
    const{platform,content,dateTime} = data;
    // const{urlData} = urlData;
    console.log("p",platform);
    console.log("c",content);
    console.log("s",dateTime);
    console.log("u",urlData);
    
    if(!dateTime || !urlData)
        { 
            // await session.abortTransaction();
            // session.endSession();
            return NextResponse.json({msg:"Incomplete info",success:false});

}
    // add the data in the database;
    const post = new Post({
      platform,
      content,
      dateTime
    });
    await post.save();

    const media  = new Media({
        urlData,
    })
    await media.save();
    //  await session.commitTransaction();
    //  session.endSession();
  } catch (error) {
    return NextResponse.json({msg:"error",error,success:false})
  }
}