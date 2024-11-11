"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { IoIosTrendingUp } from "react-icons/io";
import { MdAccountCircle } from "react-icons/md";
const LeftPanel = () => {
  const session = useSession();
  const [activeButton, setActiveButton] = useState<String>("New Post");

  const handleActiveButton = (button: String) => {
    setActiveButton(button);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 h-[658px] flex flex-col">
      <h2 className="text-3xl font-bold text-gray-800 mb-4"> Panel</h2>

      <button className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold mt-4 transition-transform transform hover:scale-105 hover:shadow-lg">
        + Create Post
      </button>

      <hr className="my-4 border-gray-300" />

      <div className="flex-grow">
        <p className="text-lg font-semibold text-gray-700 mb-2">Content</p>
        <div className="flex flex-col gap-3 mb-4">
          <button
            className={`px-4 py-2 rounded-lg text-left transition-colors duration-200 ${
              activeButton === "New Post" ? "bg-slate-400 text-white" : "bg-slate-200 text-gray-800"
            } hover:bg-slate-300`}
            onClick={() => handleActiveButton("New Post")}
          >
            New Post
          </button>

          <button
            className={`px-4 py-2 rounded-lg text-left transition-colors duration-200 ${
              activeButton === "Scheduled" ? "bg-slate-400 text-white" : "bg-slate-200 text-gray-800"
            } hover:bg-slate-300`}
            onClick={() => handleActiveButton("Scheduled")}
          >
            Scheduled
          </button>
        </div>
        <hr className="my-4 border-gray-300" />
        
        <p className="text-lg font-semibold text-gray-700 mt-4 mb-2">Configuration</p>
        <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors shadow-md hover:shadow-lg">
          Connect Social Media
        </button>
        
        <hr className="my-4 border-gray-300" />
        
        <p className="text-lg font-semibold text-gray-700 mt-4 mb-2">Account</p>
        <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors w-full">
          <MdAccountCircle className="text-green-500 text-3xl" />
          {session?.status === "unauthenticated" ? (
            <p className="text-gray-700">Create Account</p>
          ) : (
            <p className="text-gray-700">{(session?.data?.user?.name)?.split(" ")[0]}</p>
          )}
        </button>

        <hr className="my-4 border-gray-300" />

        <p className="text-lg font-semibold text-gray-700 mt-4 mb-2">Plan</p>
        <button className="flex items-center gap-2 p-2 rounded-lg bg-green-400 hover:bg-green-500 transition-colors w-full">
        <IoIosTrendingUp className="text-xl"/>
          Get Plan
        </button>
      </div>
    </div>
  );
};

export default LeftPanel;
