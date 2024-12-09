// import Cloudinary from "@/app/services/cloudinary";
// import { cloudinaryWorker } from "@/app/services/cloundinary";
import { RootState, SocialState } from "@/store/store";
import { format } from 'date-fns';
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useSelector } from "react-redux";
const ImageUploadForm = ({image}:any) => {
  const session =  useSession()
  const[showSchedule,setShowSchedule] = useState(false);
    const allConnectedAccount = useSelector((state: RootState) => state.social);
    // console.log("allConnectedAccount",allConnectedAccount);
    interface FormData{
      content :string;
      dateTime :string;
      platform : string[];
    }
    const [formData,setFormData] = useState<FormData>({
       content : "",
       dateTime : "",
       platform :[],
    })
    const handleData=(e:any)=>{
      
        const{name,value,type,checked} = e.target;
        setFormData((pre)=>{
          if(type==="checkbox")
          {
            if(pre.platform.includes(value))
            {
              const platform =  pre.platform.filter((val)=>val!==value);
              return {...pre,platform};
            }
            const platform = [...pre.platform,value];
            
            
            return {...pre,platform}
          }
          else if(name==="dateTime")
          {
            const newDate =format(new Date(value),"dd-MM-yyyy HH:mm");
            return {...pre,dateTime:newDate};
          }
          return {...pre,[name]:value}  
        })
        
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
    const handleSchedule=async()=>{
       try {
        const res = await fetch('http://localhost:3000/api/User/schedule',{
          method:"POST",
          headers:{
            "Content-Type":"application/json",
          },
          body:JSON.stringify(formData)
        })
        const val = await res.json();
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
              return(
                <div className='flex gap-3'  >
                <input type="checkbox" name="platform" id="" value={`${val}`}  onChange={(e)=>handleData(e)}/>
                <label>{`${key} - ${val}`}</label>
                </div>
              )
                
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
