import SocialConnection from "@/app/components/social-connection/page";
import { useSelector } from "react-redux";

const RightPanel = () => {
  
 
  return (
    <div className=" relative h-[660px] bg-white w-full rounded-xl">
      <SocialConnection/>
     
    </div>
  );
};

export default RightPanel;
