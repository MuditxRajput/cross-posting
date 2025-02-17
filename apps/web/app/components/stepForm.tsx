'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { reduceCycle } from '@/store/slices/social-account';
import { RootState, SocialState } from '@/store/store';
import { format, parseISO } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { ThreeDot } from 'react-loading-indicators';
import { useDispatch, useSelector } from 'react-redux';
import ProgressBar from './progressBar';

const steps = [
  { id: 1, title: 'Description' },
  { id: 2, title: 'Platform' },
  { id: 3, title: 'Time & Date' },
  { id: 4, title: 'Submit' },
];

interface Platform {
  name: string;
  account: string[];
}

interface FormData {
  description: string;
  platforms: Platform[];
  dateTime: string;
  image: string[];
}

interface StepFormProps {
  image: any;
  aspectRatio: string; // Add aspectRatio to props
}

const StepForm = ({ image, aspectRatio }: StepFormProps) => {
  const dispatch = useDispatch();
  const session = useSession();
  const { toast } = useToast();
  const allConnectedAccount = useSelector((state: RootState) => state.social);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    description: '',
    platforms: [],
    dateTime: '',
    image: [],
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePlatformChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => {
      const platformIndex = prev.platforms.findIndex((p) => p.name === name);

      let updatedPlatforms = [...prev.platforms];

      if (platformIndex > -1) {
        if (checked) {
          // Add account to existing platform
          if (updatedPlatforms[platformIndex] && !updatedPlatforms[platformIndex].account.includes(value)) {
            updatedPlatforms[platformIndex].account.push(value);
          }
        } else {
          // Remove account from platform
          if (updatedPlatforms[platformIndex]) {
            updatedPlatforms[platformIndex].account = updatedPlatforms[platformIndex].account.filter(
              (acc) => acc !== value
            );
          }

          // Remove platform if no accounts left
          if (updatedPlatforms[platformIndex] && updatedPlatforms[platformIndex].account.length === 0) {
            updatedPlatforms.splice(platformIndex, 1);
          }
        }
      } else if (checked) {
        // Add new platform
        updatedPlatforms.push({ name, account: [value] });
      }

      return { ...prev, platforms: updatedPlatforms };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setLoading(true);
      const res = await saveToCloudinary(image, aspectRatio); // Pass aspectRatio here
      if (res.success) {
        toast({
          title: 'Success',
          description: 'Post scheduled successfully!',
        });
        // window.location.href = "/";
      } else {
        if (res.error) {
          toast({
            title: 'Something went wrong',
          });
        } else if (!res.success) {
          dispatch(reduceCycle(1));
        }
      }
    }
  };

  const saveToCloudinary = async (image: any, aspectRatio: string) => {
    try {
      const fileType = image[0]?.src?.startsWith('data:image') ? 'image' : 'video';
      const response = await fetch('https://cross-posting-web.vercel.app/api/cloudinary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, fileType, aspectRatio }), // Include aspectRatio in the request
      });
      const data = await response.json();
      if (data.uploadedImages.length > 0) {
        formData.image = data.uploadedImages;
        const userEmail = session.data?.user?.email;
        const mediaType = fileType;
        console.log("image is uploaded", formData.image);
        const resp = await fetch('https://h2sfj6zzo7.execute-api.us-east-1.amazonaws.com/cors/connectingToValkey', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ formData, email: userEmail, mediaType }),
        });
        const val1 = await resp.json();
        if (val1.success) setLoading(false);
        return val1;
      } else {
        return { meg: 'error' };
      }
    } catch (error) {
      console.log('Error', error);
      return error;
    }
  };

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
        );
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
                        <label htmlFor={`${key}-${index}`} className="">
                          {`${key} - ${val}`}
                        </label>
                      </div>
                    );
                  }
                });
              }
            })}
          </div>
        );
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
        );
      case 4:
        return (
          <div className="space-y-4">
            <p>
              <strong>Description:</strong> {formData.description}
            </p>
            <p>
              <strong>Platforms:</strong> {formData.platforms.map((p) => `${p.name}`).join(', ')}
            </p>
            <p>
              <strong>Scheduled Time:</strong>{' '}
              {formData.dateTime ? format(parseISO(formData.dateTime), 'dd-MM-yyyy HH:mm') : 'Not Set'}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full mx-auto p-10 bg-white rounded-lg shadow-md">
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
          {loading ? (
            <Button>
              <ThreeDot />
            </Button>
          ) : (
            <Button type="submit">{currentStep === steps.length ? 'Submit' : 'Next'}</Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default StepForm;