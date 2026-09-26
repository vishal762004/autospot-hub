/**
 * @file ProfileView.tsx
 * @description User Profile management view displaying editable account profile info,
 * avatar image upload, purchase order history with PDF invoice download, and scheduled test drives.
 */

import React, { useState, useEffect } from 'react';
import { Camera, User, Phone, Mail, MapPin, Package, Calendar, FileText, CheckCircle2, Shield, LogOut, LogIn, ShieldCheck } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile, Order, TestDriveAppointment } from '../types';
import { formatCurrency } from '../utils/taxCalculator';
import { SmartCarImage } from './SmartCarImage';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  orders: Order[];
  testDrives: TestDriveAppointment[];
  currentUser: FirebaseUser | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateUser,
  orders,
  testDrives,
  currentUser,
  onOpenAuthModal,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'testdrives'>('info');

  // Form State
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [address, setAddress] = useState(user.address);
  const [city, setCity] = useState(user.city);
  const [pincode, setPincode] = useState(user.pincode);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync internal state when props change
  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone);
    setAddress(user.address);
    setCity(user.city);
    setPincode(user.pincode);
  }, [user]);

  // Avatar Upload Handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onUpdateUser({ ...user, avatarUrl: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  // Form Submission
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name,
      email,
      phone,
      address,
      city,
      pincode,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-white space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/10">
            <User className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-200 via-white to-amber-400 bg-clip-text text-transparent">
              VIP Account & Order Portal
            </h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Please sign in with Firebase Authentication to access your personalized vehicle orders, scheduled test drives, and account settings.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenAuthModal}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Create Account</span>
            </button>
          </div>

          <div className="pt-6 border-t border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Encrypted cloud storage powered by Google Firebase Firestore</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white space-y-8">
      
      {/* USER HEADER BANNER CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center gap-6">
        
        {/* Avatar Upload */}
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-950 border-4 border-amber-400 shadow-xl flex items-center justify-center text-amber-400 font-bold text-3xl">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0)
            )}
          </div>

          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 p-2 rounded-full bg-amber-500 text-slate-950 hover:bg-amber-400 cursor-pointer shadow-lg transition-transform group-hover:scale-110"
            title="Upload New Avatar"
          >
            <Camera className="w-4 h-4" />
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        </div>

        {/* User Info Details */}
        <div className="text-center md:text-left space-y-1 flex-1">
          <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
            <h2 className="text-2xl font-black text-white">{user.name}</h2>
            <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
              VIP Member
            </span>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Firebase Auth Active</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center justify-center md:justify-start gap-1 flex-wrap">
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>{user.email}</span>
            <span className="mx-1">•</span>
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>{user.phone}</span>
          </p>
          <p className="text-xs text-slate-400 flex items-center justify-center md:justify-start gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{user.city || 'New Delhi'}, India</span>
          </p>
          
          <div className="pt-2 flex justify-center md:justify-start">
            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-rose-500 text-slate-300 hover:text-rose-400 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Firebase</span>
            </button>
          </div>
        </div>

        {/* STATS SUMMARY PILLS */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto text-center text-xs">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl">
            <span className="text-lg font-black text-amber-400">{user.carsViewedCount || 12}</span>
            <p className="text-[10px] text-slate-400 uppercase font-medium">Cars Viewed</p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl">
            <span className="text-lg font-black text-amber-400">{testDrives.length}</span>
            <p className="text-[10px] text-slate-400 uppercase font-medium">Test Drives</p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl">
            <span className="text-lg font-black text-amber-400">{orders.length}</span>
            <p className="text-[10px] text-slate-400 uppercase font-medium">Orders</p>
          </div>
        </div>

      </div>

      {/* PROFILE TABS NAVIGATION */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-5 py-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'info'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Information</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('testdrives')}
          className={`px-5 py-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'testdrives'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Test Drives ({testDrives.length})</span>
        </button>
      </div>

      {/* TAB 1: EDIT PROFILE FORM */}
      {activeTab === 'info' && (
        <form onSubmit={handleSaveProfile} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 max-w-2xl shadow-xl">
          <h3 className="text-base font-bold text-amber-400 uppercase tracking-wider">
            Edit Contact Details
          </h3>

          {savedSuccess && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs rounded-xl flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-medium mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} readOnly
                required
                className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-medium mb-1">Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="py-3 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all"
          >
            Save Account Changes
          </button>
        </form>
      )}

      {/* TAB 2: PURCHASE ORDERS HISTORY */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-slate-400 font-medium">Invoice No: </span>
                    <span className="font-mono font-bold text-amber-400">{ord.id}</span>
                    <span className="mx-2 text-slate-600">•</span>
                    <span className="text-slate-400">Date: {ord.date}</span>
                  </div>

                  <span className="bg-emerald-500/20 text-emerald-400 font-bold px-3 py-1 rounded-full border border-emerald-500/30 self-start sm:self-auto text-[10px]">
                    {ord.status}
                  </span>
                </div>

                <div className="space-y-2">
                  {ord.items.map((item) => (
                    <div key={item.car.id} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-3">
                        <SmartCarImage car={item.car} alt={item.car.model} className="w-12 h-9 object-cover rounded-lg bg-slate-900" loading="lazy" decoding="async" />
                        <div>
                          <p className="font-bold text-white">{item.car.make} {item.car.model}</p>
                          <p className="text-[10px] text-slate-400">{item.car.category}</p>
                        </div>
                      </div>
                      <span className="font-bold text-amber-300">{formatCurrency(item.car.price)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div>
                    <p className="text-slate-400">Tracking Number: <strong className="text-slate-200 font-mono">{ord.trackingNumber}</strong></p>
                    <p className="text-slate-400">Grand Total Paid: <strong className="text-amber-400">{formatCurrency(ord.taxBreakdown.grandTotal)}</strong></p>
                  </div>

                  <button
                    onClick={async () => {
                      const { generateInvoicePDF } = await import('../utils/pdfGenerator');
                      generateInvoicePDF(ord);
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-md"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Download PDF Invoice</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No Purchase Orders Yet</p>
              <p className="text-xs text-slate-500 mt-1">Your confirmed car orders and invoices will appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SCHEDULED TEST DRIVES */}
      {activeTab === 'testdrives' && (
        <div className="space-y-4">
          {testDrives.length > 0 ? (
            testDrives.map((td) => (
              <div
                key={td.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-4">
                  <img src={td.carImage} alt={td.carName} className="w-20 h-14 object-cover rounded-xl bg-slate-950 border border-slate-800" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{td.carName}</h4>
                    <p className="text-amber-400 font-semibold mt-0.5">
                      {td.preferredDate} at {td.preferredTime}
                    </p>
                    <p className="text-slate-400 text-[10px] mt-0.5">{td.address}</p>
                  </div>
                </div>

                <span className="bg-amber-500/20 text-amber-400 font-bold px-3 py-1 rounded-full border border-amber-500/30 text-[10px]">
                  {td.status}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No Test Drive Appointments Scheduled</p>
              <p className="text-xs text-slate-500 mt-1">Book a personal VIP test drive from the showroom or hero banner.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
