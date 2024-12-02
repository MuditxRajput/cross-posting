import React from 'react'
import ImageUploadForm from '../imageUpload/ImageUploadForm'
import Image from 'next/image'
const ImagePreview = ({images}:{images:string[]}) => {
  return (
    <div className="grid grid-cols-4 gap-4 mt-4">
    {images.map((image, index) => (
      <div key={index} className="p-2 border rounded">
        <Image src={image} width={20} height={20} alt={`Uploaded ${index}`} className="w-full h-auto" />
        <ImageUploadForm image ={image} />
      </div>
    ))}
  </div>
  )
}

export default ImagePreview