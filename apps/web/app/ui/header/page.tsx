"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { IoReorderThreeOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { setLeftPanel } from "../../../store/slices/social-account";
const Header = () => {
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const leftPanelIsOpen = useSelector((state: { social: { leftpanel: boolean } }) => state.social.leftpanel);
  console.log(leftPanelIsOpen);
  return (
    <div className="bg-white shadow-sm top-0 left-0 right-0 z-50 flex justify-center items-center">
      <div className="flex justify-center items-center sm:hidden px-1 ">
        <IoReorderThreeOutline className="text-3xl text-gray-800 cursor-pointer sm:hidden" onClick={()=>dispatch(setLeftPanel(!leftPanelIsOpen))} />
      </div>
      <div className="container  flex justify-between items-center px-2 ">
        {/* Logo */}
        <div className=" font-bold text-gray-800 ">
          <Image src="/logo.png" alt="Logo" width={100} height={80} className=" w-24 h-10" />
        </div>

        {/* Navigation Links */}
        <div className=" gap-8 hidden sm:flex ">
          <Link href="/" className="text-gray-700 hover:text-blue-500 transition-colors duration-200">
             Home
          </Link>
          <Link href="/pricing" className="text-gray-700 hover:text-blue-500 transition-colors duration-200">
            Pricing
          </Link>
          <Link href="/contact" className="text-gray-700 hover:text-blue-500 transition-colors duration-200">
            Contact Us
          </Link>
        </div>

        {/* User Profile */}
        <div>
          {status === "unauthenticated" ? (
            <Link
              href="/auth/signin"
              className="bg-blue-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 transition-colors duration-200"
            >
              Sign Up
            </Link>
          ) : (
            <div className="flex items-center gap-3 p-1 rounded-lg">
              <Image
                src={session?.user?.image || '/default-avatar.png'} // Provide a default image path here
                alt="User profile"
                width={40}
                height={40}
                className="rounded-full border-2 border-blue-500 w-9 h-9" // Optional styling to make the image round
              />
              <p className="text-gray-800 font-medium">{session?.user?.name?.split(" ")[0]}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;