"use client";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { UploadIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Crop } from 'react-image-crop';
import StepForm from '../stepForm';
import ImageCropper from './ImageCropper';
import ImagePreview from './ImagePreview';
import ImageSlider from './imageSlider';

// Type definition for media items
type MediaItem = { type: 'image' | 'video'; src: string };

export default function Upload() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string | null>(null); 

  // Validate video aspect ratio for Instagram Reels
  const validateVideoAspectRatio = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const aspectRatio = video.videoWidth / video.videoHeight;
        const targetRatio = 9 / 16;
        const tolerance = 0.02;
        resolve(Math.abs(aspectRatio - targetRatio) <= tolerance);
      };

      video.src = URL.createObjectURL(file);
    });
  };

  // Handle file drop or selection
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);

    for (const file of acceptedFiles) {
      const reader = new FileReader();
      const isVideo = file.type.startsWith('video/');

      if (isVideo) {
        const isValidRatio = await validateVideoAspectRatio(file);
        if (!isValidRatio) {
          setError('Video must have a 9:16 aspect ratio for Instagram Reels.');
          continue;
        }
      }

      reader.onload = () => {
        if (reader.result) {
          setMedia((prev) => [
            ...prev,
            { type: isVideo ? 'video' : 'image', src: reader.result as string },
          ]);
        }
      };

      reader.readAsDataURL(file);
    }
  }, []);

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': [],
    },
  });

  // Save edited image and calculate aspect ratio
  const handleSaveEdit = (editedImage: string, index: number, crop: Crop) => {
    setMedia((prev) =>
      prev.map((item, i) => (i === index ? { ...item, src: editedImage } : item))
    );
    setEditingIndex(null);

    // Calculate aspect ratio from crop dimensions
    if (crop.width && crop.height) {
      // Format as string like "1:1" or "4:5"
      let ratioWidth = crop.width;
      let ratioHeight = crop.height;
      
      // Try to reduce to common formats
      const ratio = ratioWidth / ratioHeight;
      if (Math.abs(ratio - 1) < 0.05) {
        // Square 1:1
        ratioWidth = 1;
        ratioHeight = 1;
      } else if (Math.abs(ratio - 4/5) < 0.05) {
        // Portrait 4:5
        ratioWidth = 4;
        ratioHeight = 5;
      } else if (Math.abs(ratio - 16/9) < 0.05) {
        // Landscape 16:9
        ratioWidth = 16;
        ratioHeight = 9;
      }
      
      setAspectRatio(`${ratioWidth}:${ratioHeight}`);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => setEditingIndex(null);

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Dropzone */}
      {media.length === 0 && (
        <Card
          {...getRootProps()}
          className={`p-4 md:p-8 text-center border-dashed border-2 ${
            isDragActive ? 'border-primary' : 'border-gray-300'
          } cursor-pointer transition-all duration-300 ease-in-out hover:bg-gray-50`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            <UploadIcon className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-primary font-medium">Drop the files here ...</p>
            ) : (
              <>
                <p className="text-base md:text-lg font-medium mb-2">Drag and drop files here</p>
                <p className="text-xs md:text-sm text-gray-500">
                  or click to select files. Videos must be in 9:16 aspect ratio for Reels.
                </p>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Image Editor */}
      {editingIndex !== null && media[editingIndex]?.type === 'image' && (
        <ImageCropper
          src={media[editingIndex].src}
          onCropComplete={(croppedImage, crop) => handleSaveEdit(croppedImage, editingIndex, crop)}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Media Preview */}
      {media.length === 1 && editingIndex === null ? (
        <div className="mt-4 flex flex-col md:flex-row justify-center items-center gap-4">
          {media[0]?.type === 'image' ? (
            <>
              <div className="w-full md:w-1/2">
                <ImagePreview
                  images={[media[0].src]}
                  single
                  onEdit={() => setEditingIndex(0)}
                />
              </div>
              <div className="w-full md:w-1/2">
                <StepForm image={media} aspectRatio={aspectRatio || ''} />
              </div>
            </>
          ) : (
            <>
              <video
                controls
                src={media[0]?.src || ''}
                className="w-full md:w-60 max-w-md rounded shadow"
              />
              <div className="w-full md:w-1/2">
                <StepForm image={media} aspectRatio={aspectRatio || ''} />
              </div>
            </>
          )}
        </div>
      ) : media.length > 1 && editingIndex === null ? (
        <div className="mt-4 flex flex-col md:flex-row gap-4 p-2">
          <div className="w-full md:w-1/2">
            <ImageSlider
              images={media.map((item) => item.src)}
              onEdit={(index) => setEditingIndex(index)}
            />
          </div>
          <div className="w-full md:w-1/2">
            <StepForm image={media} aspectRatio={aspectRatio || ''} />
          </div>
        </div>
      ) : null}
    </div>
  );
}