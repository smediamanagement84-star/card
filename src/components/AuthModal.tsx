import React, { useState, useEffect } from 'react';
import { auth, loginWithGoogle, RecaptchaVerifier, signInWithPhoneNumber } from '../firebase';
import { X, Phone, Mail, ArrowRight, RefreshCw, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmationResult } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
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
    }
  }, [isOpen]);

  const setupRecaptcha = () => {
    if ((window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier.clear();
    }
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {}
    });
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setupRecaptcha();

    const appVerifier = (window as any).recaptchaVerifier;

    try {
      // Ensure phone number starts with +
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setStep('otp');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await confirmationResult?.confirm(otp);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in with Google. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0A0A0A]/90 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#111111] border border-[#2E2510] rounded-lg shadow-2xl p-8"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-[#7A7870] hover:text-[#C9A84C] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-full border border-[#C9A84C] flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-6 h-6 text-[#C9A84C]" />
              </div>
              <h3 className="text-2xl font-serif text-[#F0EAD6]">Sign In</h3>
              <p className="text-[#7A7870] text-sm font-light mt-1">Access your elite digital card dashboard.</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-200 text-xs rounded text-center">
                {error}
              </div>
            )}

            {step === 'method' && (
              <div className="space-y-4">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 bg-[#F0EAD6] text-[#0A0A0A] py-3 rounded text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Continue with Google
                </button>
                <div className="flex items-center gap-4 py-2">
                  <div className="flex-1 h-[1px] bg-[#2A2010]" />
                  <span className="text-[10px] text-[#3A3020] uppercase tracking-[0.2em]">Or</span>
                  <div className="flex-1 h-[1px] bg-[#2A2010]" />
                </div>
                <button
                  onClick={() => setStep('phone')}
                  className="w-full flex items-center justify-center gap-3 border border-[#3A3020] text-[#7A7870] py-3 rounded text-xs font-bold uppercase tracking-[0.2em] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Use Phone Number
                </button>
              </div>
            )}

            {step === 'phone' && (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A7870]">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+977 1234567890"
                    className="w-full bg-[#0A0A0A] border border-[#2A2010] p-3 rounded text-sm text-[#F0EAD6] focus:border-[#C9A84C] outline-none transition-colors"
                    required
                  />
                  <p className="text-[9px] text-[#3A3020] tracking-wider">Include country code (e.g. +977)</p>
                </div>
                <div id="recaptcha-container"></div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#C9A84C] text-[#0A0A0A] py-3 rounded text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#E8CC80] transition-colors disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  Send Code
                </button>
                <button
                  type="button"
                  onClick={() => setStep('method')}
                  className="w-full text-[10px] uppercase tracking-[0.2em] text-[#7A7870] hover:text-[#C9A84C] transition-colors pt-2"
                >
                  Back to methods
                </button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A7870]">Enter Verification Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full bg-[#0A0A0A] border border-[#2A2010] p-3 rounded text-sm text-[#F0EAD6] focus:border-[#C9A84C] outline-none text-center tracking-[1em] font-bold"
                    required
                  />
                  <p className="text-[9px] text-[#3A3020] text-center tracking-wider">A 6-digit code was sent to {phoneNumber}</p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#C9A84C] text-[#0A0A0A] py-3 rounded text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#E8CC80] transition-colors disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Confirm Login'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="w-full text-[10px] uppercase tracking-[0.2em] text-[#7A7870] hover:text-[#C9A84C] transition-colors pt-2"
                >
                  Change Number
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
