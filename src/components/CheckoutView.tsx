/**
 * @file CheckoutView.tsx
 * @description Responsive checkout with customer details, document verification,
 * demo payment selection, and a clear order summary. Uploaded document files are
 * intentionally not uploaded or persisted by this demo. Only checklist status is returned.
 */

import React, { useState } from 'react';
import { CreditCard, Building2, Smartphone, Lock, ShieldCheck, FileCheck2, Upload, CheckCircle2 } from 'lucide-react';
import { CartItem, AddressDetails, DocumentVerification, TaxBreakdown } from '../types';
import { formatCurrency, calculateTaxBreakdown } from '../utils/taxCalculator';
import { SmartCarImage } from './SmartCarImage';

interface CheckoutViewProps {
  cartItems: CartItem[];
  onBackToShowroom: () => void;
  onCompleteOrder: (
    address: AddressDetails,
    paymentMethod: 'Credit/Debit Card' | 'Net Banking' | 'UPI',
    documentVerification: DocumentVerification,
  ) => void;
  savedAddress?: AddressDetails;
}

type DocumentKey = 'identityProof' | 'addressProof' | 'panOrForm60';

const DOCUMENTS: { key: DocumentKey; title: string; description: string }[] = [
  {
    key: 'identityProof',
    title: 'Identity proof',
    description: 'Government-issued identity document ready for showroom verification.',
  },
  {
    key: 'addressProof',
    title: 'Address proof',
    description: 'Current address document matching the registration details.',
  },
  {
    key: 'panOrForm60',
    title: 'PAN / Form 60/61',
    description: 'Tax/identity document as applicable to the purchase.',
  },
];

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cartItems,
  onBackToShowroom,
  onCompleteOrder,
  savedAddress,
}) => {
  const [address, setAddress] = useState<AddressDetails>({
    fullName: savedAddress?.fullName || '',
    phone: savedAddress?.phone || '',
    email: savedAddress?.email || '',
    address: savedAddress?.address || '',
    city: savedAddress?.city || '',
    state: savedAddress?.state || '',
    pincode: savedAddress?.pincode || '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'Credit/Debit Card' | 'Net Banking' | 'UPI'>('Credit/Debit Card');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [upiId, setUpiId] = useState('');
  const [documents, setDocuments] = useState<Record<DocumentKey, boolean>>({
    identityProof: false,
    addressProof: false,
    panOrForm60: false,
  });
  const [fileNames, setFileNames] = useState<Partial<Record<DocumentKey, string>>>({});
  const [customerConsent, setCustomerConsent] = useState(false);
  const [formError, setFormError] = useState('');

  const taxBreakdown: TaxBreakdown = calculateTaxBreakdown(cartItems);

  const handleDocumentFile = (key: DocumentKey, file?: File) => {
    setDocuments((previous) => ({ ...previous, [key]: Boolean(file) }));
    setFileNames((previous) => ({ ...previous, [key]: file?.name || undefined }));
    setFormError('');
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!address.fullName || !address.phone || !address.email || !address.address || !address.city || !address.state || !address.pincode) {
      setFormError('Please complete all required customer and delivery fields.');
      return;
    }

    if (paymentMethod === 'UPI' && !upiId.trim()) {
      setFormError('Please enter a UPI ID or choose another payment method.');
      return;
    }

    const allDocumentsReady = DOCUMENTS.every(({ key }) => documents[key]);
    if (!allDocumentsReady) {
      setFormError('Please mark all three required documents as ready for showroom verification.');
      return;
    }

    if (!customerConsent) {
      setFormError('Please confirm that the information and documents are accurate.');
      return;
    }

    onCompleteOrder(address, paymentMethod, {
      ...documents,
      customerConsent,
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-white sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-400">Demo order process</p>
          <h2 className="mt-1 text-2xl font-black text-white">Complete your vehicle purchase</h2>
          <p className="mt-1 text-xs leading-5 text-slate-400">Customer details → document verification → payment → order confirmation</p>
        </div>
        <button
          type="button"
          onClick={onBackToShowroom}
          className="inline-flex w-fit items-center justify-center rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:border-amber-400 hover:text-white"
        >
          ← Back to showroom
        </button>
      </div>

      {formError && (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200" role="alert">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* SECTION 1 */}
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-6">
            <h3 className="flex items-center gap-2 text-lg font-bold text-amber-400">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-xs font-black text-slate-950">1</span>
              Delivery & registration details
            </h3>
            <div className="mt-5 grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
              {[
                ['fullName', 'Full legal name', 'text'],
                ['phone', 'Phone number', 'tel'],
                ['email', 'Email address', 'email'],
                ['address', 'Street address', 'text'],
                ['city', 'City', 'text'],
                ['state', 'State', 'text'],
                ['pincode', 'Pincode', 'text'],
              ].map(([key, label, type]) => (
                <div key={key} className={key === 'email' || key === 'address' ? 'sm:col-span-2' : ''}>
                  <label className="mb-1 block font-medium text-slate-400">{label}</label>
                  <input
                    type={type}
                    value={address[key as keyof AddressDetails]}
                    onChange={(e) => setAddress({ ...address, [key]: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-white outline-none transition focus:border-amber-400"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 2 */}
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-amber-400">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-xs font-black text-slate-950">2</span>
                  Document verification
                </h3>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Select the documents that are ready for showroom verification. This demo does not upload or store the actual files.
                </p>
              </div>
              <FileCheck2 className="hidden h-7 w-7 text-emerald-400 sm:block" />
            </div>

            <div className="mt-5 space-y-3">
              {DOCUMENTS.map((document) => (
                <div key={document.key} className={`rounded-2xl border p-4 transition ${documents[document.key] ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-slate-800 bg-slate-950'}`}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={documents[document.key]}
                        onChange={(e) => {
                          setDocuments((previous) => ({ ...previous, [document.key]: e.target.checked }));
                          if (!e.target.checked) setFileNames((previous) => ({ ...previous, [document.key]: undefined }));
                          setFormError('');
                        }}
                        className="mt-1 h-4 w-4 accent-amber-500"
                      />
                      <span>
                        <span className="block font-bold text-white">{document.title}</span>
                        <span className="mt-1 block text-[11px] leading-5 text-slate-400">{document.description}</span>
                      </span>
                    </label>

                    <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-[11px] font-bold text-slate-300 transition hover:border-amber-400 hover:text-white">
                      <Upload className="h-3.5 w-3.5" />
                      <span>{fileNames[document.key] ? 'File selected' : 'Optional demo file'}</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="sr-only"
                        onChange={(e) => handleDocumentFile(document.key, e.target.files?.[0])}
                      />
                    </label>
                  </div>
                  {fileNames[document.key] && (
                    <p className="mt-3 truncate rounded-lg bg-slate-900 px-3 py-2 text-[10px] text-slate-400">Selected locally: {fileNames[document.key]}</p>
                  )}
                </div>
              ))}
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <input
                type="checkbox"
                checked={customerConsent}
                onChange={(e) => { setCustomerConsent(e.target.checked); setFormError(''); }}
                className="mt-1 h-4 w-4 accent-amber-500"
              />
              <span className="text-xs leading-5 text-slate-300">
                I confirm that the customer information is accurate and the listed documents are ready for verification by the showroom/dealer.
              </span>
            </label>
          </section>

          {/* SECTION 3 */}
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-6">
            <h3 className="flex items-center gap-2 text-lg font-bold text-amber-400">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-xs font-black text-slate-950">3</span>
              Payment method
            </h3>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { id: 'Credit/Debit Card' as const, label: 'Credit Card', icon: CreditCard },
                { id: 'Net Banking' as const, label: 'Net Banking', icon: Building2 },
                { id: 'UPI' as const, label: 'UPI / QR', icon: Smartphone },
              ].map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center justify-center gap-2 rounded-2xl border p-4 text-xs font-bold transition ${isSelected ? 'border-amber-400 bg-amber-500/10 text-amber-300' : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'}`}
                  >
                    <Icon className="h-5 w-5" />
                    {method.label}
                  </button>
                );
              })}
            </div>

            {paymentMethod === 'Credit/Debit Card' && (
              <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                  <div>
                    <p className="font-bold text-amber-300">Demo payment mode</p>
                    <p className="mt-1 leading-5">Card details are not collected in this portfolio demo. A production release should use a PCI-compliant provider and server-side payment verification.</p>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'Net Banking' && (
              <div className="mt-4">
                <label className="mb-2 block text-xs font-medium text-slate-400">Select bank</label>
                <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white outline-none focus:border-amber-400">
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>State Bank of India</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {paymentMethod === 'UPI' && (
              <div className="mt-4">
                <label className="mb-2 block text-xs font-medium text-slate-400">UPI ID</label>
                <input type="text" placeholder="name@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} required className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white outline-none focus:border-amber-400" />
              </div>
            )}
          </section>
        </div>

        {/* SUMMARY */}
        <aside className="space-y-6">
          <div className="sticky top-24 rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white">Purchase summary</h3>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300">DEMO FLOW</span>
            </div>

            <div className="mt-4 space-y-3">
              {cartItems.map((item) => (
                <div key={item.car.id} className="flex gap-3 border-b border-slate-800/60 pb-3">
                  <SmartCarImage car={item.car} alt={item.car.model} className="h-14 w-20 rounded-xl bg-slate-950 object-cover" loading="lazy" decoding="async" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-white">{item.car.make} {item.car.model}</p>
                    <p className="mt-1 text-xs font-semibold text-amber-400">{formatCurrency(item.car.price)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t border-slate-800 pt-4 text-xs">
              <div className="flex justify-between text-slate-400"><span>Vehicle subtotal</span><span className="text-white">{formatCurrency(taxBreakdown.basePrice)}</span></div>
              <div className="flex justify-between text-slate-400"><span>Illustrative taxes & fees</span><span className="text-white">{formatCurrency(taxBreakdown.totalCharges)}</span></div>
              <div className="mt-3 flex justify-between border-t border-slate-800 pt-3 text-base font-black text-amber-400"><span>Total</span><span>{formatCurrency(taxBreakdown.grandTotal)}</span></div>
            </div>

            <button type="submit" className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 py-4 text-sm font-black text-slate-950 shadow-xl shadow-amber-500/20 transition hover:from-amber-400 hover:to-amber-500">
              <Lock className="h-4 w-4" />
              Complete purchase
            </button>

            <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-950 p-3 text-[10px] leading-4 text-slate-500">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
              <span>Document status, not document contents, is recorded with the order. Actual dealer/RTO requirements can vary by transaction and state.</span>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
};
