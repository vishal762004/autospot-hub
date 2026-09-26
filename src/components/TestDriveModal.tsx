/**
 * @file TestDriveModal.tsx
 * @description Modal form allowing customers to schedule a personal doorstep or showroom
 * luxury car test drive appointment with live car photo preview and automated booking confirmation.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, Car as CarIcon, MapPin, User, Phone, CheckCircle2, Send } from 'lucide-react';
import { Car, TestDriveAppointment } from '../types';
import { SmartCarImage } from './SmartCarImage';

interface TestDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  cars: Car[];
  selectedCarInitial?: Car | null;
  onBookTestDrive: (appointment: Omit<TestDriveAppointment, 'id' | 'status' | 'bookedAt'>) => Promise<boolean>;
}

export const TestDriveModal: React.FC<TestDriveModalProps> = ({
  isOpen,
  onClose,
  cars,
  selectedCarInitial,
  onBookTestDrive,
}) => {
  const [selectedCarId, setSelectedCarId] = useState<number>(
    selectedCarInitial ? selectedCarInitial.id : cars[0]?.id || 1
  );

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [preferredDate, setPreferredDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0] // 2 days from today
  );
  const [preferredTime, setPreferredTime] = useState('11:00');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Selected car object
  const currentCar = cars.find((c) => c.id === Number(selectedCarId)) || cars[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCar) return;

    setSubmitting(true);

    const success = await onBookTestDrive({
      carId: currentCar.id,
      carName: `${currentCar.make} ${currentCar.model}`,
      carImage: currentCar.image,
      fullName,
      phone,
      email,
      address,
      preferredDate,
      preferredTime,
    });

    setSubmitting(false);
    if (!success) return;

    setBookingConfirmed(true);

    setTimeout(() => {
      setBookingConfirmed(false);
      onClose();
    }, 2500);
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-md overflow-y-auto sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative my-4 w-full max-w-xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-4 text-white shadow-2xl sm:my-8 sm:p-8 space-y-5 sm:space-y-6"
      >
        {/* STICKY MODAL HEADER — always keeps the close control visible */}
        <div className="sticky top-0 z-30 -mx-4 -mt-4 flex items-start justify-between gap-3 border-b border-slate-800 bg-slate-900/95 px-4 py-3 backdrop-blur-md sm:-mx-8 sm:-mt-8 sm:px-8">
          <div className="space-y-1 pr-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase text-amber-400">
              <CarIcon className="h-3.5 w-3.5" />
              <span>VIP Experience</span>
            </div>
            <h2 className="text-xl font-black text-white sm:text-2xl">
              Schedule a VIP Test Drive
            </h2>
            <p className="text-xs text-slate-400">
              Choose a vehicle, date and preferred appointment time.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-slate-300 shadow-lg transition hover:border-rose-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/60"
            aria-label="Close test drive appointment"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* MODAL HEADER NOTE */}
        <div className="hidden" aria-hidden="true" />

        {/* SUCCESS MESSAGE STATE */}
        {bookingConfirmed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-white">
              Test Drive Appointment Scheduled!
            </h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Our concierge team will reach out to confirm your scheduled appointment for <strong className="text-amber-400">{currentCar?.make} {currentCar?.model}</strong> on <strong className="text-amber-400">{preferredDate}</strong> at {preferredTime}.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* CAR SELECTOR DROPDOWN */}
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">
                Select Luxury Vehicle
              </label>
              <select
                value={selectedCarId}
                onChange={(e) => setSelectedCarId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-amber-400 font-semibold"
              >
                {cars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.make} {car.model} ({car.category})
                  </option>
                ))}
              </select>
            </div>

            {/* LIVE CAR PHOTO PREVIEW */}
            {currentCar && (
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-[16/8] group">
                <img
                  src={currentCar.image}
                  alt={`${currentCar.make} ${currentCar.model}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                  <span className="text-xs font-bold text-white">
                    {currentCar.make} {currentCar.model} • {currentCar.specs.power}
                  </span>
                </div>
              </div>
            )}

            {/* CUSTOMER CONTACT FIELDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Preferred Date</label>
                <input
                  type="date"
                  value={preferredDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Preferred Time</label>
                <input
                  type="time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Test Drive Address / Showroom Pickup</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Saving appointment…' : 'Confirm Test Drive Appointment'}</span>
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
