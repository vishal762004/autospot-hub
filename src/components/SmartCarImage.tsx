import React from 'react';
import { Car } from '../types';

interface SmartCarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  car: Car;
}

/**
 * Uses the fast local asset when it has been prepared, then falls back to the
 * verified real source photo. The final fallback contains no vehicle artwork.
 */
export const SmartCarImage: React.FC<SmartCarImageProps> = ({ car, alt, onError, ...props }) => {
  const handleError: React.ReactEventHandler<HTMLImageElement> = (event) => {
    const img = event.currentTarget;
    if (car.sourceImage && img.dataset.sourceFallback !== 'true') {
      img.dataset.sourceFallback = 'true';
      img.src = car.sourceImage;
      return;
    }
    img.onerror = null;
    img.src = '/images/cars/car-fallback.svg';
    onError?.(event);
  };

  return <img {...props} src={car.image} alt={alt ?? `${car.make} ${car.model}`} onError={handleError} />;
};
