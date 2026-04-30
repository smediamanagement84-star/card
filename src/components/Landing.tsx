import { useAuth } from '../App';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Star, Smartphone, QrCode, Globe } from 'lucide-react';
import { useState } from 'react';
import AuthModal from './AuthModal';

export default function Landing() {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C9A84C]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#C9A84C]/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/4" />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A84C]/20 bg-[#C9A84C]/5 text-[#C9A84C] text-[10px] uppercase tracking-[0.3em]"
          >
            <Star className="w-3 h-3 fill-current" />
            The Future of Networking
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl font-serif text-[#F0EAD6] leading-tight"
          >
            Digital Presence <br /> 
            <span className="italic text-[#C9A84C]">Redefined</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[#7A7870] font-light max-w-2xl mx-auto tracking-wide"
          >
            Elevate your professional identity with a bespoke digital business card. 
            Designed for luxury, built for the modern executive.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            {user ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto bg-[#C9A84C] text-[#0A0A0A] px-10 py-4 rounded text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#E8CC80] transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(201,168,76,0.3)]"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto bg-[#C9A84C] text-[#0A0A0A] px-10 py-4 rounded text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#E8CC80] transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(201,168,76,0.3)]"
              >
                Create Your Card
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <Link
              to="/d/sample"
              className="w-full sm:w-auto border border-[#3A3020] text-[#7A7870] px-10 py-4 rounded text-xs font-bold uppercase tracking-[0.2em] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all flex items-center justify-center"
            >
              View Sample
            </Link>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
          {[
            { icon: QrCode, title: "QR Integration", desc: "Instant contact sharing via unique, high-resolution QR codes accessible on any device." },
            { icon: Smartphone, title: "PWA Experience", desc: "Installable on mobile home screens for lightning-fast access, even without a network." },
            { icon: Globe, title: "Real-time Updates", desc: "Change your details anytime. Your one link stays the same, your profile is always current." }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-lg border border-[#1A1A1A] bg-[#111111]/50 space-y-4 hover:border-[#C9A84C]/30 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-[#C9A84C]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-[#C9A84C]" />
              </div>
              <h3 className="text-xl font-serif text-[#F0EAD6]">{feature.title}</h3>
              <p className="text-sm text-[#7A7870] leading-relaxed font-light">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1A1A1A] py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[#3A3020] text-[10px] uppercase tracking-[0.5em]">
            © 2026 Elite Digital Card · Crafted for Excellence
          </p>
        </div>
      </footer>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
