/**
 * @file CartDrawer.tsx
 * @description Slide-over drawer component displaying items selected in cart,
 * real-time itemized tax breakdown calculations, item deletion, and checkout action.
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { CartItem } from '../types';
import { formatCurrency, calculateTaxBreakdown } from '../utils/taxCalculator';
import { SmartCarImage } from './SmartCarImage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (carId: number) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const taxBreakdown = calculateTaxBreakdown(cartItems);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-white shadow-2xl flex flex-col justify-between"
          >
            {/* DRAWER HEADER */}
            <div className="border-b border-slate-800 p-3 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Your Showroom Cart</h3>
                  <p className="text-xs text-slate-400">
                    {cartItems.length} {cartItems.length === 1 ? 'vehicle' : 'vehicles'} selected
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CART ITEMS LIST */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div
                    key={item.car.id}
                    className="flex gap-3 p-3 bg-slate-950 border border-slate-800 rounded-2xl relative group"
                  >
                    <SmartCarImage
                      car={item.car}
                      alt={`${item.car.make} ${item.car.model}`}
                      className="w-24 h-20 object-cover object-center rounded-xl bg-slate-900 border border-slate-800 flex-shrink-0"
                      loading="lazy"
                      decoding="async"
                    />

                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                          {item.car.make}
                        </p>
                        <h4 className="text-sm font-bold text-white line-clamp-1">
                          {item.car.model}
                        </h4>
                        <p className="text-xs font-bold text-amber-300 mt-1">
                          {formatCurrency(item.car.price)}
                        </p>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.car.id)}
                        className="self-start text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 mt-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 space-y-3">
                  <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">Your cart is currently empty</p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Browse our showroom and add your dream luxury vehicle to view instant tax calculations.
                  </p>
                </div>
              )}
            </div>

            {/* TAX BREAKDOWN & CHECKOUT FOOTER */}
            {cartItems.length > 0 && (
              <div className="p-5 border-t border-slate-800 bg-slate-950/80 space-y-4">
                
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Base Vehicles Subtotal:</span>
                    <span className="font-semibold text-white">{formatCurrency(taxBreakdown.basePrice)}</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>GST (28%):</span>
                    <span>{formatCurrency(taxBreakdown.gst)}</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Road Tax (20%):</span>
                    <span>{formatCurrency(taxBreakdown.roadTax)}</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Insurance (5%):</span>
                    <span>{formatCurrency(taxBreakdown.insurance)}</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Registration + TCS + FASTag + Warranty:</span>
                    <span>
                      {formatCurrency(
                        taxBreakdown.registration +
                          taxBreakdown.tcs +
                          taxBreakdown.fastTag +
                          taxBreakdown.extendedWarranty
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between pt-2 border-t border-slate-800 text-base font-extrabold text-amber-400">
                    <span>Grand Total:</span>
                    <span>{formatCurrency(taxBreakdown.grandTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onProceedToCheckout();
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-98"
                >
                  <span>Proceed to Payment Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Secure demo checkout — connect a payment provider before production</span>
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
