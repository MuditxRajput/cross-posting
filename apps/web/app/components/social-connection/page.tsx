"use client"
import { removeFacebook, removeInstagram, removeLinkedIn, removeYoutube } from "@/store/slices/social-account";
import { RootState } from "@/store/store";
import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";
import { FaFacebook, FaPinterest } from "react-icons/fa";
import { ImLinkedin } from "react-icons/im";
import { IoLogoYoutube } from "react-icons/io5";
import { RiInstagramFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";

const SocialConnection = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Fetch account details from Redux
  const youtube = useSelector((state: RootState) => state.social.youtube);
  const instagram = useSelector((state: RootState) => state.social.instagram);
  const linkedln = useSelector((state: RootState) => state.social.linkedIn);
  const facebook = useSelector((state: RootState) => state.social.facebook);

  const connectionDetails = [
    { name: "Instagram", icon: <RiInstagramFill />, color: "bg-gradient-to-r from-pink-500 to-purple-500", account: instagram },
    { name: "Facebook", icon: <FaFacebook />, color: "bg-gradient-to-r from-blue-600 to-blue-400", account: facebook },
    { name: "YouTube", icon: <IoLogoYoutube />, color: "bg-gradient-to-r from-red-600 to-red-400", account: youtube },
    { name: "LinkedIn", icon: <ImLinkedin />, color: "bg-gradient-to-r from-blue-800 to-blue-600", account: linkedln },
    { name: "Pinterest", icon: <FaPinterest />, color: "bg-gradient-to-r from-red-700 to-red-500", account: null }, // Provide an empty array for Pinterest
  ];

  const apiHandler = async (name: string) => {
    console.log("Connecting to", name);
    if (name === "Instagram") {
      router.push(`https://www.facebook.com/v21.0/dialog/oauth?client_id=${process.env.NEXT_PUBLIC_FB_CLIENT_ID}&display=page&redirect_uri=https://cross-posting-web.vercel.app/components/callbacks/instagram-callback&response_type=token&scope=instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_insights,pages_show_list,pages_read_engagement`);
    } else if (name === "LinkedIn") {
      window.open(`https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID}&redirect_uri=https://cross-posting-web.vercel.app/api/linkedin/callback&state=foobar&scope=openid%20profile%20w_member_social%20email`);
    } else {
      console.log("Connecting to", name);
      try {
        const res = await fetch(`https://cross-posting-web.vercel.app/api/${name.toLowerCase()}/connect`
      , {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
        const data = await res.json();
        console.log("Data:", data);
        if (data.authUrl) {
          window.open(data.authUrl);
        } else {
          console.error("No auth URL received");
        }
      } catch (error) {
        console.error("Error initiating social connection:", error);
      }
    }
    
  };

  const removeAccount = (social: string, name: string) => {
    if (name === "Instagram") dispatch(removeInstagram(social));
    else if (name === "YouTube") dispatch(removeYoutube(social));
    else if (name === "Facebook") dispatch(removeFacebook(social));
    else dispatch(removeLinkedIn(social));
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-2xl border border-gray-100">
      <p className="text-2xl font-bold text-gray-800 mb-8 text-center">Connect Your Social Handles</p>
      <div className="flex flex-col gap-6">
        {connectionDetails.map((val, index) => (
          <div key={index} className="flex items-center gap-6">
            <div
              className="flex cursor-pointer items-center w-[250px] gap-4 bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300"
              onClick={() => apiHandler(val.name)}
            >
              <div className={`text-white rounded-xl p-3 ${val.color}`}>{val.icon}</div>
              <Button children={val.name} className="text-gray-800 font-semibold text-lg" appName={val.name} />
              <span className="ml-auto text-gray-400 text-2xl hover:text-black font-bold">+</span>
            </div>
            <span className="text-gray-600">
              {val.account && val.account.length > 0 ? (
                val.account
                  .filter((val) => val !== null)
                  .map((social, idx) => (
                    <div key={idx} className="bg-gray-200 text-black rounded-full px-3 py-1 inline-flex items-center gap-2">
                      {social}
                      <span
                        className="text-black hover:text-red-500 cursor-pointer text-lg"
                        onClick={() => removeAccount(social, val.name)}
                      >
                        ×
                      </span>
                    </div>
                  ))
              ) : val.account === null ? (
                <span className="text-gray-500 italic">Coming soon...</span>
              ) : (
                <span className="text-gray-500">Not Connected</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialConnection;