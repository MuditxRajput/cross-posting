// import Cloudinary from "@/app/services/cloudinary";
// import { cloudinaryWorker } from "@/app/services/cloundinary";
import { RootState, SocialState } from "@/store/store";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useSelector } from "react-redux";
const ImageUploadForm = ({image}:any) => {
  const session =  useSession()
  const[showSchedule,setShowSchedule] = useState(false);
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
      try {
        const response = await fetch("http://localhost:3000/api/cloudinary",{
          method : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({image})
        })
        const data = await response.json();
        //  console.log(data.url);
         
        if(data.url)
        {
          setShowSchedule(true);
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
        console.log("final val",val);
      }
      } catch (error) {
        console.log("Error",error);
        
      }
    }
    const handleSchedule=async()=>{
      const userEmail =   session.data?.user?.email
       try {
        console.log("data before we send",formData);
        const res = await fetch('http://localhost:3000/api/User/schedule',{
          method:"POST",
          headers:{
            "Content-Type":"application/json",
          },
          body:JSON.stringify({formData,email:userEmail})
        })
        const val = await res.json();
        console.log("data after we send",formData);
        console.log("VAl after queue",val);
        
        
        
       } catch (error) {
        console.log("error in queue",error);
        
       }
    }
  return (
    <div className="mt-2">
    <input
      type="text"
      name="content"
      placeholder="Content"
      className="w-full p-2 border rounded mb-2"
      onChange={(e)=>handleData(e)}
    />
    {Object.keys(allConnectedAccount).map((platform)=>{
        const key = platform as keyof SocialState;
        
        if(Array.isArray(allConnectedAccount[key]))
          {
        
            return allConnectedAccount[key].map((val,index)=>{
              if(val!==null && val!=undefined)
              {
                return(
                  <div className='flex gap-3'  >
                  <input type="checkbox" name={`${key}`} id="" value={`${val}`}  onChange={(e)=>handleData(e)}/>
                  <label>{`${key} - ${val}`}</label>
                  </div>
                )
              }
             
                
            })
        }
    })}

    {/* <input type name="date" id="date" /> */}
    <input type="datetime-local" name="dateTime" id="dateTime" onChange={(e)=>handleData(e)} />
    {showSchedule ?<button onClick={()=>handleSchedule()}  className="bg-green-500 text-white p-2 rounded mt-2">
      Schedule
    </button>  :<button onClick={()=>saveToCloudinary(image)} className="bg-green-500 text-white p-2 rounded mt-2">
      Saved
    </button> }
    
  </div>
  )
}

export default ImageUploadForm
