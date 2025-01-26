"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

const Header = () => {
  const { data: session, status } = useSession();

  return (
    <div className="bg-white shadow-sm top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex justify-between items-center py-1 px-6">
        {/* Logo */}
        <div className="text-2xl font-bold text-gray-800">
          <Image src="/logo.png" alt="Logo" width={200} height={100} />
        </div>

        {/* Navigation Links */}
        <div className="flex gap-8">
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
            <div className="flex items-center gap-3">
              <Image
                src={session?.user?.image || '/default-avatar.png'} // Provide a default image path here
                alt="User profile"
                width={40}
                height={40}
                className="rounded-full border-2 border-blue-500" // Optional styling to make the image round
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