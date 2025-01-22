import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { UploadIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import StepForm from '../stepForm';
import AdvancedImageEditor from './AdvancedImageEditor';
import { ImagePreview } from './ImagePreview';
import ImageSlider from './imageSlider';

// Type definition for media items
type MediaItem = { type: 'image' | 'video'; src: string };

export default function Upload() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          setMedia((prev) => [...prev, { type: isVideo ? 'video' : 'image', src: reader.result as string }]);
        }
      };

      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': []
    }
  });

  const handleSaveEdit = (editedImage: string, index: number) => {
    setMedia((prev) => prev.map((item, i) => (i === index ? { ...item, src: editedImage } : item)));
    setEditingIndex(null);
  };

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
          className={`p-8 text-center border-dashed border-2 ${
            isDragActive ? 'border-primary' : 'border-gray-300'
          } cursor-pointer transition-all duration-300 ease-in-out hover:bg-gray-50`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-primary font-medium">Drop the files here ...</p>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">Drag and drop files here</p>
                <p className="text-sm text-gray-500">or click to select files. Videos must be in 9:16 aspect ratio for Reels.</p>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Image Editor */}
      {media.length > 0 && editingIndex !== null && (
        <AdvancedImageEditor
          image={media[editingIndex].src}
          onSave={(editedImage) => handleSaveEdit(editedImage, editingIndex)}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Media Preview */}
      {media.length === 1 && editingIndex === null ? (
        <div className="mt-4 flex justify-center items-center">
          {media[0]?.type === 'image' ? (
            <div className="flex w-full gap-4 justify-center items-center">
              <div className="w-1/2">
                <ImagePreview
                  images={[media[0].src]}
                  single
                  onEdit={() => setEditingIndex(0)}
                />
              </div>
              <StepForm image={media} />
            </div>
          ) : (
            <div className="flex flex-row gap-3">
              <video
                controls
                src={media[0]?.src || ''}
                className="w-60 max-w-md rounded shadow"
              />
              <StepForm image={media} />
            </div>
          )}
        </div>
      ) : media.length > 1 && editingIndex === null ? (
        <div className="mt-4 flex gap-3 p-2">
          <ImageSlider
            images={media.map((item) => item.src)}
            onEdit={(index) => setEditingIndex(index)}
          />
          <StepForm image={media} />
        </div>
      ) : null}
    </div>
  );
}
