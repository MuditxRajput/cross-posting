import React from 'react';

interface ImagePreviewProps {
  images: string[];
  single?: boolean;
  onEdit: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ images, single, onEdit }) => {
  return (
    <div className="relative">
      <img src={images[0]} alt="Preview" className="w-full h-auto rounded shadow" />
      <button
        onClick={onEdit}
        className="absolute top-2 right-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Edit
      </button>
    </div>
  );
};

export default ImagePreview;