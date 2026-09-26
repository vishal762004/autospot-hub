/**
 * @file OrderConfirmationModal.tsx
 * @description Order Receipt and Confirmation Modal showing Order ID, Tracking Number,
 * estimated delivery timeline progress bar, delivery address summary, and PDF order summary download trigger.
 */

import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, FileText, Home, Truck, ShieldCheck, MapPin, Phone, Calendar, X } from 'lucide-react';
import { Order } from '../types';
import { formatCurrency } from '../utils/taxCalculator';
import { SmartCarImage } from './SmartCarImage';

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
  onNavigateHome: () => void;
  onNavigateProfile: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onNavigateHome,
  onNavigateProfile,
}) => {
  useEffect(() => {
    if (!order) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [order, onClose]);

  if (!order) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 text-white space-y-6 my-8 max-h-[90vh] overflow-y-auto"
      >
        {/* STICKY CLOSE HEADER */}
        <div className="sticky top-0 z-30 -mx-6 -mt-6 flex justify-end border-b border-slate-800 bg-slate-900/95 px-4 py-3 backdrop-blur-md sm:-mx-8 sm:-mt-8 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-slate-300 shadow-lg transition hover:border-amber-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/60"
            aria-label="Close order confirmation"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* SUCCESS ICON HEADER */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            ORDER CONFIRMED
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Thank you for choosing Auto Spot Hub. Your demo order has been saved successfully and is ready for showroom follow-up.
          </p>
        </div>

        {/* ORDER ID & TRACKING SUMMARY CARD */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium">Order ID:</span>
            <p className="font-mono font-bold text-amber-400 text-sm">{order.id}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Shipment Tracking:</span>
            <p className="font-mono font-bold text-slate-200 text-sm">{order.trackingNumber}</p>
          </div>
        </div>

        {/* DELIVERY PROGRESS BAR */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-amber-400" /> Vehicle Handover Progress
            </span>
            <span className="text-amber-400 font-bold">Confirmed (Step 1/4)</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-extrabold">
              Confirmed
            </div>
            <div className="p-2 rounded-xl bg-slate-800 text-slate-400 font-medium">
              Processing
            </div>
            <div className="p-2 rounded-xl bg-slate-800 text-slate-400 font-medium">
              Shipped
            </div>
            <div className="p-2 rounded-xl bg-slate-800 text-slate-400 font-medium">
              Delivered
            </div>
          </div>

          <p className="text-[11px] text-slate-300 flex items-center gap-1.5 pt-1">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Estimated Home Handover: <strong className="text-white">{order.estimatedDeliveryDate}</strong></span>
          </p>
        </div>

        {/* ORDERED VEHICLES SUMMARY */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
            Vehicle Details ({order.items.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {order.items.map((item) => (
              <div
                key={item.car.id}
                className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.car.image}
                    alt={item.car.model}
                    className="w-12 h-10 object-cover rounded-lg bg-slate-900"
                  />
                  <div>
                    <p className="font-bold text-white">{item.car.make} {item.car.model}</p>
                    <p className="text-slate-400">{item.car.category}</p>
                  </div>
                </div>
                <span className="font-bold text-amber-300">{formatCurrency(item.car.price)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold">
            <span className="text-slate-300">Grand Total Paid (incl. All Taxes):</span>
            <span className="text-amber-400 text-sm">{formatCurrency(order.taxBreakdown.grandTotal)}</span>
          </div>
        </div>

        {/* DOCUMENT VERIFICATION STATUS */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-300">Document verification</p>
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
            {[
              ['Identity proof', order.documentVerification?.identityProof],
              ['Address proof', order.documentVerification?.addressProof],
              ['PAN / Form 60/61', order.documentVerification?.panOrForm60],
              ['Customer confirmation', order.documentVerification?.customerConsent],
            ].map(([label, ready]) => (
              <div key={String(label)} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
                <span className="text-slate-400">{label}</span>
                <span className={ready ? 'font-bold text-emerald-400' : 'font-bold text-amber-400'}>{ready ? 'Ready' : 'Pending'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* DELIVERY ADDRESS SUMMARY */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1 text-xs text-slate-300">
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-amber-400" /> Delivery Address
          </p>
          <p className="font-bold text-white">{order.address.fullName}</p>
          <p>{order.address.address}, {order.address.city}, {order.address.state} - {order.address.pincode}</p>
          <p className="text-slate-400">Phone: {order.address.phone}</p>
        </div>

        {/* ACTION BUTTONS (DOWNLOAD PDF & RETURN HOME) */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {/* Download PDF Order Summary Button */}
          <button
            onClick={async () => {
              const { generateInvoicePDF } = await import('../utils/pdfGenerator');
              generateInvoicePDF(order);
            }}
            className="flex-1 py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <FileText className="w-4 h-4" />
            <span>Download Purchase Summary PDF</span>
          </button>

          {/* Go to Profile Orders */}
          <button
            onClick={() => {
              onClose();
              onNavigateProfile();
            }}
            className="py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-xl text-xs sm:text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <span>View Orders</span>
          </button>

          {/* Return Home */}
          <button
            onClick={() => {
              onClose();
              onNavigateHome();
            }}
            className="py-3.5 px-4 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold rounded-xl text-xs sm:text-sm border border-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
        </div>

      </motion.div>
    </div>
  );
};
