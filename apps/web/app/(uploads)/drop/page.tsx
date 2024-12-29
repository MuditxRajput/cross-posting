'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

import ImagePreview from '@/app/components/imageUpload/ImagePreview'
import ImageSlider from '@/app/components/imageUpload/imageSlider'
import StepForm from '@/app/components/stepForm'
import { Card } from '@/components/ui/card'
import { UploadIcon } from 'lucide-react'

export default function Upload() {
  const [media, setMedia] = useState<{ type: 'image' | 'video'; src: string }[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result) {
          const isVideo = file.type.startsWith('video/')
          setMedia((prev) => [
            ...prev,
            { type: isVideo ? 'video' : 'image', src: reader.result as string },
          ])
        }
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <Card
        {...getRootProps()}
        className={`p-8 text-center border-dashed border-2 ${
          isDragActive ? 'border-primary' : 'border-gray-300'
        } cursor-pointer transition-all duration-300 ease-in-out hover:bg-gray-50`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-primary font-medium">Drop the files here ...</p>
          ) : (
            <>
              <p className="text-lg font-medium mb-2">Drag and drop files here</p>
              <p className="text-sm text-gray-500">or click to select files</p>
            </>
          )}
        </div>
      </Card>

      {/* Conditional Rendering */}
      {media.length === 1 ? (
        <div className="mt-4 flex">
          {media[0]?.type === 'image' ? (
            <ImagePreview images={[media[0].src]} single />
          ) : (
            <div className='flex flex-row gap-3'>
              <video
                controls
                src={media[0]?.src || " "}
                className=" w-60 max-w-md rounded shadow"
              />
              <StepForm />
            </div>
          )}
        </div>
      ) : media.length > 1 ? (
        <div className="mt-4 flex gap-3 p-2">
          <ImageSlider images={media.map((item) => item.src)} />
          <StepForm />
        </div>
      ) : null}
    </div>
  )
}
