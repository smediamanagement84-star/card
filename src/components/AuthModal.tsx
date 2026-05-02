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

const FRIENDLY_FALLBACK = 'Sign-in failed. Please try again.';

function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/unauthorized-domain':
      return 'This domain isn\'t authorized in Firebase. Add the current domain to Firebase → Authentication → Settings → Authorized domains.';
    case 'auth/popup-blocked':
      return 'Pop-up blocked. Allow pop-ups and try again.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-by-user':
      return 'Sign-in cancelled.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again in a few minutes.';
    case 'auth/invalid-phone-number':
      return 'Invalid phone number. Include country code (e.g. +977 9841234567).';
    case 'auth/missing-phone-number':
      return 'Enter your phone with country code.';
    case 'auth/quota-exceeded':
      return 'Daily SMS quota exceeded. Try Google sign-in instead.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.';
    case 'auth/captcha-check-failed':
    case 'auth/missing-client-identifier':
      return 'Security check failed. Refresh the page and try again.';
    case 'auth/code-expired':
      return 'The verification code expired. Request a new one.';
    case 'auth/invalid-verification-code':
      return 'Invalid code. Check and try again.';
    case 'auth/billing-not-enabled':
      return 'Phone sign-in requires billing on the Firebase project. Use Google instead.';
    case 'auth/operation-not-allowed':
      return 'Phone sign-in isn\'t enabled in Firebase Console. Enable it under Authentication → Sign-in method.';
    case 'auth/internal-error':
      return 'Auth backend error. Refresh and try again.';
    default:
      return FRIENDLY_FALLBACK;
  }
}

function clearRecaptcha() {
  try {
    if ((window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier.clear();
      delete (window as any).recaptchaVerifier;
    }
  } catch {}
}

function ensureVerifier(): any {
  // Reuse existing or build a new invisible verifier.
  if ((window as any).recaptchaVerifier) return (window as any).recaptchaVerifier;
  const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
    size: 'invisible',
    callback: () => {},
    'expired-callback': () => clearRecaptcha(),
  });
  (window as any).recaptchaVerifier = verifier;
  return verifier;
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

  const finishAndRedirect = () => {
    onClose();
    setTimeout(() => navigate(redirectTo), 50);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const cleaned = phoneNumber.replace(/[^\d+]/g, '');
      const formatted = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
      const verifier = ensureVerifier();
      const result = await signInWithPhoneNumber(auth, formatted, verifier);
      setConfirmationResult(result);
      setStep('otp');
    } catch (err: any) {
      console.error('Phone sign-in error:', err);
      const code = err?.code || '';
      const friendly = getAuthErrorMessage(code);
      // For unknown errors, surface the actual code so we can debug.
      const detail = friendly === FRIENDLY_FALLBACK && (code || err?.message)
        ? `${friendly} (${code || err.message})`
        : friendly;
      setError(detail);
      // Reset captcha so the user can retry without refresh.
      clearRecaptcha();
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
      console.error('OTP confirm error:', err);
      setError(getAuthErrorMessage(err?.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const result: any = await loginWithGoogle();
      if (result?.user) {
        finishAndRedirect();
      } else {
        // Redirect path — the page is about to navigate away.
        onClose();
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      const code = err?.code || '';
      const friendly = getAuthErrorMessage(code);
      const detail = friendly === FRIENDLY_FALLBACK && (code || err?.message)
        ? `${friendly} (${code || err.message})`
        : friendly;
      setError(detail);
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
            className="absolute inset-0 bg-black/70"
          />
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl glass-strong p-6 sm:p-8 pb-[max(env(safe-area-inset-bottom),1.5rem)]"
          >
            <div className="flex items-center justify-between mb-4">
              {step !== 'method' ? (
                <button
                  type="button"
                  onClick={() => { setStep('method'); setError(null); }}
                  className="w-10 h-10 rounded-full bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : <span />}
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent)] flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-5 h-5 text-[var(--bg)]" />
              </div>
              <h3 className="text-2xl font-semibold font-display text-[var(--text)]">
                {step === 'method' ? 'Welcome' : step === 'phone' ? 'Your phone' : 'Enter code'}
              </h3>
              <p className="text-[var(--text-muted)] text-sm mt-1">
                {step === 'method' ? 'Sign in to build & share your card.'
                  : step === 'phone' ? 'We\'ll text you a 6-digit code.'
                  : `Sent to ${phoneNumber}`}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-200 text-xs rounded-xl text-center leading-relaxed break-words"
              >
                {error}
              </motion.div>
            )}

            {step === 'method' && (
              <div className="space-y-3">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-[var(--text)] text-[var(--bg)] py-4 rounded-2xl text-base font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 active:scale-[0.99]"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                  Continue with Google
                </button>
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[10px] text-[var(--text-faint)] uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                <button
                  onClick={() => setStep('phone')}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white/[0.04] border border-[var(--border)] text-[var(--text)] py-4 rounded-2xl text-base font-semibold hover:bg-white/[0.08] transition-all active:scale-[0.99]"
                >
                  <Phone className="w-5 h-5" />
                  Use phone number
                </button>
                <p className="text-[10px] text-[var(--text-faint)] text-center pt-2">
                  By continuing you agree to share your sign-in info with this app.
                </p>
              </div>
            )}

            {step === 'phone' && (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[var(--text-muted)]">Phone number</label>
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
                  <p className="text-[11px] text-[var(--text-faint)]">Include country code — e.g. +977 for Nepal, +1 for US.</p>
                </div>

                {/* Invisible reCAPTCHA mounts here. Firebase invokes it during signInWithPhoneNumber. */}
                <div id="recaptcha-container" />

                <button
                  type="submit"
                  disabled={loading || !phoneNumber}
                  className="btn-primary w-full !py-4 text-base"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4 ml-1" />}
                  <span className="ml-2">Send code</span>
                </button>
                <p className="text-[10px] text-[var(--text-faint)] text-center pt-1">
                  Standard SMS rates apply. Phone sign-in must be enabled in Firebase Console.
                </p>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
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
                  className="input-glass text-center tracking-[0.5em] !text-2xl !py-5 font-bold"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="btn-primary w-full !py-4 text-base"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  <span className={loading ? 'ml-2' : ''}>Confirm login</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setOtp(''); setStep('phone'); }}
                  className="w-full text-xs text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors pt-1"
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
