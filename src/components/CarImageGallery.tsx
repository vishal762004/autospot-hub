/**
 * @file CarImageGallery.tsx
 * @description Shows the one verified vehicle photograph for a listing.
 * Additional thumbnails are rendered only when genuine alternate source images exist in `gallery`.
 */

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { Car } from '../types';

interface CarImageGalleryProps {
  car: Car;
}

export const CarImageGallery: React.FC<CarImageGalleryProps> = ({ car }) => {
  const views = useMemo(() => {
    const realGallery = (car.gallery ?? []).filter((image) => image && image !== car.image);
    return [car.image, ...realGallery].filter((image, index, all) => all.indexOf(image) === index);
  }, [car.gallery, car.image]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const safeIndex = Math.min(activeIndex, views.length - 1);
  const activeImage = views[safeIndex];

  const goPrev = () => setActiveIndex((current) => (current - 1 + views.length) % views.length);
  const goNext = () => setActiveIndex((current) => (current + 1) % views.length);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <img
          src={activeImage}
          alt={`${car.make} ${car.model}`}
          className="h-full w-full object-cover object-center"
          loading="lazy"
          decoding="async"
          onError={(event) => {
            if (car.sourceImage && event.currentTarget.dataset.remoteFallback !== 'true') {
              event.currentTarget.dataset.remoteFallback = 'true';
              event.currentTarget.src = car.sourceImage;
              return;
            }
            event.currentTarget.onerror = null;
            event.currentTarget.src = '/images/cars/car-fallback.svg';
          }}
        />
        <button
          type="button"
          onClick={() => setViewerOpen(true)}
          className="absolute bottom-3 right-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-700 bg-slate-950/90 px-3 py-2 text-xs font-bold text-white backdrop-blur-sm transition hover:border-amber-400 hover:text-amber-300"
          aria-label="Open larger vehicle photograph"
        >
          <Expand className="h-4 w-4" />
          <span>View photo</span>
        </button>

        {views.length > 1 && (
          <>
            <button type="button" onClick={goPrev} className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-950/85 text-white" aria-label="Previous vehicle photograph"><ChevronLeft className="h-5 w-5" /></button>
            <button type="button" onClick={goNext} className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-950/85 text-white" aria-label="Next vehicle photograph"><ChevronRight className="h-5 w-5" /></button>
          </>
        )}
      </div>

      {views.length > 1 && (
        <div className="grid grid-cols-2 gap-2">
          {views.map((image, index) => (
            <button key={image} type="button" onClick={() => setActiveIndex(index)} className={`aspect-[4/3] overflow-hidden rounded-xl border ${index === safeIndex ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-800'}`} aria-label={`Show vehicle photograph ${index + 1}`}>
              <img src={image} alt="" aria-hidden="true" loading="lazy" decoding="async" className="h-full w-full object-cover" onError={(event) => {
                if (image === car.image && car.sourceImage && event.currentTarget.dataset.remoteFallback !== 'true') {
                  event.currentTarget.dataset.remoteFallback = 'true';
                  event.currentTarget.src = car.sourceImage;
                  return;
                }
                event.currentTarget.onerror = null;
                event.currentTarget.src = '/images/cars/car-fallback.svg';
              }} />
            </button>
          ))}
        </div>
      )}

      {viewerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-3 backdrop-blur-md sm:p-6" role="dialog" aria-modal="true" aria-label={`${car.make} ${car.model} photograph viewer`} onMouseDown={(event) => { if (event.target === event.currentTarget) setViewerOpen(false); }}>
          <div className="relative flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
              <div className="min-w-0"><p className="truncate text-xs font-black uppercase tracking-[0.16em] text-amber-400">Vehicle Photograph</p><p className="truncate text-sm font-bold text-white">{car.make} {car.model}</p></div>
              <button type="button" onClick={() => setViewerOpen(false)} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-slate-300 hover:border-amber-400 hover:text-white" aria-label="Close vehicle photograph viewer" title="Close"><X className="h-5 w-5" /></button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black p-3 sm:p-6">
              <img src={activeImage} alt={`${car.make} ${car.model}`} className="max-h-full max-w-full object-contain" onError={(event) => {
                if (car.sourceImage && event.currentTarget.dataset.remoteFallback !== 'true') {
                  event.currentTarget.dataset.remoteFallback = 'true';
                  event.currentTarget.src = car.sourceImage;
                  return;
                }
                event.currentTarget.onerror = null;
                event.currentTarget.src = '/images/cars/car-fallback.svg';
              }} />
              {views.length > 1 && <><button type="button" onClick={goPrev} className="absolute left-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 bg-slate-950/85 text-white" aria-label="Previous vehicle photograph"><ChevronLeft className="h-6 w-6" /></button><button type="button" onClick={goNext} className="absolute right-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 bg-slate-950/85 text-white" aria-label="Next vehicle photograph"><ChevronRight className="h-6 w-6" /></button></>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
