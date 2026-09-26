/**
 * @file AboutView.tsx
 * @description About Us page presenting Auto Spot Hub's mission, dealership history,
 * project purpose, technology stack, and demo/production boundaries.
 */

import React from 'react';
import { Award, CheckCircle } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 text-white space-y-12">
      
      {/* HERO TITLE */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase">
          <Award className="w-3.5 h-3.5" />
          <span>Portfolio Automotive Marketplace</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          ABOUT AUTO SPOT HUB
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Auto Spot Hub is a portfolio project that demonstrates how a modern automotive marketplace can combine a responsive React interface, TypeScript, Firebase authentication, Firestore data access, catalog search, checkout UX, test-drive booking, and an administrator dashboard.
        </p>
      </div>

      {/* STATS BANNER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-1">
          <span className="text-3xl sm:text-4xl font-black text-amber-400">28</span>
          <p className="text-xs text-slate-400 font-bold uppercase">Catalogue Vehicles</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-1">
          <span className="text-3xl sm:text-4xl font-black text-amber-400">TS</span>
          <p className="text-xs text-slate-400 font-bold uppercase">TypeScript UI</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-1">
          <span className="text-3xl sm:text-4xl font-black text-amber-400">Auth</span>
          <p className="text-xs text-slate-400 font-bold uppercase">Firebase Authentication</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-1">
          <span className="text-3xl sm:text-4xl font-black text-amber-400">Firestore</span>
          <p className="text-xs text-slate-400 font-bold uppercase">Customer Data</p>
        </div>
      </div>

      {/* LEADERSHIP SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h3 className="text-2xl font-black text-white">
            Developer & Founders: <br />
            <span className="text-amber-400">Auto Spot Hub Support Team</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            This project focuses on clear UX and understandable engineering boundaries. The tax calculator, checkout, PDF order summary, and test-drive flow are intentionally documented as demo functionality rather than live dealership services.
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-200">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>28 curated vehicle records with local catalogue imagery</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Reusable React components with TypeScript models and validation scripts</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Firebase Authentication, Firestore rules, customer profiles, orders, and test-drive workflow</span>
            </div>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-[16/10]">
          <img
            src="/images/cars/01-rolls-royce-phantom-viii.jpg"
            alt="Rolls-Royce Phantom VIII photographed for the vehicle catalogue"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

    </div>
  );
};
