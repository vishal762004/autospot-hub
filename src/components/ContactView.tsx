/**
 * @file ContactView.tsx
 * @description Contact Us component featuring dealership details for Auto Spot Hub Support Team,
 * phone number, email, office hours, and a clearly labelled demo contact form.
 */

import React, { useState } from 'react';
import { User, Phone, Mail, Clock, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { SITE_CONTACT } from '../data/siteConfig';

export const ContactView: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-white">
      
      {/* SECTION TITLE */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase">
          <Phone className="w-3.5 h-3.5" />
          <span>Concierge Desk</span>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          GET IN TOUCH WITH US
        </h2>
        <p className="text-slate-400 text-sm">
          Have questions regarding luxury car customization, test drives, or payment options? Contact our team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: CONTACT CARDS */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-3">
            Dealership Information
          </h3>

          <div className="space-y-4 text-xs sm:text-sm">
            
            {/* Person */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-400 font-medium text-[10px] uppercase">Founders & Management</p>
                <p className="font-bold text-white text-base">Auto Spot Hub Support Team</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-400 font-medium text-[10px] uppercase">Phone & WhatsApp</p>
                <div className="flex flex-wrap items-center gap-3">
                  <a href={SITE_CONTACT.phoneHref} className="font-bold text-amber-400 text-base hover:text-amber-300 hover:underline">{SITE_CONTACT.phoneDisplay}</a>
                  <a href={SITE_CONTACT.whatsappHref} target="_blank" rel="noreferrer" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline">WhatsApp</a>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-400 font-medium text-[10px] uppercase">Official Support Email</p>
                <p className="font-bold text-white text-base"><a href={SITE_CONTACT.emailHref} className="hover:text-amber-300 hover:underline">{SITE_CONTACT.email}</a></p>
              </div>
            </div>

            {/* Hours */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-400 font-medium text-[10px] uppercase">Showroom Business Hours</p>
                <p className="font-bold text-white">Monday - Saturday: 9:00 AM - 6:00 PM (IST)</p>
                <p className="text-slate-500 text-[10px]">Sunday: Closed / By VIP Appointment Only</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-400 font-medium text-[10px] uppercase">Showroom Headquarters</p>
                <p className="font-bold text-white">Demo showroom location — configure before deployment</p>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: MESSAGE FORM */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-3">
            Send us a Message
          </h3>

          {isSent ? (
            <div className="py-12 text-center space-y-3 bg-slate-950 border border-slate-800 rounded-2xl p-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-lg font-bold text-white">Demo Message Accepted</h4>
              <p className="text-xs text-slate-400">
                Thanks, {name}. This portfolio build does not transmit messages; connect the form to an email/CRM service before deployment.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Your Legal Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Inquiring about Rolls-Royce Phantom VIII"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Your Message / Request</label>
                <textarea
                  placeholder="Describe your inquiry, custom vehicle requirements, or finance questions..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Send className="w-4 h-4" />
                <span>Submit Demo Message</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};
