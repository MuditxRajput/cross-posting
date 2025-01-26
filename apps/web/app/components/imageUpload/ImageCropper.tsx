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
  const [scale, setScale] = useState<number>(1); // New state for scaling the image

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
        if (!blob) return;
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      }, 'image/jpeg');
    });
  };

  const handleCropComplete = async () => {
    if (imageRef && crop.width && crop.height) {
      const croppedImage = await getCroppedImg(imageRef, crop);
      onCropComplete(croppedImage, crop);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6 bg-white rounded-xl shadow-lg max-w-2xl mx-auto">
      {/* Image Cropper */}
      <div className="w-full max-w-md overflow-hidden rounded-lg shadow-md">
        <ReactCrop
          crop={crop}
          onChange={(newCrop) => setCrop(newCrop)}
          onComplete={(crop) => setCrop(crop)}
          className="w-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Source"
            ref={(img) => setImageRef(img)}
            onLoad={(e) => setImageRef(e.currentTarget)}
            className="w-full h-auto max-h-[400px]"
            style={{ transform: `scale(${scale})` }} // Apply scaling using transform
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
