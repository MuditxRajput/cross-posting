"use client"
import { useSession } from "next-auth/react";
import Image from "next/image";

const Header = () => {
    const { data: session, status } = useSession();


    return (
        <div className="flex justify-around items-center mt-1">
            <div>
                Social Post
            </div>
            <div>
                <ul className="flex gap-3">
                    <li>Pricing</li>
                    <li>Contact us</li>
                </ul>
            </div>
            <div>
                {status === "unauthenticated" ? (
                    <p>Sign Up</p>
                ) : (
                    <div className="flex justify-center items-center gap-3">
                        <Image
                            src={session?.user?.image || '/default-avatar.png'} // Provide a default image path here
                            alt="User profile"
                            width={40} // Increased width for better visibility
                            height={40}
                            className="rounded-full" // Optional styling to make the image round
                        />
                        <p>{session?.user?.name?.split(" ")[0]}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Header;
