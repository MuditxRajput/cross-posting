'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Edit } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const ImageSlider = ({
  images,
  onEdit
}: {
  images: string[],
  onEdit: (index: number) => void
}) => {
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
    <Card className="relative w-full max-w-sm mx-auto mt-2 overflow-hidden shadow-lg">
      <div className="h-96 overflow-hidden"> {/* Fixed height */}
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
              style={{ objectFit: 'cover' }} /* Ensure image fits */
              className="rounded-md"
            />
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Rest of the code remains the same */}
    </Card>
  )
}

export default ImageSlider