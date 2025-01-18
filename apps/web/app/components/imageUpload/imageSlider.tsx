'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const ImageSlider = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="relative w-full max-w-sm mx-auto mt-2 overflow-hidden">
      <div className="aspect-square">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentIndex] || ''}
              alt={`Slide ${currentIndex}`}
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-md"
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="absolute inset-0 flex items-center justify-between p-2">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-white/80 hover:bg-white"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-white/80 hover:bg-white"
          onClick={nextSlide}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-1.5 rounded-full ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </Card>
  )
}

export default ImageSlider