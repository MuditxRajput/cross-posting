import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import ImagePreview from '../imageUpload/ImagePreview';
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
    <div className="w-full ">
      <div
        {...getRootProps()}
        className=" border-2 border-dashed border-black rounded cursor-pointer flex justify-center items-center shadow-lg h-20 "
      >
        <input {...getInputProps()} />
        <p className='  flex justify-center items-center hover:text-lg'>Drag and drop files here, or click to select files</p>
      </div>
      <ImagePreview images={images} />
    </div>
  );
}
