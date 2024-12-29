import Image from 'next/image'
import StepForm from '../stepForm'

const ImagePreview = ({ images, single }: { images: string[], single?: boolean }) => {
  return (
    <div className=" mt-4 w-full">
      {images.map((image, index) => (
        <div key={index} className="p-2 border rounded bg-white w-full flex gap-6">
          <div className="flex justify-center items-center">
            <Image src={image} width={280} height={400} alt={`Uploaded ${index}`} />
          </div>
          <div className=' w-full flex-1'>
          {single && <StepForm image={image} />}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ImagePreview
