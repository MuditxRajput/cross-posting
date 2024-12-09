// this is the api , where i send the data image into the queue..
import { postQueue } from "@/app/services/queue";
import { dbConnection } from "@database/database";
import { NextResponse } from "next/server";
export async function POST(req:any,res:any)
{
    try {
        dbConnection();
        const formData = await req.json();
        console.log(formData.dateTime);
        // put the data in the queue..
        postQueue.add('schedulePost',formData,{
            delay: new Date(formData.dateTime).getTime() -Date.now()
        })

        return NextResponse.json({ message: 'Post scheduled successfully' , success:true });
        
    } catch (error) {
        return NextResponse.json({ message: 'Failed to schedule post' , success:false });
    }
}