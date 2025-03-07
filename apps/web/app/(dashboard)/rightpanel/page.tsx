"use client"
import SocialConnection from "@/app/components/social-connection/page";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaExclamationCircle } from "react-icons/fa";
const RightPanel = () => {
  const router = useRouter();
  const [warning, setWarning] = useState(false);
  const [platform, setPlatform] = useState(null);
  interface MessageDescription {
    title: string;
    description?: JSX.Element | string;
  }
  
  interface Message {
    title: string;
    description: MessageDescription[];
  }
  
  const [message, setMessage] = useState<Message>({ title: "", description: [] });
  const [expanded, setExpanded] = useState<number | null>(null);

  const PlatformMessage = {
    Instagram: {
      title:
        "Connect an Instagram Creator or Business profile to post and schedule posts on Instagram.",
      description: [
        {
          title: "Must be a Business or Creator profile",
          description: (
            <>
              <p className="text-gray-600">
                Only Instagram Business or Creator profiles are supported.
                Personal profiles are not supported. Switching to a Business or
                Creator profile is easy and only takes a few minutes.
              </p>
              <p className="mt-2 text-green-600 cursor-pointer hover:underline">
                How to set up a business account
              </p>
              <p className="text-green-600 cursor-pointer hover:underline">
                How to set up a creator account
              </p>
            </>
          ),
        },
        {
          title: "Must be connected to a Facebook Page",
          description: (
            <>
              <p className="text-green-600 cursor-pointer hover:underline">
                Having trouble connecting? View troubleshooting guide
              </p>
            </>
          ),
        },
      ],
    },
    LinkedIn: {
      title:
        "Connect your LinkedIn profile to share content and manage your professional presence.",
      description: [
        {
          title:
            "Make sure you are signed in to the LinkedIn Profile account you wish to connect. You may need to sign out and sign in to the correct account before proceeding.",
        },
      ],
    },
  };

  useEffect(() => {
    if (platform && PlatformMessage[platform]) {
      setMessage(PlatformMessage[platform]);
      setWarning(true);
    } else {
      setWarning(false);
    }
  }, [platform]);

  const apiHandler = async (name: string) => {
    if (name === "Instagram") {
      router.push(
        `https://www.facebook.com/v21.0/dialog/oauth?client_id=${process.env.NEXT_PUBLIC_FB_CLIENT_ID}&display=page&redirect_uri=https://cross-posting-web.vercel.app/components/callbacks/instagram-callback&response_type=token&scope=instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_insights,pages_show_list,pages_read_engagement`
      );
    } else if (name === "LinkedIn") {
      window.open(
        `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID}&redirect_uri=https://cross-posting-web.vercel.app/api/linkedin/callback&state=foobar&scope=openid%20profile%20w_member_social%20email`
      );
    } else {
      try {
        const res = await fetch(
          `https://cross-posting-web.vercel.app/api/${name.toLowerCase()}/connect`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );
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

  return (
    <div className="relative flex justify-center w-full rounded-xl h-full">
      {/* Overlay & Popup */}
      {warning && platform && PlatformMessage[platform] && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md md:max-w-lg lg:max-w-xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold">Connect {platform}</h2>
            <h4 className="text-md font-semibold my-2">{message.title}</h4>
            <div className="mt-4">
              <h3 className="text-gray-800 font-semibold">Requirements:</h3>
              {message?.description?.map((msg, index) => (
                <div key={index} className="mt-4">
                  <button
                    className="flex items-center justify-between w-full p-2 border rounded-lg bg-gray-100"
                    onClick={() =>
                      setExpanded(expanded === index ? null : index)
                    }
                  >
                    <span className="flex items-center gap-2">
                      {msg.description && (
                        <FaExclamationCircle className="text-gray-600" />
                      )}
                      {msg.title}
                    </span>
                    {msg.description && (
                      <span>{expanded === index ? "▲" : "▼"}</span>
                    )}
                  </button>

                  {expanded === index && msg.description && (
                    <div className="p-3 mt-2 bg-gray-100 rounded-lg">
                      {msg.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-5">
              <div className="w-full flex justify-between gap-2 md:w-1/2">
                <button
                  onClick={() => setWarning(false)}
                  className="bg-gray-300 px-4 py-2 rounded-md w-full"
                >
                  Cancel
                </button>
                <button
                  onClick={() => apiHandler(platform)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md w-full"
                >
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SocialConnection warning={setWarning} platform={setPlatform} />
    </div>
  );
};

export default RightPanel;
