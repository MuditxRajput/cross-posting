import { RootState, SocialState } from '@/store/store';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSelector } from 'react-redux';
function ImageUploadComponent() {
  const allConnectedAccount = useSelector((state: RootState) => state.social);
  console.log("allconnectedAccount",allConnectedAccount);
  
  const [images, setImages] = useState<string[]>([]);
  
  const onDrop = useCallback((acceptedFiles: any) => {
    const newImages: string[] = [];
    acceptedFiles.forEach((file: any) => {
      const reader = new FileReader();

      reader.onabort = () => console.log('File reading was aborted');
      reader.onerror = () => console.log('File reading has failed');
      reader.onload = () => {
        // Convert file to a data URL and add it to the newImages array
        if (reader.result) {
          newImages.push(reader.result as string);
          // Update state after processing each file
          setImages((prevImages) => [...prevImages, reader.result as string]);
        }
      };
      reader.readAsDataURL(file); // Read file as a data URL
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className='w-full'>
      <div
        {...getRootProps()}
        className=" p-10  flex justify-center items-center border-2 border-dashed rounded-md hover:text-xl cursor-pointer"
      >
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-4 ">
        {images.map((image, index) => (
          <div className='flex flex-col p-5 gap-3'>
          
          <Image
            height={40}
            width={40}
            key={index}
            src={image}
            alt={`uploaded ${index}`}
            className="w-full h-auto rounded-md"
          />
          <input type='text' placeholder='Title' className='border rounded-lg px-3 py-2' />
          {/* <input type='text' placeholder='Description' /> */}
          <textarea rows={5} cols={5} placeholder='Description' className='border rounded-lg px-3 py-2'/>
          <input type="datetime-local" name="date-time" id="date-time" className='px-2 py-1 border rounded-lg' />
          
          {Object.keys(allConnectedAccount).map((platform) => {
  const key = platform as keyof SocialState;
  if(Array.isArray(allConnectedAccount[key]))
  {
    return allConnectedAccount[key].map((item, idx) => (
      // <div key={`${platform}-${idx}`}>  {key} :  {item}</div>
      <div className='flex gap-3'>
      <input type="checkbox" name="" id="" />
      <label>{item}</label>
      </div>
    ));
  }
 
})}
<button className='bg-green-400 rounded-lg w-32 flex justify-center px-2 py-2'>Schedule Post</button>

          </div>
        ))}
      </div>
    </div>
  );
}

export default ImageUploadComponent;
