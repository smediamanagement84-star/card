import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { logout } from '../firebase';
import { LogIn, LogOut, LayoutDashboard, CreditCard } from 'lucide-react';
import { useState } from 'react';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <nav className="border-b border-[#2E2510] bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded border border-[#C9A84C] flex items-center justify-center group-hover:bg-[#C9A84C]/10 transition-colors">
              <CreditCard className="w-5 h-5 text-[#C9A84C]" />
            </div>
            <span className="font-serif italic text-xl tracking-wide text-[#F0EAD6]">EliteCard</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-xs uppercase tracking-[0.2em] text-[#7A7870] hover:text-[#C9A84C] transition-colors flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-xs uppercase tracking-[0.2em] text-[#7A7870] hover:text-[#C9A84C] transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
                <div className="w-8 h-8 rounded-full border border-[#C9A84C] overflow-hidden bg-[#111111] flex items-center justify-center text-[10px] text-[#C9A84C]">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.phoneNumber?.slice(-2) || user.email?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-[#C9A84C] text-[#0A0A0A] px-6 py-2 rounded text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#E8CC80] transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(201,168,76,0.2)]"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
}
