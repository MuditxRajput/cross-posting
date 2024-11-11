// import { NextResponse } from "next/server";

// export async function POST(req:any,res:any)
// {
//   try {
//      const data = await req.json();
//      const {code} = data;
//      console.log("code",code);
     
//      const tokenObj = {
//       grant_type : "authorization_code",
//       client_id :process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || "",
//       client_secret :process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_SECRET || "",
//       redirect_uri :"http://localhost:3000/components/callbacks/linkedln",
//       code: code
//      }
//      const urlEncodedBody = new URLSearchParams(tokenObj).toString();
//      console.log("urlEncoded",urlEncodedBody);
     
//      const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken',{
//       method:"POST",
//       headers:{
//         "Content-Type":"application/x-www-form-urlencoded"
//       },
//       body:urlEncodedBody,
//      })
//      const val = await res.json();
    
//      const accessToken = val.access_token;
//     return NextResponse.json({msg:"inside",accessToken,success:true})
//   } catch (error) {
//     console.log("error",error);
//     return NextResponse.json({msg:"outside",success:false})
//   }

// }