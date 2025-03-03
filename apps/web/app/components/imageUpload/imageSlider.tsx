'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Edit } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const ImageSlider = ({
  images,
  onEdit,
}: {
  images: string[];
  onEdit: (index: number) => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="relative w-full max-w-sm mx-auto mt-2 overflow-hidden shadow-lg">
      <div className="h-96 overflow-hidden">
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

      {/* Edit Button */}
      <button
        onClick={() => onEdit(currentIndex)} // Pass the current index to onEdit
        className="absolute top-4 right-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold shadow-md hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
      >
        <Edit className="w-4 h-4" />
      </button>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/50 p-2 rounded-full shadow-md hover:bg-white/75 transition-all duration-300"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/50 p-2 rounded-full shadow-md hover:bg-white/75 transition-all duration-300"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </Card>
  );
};

export default ImageSlider;