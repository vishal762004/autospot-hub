/**
 * @file PageNavigation.tsx
 * @description Shared navigation strip for full-page views.
 * Back is the single page-level navigation action; the header logo always returns home.
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PageNavigationProps {
  title: string;
  canGoBack: boolean;
  onBack: () => void;
}

export const PageNavigation: React.FC<PageNavigationProps> = ({ title, canGoBack, onBack }) => {
  return (
    <div className="sticky top-16 z-[65] px-3 pt-3 sm:top-20 sm:px-6 sm:pt-4 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/95 px-2.5 py-2.5 shadow-xl shadow-black/20 backdrop-blur-md sm:px-3">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-35 sm:px-3"
          title={canGoBack ? 'Go to previous page' : 'Return home'}
          aria-label={canGoBack ? 'Go to previous page' : 'Return home'}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="min-w-0 flex-1 text-center">
          <div className="truncate text-[10px] font-black uppercase tracking-[0.14em] text-amber-400 sm:text-xs sm:tracking-[0.18em]">
            {title}
          </div>
        </div>

        <div className="hidden h-10 w-10 shrink-0 sm:block" aria-hidden="true" />
      </div>
    </div>
  );
};
