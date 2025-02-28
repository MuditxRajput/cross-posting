"use client"
import Signup from "@/app/(authPages)/signUp/page";
import { reduceCycle, setInstagram, setLinkedIn, setYoutube } from "@/store/slices/social-account";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import LeftPanel from "../leftpanel/page";
import RightPanel from "../rightpanel/page";

const Dashboard = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const getaccounts = async () => {
      const res = await fetch(`https://cross-posting-web.vercel.app/api/getaccount`, {
        method: "GET"
      });
      const data = await res.json();
      if (data.success) {
        data.connectedaccount.slice(1).forEach((acc: any) => {
          switch (acc.socialName) {
            case "YouTube":
              dispatch(setYoutube(acc.accounts));
              break;
            case "Instagram":
              dispatch(setInstagram(acc.accounts));
              break;
            case "LinkedIn":
              dispatch(setLinkedIn(acc.accounts));
              break;
            default: break;
          }
        });
        dispatch(reduceCycle(data.cycle));
      }
    };
    getaccounts();
  }, [dispatch]);

  const session = useSession();
  if (session.status === "loading") {
    return <div>Loading...</div>;
  } else if (session.status === "unauthenticated") {
    return <Signup />;
  }

  return (
    <div className="relative">
      <div className="bg-slate-100 flex gap-6 px-2 pt-2 relative">
        <div className="hidden sm:block w-[260px]">
          <LeftPanel />
        </div>
        <div className="flex flex-1">
          <RightPanel />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;