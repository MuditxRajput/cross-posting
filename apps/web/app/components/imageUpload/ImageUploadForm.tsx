// import Cloudinary from "@/app/services/cloudinary";
// import { cloudinaryWorker } from "@/app/services/cloundinary";
import { RootState, SocialState } from "@/store/store";
import { useState } from "react";
import { useSelector } from "react-redux";

const ImageUploadForm = ({image}:any) => {
  const[showSchedule,setShowSchedule] = useState(false);
    const allConnectedAccount = useSelector((state: RootState) => state.social);
    const [formData,setFormData] = useState({
        title :"",
        description :""
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
        if(data.url)
        {
          setShowSchedule(true);
        }
         // we need to save the data.url in the database with timestamp
        
      } catch (error) {
        console.log("Error",error);
        
      }
    }
  return (
    <div className="mt-2">
    <input
      type="text"
      placeholder="Title"
      className="w-full p-2 border rounded mb-2"
      onChange={(e)=>handleData(e)}
    />
    <textarea
      rows={4}
      placeholder="Description"
      className="w-full p-2 border rounded"
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
    {showSchedule ?<button  className="bg-green-500 text-white p-2 rounded mt-2">
      Schedule
    </button>  :<button onClick={()=>saveToCloudinary(image)} className="bg-green-500 text-white p-2 rounded mt-2">
      Saved
    </button> }
    
  </div>
  )
}

export default ImageUploadForm
