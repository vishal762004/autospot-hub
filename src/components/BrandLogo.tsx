/**
 * @file BrandLogo.tsx
 * @description Renders the real automotive brand mark from the local cache when available, with the same real mark as a fallback.
 */

import React, { useState } from 'react';

const BRAND_LOGO_FILES: Record<string, string> = {
  'aston-martin': 'aston-martin.svg',
  audi: 'audi.svg',
  bmw: 'bmw.svg',
  bentley: 'bentley.svg',
  bugatti: 'bugatti.svg',
  ferrari: 'ferrari.svg',
  koenigsegg: 'koenigsegg.svg',
  lamborghini: 'lamborghini.svg',
  'land-rover': 'land-rover.svg',
  mahindra: 'mahindra.svg',
  mclaren: 'mclaren.svg',
  'mercedes-benz': 'mercedes-benz.svg',
  'mercedes-maybach': 'mercedes-benz.svg',
  pagani: 'pagani.svg',
  porsche: 'porsche.svg',
  'rolls-royce': 'rolls-royce.svg',
  toyota: 'toyota.svg',
};

const BRAND_LOGO_SOURCE_URLS: Record<string, string> = {
  'aston-martin': 'https://cdn.simpleicons.org/astonmartin',
  audi: 'https://cdn.simpleicons.org/audi',
  bmw: 'https://cdn.simpleicons.org/bmw',
  bentley: 'https://cdn.simpleicons.org/bentley',
  bugatti: 'https://cdn.simpleicons.org/bugatti',
  ferrari: 'https://cdn.simpleicons.org/ferrari',
  koenigsegg: 'https://cdn.simpleicons.org/koenigsegg',
  lamborghini: 'https://cdn.simpleicons.org/lamborghini',
  'land-rover': 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/landrover.svg',
  mahindra: 'https://cdn.simpleicons.org/mahindra',
  mclaren: 'https://cdn.simpleicons.org/mclaren',
  'mercedes-benz': 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/mercedes.svg',
  'mercedes-maybach': 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/mercedes.svg',
  pagani: 'https://www.pagani.com/wp-content/uploads/2023/02/logo-pagani.svg',
  porsche: 'https://cdn.simpleicons.org/porsche',
  'rolls-royce': 'https://cdn.simpleicons.org/rollsroyce',
  toyota: 'https://cdn.simpleicons.org/toyota',
};

interface BrandLogoProps {
  brandId: string;
  brandName: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ brandId, brandName }) => {
  const [logoUnavailable, setLogoUnavailable] = useState(false);
  const file = BRAND_LOGO_FILES[brandId];
  if (!file) return null;
  const remote = BRAND_LOGO_SOURCE_URLS[brandId];

  if (logoUnavailable) {
    return <span className="text-center text-[9px] font-black uppercase leading-tight text-slate-700">{brandName}</span>;
  }

  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg bg-white p-2" aria-label={`${brandName} real brand logo`}>
      <img
        src={`/images/brands/${file}`}
        alt={`${brandName} logo`}
        loading="lazy"
        decoding="async"
        className="h-10 w-full max-w-28 object-contain transition-transform duration-300 group-hover:scale-110"
        onError={(event) => {
          if (remote && event.currentTarget.dataset.remoteFallback !== 'true') {
            event.currentTarget.dataset.remoteFallback = 'true';
            event.currentTarget.src = remote;
            return;
          }
          event.currentTarget.onerror = null;
          setLogoUnavailable(true);
          event.currentTarget.alt = `${brandName} logo unavailable`;
        }}
      />
    </div>
  );
};
