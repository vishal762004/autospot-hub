/**
 * @file CarDetailModal.tsx
 * @description Detailed Modal component showing full technical specifications,
 * key luxury features, instant tax calculation preview, and customer reviews.
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, ShoppingBag, Calendar, Star, CheckCircle, ShieldCheck, Calculator, MessageSquare, Send } from 'lucide-react';
import { Car, Review } from '../types';
import { CarImageGallery } from './CarImageGallery';
import { formatCurrency, calculateTaxBreakdown } from '../utils/taxCalculator';

interface CarDetailModalProps {
  car: Car | null;
  onClose: () => void;
  onAddToCart: (car: Car) => void;
  onBookTestDrive: (car: Car) => void;
  isInCart: boolean;
  onAddReview: (carId: number, review: Omit<Review, 'id' | 'date'>) => void;
}

export const CarDetailModal: React.FC<CarDetailModalProps> = ({
  car,
  onClose,
  onAddToCart,
  onBookTestDrive,
  isInCart,
  onAddReview,
}) => {
  const [activeTab, setActiveTab] = useState<'specs' | 'taxes' | 'reviews'>('specs');
  
  // Review form state
  const [newReviewerName, setNewReviewerName] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  if (!car) return null;

  // Compute estimated tax breakdown for a single car
  const singleCarCart = [{ car, addedAt: new Date().toISOString() }];
  const taxBreakdown = calculateTaxBreakdown(singleCarCart);

  // Handle Review Submission
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewerName.trim() || !newComment.trim()) return;

    onAddReview(car.id, {
      name: newReviewerName.trim(),
      rating: newRating,
      comment: newComment.trim(),
      verified: false,
      helpfulCount: 0,
    });

    setNewReviewerName('');
    setNewComment('');
    setNewRating(5);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-8 text-white max-h-[90vh] flex flex-col"
      >
        
        {/* STICKY MODAL HEADER */}
        <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/95 px-4 py-3 backdrop-blur-md sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-amber-400">Vehicle Details</p>
            <p className="truncate text-sm font-bold text-white">{car.make} {car.model}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-slate-300 shadow-lg transition hover:border-amber-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/60"
            aria-label="Close vehicle details"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* MODAL BODY SCROLLABLE */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
          
          {/* HEADER IMAGE & TITLE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Image Gallery */}
            <div>
              <CarImageGallery car={car} />
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                {car.category}
              </div>
            </div>

            {/* Title & Price Info */}
            <div className="space-y-3">
              <p className="text-xs font-extrabold text-amber-400 tracking-widest uppercase">
                {car.make}
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {car.model}
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-400">
                  {formatCurrency(car.price)}
                </span>
                <span className="text-xs text-slate-400 font-medium">Ex-Showroom Base</span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <span>Estimated On-Road Price:</span>
                <span className="font-bold text-amber-300 text-sm">
                  {formatCurrency(taxBreakdown.grandTotal)}
                </span>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onAddToCart(car)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all shadow-lg ${
                    isInCart
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isInCart ? 'Added in Cart' : 'Add to Cart'}</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onBookTestDrive(car);
                  }}
                  className="flex items-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-semibold border border-slate-700 transition-all hover:border-amber-400"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Test Drive</span>
                </button>
              </div>
            </div>

          </div>

          {/* TABS HEADER */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-4 py-3 text-xs sm:text-sm font-bold transition-all border-b-2 ${
                activeTab === 'specs'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Technical Specs & Features
            </button>

            <button
              onClick={() => setActiveTab('taxes')}
              className={`px-4 py-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'taxes'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>On-Road Tax Breakdown</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Reviews ({car.reviews?.length || 0})</span>
            </button>
          </div>

          {/* TAB 1: TECHNICAL SPECS & FEATURES */}
          {activeTab === 'specs' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Specs Table */}
              <div>
                <h4 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider mb-3">
                  Vehicle Specifications
                </h4>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden text-sm">
                  <div className="grid grid-cols-2 p-3 border-b border-slate-800 bg-slate-900/50">
                    <span className="text-slate-400 font-medium">Engine</span>
                    <span className="text-slate-100 font-bold">{car.specs.engine}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 border-b border-slate-800">
                    <span className="text-slate-400 font-medium">Max Power Output</span>
                    <span className="text-amber-300 font-bold">{car.specs.power}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 border-b border-slate-800 bg-slate-900/50">
                    <span className="text-slate-400 font-medium">Transmission</span>
                    <span className="text-slate-100 font-bold">{car.specs.transmission}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 border-b border-slate-800">
                    <span className="text-slate-400 font-medium">Fuel Type</span>
                    <span className="text-slate-100 font-bold">{car.specs.fuelType}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 border-b border-slate-800 bg-slate-900/50">
                    <span className="text-slate-400 font-medium">Fuel Efficiency / Range</span>
                    <span className="text-slate-100 font-bold">{car.specs.mileage}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3">
                    <span className="text-slate-400 font-medium">Dimensions (L x W x H)</span>
                    <span className="text-slate-100 font-bold">{car.specs.dimensions}</span>
                  </div>
                </div>
              </div>

              {/* Key Features Checklist */}
              <div>
                <h4 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider mb-3">
                  Key Luxury Features
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {car.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: TAX & CHARGES BREAKDOWN */}
          {activeTab === 'taxes' && (
            <div className="space-y-4 animate-fadeIn">
              <p className="text-xs text-slate-400">
                Itemized breakdown of taxes, registration fees, and mandatory charges applicable for this vehicle in India:
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-300">Base Ex-Showroom Price:</span>
                  <span className="font-bold text-white">{formatCurrency(taxBreakdown.basePrice)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">GST (Goods and Services Tax @ 28%):</span>
                  <span className="font-semibold text-slate-300">{formatCurrency(taxBreakdown.gst)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Road Tax & RTO Registration (@ 20%):</span>
                  <span className="font-semibold text-slate-300">{formatCurrency(taxBreakdown.roadTax)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Comprehensive Vehicle Insurance (@ 5%):</span>
                  <span className="font-semibold text-slate-300">{formatCurrency(taxBreakdown.insurance)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">RTO Registration Charges (@ 2%):</span>
                  <span className="font-semibold text-slate-300">{formatCurrency(taxBreakdown.registration)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Tax Collected at Source (TCS @ 1%):</span>
                  <span className="font-semibold text-slate-300">{formatCurrency(taxBreakdown.tcs)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Mandatory FASTag Fee:</span>
                  <span className="font-semibold text-slate-300">{formatCurrency(taxBreakdown.fastTag)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Extended 2-Year Warranty (@ 2%):</span>
                  <span className="font-semibold text-slate-300">{formatCurrency(taxBreakdown.extendedWarranty)}</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-extrabold text-amber-400">
                  <span>Grand Total On-Road Price:</span>
                  <span>{formatCurrency(taxBreakdown.grandTotal)}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMER REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Existing Reviews List */}
              <div className="space-y-3">
                {car.reviews && car.reviews.length > 0 ? (
                  car.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{rev.name}</span>
                          {rev.verified === true && (
                            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 border border-emerald-500/30">
                              <ShieldCheck className="w-3 h-3" /> Verified Buyer
                            </span>
                          )}
                        </div>
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-700'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{rev.comment}</p>
                      <p className="text-[10px] text-slate-500">{rev.date}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4 bg-slate-950 rounded-xl border border-slate-800">
                    No reviews yet for this model. Be the first community member to leave a review!
                  </p>
                )}
              </div>

              {/* Add Review Form */}
              <form onSubmit={handleSubmitReview} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Write a Review for {car.make} {car.model}
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Your Full Name"
                    value={newReviewerName}
                    onChange={(e) => setNewReviewerName(e.target.value)}
                    required
                    className="bg-slate-900 border border-slate-800 text-xs text-white p-2.5 rounded-xl focus:outline-none focus:border-amber-400"
                  />

                  {/* Rating Selector */}
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl">
                    <span className="text-xs text-slate-400">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="text-amber-400 focus:outline-none"
                        >
                          <Star
                            className={`w-4 h-4 ${star <= newRating ? 'fill-amber-400' : 'text-slate-700'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <textarea
                  placeholder="Share your experience driving or owning this car..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-white p-2.5 rounded-xl focus:outline-none focus:border-amber-400"
                />

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-all shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Review</span>
                </button>
              </form>

            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};
