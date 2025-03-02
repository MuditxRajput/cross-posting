"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MdAccountCircle, MdPostAdd, MdSchedule, MdSettings, MdTrendingUp } from "react-icons/md";

const LeftPanel = () => {
  const session = useSession();
  const router = useRouter();
  const [activeButton, setActiveButton] = useState<String>("New Post");

  const handleActiveButton = (button: String) => {
    setActiveButton(button);
    window.location.href = `./upload`;
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 shadow-2xl rounded-xl p-6  flex flex-col border border-gray-100">
      {/* Header */}
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>

      {/* Create Post Button */}
      <button
        onClick={() => router.push("./upload")}
        className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-xl font-semibold mt-4 transition-transform transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
      >
        <MdPostAdd className="text-xl" />
        + Create Post
      </button>

      <hr className="my-6 border-gray-200" />

      {/* Content Section */}
      <div className="flex-grow">
        <p className="text-lg font-semibold text-gray-700 mb-4">Content</p>
        <div className="flex flex-col gap-3 mb-6">
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
              activeButton === "New Post"
                ? "bg-gradient-to-r from-green-400 to-blue-400 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => handleActiveButton("New Post")}
          >
            <MdPostAdd className="text-xl" />
            New Post
          </button>

          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
              activeButton === "Scheduled"
                ? "bg-gradient-to-r from-green-400 to-blue-400 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => handleActiveButton("Scheduled")}
          >
            <MdSchedule className="text-xl" />
            Scheduled
          </button>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Configuration Section */}
        <p className="text-lg font-semibold text-gray-700 mb-4">Configuration</p>
        <button onClick={()=>window.location.href ="../dashboard"} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 w-full">
          <MdSettings className="text-xl" />
          Connect Social Media
        </button>

        <hr className="my-6 border-gray-200" />

        {/* Account Section */}
        <p className="text-lg font-semibold text-gray-700 mb-4">Account</p>
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 w-full">
          <MdAccountCircle className="text-2xl text-green-500" />
          {session?.status === "unauthenticated" ? (
            <p>Create Account</p>
          ) : (
            <p>{(session?.data?.user?.name)?.split(" ")[0]}</p>
          )}
        </button>

        <hr className="my-6 border-gray-200" />

        {/* Plan Section */}
        <p className="text-lg font-semibold text-gray-700 mb-4" >Plan</p>
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-green-400 to-blue-400 text-white hover:shadow-lg transition-all duration-200 w-full">
          <MdTrendingUp className="text-xl" />
          Get Plan
        </button>
      </div>
    </div>
  );
};

export default LeftPanel;