"use client";
import LeftPanel from "@/app/(dashboard)/leftpanel/page";
import { reduceCycle, setInstagram, setLinkedIn, setYoutube } from "@/store/slices/social-account";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Upload from "../../components/imageUpload/Upload";
const UploadPage = () => {
  const dispatch = useDispatch();
   useEffect(()=>{
      const getaccounts = async()=>{
        const res = await fetch(`http://localhost:3000/api/getaccount`,{
          method: "GET"
        });
        const data = await res.json();
        if(data.success)
        {
         {data.connectedaccount.slice(1).forEach((acc:any)=>{
          switch(acc.socialName){
            case "YouTube":
              dispatch(setYoutube(acc.accounts));
              break;
            case "Instagram":
              dispatch(setInstagram(acc.accounts));
              break;
            case "LinkedIn":
              dispatch(setLinkedIn(acc.accounts));
              break;
            default : break;
  
          }
  
         })}
         console.log(data.cycle);
         dispatch(reduceCycle(data.cycle));
         
        }
        else {
        
        }
      }
      getaccounts();
    },[])
  const cycle = useSelector((state: { social: { cycle: any } }) => state.social.cycle);

  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen flex gap-6 p-6">
      {/* Modal for Free Credit Over */}
      {cycle <= 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Free Credit is Over ❗</h2>
            <p className="text-gray-600 mb-6">
              You've used all your free credits. Please purchase additional credits to continue.
            </p>
            <button
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300"
              onClick={() => {
                window.location.href = "../../components/paymentCard";
              }}
            >
              Buy Credit
            </button>
          </div>
        </div>
      )}

      {/* Left Panel */}
      <div className=" w-60">
        <LeftPanel />
      </div>

      {/* Upload Section */}
      <div className="w-3/4 flex justify-center">
        <Upload />
      </div>
    </div>
  );
};

export default UploadPage;