"use client";
import React from 'react';

interface ImagePreviewProps {
  images: string[];
  single?: boolean;
  onEdit: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ images, single, onEdit }) => {
  return (
    <div className="relative group">
      {/* Image Container */}
      <div className="w-full h-96 overflow-hidden rounded-xl shadow-lg"> {/* Fixed height */}
        <img
          src={images[0]}
          alt="Preview"
          className="w-full h-full object-cover transition-transform transform group-hover:scale-105" /* Ensure image fits */
        />
      </div>

      {/* Edit Button */}
      <button
        onClick={onEdit}
        className="absolute top-4 right-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold shadow-md hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
      >
        Edit
      </button>
    </div>
  );
};

export default ImagePreview;