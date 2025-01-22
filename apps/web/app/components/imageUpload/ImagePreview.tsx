import { Button } from '@/components/ui/button';
import Image from 'next/image'; // Adjust the import path as necessary
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
        <div 
          key={index} 
          className="p-2 border rounded    gap-2"
        >
          <div className="flex justify-center items-center">
            <Image 
              src={image || "/placeholder.svg"} 
               width={200}
              height={400}
              alt={`Uploaded ${index}`} 
              className="rounded-lg" 
            />
          </div>
          {/* Add Edit button for single image */}
          {single && onEdit && (
            <div className="flex justify-end mt-2">
              <Button 
                onClick={onEdit} 
                className="bg-primary text-white hover:bg-primary-dark"
              >
                Edit
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
export { ImagePreview };
