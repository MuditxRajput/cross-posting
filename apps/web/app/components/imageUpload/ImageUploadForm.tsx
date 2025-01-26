"use client";
import { useToast } from "@/hooks/use-toast";
import { RootState, SocialState } from "@/store/store";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { ThreeDot } from "react-loading-indicators";
import { useSelector } from "react-redux";

const ImageUploadForm = ({ image }: any) => {
  const { toast } = useToast();
  const session = useSession();
  const [showSchedule, setShowSchedule] = useState(false);
  const [loading, setLoading] = useState(false);

  const allConnectedAccount = useSelector((state: RootState) => state.social);

  interface Platform {
    name: string;
    account: string[];
  }

  interface FormData {
    content: string;
    dateTime: string;
    platform: Platform[];
    image: string;
  }

  const [formData, setFormData] = useState<FormData>({
    content: "",
    dateTime: "",
    platform: [],
    image: "",
  });

  const handleData = (e: any) => {
    const { name, value, type, checked } = e.target;

    setFormData((pre) => {
      if (type === "checkbox") {
        const platformName = name;
        const platformIndex = pre.platform.findIndex((platform) => platform.name === platformName);

        if (platformIndex > -1) {
          const updatedPlatform = [...pre.platform];

          if (checked) {
            if (updatedPlatform[platformIndex] && !updatedPlatform[platformIndex].account.includes(value)) {
              updatedPlatform[platformIndex].account.push(value);
            }
          } else {
            if (updatedPlatform[platformIndex]) {
              updatedPlatform[platformIndex].account = updatedPlatform[platformIndex].account.filter(
                (acc) => acc !== value
              );
            }
          }

          return { ...pre, platform: updatedPlatform };
        } else if (checked) {
          return {
            ...pre,
            platform: [...pre.platform, { name: platformName, account: [value] }],
          };
        }
      }
      return { ...pre, [name]: value };
    });
  };

  const saveToCloudinary = async (image: any) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/cloudinary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data = await response.json();
      if (data.url) {
        const cloudinaryImage = data.url;
        formData.image = data.url;
        const userEmail = session.data?.user?.email;
        const dataType = data.type;

        const res = await fetch("http://localhost:3000/api/User/media", {
          method: "POST",
          headers: {
            "Content-Type": "Application/json",
          },
          body: JSON.stringify({ data: formData, urlData: cloudinaryImage, email: userEmail, mediaType: dataType }),
        });
        const val = await res.json();
        if (val.success) {
          setShowSchedule(true);
          setLoading(false);
        }
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  const handleSchedule = async () => {
    setLoading(true);
    setShowSchedule(false);
    const userEmail = session.data?.user?.email;
    try {
      const res = await fetch("http://localhost:3000/api/User/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formData, email: userEmail }),
      });
      const val = await res.json();
      if (val.success) {
        setLoading(false);
        toast({
          title: "Post Published",
        });
        setTimeout(() => {
          // window.location.href = "/";
        }, 2000);
      } else {
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
        });
      }
    } catch (error) {
      console.log("error in queue", error);
    }
  };

  return (
    <div className="mt-4 bg-white shadow-lg rounded-xl p-6 max-w-md mx-auto">
      {/* Content Input */}
      <input
        type="text"
        name="content"
        placeholder="Enter your content here..."
        className="w-full p-3 border border-green-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
        onChange={(e) => handleData(e)}
      />

      {/* Platform Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Platforms</h3>
        {Object.keys(allConnectedAccount).map((platform) => {
          const key = platform as keyof SocialState;

          if (Array.isArray(allConnectedAccount[key])) {
            return allConnectedAccount[key].map((val, index) => {
              if (val !== null && val !== undefined) {
                return (
                  <div key={index} className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      name={`${key}`}
                      id={`${key}-${index}`}
                      value={`${val}`}
                      className="accent-green-500 w-5 h-5"
                      onChange={(e) => handleData(e)}
                    />
                    <label htmlFor={`${key}-${index}`} className="text-gray-700">
                      {`${key} - ${val}`}
                    </label>
                  </div>
                );
              }
            });
          }
        })}
      </div>

      {/* Schedule Date and Time */}
      <div className="mb-6">
        <label htmlFor="dateTime" className="block text-gray-700 font-medium mb-2">
          Schedule Date and Time
        </label>
        <input
          type="datetime-local"
          name="dateTime"
          id="dateTime"
          className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
          onChange={(e) => handleData(e)}
        />
      </div>

      {/* Save Button */}
      {!loading && !showSchedule && (
        <button
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300"
          onClick={() => saveToCloudinary(image)}
        >
          Save
        </button>
      )}

      {/* Loading Indicator */}
      {loading && (
        <button className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-lg font-semibold mt-2">
          <ThreeDot color="#ffffff" size="small" text="" textColor="" />
        </button>
      )}

      {/* Schedule Button */}
      {showSchedule && (
        <button
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-lg font-semibold mt-2 hover:from-green-600 hover:to-blue-600 transition-all duration-300"
          onClick={handleSchedule}
        >
          Schedule
        </button>
      )}
    </div>
  );
};

export default ImageUploadForm;