import Image from 'next/image'
import ImageUploadForm from '../imageUpload/ImageUploadForm'
const ImagePreview = ({images}:{images:string[]}) => {
  return (
    <div className="grid grid-cols-4 gap-4 mt-4">
    {images.map((image, index) => (
      <div key={index} className="p-2 border rounded bg-white ">
        <div className='flex justify-center items-center'>
          <Image src={image} width={180} height={100} alt={`Uploaded ${index}`} />
        </div>

        <ImageUploadForm image ={image} />
      </div>
    ))}
  </div>
  )
}

export default ImagePreview