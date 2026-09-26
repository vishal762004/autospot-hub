/**
 * @file BrandsSection.tsx
 * @description Responsive brand catalogue that stays aligned with the actual vehicles.
 * Selecting a brand immediately opens the showroom with that make filtered in.
 */

import React from 'react';
import { ArrowRight, Shield } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { LUXURY_BRANDS } from '../data/brands';

interface BrandsSectionProps {
  onSelectBrand: (brandName: string) => void;
}

export const BrandsSection: React.FC<BrandsSectionProps> = ({ onSelectBrand }) => {
  return (
    <section id="brands" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto mb-8 max-w-3xl space-y-2 text-center sm:mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase text-amber-400">
          <Shield className="h-3.5 w-3.5" />
          <span>Featured Marques</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
          ALL CATALOGUE BRANDS
        </h2>
        <p className="text-sm text-slate-400">
          Every brand below has at least one vehicle represented in the current Auto Spot Hub catalogue.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {LUXURY_BRANDS.map((brand) => (
          <button
            key={brand.id}
            type="button"
            onClick={() => onSelectBrand(brand.name)}
            className="group relative flex min-h-[205px] flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900 p-4 text-left shadow-lg transition duration-300 hover:-translate-y-0.5 hover:border-amber-500/50 hover:shadow-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
          >
            <div>
              <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-slate-700 bg-white p-2 transition-colors group-hover:border-amber-400/50 sm:h-[80px] sm:w-[80px]">
                <BrandLogo brandId={brand.id} brandName={brand.name} />
              </div>
              <h3 className="text-sm font-bold text-white transition-colors group-hover:text-amber-300 sm:text-base">
                {brand.name}
              </h3>
              <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-slate-400">
                {brand.description}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 text-xs font-semibold text-amber-400">
              <span>View Collection</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
