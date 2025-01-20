import Image from 'next/image'
import StepForm from '../stepForm'
import { Button } from '@/components/ui/button'

const ImagePreview = ({ 
  images, 
  single, 
  onEdit 
}: { 
  images: string[], 
  single?: boolean,
  onEdit?: () => void
}) => {
  return (
    <div className="mt-4 w-full">
      {images.map((image, index) => (
        <div key={index} className="p-2 border rounded bg-white w-full flex flex-col md:flex-row gap-6">
          <div className="flex justify-center items-center">
            <Image src={image || "/placeholder.svg"} width={280} height={400} alt={`Uploaded ${index}`} className="rounded-lg" />
          </div>
          <div className='w-full flex-1'>
            {single && <StepForm image={image} />}
            {onEdit && (
              <Button onClick={onEdit} className="mt-2">
                Edit Image
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ImagePreview

