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
    { name: "Instagram", icon: <RiInstagramFill />, color: "bg-pink-500", account: instagram },
    { name: "Facebook", icon: <FaFacebook />, color: "bg-blue-600", account: facebook },
    { name: "YouTube", icon: <IoLogoYoutube />, color: "bg-red-600", account: youtube },
    { name: "LinkedIn", icon: <ImLinkedin />, color: "bg-blue-800", account: linkedln },
    { name: "Pinterest", icon: <FaPinterest />, color: "bg-red-700", account: null }, // Provide an empty array for Pinterest
  ];
  

  const apiHandler = async (name: string) => {
    if (name === "Instagram") {
      // router.push(`https://www.facebook.com/v21.0/dialog/oauth?...`);
     router.push(`https://www.facebook.com/v21.0/dialog/oauth?client_id=4196765553928348&display=page&redirect_uri=http://localhost:3000/components/callbacks/instagram-callback&response_type=token&scope=instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_insights,pages_show_list,pages_read_engagement`);
    } else if (name === "LinkedIn") {
     window.open(`https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=86ij8xunmbhjqh&redirect_uri=http://localhost:3000/api/linkedin/callback&state=foobar&scope=openid%20profile%20w_member_social%20email`);
    } else {
      try {
        const res = await fetch(`http://localhost:3000/api/${name.toLowerCase()}/connect`);
        const data = await res.json();
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
    <div className="p-6 bg-white rounded-lg">
      <p className="text-lg font-semibold text-gray-800 mb-5 text-center">Connect your handles</p>
      <div className="flex gap-3">
        <div className="flex flex-col gap-5">
          {connectionDetails.map((val, index) => (
            <div key={index} className="flex items-center gap-5">
              <div
                className="flex cursor-pointer items-center w-[200px] gap-4 bg-gray-50 rounded-lg p-3 shadow-sm hover:shadow-lg transition-all duration-200"
                onClick={() => apiHandler(val.name)}
              >
                <div className={`text-white rounded-full p-2 ${val.color}`}>{val.icon}</div>
                <Button children={val.name} className="text-gray-800 font-medium" appName={val.name} />
                <span className="ml-auto text-gray-400 text-xl hover:text-black font-bold">+</span>
              </div>
              <span className="text-gray-600">
              {val.account && val.account.length > 0 ? (
                  val.account
                    .filter((val) => val !== null)
                    .map((social, idx) => (
                      <div key={idx} className="bg-gray-200 text-black rounded-full px-2 py-1 inline-flex items-center gap-1">
                        {social}
                        <span
                          className="text-black hover:text-red-500 cursor-pointer text-md"
                          onClick={() => removeAccount(social, val.name)}
                        >
                          x
                        </span>
                      </div>
                    ))
                ) :
                (val.account===null ) ? "Comming soon..":
                
                (
                  "Not Connected"
                )}

              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialConnection;
