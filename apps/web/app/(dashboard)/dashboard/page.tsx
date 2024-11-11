"use client"
import Signup from "@/app/(authPages)/signUp/page";
import { useSession } from "next-auth/react";
import LeftPanel from "../leftpanel/page";
import RightPanel from "../rightpanel/page";
const Dashboard = () => {
  const session = useSession();
    if(session.status==="loading")
    {
      return <div>Loading...</div>
    }
    else if(session.status==="unauthenticated")
    {
      return <Signup/>
    }
  return (
    <div className="bg-slate-100 flex gap-6 px-2 pt-2 ">
      <div className="w-[260px] ">
        <LeftPanel/>
      </div>
      <div className="flex flex-1">
        <RightPanel/>
      </div>
    </div>
  )
}

export default Dashboard
