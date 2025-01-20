'use client'

import React, { useState, useRef } from 'react'
import ReactCrop, { Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'

interface ImageEditorProps {
  image: string
  onSave: (editedImage: string) => void
}

export default function ImageEditor({ image, onSave }: ImageEditorProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<Crop>()
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [color, setColor] = useState('#00000000')
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const imgRef = useRef<HTMLImageElement>(null)

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setCrop({ unit: '%', width: 90, height: 90, x: 5, y: 5 })
  }

  const getCroppedImg = (
    image: HTMLImageElement,
    crop: Crop,
    scale = 1,
    rotation = 0,
    brightness = 100,
    contrast = 100,
    saturation = 100
  ) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const pixelRatio = window.devicePixelRatio

    canvas.width = Math.floor(crop.width * scaleX * pixelRatio)
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio)

    ctx.scale(pixelRatio, pixelRatio)
    ctx.imageSmoothingQuality = 'high'

    const cropX = crop.x * scaleX
    const cropY = crop.y * scaleY

    const rotateRads = rotation * Math.PI / 180
    const centerX = image.naturalWidth / 2
    const centerY = image.naturalHeight / 2

    ctx.save()

    ctx.translate(-cropX, -cropY)
    ctx.translate(centerX, centerY)
    ctx.rotate(rotateRads)
    ctx.scale(scale, scale)
    ctx.translate(-centerX, -centerY)
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight
    )

    ctx.restore()

    // Apply color overlay
    ctx.globalCompositeOperation = 'source-atop'
    ctx.fillStyle = color
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    return canvas.toDataURL('image/jpeg')
  }

  const handleSave = () => {
    if (imgRef.current && completedCrop) {
      const croppedImage = getCroppedImg(
        imgRef.current,
        completedCrop,
        scale,
        rotation,
        brightness,
        contrast,
        saturation
      )
      onSave(croppedImage)
    }
  }

  const handleReset = () => {
    setCrop(undefined)
    setScale(1)
    setRotation(0)
    setColor('#00000000')
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
  }

  return (
    <div className="flex flex-row items-start gap-8">
      {/* Controls on the left */}
      <div className="w-1/2 max-w-sm space-y-4">
        <div>
          <label className="text-sm font-medium">Scale</label>
          <Slider
            min={0.5}
            max={2}
            step={0.1}
            value={[scale]}
            onValueChange={(value) => setScale(value[0] ?? 0)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Rotation</label>
          <Slider
            min={0}
            max={360}
            value={[rotation]}
            onValueChange={(value) => setRotation(value[0] ?? 0)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Brightness</label>
          <Slider
            min={50}
            max={150}
            value={[brightness]}
            onValueChange={(value) => setBrightness(value[0] ?? 100)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Contrast</label>
          <Slider
            min={50}
            max={150}
            value={[contrast]}
            onValueChange={(value) => setContrast(value[0] ?? 100)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Saturation</label>
          <Slider
            min={50}
            max={150}
            value={[saturation]}
            onValueChange={(value) => setSaturation(value[0] ?? 100)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Color Overlay</label>
          <Input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Button onClick={handleSave}>Save Changes</Button>
          <Button variant="secondary" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>
      {/* Image Editor on the right */}
      <div className="w-1/2">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={1}
        >
          <img
            ref={imgRef}
            src={image || '/placeholder.svg'}
            alt="Crop me"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
            }}
            onLoad={onImageLoad}
          />
        </ReactCrop>
      </div>
    </div>
  )
}
