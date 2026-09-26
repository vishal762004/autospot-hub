/**
 * @file Footer.tsx
 * @description Footer component displaying showroom description, quick navigation links,
 * contact info, social handles, and copyright notice.
 */

import React from 'react';
import { Phone, Mail, MapPin, Shield } from 'lucide-react';
import { ActiveTab } from '../types';
import { Logo } from './Logo';
import { SITE_CONTACT } from '../data/siteConfig';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand & Logo */}
          <div className="space-y-3 md:col-span-1">
            <button
              type="button"
              className="cursor-pointer text-left focus:outline-none"
              onClick={() => setActiveTab('home')}
            >
              <Logo size="sm" />
            </button>
            <p className="text-xs leading-relaxed text-slate-400">
              A portfolio automotive marketplace demonstrating React, TypeScript, Firebase authentication, Firestore workflows, responsive UI, and production-minded security boundaries.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveTab('cars')} className="hover:text-amber-300 transition-colors">
                  Showroom Catalog
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('brands')} className="hover:text-amber-300 transition-colors">
                  Luxury Brands
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('reviews')} className="hover:text-amber-300 transition-colors">
                  Client Reviews & Ratings
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('profile')} className="hover:text-amber-300 transition-colors">
                  My Orders & Invoice Downloads
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Contact Concierge
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <a href={SITE_CONTACT.phoneHref} className="text-slate-200 font-semibold hover:text-amber-300 hover:underline">{SITE_CONTACT.phoneDisplay}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <a href={SITE_CONTACT.emailHref} className="hover:text-amber-300 hover:underline">{SITE_CONTACT.email}</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Demo deployment location</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Leadership */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Leadership & Team
            </h4>
            <p className="text-xs text-slate-300 font-semibold">
              Auto Spot Hub Support Team
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Portfolio demo only. Pricing, tax, payment, delivery, review verification, and contact workflows must be connected to trusted production services before commercial deployment.
            </p>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="pt-8 border-t border-slate-900 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>&copy; 2026 Auto Spot Hub. Made by Auto Spot Hub Support Team. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Pricing & Tax Disclaimer</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
