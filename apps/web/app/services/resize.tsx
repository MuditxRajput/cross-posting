import { useState } from 'react';

const ResizeEditor = ({ image }: { image: string }) => {
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(400);

  const handleWidthChange = (e: any) => {
    setWidth(e.target.value);
  };

  const handleHeightChange = (e: any) => {
    setHeight(e.target.value);
  };

  return (
    <div className="resize-editor">
      <div>
        <label>Width:</label>
        <input type="number" value={width} onChange={handleWidthChange} />
      </div>
      <div>
        <label>Height:</label>
        <input type="number" value={height} onChange={handleHeightChange} />
      </div>
      <div>
        <img
          src={image}
          style={{ width: `${width}px`, height: `${height}px` }}
          alt="Resized Image"
        />
      </div>
      <button>Apply Resize</button>
    </div>
  );
};

export default ResizeEditor;
