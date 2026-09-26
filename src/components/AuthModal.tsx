/**
 * @file AuthModal.tsx
 * @description Firebase Authentication modal for Auto Spot Hub.
 * Provides Email/Password Sign-In, Sign-Up, Google Authentication, and Password Reset.
 */

import React, { useEffect, useState } from 'react';
import { X, Mail, Lock, User, Phone, LogIn, UserPlus, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, loginWithGoogle, syncUserProfileDoc } from '../lib/firebase';
import { Logo } from './Logo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resetForm = () => {
    setError(null);
    setSuccessMsg(null);
  };

  const handleModeSwitch = (newMode: 'signin' | 'signup' | 'forgot') => {
    resetForm();
    setMode(newMode);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetForm();
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccessMsg('Successfully signed in to your Auto Spot Hub account!');
        setTimeout(() => {
          onClose();
        }, 1000);
      } else if (mode === 'signup') {
        if (!name.trim()) {
          throw new Error('Please enter your full name.');
        }
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName: name });
        await syncUserProfileDoc(userCred.user, { name, phone });
        setSuccessMsg('Account created successfully! Welcome to Auto Spot Hub VIP.');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        setSuccessMsg(`Password reset link sent to ${email}. Please check your inbox.`);
      }
    } catch (err: unknown) {
      console.error('Firebase Auth Error:', err);
      const authError = err as { code?: string; message?: string };
      let message = authError.message || 'An authentication error occurred.';
      if (authError.code === 'auth/invalid-credential' || authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
        message = 'Invalid email or password. Please check your credentials.';
      } else if (authError.code === 'auth/email-already-in-use') {
        message = 'An account with this email address already exists. Please sign in instead.';
      } else if (authError.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters long.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Google Sign In Handler
  const handleGoogleAuth = async () => {
    resetForm();
    setLoading(true);
    try {
      await loginWithGoogle();
      setSuccessMsg('Google Sign-In successful!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const authError = err as { code?: string; message?: string };
      if (authError.code !== 'auth/popup-closed-by-user') {
        setError(authError.message || 'Failed to sign in with Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LOGO & TITLE */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Logo size="sm" showSubtitle={false} />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-amber-200 via-white to-amber-400 bg-clip-text text-transparent">
            {mode === 'signin' && 'Sign In to Auto Spot Hub'}
            {mode === 'signup' && 'Create VIP Member Account'}
            {mode === 'forgot' && 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'signin' && 'Access your showroom wishlist, orders, and VIP test drives'}
            {mode === 'signup' && 'Unlock instant test drive bookings & personalized car recommendations'}
            {mode === 'forgot' && 'Enter your registered email to receive a password reset link'}
          </p>
        </div>

        {/* NOTIFICATIONS */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* AUTH FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    required
                    className="w-full bg-slate-950 border border-slate-800 text-white pl-9 pr-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full bg-slate-950 border border-slate-800 text-white pl-9 pr-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vip@autospothub.com"
                required
                className="w-full bg-slate-950 border border-slate-800 text-white pl-9 pr-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs text-slate-400 font-medium">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('forgot')}
                    className="text-[11px] text-amber-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-white pl-9 pr-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : mode === 'signin' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In with Firebase</span>
              </>
            ) : mode === 'signup' ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Register Firebase Account</span>
              </>
            ) : (
              <span>Send Password Reset Email</span>
            )}
          </button>
        </form>

        {/* DIVIDER */}
        {mode !== 'forgot' && (
          <>
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase font-semibold">
                Or Continue With
              </span>
              <div className="border-t border-slate-800 w-full" />
            </div>

            {/* GOOGLE SIGN IN BUTTON */}
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.2-.7-.4-1.5-.4-2.3z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </>
        )}

        {/* SWITCH MODES FOOTER */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          {mode === 'signin' && (
            <p>
              Don't have a VIP account?{' '}
              <button
                type="button"
                onClick={() => handleModeSwitch('signup')}
                className="text-amber-400 hover:underline font-bold"
              >
                Sign Up Now
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => handleModeSwitch('signin')}
                className="text-amber-400 hover:underline font-bold"
              >
                Sign In Here
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => handleModeSwitch('signin')}
              className="text-amber-400 hover:underline font-bold"
            >
              ← Back to Sign In
            </button>
          )}
        </div>

        {/* SECURITY ACCREDITATION FOOTER */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          <span>Secured by Firebase Firestore & Authentication</span>
        </div>

      </div>
    </div>
  );
};
