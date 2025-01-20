'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from '@/components/ui/slider'
import { useCallback, useState } from 'react'
import Cropper from 'react-easy-crop'
import { Area, Point } from 'react-easy-crop/types'

interface AdvancedImageEditorProps {
  image: string
  onSave: (editedImage: string) => void
  onCancel: () => void
}

type AspectRatio = {
  value: number
  label: string
}

const ASPECT_RATIOS: AspectRatio[] = [
  { value: 1 / 1, label: '1:1 (Square)' },
  { value: 4 / 5, label: '4:5 (Portrait)' },
  { value: 16 / 9, label: '16:9 (Landscape)' },
  { value: 9 / 16, label: '9:16 (Story)' },
]

export default function AdvancedImageEditor({ 
  image, 
  onSave, 
  onCancel 
}: AdvancedImageEditorProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [aspect, setAspect] = useState<number>(1)

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.setAttribute('crossOrigin', 'anonymous')
      image.src = url
    })

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0,
  ): Promise<string> => {
    try {
      const image = await createImage(imageSrc)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('No 2d context')
      }

      const rotRad = getRadianAngle(rotation)

      const { width: bBoxWidth, height: bBoxHeight } = getRotatedRect({
        width: image.width,
        height: image.height,
        rotation: rotRad
      })

      canvas.width = bBoxWidth
      canvas.height = bBoxHeight

      ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
      ctx.rotate(rotRad)
      ctx.translate(-image.width / 2, -image.height / 2)
      ctx.drawImage(image, 0, 0)

      const croppedCanvas = document.createElement('canvas')
      const croppedCtx = croppedCanvas.getContext('2d')

      if (!croppedCtx) {
        throw new Error('No 2d context')
      }

      croppedCanvas.width = pixelCrop.width
      croppedCanvas.height = pixelCrop.height

      croppedCtx.drawImage(
        canvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      )

      // Apply filters
      const imageData = croppedCtx.getImageData(0, 0, croppedCanvas.width, croppedCanvas.height)
      const data = imageData.data
      
      for (let i = 0; i < data.length; i += 4) {
        // Apply brightness
        const brightnessFloat = brightness / 100
        data[i] = clamp(data[i] * brightnessFloat, 0, 255)
        data[i + 1] = clamp(data[i + 1] * brightnessFloat, 0, 255)
        data[i + 2] = clamp(data[i + 2] * brightnessFloat, 0, 255)

        // Apply contrast
        const contrastFloat = contrast / 100
        for (let j = 0; j < 3; j++) {
          data[i + j] = clamp(
            ((data[i + j] / 255 - 0.5) * contrastFloat + 0.5) * 255,
            0,
            255
          )
        }

        // Apply saturation
        const saturationFloat = saturation / 100
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
        data[i] = clamp(avg + (data[i] - avg) * saturationFloat, 0, 255)
        data[i + 1] = clamp(avg + (data[i + 1] - avg) * saturationFloat, 0, 255)
        data[i + 2] = clamp(avg + (data[i + 2] - avg) * saturationFloat, 0, 255)
      }

      croppedCtx.putImageData(imageData, 0, 0)

      return croppedCanvas.toDataURL('image/jpeg', 0.95)
    } catch (error) {
      console.error('Error during image processing:', error)
      throw error
    }
  }

  const handleSave = useCallback(async () => {
    if (!croppedAreaPixels) return

    try {
      const croppedImage = await getCroppedImg(
        image,
        croppedAreaPixels,
        rotation
      )
      onSave(croppedImage)
    } catch (error) {
      console.error('Error saving the cropped image:', error)
    }
  }, [croppedAreaPixels, rotation, image, onSave])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full h-[300px] md:h-[400px] bg-gray-50">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          classes={{
            containerClassName: "rounded-lg"
          }}
        />
      </div>
      
      <div className="w-full max-w-sm space-y-4">
        <div className="space-y-2">
          <Label>Aspect Ratio</Label>
          <Select 
            value={aspect.toString()} 
            onValueChange={(value) => setAspect(parseFloat(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select aspect ratio" />
            </SelectTrigger>
            <SelectContent>
              {ASPECT_RATIOS.map((ratio) => (
                <SelectItem key={ratio.value} value={ratio.value.toString()}>
                  {ratio.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="zoom">Zoom</Label>
          <Slider
            id="zoom"
            min={1}
            max={3}
            step={0.1}
            value={[zoom]}
            onValueChange={(value) => setZoom(value[0])}
            className="mt-2"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rotation">Rotation</Label>
          <Slider
            id="rotation"
            min={0}
            max={360}
            value={[rotation]}
            onValueChange={(value) => setRotation(value[0])}
            className="mt-2"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brightness">Brightness</Label>
          <Slider
            id="brightness"
            min={0}
            max={200}
            value={[brightness]}
            onValueChange={(value) => setBrightness(value[0])}
            className="mt-2"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contrast">Contrast</Label>
          <Slider
            id="contrast"
            min={0}
            max={200}
            value={[contrast]}
            onValueChange={(value) => setContrast(value[0])}
            className="mt-2"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="saturation">Saturation</Label>
          <Slider
            id="saturation"
            min={0}
            max={200}
            value={[saturation]}
            onValueChange={(value) => setSaturation(value[0])}
            className="mt-2"
          />
        </div>

        <div className="flex justify-between gap-4 pt-4">
          <Button 
            onClick={onCancel} 
            variant="outline" 
            className="w-full"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="w-full"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation)

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

function getRotatedRect({
  width,
  height,
  rotation
}: {
  width: number
  height: number
  rotation: number
}) {
  const { width: rotatedWidth, height: rotatedHeight } = rotateSize(width, height, rotation)
  return {
    width: rotatedWidth,
    height: rotatedHeight,
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}