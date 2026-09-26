/**
 * Presentation component for one vehicle in the catalogue.
 * Business operations are received as callbacks so this component stays reusable.
 */
/**
 * @file CarCard.tsx
 * @description Individual Car Card component for the showroom grid display.
 * Includes thumbnail image, price formatting, specification badges, Add to Cart action,
 * and View Details modal trigger.
 */

import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Eye, Gauge, Fuel, Star } from 'lucide-react';
import { Car } from '../types';
import { BrandLogo } from './BrandLogo';
import { SmartCarImage } from './SmartCarImage';
import { formatCurrency } from '../utils/taxCalculator';

interface CarCardProps {
  car: Car;
  onSelect: (car: Car) => void;
  onAddToCart: (car: Car) => void;
  isInCart: boolean;
}

export const CarCard: React.FC<CarCardProps> = ({
  car,
  onSelect,
  onAddToCart,
  isInCart,
}) => {
  // Calculate average rating
  const avgRating =
    car.reviews && car.reviews.length > 0
      ? (car.reviews.reduce((sum, r) => sum + r.rating, 0) / car.reviews.length).toFixed(1)
      : '—';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 hover:border-slate-700 transition-all flex flex-col justify-between"
    >
      {/* CARD IMAGE CONTAINER */}
      <button
        type="button"
        onClick={() => onSelect(car)}
        className="relative block w-full cursor-pointer aspect-[16/10] overflow-hidden bg-slate-950 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400"
        aria-label={`View ${car.make} ${car.model} details`}
      >
        <SmartCarImage
          car={car}
          alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
          onError={(event) => {
            // Prefer the cached local photo; use the verified real source only when the local asset has not been prepared yet.
            if (car.sourceImage && event.currentTarget.dataset.remoteFallback !== 'true') {
              event.currentTarget.dataset.remoteFallback = 'true';
              event.currentTarget.src = car.sourceImage;
              return;
            }
            event.currentTarget.onerror = null;
            event.currentTarget.src = '/images/cars/car-fallback.svg';
          }}
        />

        <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-slate-950/75 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 sm:text-xs">
          Click image for details
        </span>

        {/* Category Pill Badge */}
        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-slate-200 text-xs font-medium px-3 py-1 rounded-full border border-slate-700/80">
          {car.category}
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-700/80 flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>{avgRating}</span>
        </div>
      </button>

      {/* CARD CONTENT */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Make & Model */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white p-1">
                  <BrandLogo brandId={car.make.toLowerCase().replace(/\s+/g, '-')} brandName={car.make} />
                </div>
                <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                  {car.make}
                </p>
              </div>
              <h3 className="mt-1 line-clamp-2 text-lg font-bold leading-tight text-white transition-colors group-hover:text-amber-300">
                {car.model}
              </h3>
            </div>
          </div>

          {/* Price */}
          <div className="mt-2">
            <span className="text-xl font-extrabold text-amber-400">
              {formatCurrency(car.price)}
            </span>
            <span className="text-[10px] text-slate-400 ml-1.5 uppercase font-medium">
              Ex-Showroom
            </span>
          </div>

          {/* Key Specs Pills */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
              <Gauge className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="truncate">{car.specs.power}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
              <Fuel className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="truncate">{car.specs.fuelType}</span>
            </div>
          </div>
        </div>

        {/* CARD ACTIONS */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          {/* View Details Button */}
          <button
            onClick={() => onSelect(car)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all hover:border-slate-500"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>

          {/* Add to Cart Button */}
          <button
            onClick={() => onAddToCart(car)}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-md ${
              isInCart
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isInCart ? 'Added in Cart' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
