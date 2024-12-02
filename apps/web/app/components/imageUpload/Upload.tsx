import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import ImagePreview from '../imageUpload/ImagePreview'
export default function Upload() {
  const [images, setImages] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages: string[] = [];
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          newImages.push(reader.result as string);
          setImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div>
      <div
        {...getRootProps()}
        className="p-4 border-2 border-dashed rounded cursor-pointer"
      >
        <input {...getInputProps()} />
        <p>Drag and drop files here, or click to select files</p>
      </div>
      <ImagePreview images={images} />
    </div>
  );
}
