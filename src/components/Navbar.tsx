import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { logout } from '../firebase';
import { LogIn, LogOut, LayoutDashboard, Sparkles } from 'lucide-react';
import { useState } from 'react';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xl bg-[#0a0a14]/60 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/30 group-hover:shadow-fuchsia-500/50 transition-shadow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>
              EliteCard
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(user.displayName || user.email || 'U').charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </>
            ) : (
              <button onClick={() => setAuthOpen(true)} className="btn-primary inline-flex items-center gap-2 !py-2 !px-5 text-sm">
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </nav>
  );
}
