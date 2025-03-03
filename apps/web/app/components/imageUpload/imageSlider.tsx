'use client'

import { Card } from '@/components/ui/card'
import { AnimatePresence, motion } from 'framer-motion'
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
      
      {/* Navigation Controls */}
      <div className="absolute inset-0 flex items-center justify-between p-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          className="bg-black/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/40 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          className="bg-black/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/40 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
      
      {/* Add Edit Button */}
      <button
        onClick={() => onEdit(currentIndex)}
        className="absolute top-4 right-4 px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold shadow-md hover:from-blue-600 hover:to-purple-600 transition-all duration-300 text-sm"
      >
        Edit
      </button>
      
      {/* Indicator Dots */}
      <div className="absolute bottom-4 left-0 right-0">
        <div className="flex justify-center space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}

export default ImageSlider