/**
 * @file CarGrid.tsx
 * @description Catalog grid displaying all luxury cars with multi-criteria filters
 * (Category, Fuel Type, Search, Price Sorting) and pagination.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Car } from '../types';
import { CarCard } from './CarCard';
import { Search, Filter, SlidersHorizontal, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

interface CarGridProps {
  cars: Car[];
  cartItemsCarIds: number[];
  onSelectCar: (car: Car) => void;
  onAddToCart: (car: Car) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedBrandFilter?: string | null;
  onClearBrandFilter?: () => void;
}

export const CarGrid: React.FC<CarGridProps> = ({
  cars,
  cartItemsCarIds,
  onSelectCar,
  onAddToCart,
  searchQuery,
  setSearchQuery,
  selectedBrandFilter,
  onClearBrandFilter,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFuel, setSelectedFuel] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 9;

  // Filter categories list
  const categories = ['All', 'Luxury Sedan', 'Supercar', 'SUV', 'Electric', 'Sports'];
  const fuelTypes = ['All', 'Petrol', 'Diesel', 'Electric', 'Hybrid'];

  // Any new search/filter should start the customer on page 1. This prevents a
  // valid search from appearing empty when the previous result page no longer exists.
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedFuel, selectedBrandFilter]);

  // Search across the fields a customer would reasonably expect to find.
  // Terms are matched individually, so "mercedes v12" can find a V12 Mercedes model.
  const filteredCars = useMemo(() => {
    const queryTerms = searchQuery
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    return cars.filter((car) => {
      const searchableText = [
        car.make,
        car.model,
        car.category,
        car.specs.engine,
        car.specs.power,
        car.specs.transmission,
        car.specs.mileage,
        car.specs.topSpeed ?? '',
        car.specs.acceleration ?? '',
        car.specs.fuelType,
        ...car.features,
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = queryTerms.every((term) => searchableText.includes(term));
      const matchesCategory = selectedCategory === 'All' || car.category === selectedCategory;
      const matchesFuel = selectedFuel === 'All' || car.specs.fuelType === selectedFuel;
      const matchesBrand = !selectedBrandFilter || car.make.toLowerCase().includes(selectedBrandFilter.toLowerCase());

      return matchesSearch && matchesCategory && matchesFuel && matchesBrand;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return (Number(Boolean(b.featured)) - Number(Boolean(a.featured))) || a.make.localeCompare(b.make);
    });
  }, [cars, searchQuery, selectedCategory, selectedFuel, selectedBrandFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredCars.length / itemsPerPage) || 1;
  const paginatedCars = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCars.slice(start, start + itemsPerPage);
  }, [filteredCars, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedFuel('All');
    setSortBy('featured');
    setCurrentPage(1);
    if (onClearBrandFilter) onClearBrandFilter();
  };

  return (
    <section id="showroom" className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
      
      {/* SECTION TITLE & BRAND FILTER INDICATOR */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-3xl font-black text-white tracking-tight">
              LUXURY SHOWROOM
            </h2>
            {selectedBrandFilter && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/40">
                Brand: {selectedBrandFilter}
                <button
                  onClick={onClearBrandFilter}
                  className="hover:text-white font-bold ml-1"
                >
                  ×
                </button>
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm mt-1 flex items-center flex-wrap gap-2">
            <span>
              Showing <strong className="text-amber-400 font-bold">{filteredCars.length}</strong> of{' '}
              <strong className="text-white font-bold">{cars.length}</strong> luxury vehicles in catalog.
            </span>
            {(selectedCategory !== 'All' || selectedFuel !== 'All' || searchQuery || selectedBrandFilter) && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-amber-400 hover:text-amber-300 underline font-semibold flex items-center gap-1 cursor-pointer ml-1"
              >
                <RefreshCw className="w-3 h-3" /> Show All {cars.length} Cars
              </button>
            )}
          </p>
        </div>

        {/* SORT SELECTOR */}
        <div className="flex w-full flex-wrap items-center justify-end gap-2 md:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-400 font-medium uppercase">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
          >
            <option value="featured">Featured First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* CATALOG SEARCH */}
      <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-3 sm:p-4 shadow-lg backdrop-blur-md">
        <label htmlFor="catalog-search" className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
          Search the showroom
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="catalog-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setSearchQuery('');
            }}
            placeholder="Search brand, model, V12, SUV, electric, transmission, features..."
            autoComplete="off"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-24 text-sm text-white placeholder-slate-500 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/10 hover:text-amber-300"
            >
              Clear
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="mt-2 text-[11px] text-slate-500">Searching for: <span className="font-semibold text-slate-300">{searchQuery}</span></p>
        )}
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-8 backdrop-blur-md space-y-4">
        
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-bold uppercase mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-400" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Fuel Type Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          <span className="text-xs text-slate-400 font-bold uppercase mr-2">Fuel Engine:</span>
          {fuelTypes.map((fuel) => (
            <button
              key={fuel}
              onClick={() => {
                setSelectedFuel(fuel);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedFuel === fuel
                  ? 'bg-slate-200 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {fuel}
            </button>
          ))}
        </div>
      </div>

      {/* CAR GRID OR EMPTY STATE */}
      {paginatedCars.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              onSelect={onSelectCar}
              onAddToCart={onAddToCart}
              isInCart={cartItemsCarIds.includes(car.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
          <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white">No Matching Luxury Cars Found</h3>
          <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
            We couldn't find any vehicles matching your filter criteria. Try searching for another brand or resetting your filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-12">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                    currentPage === pageNum
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 hover:text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </section>
  );
};
