import React, { useState, useEffect } from 'react';
import { auth, loginWithGoogle, RecaptchaVerifier, signInWithPhoneNumber } from '../firebase';
import { X, Phone, Mail, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmationResult } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for sign-in. Add digicardapp.netlify.app to Firebase authorized domains.';
    case 'auth/popup-blocked':
      return 'Pop-up blocked. Allow pop-ups and try again.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-by-user':
      return 'Sign-in cancelled. Try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a few minutes and try again.';
    case 'auth/invalid-phone-number':
      return 'Invalid phone number. Include country code (e.g. +977 9841234567).';
    case 'auth/missing-phone-number':
      return 'Enter your phone with country code.';
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded. Try again later.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.';
    case 'auth/captcha-check-failed':
    case 'auth/missing-client-identifier':
      return 'Security check failed. Refresh and try again.';
    case 'auth/code-expired':
      return 'The verification code has expired. Request a new one.';
    case 'auth/invalid-verification-code':
      return 'Invalid code. Check and try again.';
    default:
      return 'Authentication failed. Try again.';
  }
}

function clearRecaptcha() {
  try {
    if ((window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier.clear();
      delete (window as any).recaptchaVerifier;
    }
  } catch (_) {}
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [step, setStep] = useState<'method' | 'phone' | 'otp'>('method');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep('method');
      setPhoneNumber('');
      setOtp('');
      setError(null);
      setLoading(false);
      clearRecaptcha();
    }
  }, [isOpen]);

  useEffect(() => {
    if (step !== 'phone') {
      clearRecaptcha();
      return;
    }
    const timer = setTimeout(() => {
      try {
        clearRecaptcha();
        (window as any).recaptchaVerifier = new RecaptchaVerifier(
          auth, 'recaptcha-container',
          { size: 'invisible', callback: () => {} }
        );
      } catch (e) { console.error('reCAPTCHA init error:', e); }
    }, 100);
    return () => { clearTimeout(timer); clearRecaptcha(); };
  }, [step]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const appVerifier = (window as any).recaptchaVerifier;
    if (!appVerifier) { setError('Security check not ready. Refresh and try again.'); return; }
    setLoading(true);
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setStep('otp');
    } catch (err: any) {
      console.error(err);
      setError(getAuthErrorMessage(err.code || ''));
      clearRecaptcha();
      try {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(
          auth, 'recaptcha-container',
          { size: 'invisible', callback: () => {} }
        );
      } catch (_) {}
    } finally { setLoading(false); }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setLoading(true); setError(null);
    try {
      await confirmationResult.confirm(otp);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(getAuthErrorMessage(err.code || ''));
    } finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setError(null); setLoading(true);
    try { await loginWithGoogle(); onClose(); }
    catch (err: any) { console.error(err); setError(getAuthErrorMessage(err.code || '')); }
    finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 22 }}
            className="relative w-full max-w-md rounded-3xl overflow-hidden glass-strong p-8"
          >
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-fuchsia-500/30 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-fuchsia-500/40">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit' }}>Welcome back</h3>
              <p className="text-white/50 text-sm mt-1">Sign in to build & share your card.</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="relative mb-5 p-3 bg-red-500/10 border border-red-500/30 text-red-200 text-xs rounded-xl text-center leading-relaxed"
              >
                {error}
              </motion.div>
            )}

            {step === 'method' && (
              <div className="relative space-y-3">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white text-black py-3.5 rounded-2xl text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Continue with Google
                </button>
                <div className="flex items-center gap-3 py-2">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[10px] text-white/30 uppercase tracking-widest">Or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                <button
                  onClick={() => setStep('phone')}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white py-3.5 rounded-2xl text-sm font-semibold hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  <Phone className="w-4 h-4" />
                  Use Phone Number
                </button>
              </div>
            )}

            {step === 'phone' && (
              <form onSubmit={handlePhoneSubmit} className="relative space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/60">Phone Number</label>
                  <input
                    type="tel" value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+977 9841234567"
                    className="input-glass" required autoFocus
                  />
                  <p className="text-[10px] text-white/40">Include country code — e.g. +977 for Nepal, +1 for US.</p>
                </div>
                <div id="recaptcha-container" />
                <button type="submit" disabled={loading} className="btn-primary w-full inline-flex items-center justify-center gap-2">
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  Send Code
                </button>
                <button type="button" onClick={() => setStep('method')} className="w-full text-xs text-white/40 hover:text-white/70 transition-colors pt-1">
                  ← Back to options
                </button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleOtpSubmit} className="relative space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/60">Verification Code</label>
                  <input
                    type="text" inputMode="numeric" pattern="[0-9]*"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456" maxLength={6} autoFocus
                    className="input-glass text-center tracking-[0.5em] text-lg font-bold"
                    required
                  />
                  <p className="text-[10px] text-white/40 text-center">Sent to {phoneNumber}</p>
                </div>
                <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full inline-flex items-center justify-center gap-2">
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  Confirm Login
                </button>
                <button type="button" onClick={() => { setOtp(''); setStep('phone'); }} className="w-full text-xs text-white/40 hover:text-white/70 transition-colors pt-1">
                  Change number
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
