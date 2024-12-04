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
    const [formData,setFormData] = useState({
       content : "",
       dateTime : "",
    })
    const handleData=(e:any)=>{
        const name = e.target.name;
        const value = e.target.value;
        setFormData((pre)=>({...pre, [name]:value}))
    }
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
                <div className='flex gap-3'>
                <input type="checkbox" name="" id="" />
                <label>{val}</label>
                </div>
            })
        }
    })}
    {/* <input type name="date" id="date" /> */}
    <input type="datetime-local" name="dateTime" id="dateTime" onChange={(e)=>handleData(e)} />
    {showSchedule ?<button  className="bg-green-500 text-white p-2 rounded mt-2">
      Schedule
    </button>  :<button onClick={()=>saveToCloudinary(image)} className="bg-green-500 text-white p-2 rounded mt-2">
      Saved
    </button> }
    
  </div>
  )
}

export default ImageUploadForm
