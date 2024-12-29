'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from "@/hooks/use-toast"
import { RootState, SocialState } from '@/store/store'
import { format, parseISO } from 'date-fns'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { ThreeDot } from "react-loading-indicators"
import { useSelector } from 'react-redux'
import ProgressBar from './progressBar'
const steps = [
  { id: 1, title: 'Enter Description' },
  { id: 2, title: 'Select Platform' },
  { id: 3, title: 'Schedule Time' },
  { id: 4, title: 'Submit' },
]

const platforms = [
  { name: 'Instagram',account :[] },
  { name: 'LinkedIn',account :[] },
]

interface Platform {
  name: string;
  account: string[];
}
interface FormData {
    description: string;
    platforms: Platform[];
    dateTime: string;
    image : string;
}
const StepForm = ({image}:any) => {

    const session = useSession();
    const { toast } = useToast()
    const allConnectedAccount = useSelector((state: RootState) => state.social);
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    description: '',
    platforms: [] as Platform[],
    dateTime: '',
    image :''
  })
  const [loading,setLoading]  = useState(false);
  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handlePlatformChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    console.log('Platform Change:', { name, value, checked }); // Debug log
  
    setFormData((prev) => {
      const platformIndex = prev.platforms.findIndex(p => p.name === name);
  
      let updatedPlatforms = [...prev.platforms];
  
      if (platformIndex > -1) {
        if (checked) {
          // Add account to existing platform
          if (updatedPlatforms[platformIndex] && !updatedPlatforms[platformIndex].account.includes(value)) {
            updatedPlatforms[platformIndex].account.push(value);
            console.log('Added account to existing platform:', updatedPlatforms); // Debug log
          }
        } else {
          // Remove account from platform
          if (updatedPlatforms[platformIndex]) {
            updatedPlatforms[platformIndex].account = updatedPlatforms[platformIndex].account.filter(acc => acc !== value);
          }
          
          // Remove platform if no accounts left
          if (updatedPlatforms[platformIndex] && updatedPlatforms[platformIndex].account.length === 0) {
            updatedPlatforms.splice(platformIndex, 1);
          }
          console.log('Removed account from platform:', updatedPlatforms); // Debug log
        }
      } else if (checked) {
        // Add new platform
        updatedPlatforms.push({ name, account: [value] });
        console.log('Added new platform:', updatedPlatforms); // Debug log
      }
  
      const newState = { ...prev, platforms: updatedPlatforms };
      console.log('New Form State:', newState); // Debug log
      return newState;
    });
  };

  const handleSubmit = async(e: React.FormEvent) => {
  
    e.preventDefault()
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      setLoading(true);
      // Handle final submission
     const res = await saveToCloudinary(image);
    //  console.log("final response",res);
     
    //    const val = await res.json();
       if(res.success)
       {
         toast({
           title: 'Success',
           description: 'Post Schedule is successfully!',
         })
        //  window.location.href = '/';
       }
       else {
         toast({
           title: 'Error',
           description: 'Error in submitting the form!',
           
         })
       }
      
      alert('Form submitted successfully!')
    }
  }
  const saveToCloudinary=async(image:any)=>{
    // setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/cloudinary",{
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({image})
      })
      const data = await response.json();
      if(data.url)
      {
        console.log("Data",data.url);
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
      console.log("Res while saving in media",res);
      const val = await res.json();
      console.log("media",val);
      if(val.success)
      {
        
        const resp = await fetch('http://localhost:3000/api/User/schedule',{
          method:"POST",
          headers:{
            "Content-Type":"application/json",
          },
          body:JSON.stringify({formData,email:userEmail})
        })
        const val1 = await resp.json();
        console.log("data from the schedule",val1);
        if(val1.success) setLoading(false);
        return val1;
      }
      else return val;
    }
    else {
        return {meg: "error"}
    }
    } 
    catch (error) {
      console.log("Error",error);
      return error;
    }
   
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter your description"
            className="w-full"
            required
          />
        )
      case 2:
        return (
          <div className="space-y-4">
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
                                onChange={(e) => handlePlatformChange(e)}
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
        )
      case 3:
        return (
          <Input
            type="datetime-local"
            name="dateTime"
            value={formData.dateTime}
            onChange={handleInputChange}
            className="w-full"
            required
          />
        )
      case 4:
        return (
          <div className="space-y-4">
            <p><strong>Description:</strong> {formData.description}</p>
            <p><strong>Platforms:</strong> {formData.platforms.map((p) => `${p.name}`).join(', ')}</p>
            <p><strong>Scheduled Time:</strong> {formData.dateTime ? format(parseISO(formData.dateTime), 'dd-MM-yyyy HH:mm') : 'Not Set'}</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full  mx-auto p-10 bg-white rounded-lg shadow-md ">
      <ProgressBar steps={steps} currentStep={currentStep} />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-5 mt-16">{steps[currentStep - 1]?.title}</h2>
            {renderStepContent()}
        </div>
        <div className="flex justify-between">
          <Button
            type="button"
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={currentStep === 1}
            variant="outline"
          >
            Previous
          </Button>
          {loading ?  <Button> <ThreeDot/> </Button> :  <Button type="submit">
            {currentStep === steps.length ? 'Submit' : 'Next'}
          </Button>}
          
          {/* {loading && <ThreeDot />}    */}
        </div>
      </form>
    </div>
  )
}

export default StepForm
