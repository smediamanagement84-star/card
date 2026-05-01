import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, loginWithGoogle, RecaptchaVerifier, signInWithPhoneNumber } from '../firebase';
import { X, Phone, Mail, ArrowRight, RefreshCw, Sparkles, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmationResult } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
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
      return 'Security check failed. Refresh the page and try again.';
    case 'auth/code-expired':
      return 'The verification code has expired. Request a new one.';
    case 'auth/invalid-verification-code':
      return 'Invalid code. Check and try again.';
    case 'auth/billing-not-enabled':
      return 'Phone sign-in is not yet enabled for this project.';
    case 'auth/operation-not-allowed':
      return 'Phone sign-in is disabled. Use Google instead.';
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

export default function AuthModal({ isOpen, onClose, redirectTo = '/dashboard' }: AuthModalProps) {
  const navigate = useNavigate();
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

  // Mount visible reCAPTCHA when on phone step. Visible captcha is far more
  // reliable on mobile browsers than the invisible variant.
  useEffect(() => {
    if (step !== 'phone') {
      clearRecaptcha();
      return;
    }
    const timer = setTimeout(() => {
      try {
        clearRecaptcha();
        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'normal',
          callback: () => {},
          'expired-callback': () => {},
        });
        verifier.render().catch(e => console.error('reCAPTCHA render error:', e));
        (window as any).recaptchaVerifier = verifier;
      } catch (e) {
        console.error('reCAPTCHA init error:', e);
        setError('Could not load security check. Refresh the page.');
      }
    }, 150);
    return () => {
      clearTimeout(timer);
      clearRecaptcha();
    };
  }, [step]);

  const finishAndRedirect = () => {
    onClose();
    setTimeout(() => navigate(redirectTo), 50);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const appVerifier = (window as any).recaptchaVerifier;
    if (!appVerifier) {
      setError('Security check not ready. Refresh and try again.');
      return;
    }
    setLoading(true);
    try {
      const cleaned = phoneNumber.replace(/[^\d+]/g, '');
      const formattedPhone = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setStep('otp');
    } catch (err: any) {
      console.error('phone sign-in', err);
      setError(getAuthErrorMessage(err.code || ''));
      // Reset captcha so user can retry without page refresh.
      clearRecaptcha();
      setTimeout(() => {
        try {
          const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'normal', callback: () => {}, 'expired-callback': () => {},
          });
          verifier.render().catch(console.error);
          (window as any).recaptchaVerifier = verifier;
        } catch (_) {}
      }, 200);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setLoading(true);
    setError(null);
    try {
      await confirmationResult.confirm(otp);
      finishAndRedirect();
    } catch (err: any) {
      console.error(err);
      setError(getAuthErrorMessage(err.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const result: any = await loginWithGoogle();
      // signInWithPopup returns a UserCredential; signInWithRedirect resolves with undefined
      // (the result is observed via getRedirectResult after page load).
      if (result?.user) {
        finishAndRedirect();
      } else {
        // Redirect path — the page is about to navigate away.
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setError(getAuthErrorMessage(err.code || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 26 }}
            className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden glass-strong p-6 sm:p-8 pb-[max(env(safe-area-inset-bottom),1.5rem)]"
          >
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-fuchsia-500/30 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

            <div className="relative flex items-center justify-between mb-6">
              {step !== 'method' ? (
                <button
                  type="button"
                  onClick={() => { setStep('method'); setError(null); }}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : <span />}
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-fuchsia-500/40">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit' }}>
                {step === 'method' ? 'Welcome' : step === 'phone' ? 'Your phone' : 'Enter code'}
              </h3>
              <p className="text-white/50 text-sm mt-1">
                {step === 'method' ? 'Sign in to build & share your card.'
                  : step === 'phone' ? 'We\'ll text you a 6-digit code.'
                  : `Sent to ${phoneNumber}`}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="relative mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-200 text-xs rounded-xl text-center leading-relaxed"
              >
                {error}
              </motion.div>
            )}

            {step === 'method' && (
              <div className="relative space-y-3">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl text-base font-semibold hover:bg-white/90 transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
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
                  className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white py-4 rounded-2xl text-base font-semibold hover:bg-white/10 transition-all active:scale-[0.98]"
                >
                  <Phone className="w-5 h-5" />
                  Use phone number
                </button>
              </div>
            )}

            {step === 'phone' && (
              <form onSubmit={handlePhoneSubmit} className="relative space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/60">Phone number</label>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+977 9841234567"
                    className="input-glass !text-base !py-4"
                    required
                    autoFocus
                  />
                  <p className="text-[11px] text-white/40">Include country code — e.g. +977 for Nepal, +1 for US.</p>
                </div>

                {/* Visible reCAPTCHA — much more reliable on mobile */}
                <div className="flex justify-center">
                  <div id="recaptcha-container" />
                </div>

                <button
                  type="submit"
                  disabled={loading || !phoneNumber}
                  className="btn-primary w-full inline-flex items-center justify-center gap-2 !py-4 text-base"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  Send code
                </button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleOtpSubmit} className="relative space-y-4">
                <div className="space-y-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                    className="input-glass text-center tracking-[0.6em] !text-2xl !py-5 font-bold"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="btn-primary w-full inline-flex items-center justify-center gap-2 !py-4 text-base"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  Confirm login
                </button>
                <button
                  type="button"
                  onClick={() => { setOtp(''); setStep('phone'); }}
                  className="w-full text-xs text-white/40 hover:text-white/70 transition-colors pt-1"
                >
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
