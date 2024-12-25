// import Cloudinary from "@/app/services/cloudinary";
// import { cloudinaryWorker } from "@/app/services/cloundinary";
import { useToast } from "@/hooks/use-toast";
import { RootState, SocialState } from "@/store/store";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { ThreeDot } from "react-loading-indicators";
import { useSelector } from "react-redux";

const ImageUploadForm = ({image}:any) => {
  const { toast } = useToast()
  const session =  useSession()
  const[showSchedule,setShowSchedule] = useState(false);
  const[loading,setLoading] = useState(false);

    const allConnectedAccount = useSelector((state: RootState) => state.social);
    // console.log("allConnectedAccount",allConnectedAccount);
    interface Platform{
      name:string,
      account:string[],
    }
    interface FormData{
      content :string;
      dateTime :string;
      platform : Platform[];
      image : string,
    }
    const [formData,setFormData] = useState<FormData>({
       content : "",
       dateTime : "",
       platform :[],
       image : "",
    })
    const handleData = (e: any) => {
      const { name, value, type, checked } = e.target;
    
      setFormData((pre) => {
        if (type === "checkbox") {
          const platformName = name;
          const platformIndex = pre.platform.findIndex((platform) => platform.name === platformName);
    
          if (platformIndex > -1) {
            const updatedPlatform = [...pre.platform];
    
            if (checked  ) {
              // Add the value only if it doesn't already exist
              if(updatedPlatform[platformIndex])
              if (!updatedPlatform[platformIndex].account.includes(value)) {
                updatedPlatform[platformIndex].account.push(value);
              }
            } else {
              // Remove the value when unchecked
              if(updatedPlatform[platformIndex])
               updatedPlatform[platformIndex].account = updatedPlatform[platformIndex].account.filter((acc) => acc !== value);
            }
    
            return { ...pre, platform: updatedPlatform };
          } else if (checked) {
            // Add a new platform entry if it doesn't exist
            return {
              ...pre,
              platform: [...pre.platform, { name: platformName, account: [value] }],
            };
          }
        }
        // For non-checkbox fields
        return { ...pre, [name]: value };
      });
    };
    
    const saveToCloudinary=async(image:any)=>{
      setLoading(true);
      try {
        const response = await fetch("http://localhost:3000/api/cloudinary",{
          method : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({image})
        })
        const data = await response.json();
        if(data.url)
        {
          
          const cloudinaryImage = data.url;
          formData.image = data.url;
          const userEmail =   session.data?.user?.email
          
         // we need to save the data.url in the database with timestamp
        const res =await fetch("http://localhost:3000/api/User/media",{
          method : "POST",
          headers:{
            "Content-Type" : "Application/json"
          },
          body : JSON.stringify({data:formData , urlData:cloudinaryImage,email:userEmail})
        });
        const val = await res.json();
        if(val.success)
        {
          setShowSchedule(true);
          setLoading(false);
        }
      }
      } 
      catch (error) {
        console.log("Error",error);
      }
     
    }
    const handleSchedule=async()=>{
      setLoading(true);
      setShowSchedule(false);
      const userEmail =   session.data?.user?.email
       try {
        const res = await fetch('http://localhost:3000/api/User/schedule',{
          method:"POST",
          headers:{
            "Content-Type":"application/json",
          },
          body:JSON.stringify({formData,email:userEmail})
        })
        const val = await res.json();
        if(val.success)
        {
          setLoading(false);
          toast({  
            title: " Post Published", });
             setTimeout(() => {
              window.location.href = "/";
            },2000
          );
        }

        else{
          setLoading(false);
          toast({ variant: "destructive",
            title: "Uh oh! Something went wrong.", });
        }
       } catch (error) {
        console.log("error in queue",error);
       }
    }
  return (
    <div className="mt-1 bg-white shadow-md rounded-lg p-2 max-w-md mx-auto">
    <input
      type="text"
      name="content"
      placeholder="Enter your content here..."
      className="w-full p-3 border border-green-500 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
      onChange={(e) => handleData(e)}
    />
    <div className="mb-2">
      <h3 className="text-lg  mb-2">Select Platforms</h3>
      {Object.keys(allConnectedAccount).map((platform) => {
        const key = platform as keyof SocialState;
  
        if (Array.isArray(allConnectedAccount[key])) {
          return allConnectedAccount[key].map((val, index) => {
            if (val !== null && val !== undefined) {
              return (
                <div key={index} className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    name={`${key}`}
                    id={`${key}-${index}`}
                    value={`${val}`}
                    className="accent-green-500"
                    onChange={(e) => handleData(e)}
                  />
                  <label
                    htmlFor={`${key}-${index}`}
                    className=""
                  >
                    {`${key} - ${val}`}
                  </label>
                </div>
              );
            }
          });
        }
      })}
    </div>
  
    <div className="mb-4">
      <label
        htmlFor="dateTime"
        className="block text-gray-700 font-medium mb-2"
      >
        Schedule Date and Time
      </label>
      <input
        type="datetime-local"
        name="dateTime"
        id="dateTime"
        className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
        onChange={(e) => handleData(e)}
      />
    </div>
    {
      (!loading && showSchedule)? null : (loading && !showSchedule) ? null :   <button
      className={`w-full bg-green-500 text-white p-3 rounded-lg font-semibold `}
      onClick={() => saveToCloudinary(image)}
    >
      Save
    </button>
    }
  
   {
    loading ? <button className="w-full bg-green-500 text-white p-3 rounded-lg font-semibold mt-2"> <ThreeDot color="#ffffff" size="small" text="" textColor="" /> </button>  :null
   }
    {showSchedule && (
      <button
        className="w-full bg-green-500 text-white p-3 rounded-lg font-semibold mt-2"
        onClick={handleSchedule}
      >
        Schedule
      </button>
    )}
    
  </div>
  
  )
}

export default ImageUploadForm
