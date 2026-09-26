/**
 * @file Header.tsx
 * @description Header component featuring company branding, interactive search input,
 * navigation menu tabs, shopping cart button with badge counter, test drive scheduler button,
 * and user profile access.
 */

import React from 'react';
import { Search, ShoppingBag, User, Calendar, Car, Shield, Info, Phone, MessageSquare, Menu, X, LogIn, LogOut, Crown, RotateCcw } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { ActiveTab } from '../types';
import { Logo } from './Logo';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenTestDrive: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentUser: FirebaseUser | null;
  isAdmin: boolean;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
  onOpenTestDrive,
  searchQuery,
  setSearchQuery,
  currentUser,
  isAdmin,
  onOpenAuthModal,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const goHome = () => {
    setSearchQuery('');
    setActiveTab('home');
    setMobileMenuOpen(false);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && activeTab !== 'cars') {
      setActiveTab('cars');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };


  // Navigation Links configuration
  const navItems = [
    { id: 'home', label: 'Home', icon: Car },
    { id: 'cars', label: 'Showroom', icon: Car },
    { id: 'brands', label: 'Brands', icon: Shield },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'about', label: 'About', icon: Info },
    { id: 'contact', label: 'Contact', icon: Phone },
  ] as const;

  return (
    <header className="fixed inset-x-0 top-0 z-[70] w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-2 py-2 sm:min-h-20 sm:py-0">
          
          {/* DEALERSHIP LOGO & BRAND NAME */}
          <button 
            type="button"
            className="min-w-0 cursor-pointer text-left focus:outline-none"
            onClick={goHome}
            aria-label="Auto Spot Hub home"
          >
            <Logo size="md" className="max-w-[175px] sm:max-w-none" />
          </button>

          {/* DESKTOP SEARCH BAR */}
          <div className="hidden lg:flex flex-1 max-w-xs xl:max-w-md mx-3 xl:mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search brand, model, V12, SUV..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setActiveTab('cars');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                aria-label="Search the showroom"
                className="w-full bg-slate-900/90 text-sm text-slate-100 placeholder-slate-400 border border-slate-700/80 rounded-full py-2.5 pl-10 pr-12 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all shadow-inner"
              />
              <Search className="pointer-events-none w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-amber-300"
                  aria-label="Clear search"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* DESKTOP NAVIGATION TABS */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as ActiveTab); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {isAdmin && (
              <button
                onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  activeTab === 'admin'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Owner Portal</span>
              </button>
            )}
          </nav>

          {/* RIGHT ACTION BUTTONS (Test Drive, Cart, Profile) */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            {/* BOOK TEST DRIVE BUTTON */}
            <button
              onClick={onOpenTestDrive}
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold px-4 py-2 rounded-full text-xs lg:text-sm shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Test Drive</span>
            </button>

            {/* SHOPPING CART BUTTON WITH BADGE */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-amber-400 transition-all hover:scale-105"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-extrabold text-[11px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

            {/* FIREBASE AUTH USER PROFILE BUTTON */}
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-semibold ${
                    activeTab === 'profile'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-amber-400'
                  }`}
                  title={`Logged in as ${currentUser.email}`}
                >
                  <div className="relative">
                    <User className="w-4 h-4 text-amber-400" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900 animate-pulse" />
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                </button>

                <button
                  onClick={onLogout}
                  className="p-2 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 transition-all"
                  title="Sign Out of Firebase"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}

            {/* MOBILE MENU TOGGLE */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          {/* Mobile Search Input */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search luxury cars..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setMobileMenuOpen(false);
              }}
              aria-label="Search the showroom"
              className="w-full bg-slate-950 text-sm text-slate-100 placeholder-slate-500 border border-slate-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
            <Search className="pointer-events-none w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as ActiveTab);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium text-left ${
                    activeTab === item.id
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {isAdmin && (
            <button
              onClick={() => {
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              className={`col-span-2 flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-bold text-center border ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>Owner Portal & Login Tracker</span>
            </button>
            )}
          </div>

          <button
            onClick={() => {
              onOpenTestDrive();
              setMobileMenuOpen(false);
            }}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-amber-500 text-slate-950 font-bold py-3 rounded-xl text-sm"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Test Drive Appointment</span>
          </button>
        </div>
      )}
    </header>
  );
};
