import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '../firebase';
import { X, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}

const GoogleLogo = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

function describeError(code: string, fallbackMsg?: string): string {
  switch (code) {
    case 'auth/unauthorized-domain':
      return "This domain isn't authorized in Firebase. Add it under Authentication → Settings → Authorized domains.";
    case 'auth/popup-blocked':
      return 'Pop-up blocked. Allow pop-ups for this site and try again.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
    case 'auth/cancelled-by-user':
      return 'Sign-in cancelled.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a few minutes and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/internal-error':
      return 'Auth backend error. Refresh and try again.';
    default:
      return fallbackMsg || (code ? `Sign-in failed (${code})` : 'Sign-in failed. Please try again.');
  }
}

export default function AuthModal({ isOpen, onClose, redirectTo = '/dashboard' }: AuthModalProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const result: any = await loginWithGoogle();
      if (result?.user) {
        onClose();
        setTimeout(() => navigate(redirectTo), 40);
      } else {
        // Redirect flow — the page is about to navigate away.
        onClose();
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(describeError(err?.code || '', err?.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70"
          />

          <motion.div
            initial={{ y: '100%', opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 1 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl glass-strong px-6 sm:px-8 pt-3 sm:pt-7 pb-[max(env(safe-area-inset-bottom),1.75rem)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
          >
            {/* Drag-handle on mobile so it reads as a sheet */}
            <div className="sm:hidden flex justify-center pb-3">
              <div className="w-10 h-1 rounded-full bg-white/15" />
            </div>

            <div className="flex justify-end mb-1 sm:mb-3 -mt-1 sm:-mt-2">
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[var(--accent)] flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-[var(--bg)]" />
              </div>
              <h2 id="auth-title" className="text-2xl sm:text-3xl font-semibold font-display text-[var(--text)]">
                Welcome
              </h2>
              <p className="text-[var(--text-muted)] text-sm mt-2 max-w-xs mx-auto">
                Sign in with Google to build &amp; share your card.
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-200 text-xs rounded-xl text-center leading-relaxed break-words"
              >
                {error}
              </motion.div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-[var(--text)] text-[var(--bg)] py-4 rounded-2xl text-base font-semibold hover:opacity-95 transition-opacity disabled:opacity-50 active:scale-[0.99]"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <GoogleLogo />}
              Continue with Google
            </button>

            <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-faint)]">
              <ShieldCheck className="w-3 h-3" />
              <span>Secure OAuth via Google. We never see your password.</span>
            </div>

            <p className="text-[10px] text-[var(--text-faint)] text-center pt-3 max-w-xs mx-auto leading-relaxed">
              By continuing you agree to share your name, email, and avatar with EliteCard.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
