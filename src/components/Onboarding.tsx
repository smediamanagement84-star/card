import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, Briefcase, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onSelect: (type: 'student' | 'professional') => void;
}

export default function Onboarding({ isOpen, onSelect }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0A0A0A]/95 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-2xl bg-[#111111] border border-[#2E2510] rounded-lg shadow-2xl p-10"
          >
            <div className="text-center mb-10">
              <div className="w-14 h-14 rounded-full border border-[#C9A84C] flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-[#C9A84C]" />
              </div>
              <h2 className="text-3xl font-serif text-[#F0EAD6] mb-2">Welcome to EliteCard</h2>
              <p className="text-[#7A7870] text-sm font-light">Choose your profile type to get a tailored dashboard.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <button
                onClick={() => onSelect('student')}
                className="group p-8 rounded-lg border border-[#2A2010] hover:border-[#C9A84C] bg-[#0A0A0A] text-left transition-all hover:shadow-[0_0_30px_rgba(201,168,76,0.15)]"
              >
                <div className="w-12 h-12 rounded-lg bg-[#C9A84C]/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6 text-[#C9A84C]" />
                </div>
                <h3 className="text-xl font-serif text-[#F0EAD6] mb-2">Student</h3>
                <p className="text-xs text-[#7A7870] leading-relaxed font-light">
                  University, degree, skills, and a network panel to scan & save classmates at events like hackathons.
                </p>
                <div className="mt-5 text-[10px] uppercase tracking-[0.3em] text-[#C9A84C] opacity-0 group-hover:opacity-100 transition-opacity">
                  Choose →
                </div>
              </button>

              <button
                onClick={() => onSelect('professional')}
                className="group p-8 rounded-lg border border-[#2A2010] hover:border-[#C9A84C] bg-[#0A0A0A] text-left transition-all hover:shadow-[0_0_30px_rgba(201,168,76,0.15)]"
              >
                <div className="w-12 h-12 rounded-lg bg-[#C9A84C]/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-6 h-6 text-[#C9A84C]" />
                </div>
                <h3 className="text-xl font-serif text-[#F0EAD6] mb-2">Professional</h3>
                <p className="text-xs text-[#7A7870] leading-relaxed font-light">
                  Company, title, and follow-up message templates to send via email or WhatsApp after meetings.
                </p>
                <div className="mt-5 text-[10px] uppercase tracking-[0.3em] text-[#C9A84C] opacity-0 group-hover:opacity-100 transition-opacity">
                  Choose →
                </div>
              </button>
            </div>

            <p className="text-[9px] uppercase tracking-[0.3em] text-[#3A3020] text-center mt-8">
              You can switch profile type anytime from your dashboard.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
