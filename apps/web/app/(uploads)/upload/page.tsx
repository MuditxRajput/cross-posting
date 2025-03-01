"use client";
import LeftPanel from "@/app/(dashboard)/leftpanel/page";
import { reduceCycle, setInstagram, setLinkedIn, setYoutube } from "@/store/slices/social-account";
import { useEffect,useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Upload from "../../components/imageUpload/Upload";

const UploadPage = () => {
  const dispatch = useDispatch();
  const[totalAccount, setTotalAccount] = useState(0);

  useEffect(() => {
    const getaccounts = async () => {
      const res = await fetch(`https://cross-posting-web.vercel.app/api/getaccount`, {
        method: "GET"
      });
      const data = await res.json(); 
      console.log("data", data.connectedPlatform);
      setTotalAccount(data.connectedPlatform.length);
      // totalAccount = data.connectedPlatform.length;
      // console.log("total account", totalAccount);
      if (data.success && data.connectedaccount.length > 1) {
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
            default:
              break;
          }
        });
        dispatch(reduceCycle(data.cycle));
      }
    };
    getaccounts();
  }, []);

  const cycle = useSelector((state: { social: { cycle: any } }) => state.social.cycle);

  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen flex flex-col sm:flex-row gap-6 p-4 sm:p-6">
      {/* Modal for Free Credit Over */}
      {cycle <= 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl text-center max-w-md w-full">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-800">Free Credit is Over ❗</h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              You've used all your free credits. Please purchase additional credit.
            </p>
            <button
              className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300"
              onClick={() => {
                window.location.href = "/payment-card";
              }}
            >
              Buy Credit
            </button>
          </div>
        </div>
      )}

      {/* Left Panel - Hidden on mobile */}
      <div className="hidden sm:block ">
        <LeftPanel />
      </div>
      {/* Upload Section */}
      <div className="w-full sm:w-3/4 flex flex-col gap-5">
        {totalAccount> 1 ? null : (
          <div className="flex flex-col sm:flex-row bg-green-400 justify-between px-4 py-3 sm:py-4 rounded-lg gap-3 sm:gap-5 items-center text-center sm:text-left">
            <p className="text-gray-900 font-semibold text-base sm:text-lg">
              Connect your social media accounts to start posting
            </p>
            <button className="bg-gray-600 px-4 py-2 rounded-lg text-white w-full sm:w-auto" onClick={()=>window.location.href='../../dashboard'}>
              Connect account
            </button>
          </div>
        )}
        <Upload />
      </div>
    </div>
  );
};

export default UploadPage;
