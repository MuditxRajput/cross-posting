import React, { useState } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  src: string;
  onCropComplete: (croppedImage: string, crop: Crop) => void; // Add crop to callback
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ src, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 30, height: 30, x: 0, y: 0 });
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);

  const getCroppedImg = (image: HTMLImageElement, crop: Crop): Promise<string> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return Promise.reject(new Error('Could not get canvas context'));
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX * pixelRatio,
      crop.height * scaleY * pixelRatio
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg');
    });
  };

  const handleCropComplete = async () => {
    if (imageRef && crop.width && crop.height) {
      const croppedImage = await getCroppedImg(imageRef, crop);
      onCropComplete(croppedImage, crop); // Pass cropped image and crop dimensions
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <ReactCrop
        crop={crop}
        onChange={(newCrop) => setCrop(newCrop)}
        onComplete={(crop) => setCrop(crop)}
      >
        <img
          src={src}
          alt="Source"
          ref={(img) => setImageRef(img)} // Set image reference
          onLoad={(e) => {
            const img = e.currentTarget;
            setImageRef(img);
          }}
        />
      </ReactCrop>
      <div className="flex space-x-4">
        <button
          onClick={handleCropComplete}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Crop
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;