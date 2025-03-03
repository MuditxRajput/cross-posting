"use client";
import React, { useState } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  src: string;
  onCropComplete: (croppedImage: string, crop: Crop) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ src, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 30, height: 30, x: 0, y: 0 });
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  // Function to get cropped image with proper sizing and white background
  const getCroppedImg = (image: HTMLImageElement, crop: Crop): Promise<string> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;

    // Set canvas dimensions based on aspect ratio or default to square
    let targetWidth = 1080;
    let targetHeight = 1080;
    
    // Apply aspect ratio if selected
    if (aspectRatio) {
      if (aspectRatio > 1) {
        // Landscape
        targetHeight = Math.round(targetWidth / aspectRatio);
      } else {
        // Portrait
        targetHeight = Math.min(1350, Math.round(targetWidth / aspectRatio));
        if (targetHeight === 1350) {
          targetWidth = Math.round(targetHeight * aspectRatio);
        }
      }
    }

    canvas.width = targetWidth * pixelRatio;
    canvas.height = targetHeight * pixelRatio;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return Promise.reject(new Error('Could not get canvas context'));
    }

    // Fill canvas with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate scaled dimensions
    const cropWidth = crop.width * scaleX * scale;
    const cropHeight = crop.height * scaleY * scale;
    
    // Maintain aspect ratio of the crop if needed
    let scaledWidth = cropWidth * pixelRatio;
    let scaledHeight = cropHeight * pixelRatio;
    
    // If crop is too large for the canvas, scale it down proportionally
    if (scaledWidth > canvas.width || scaledHeight > canvas.height) {
      const ratio = Math.min(canvas.width / scaledWidth, canvas.height / scaledHeight);
      scaledWidth *= ratio;
      scaledHeight *= ratio;
    }

    // Draw the cropped image on the canvas, centered
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      (canvas.width - scaledWidth) / 2, // Center horizontally
      (canvas.height - scaledHeight) / 2, // Center vertically
      scaledWidth,
      scaledHeight
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.95); // Higher quality
    });
  };

  const handleCropComplete = async () => {
    if (imageRef && crop.width && crop.height) {
      const croppedImage = await getCroppedImg(imageRef, crop);
      onCropComplete(croppedImage, crop);
    }
  };

  // Set aspect ratio presets
  const setAspectRatioPreset = (ratio: number | null) => {
    setAspectRatio(ratio);
    if (ratio) {
      // Adjust crop to match the new aspect ratio
      setCrop((prevCrop) => {
        const newCrop = { ...prevCrop };
        if (ratio > 1) {
          // Landscape
          newCrop.height = newCrop.width / ratio;
        } else {
          // Portrait or square
          newCrop.width = newCrop.height * ratio;
        }
        return newCrop;
      });
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6 bg-white rounded-xl shadow-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800">Crop Image</h2>
      
      {/* Aspect Ratio Selection */}
      <div className="w-full max-w-md">
        <label className="block mb-2 font-medium text-gray-700">Select Format</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setAspectRatioPreset(1)} // Square (1:1)
            className={`py-2 px-4 rounded ${aspectRatio === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Square
          </button>
          <button
            onClick={() => setAspectRatioPreset(4/5)} // Portrait (4:5)
            className={`py-2 px-4 rounded ${aspectRatio === 4/5 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Portrait
          </button>
          <button
            onClick={() => setAspectRatioPreset(16/9)} // Landscape (16:9)
            className={`py-2 px-4 rounded ${aspectRatio === 16/9 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Landscape
          </button>
          <button
            onClick={() => setAspectRatioPreset(null)} // Free form
            className={`py-2 px-4 rounded ${aspectRatio === null ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Free
          </button>
        </div>
      </div>

      {/* Image Cropper */}
      <div className="w-full max-w-md overflow-hidden rounded-lg shadow-md">
        <ReactCrop
          crop={crop}
          onChange={(newCrop) => setCrop(newCrop)}
          onComplete={(crop) => setCrop(crop)}
          aspect={aspectRatio || undefined}
          className="w-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Source"
            ref={(img) => setImageRef(img)}
            onLoad={(e) => setImageRef(e.currentTarget)}
            className="w-full h-auto max-h-96"
            style={{ transform: `scale(${scale})` }}
          />
        </ReactCrop>
      </div>

      {/* Slider for Scaling */}
      <div className="flex flex-col items-center w-full max-w-md">
        <label htmlFor="scale-slider" className="mb-2 font-medium text-gray-700">
          Resize Image
        </label>
        <input
          id="scale-slider"
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={scale}
          onChange={(e) => setScale(parseFloat(e.target.value))}
          className="w-full"
        />
        <p className="text-sm text-gray-500 mt-2">Scale: {scale.toFixed(1)}x</p>
      </div>

      {/* Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={handleCropComplete}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-md"
        >
          Crop
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-lg font-semibold hover:from-gray-600 hover:to-gray-800 transition-all duration-300 shadow-md"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;