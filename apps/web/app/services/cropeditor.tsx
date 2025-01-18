import { useState } from 'react';
import Cropper from 'react-easy-crop';

const CropEditor = ({ image }: { image: string }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const handleCropChange = (newCrop: { x: number; y: number }) => {
    setCrop(newCrop);
  };

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  return (
    <div className="crop-editor">
      <Cropper
        image={image}
        crop={crop}
        zoom={zoom}
        onCropChange={handleCropChange}
        onZoomChange={handleZoomChange}
      />
      <button>Apply Crop</button>
    </div>
  );
};

export default CropEditor;
