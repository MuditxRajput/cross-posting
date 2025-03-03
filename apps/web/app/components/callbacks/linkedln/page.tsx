"use client"

import Dashboard from "@/app/(dashboard)/dashboard/page";
import { useEffect } from "react";

//  here we get the code in the url fetch it 

const callbackComponent = () => {
let url = new URLSearchParams(window.location.search);
let code = url.get('code');
 useEffect(()=>{
  const getAccessToken=async()=>{
    try {
      const res = await fetch(`https://cross-posting-web.vercel.app/api/linkedin/callback`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        body: JSON.stringify({code}),
      })
      const val = await res.json();
      
    } catch (error) {
      console.log("error",error);
      
    }
  }
    getAccessToken();
 },[code])
 
  return (
    <Dashboard/>
  )
}

export default callbackComponent