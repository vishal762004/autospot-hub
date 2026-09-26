/**
 * @file HeroBanner.tsx
 * @description Hero Showcase Carousel highlighting flagship luxury supercars
 * with call-to-action buttons, specifications badges, and slide indicators.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Shield, Zap, Sparkles, ArrowRight, Calendar } from 'lucide-react';
import { Car } from '../types';
import { formatCurrency } from '../utils/taxCalculator';
import { SmartCarImage } from './SmartCarImage';

interface HeroBannerProps {
  featuredCars: Car[];
  onSelectCar: (car: Car) => void;
  onBookTestDrive: () => void;
  onExploreClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  featuredCars,
  onSelectCar,
  onBookTestDrive,
  onExploreClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance carousel every 6 seconds
  useEffect(() => {
    if (featuredCars.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredCars.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredCars.length]);

  if (featuredCars.length === 0) return null;

  const currentCar = featuredCars[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredCars.length) % featuredCars.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredCars.length);
  };

  return (
    <div className="relative w-full h-[560px] sm:h-[600px] md:h-[620px] overflow-hidden bg-slate-950 text-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCar.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          {/* Background Image with Dark Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 z-10" />
          
          <SmartCarImage
            car={currentCar}
            alt={`${currentCar.make} ${currentCar.model}`}
            className="w-full h-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />

          {/* Hero Content Container */}
          <div className="relative z-20 mx-auto flex h-full w-full max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-4">
              
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider backdrop-blur-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Featured Masterpiece</span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-none"
              >
                {currentCar.make} <br />
                <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
                  {currentCar.model}
                </span>
              </motion.h1>

              {/* Price Tag */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-baseline gap-3"
              >
                <span className="text-2xl sm:text-4xl font-extrabold text-amber-400">
                  {formatCurrency(currentCar.price)}
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-widest font-medium">
                  Base Ex-Showroom
                </span>
              </motion.div>

              {/* Quick Specs Pills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2"
              >
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 backdrop-blur-md">
                  <p className="text-[11px] text-slate-400 font-medium uppercase">Engine</p>
                  <p className="text-sm font-semibold text-slate-100 truncate">{currentCar.specs.engine}</p>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 backdrop-blur-md">
                  <p className="text-[11px] text-slate-400 font-medium uppercase">Power</p>
                  <p className="text-sm font-semibold text-amber-300 truncate">{currentCar.specs.power}</p>
                </div>
                <div className="hidden sm:block bg-slate-900/80 border border-slate-800 rounded-xl p-3 backdrop-blur-md">
                  <p className="text-[11px] text-slate-400 font-medium uppercase">Top Speed</p>
                  <p className="text-sm font-semibold text-slate-100 truncate">{currentCar.specs.topSpeed || '250+ km/h'}</p>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap items-center gap-4 pt-4"
              >
                <button
                  onClick={() => onSelectCar(currentCar)}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
                >
                  <span>View Details & Specs</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onBookTestDrive}
                  className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold px-6 py-3.5 rounded-xl backdrop-blur-md transition-all hover:border-amber-400"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Book Test Drive</span>
                </button>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Carousel Controls */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-900/70 border border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800 transition-all hover:scale-110"
        title="Previous Car"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-900/70 border border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800 transition-all hover:scale-110"
        title="Next Car"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {featuredCars.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-8 bg-amber-400' : 'w-2 bg-slate-600 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
