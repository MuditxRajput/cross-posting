import SocialConnection from "@/app/components/social-connection/page";
import CreatePost from "../create-post/page";

const RightPanel = () => {
  return (
    <div className="h-[660px] bg-white w-full rounded-xl">
      <CreatePost/>
      <SocialConnection/>
    </div>
  );
};

export default RightPanel;
