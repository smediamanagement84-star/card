import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, Briefcase, Sparkles, ArrowRight } from 'lucide-react';

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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-lg"
          />
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', damping: 22 }}
            className="relative w-full max-w-3xl rounded-3xl glass-strong p-8 sm:p-10 overflow-hidden"
          >
            <div className="relative text-center mb-10">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-14 h-14 rounded-2xl bg-[var(--accent)] flex items-center justify-center mx-auto mb-5"
              >
                <Sparkles className="w-7 h-7 text-white" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="text-3xl sm:text-4xl font-semibold text-[var(--text)] mb-2 font-display"
              >
                What's your <span className="gradient-text">vibe</span>?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="text-white/60 text-sm"
              >
                We'll tailor your card and dashboard to fit.
              </motion.p>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
              <ChoiceCard
                onClick={() => onSelect('student')}
                icon={GraduationCap} emoji="🎓" title="Student"
                desc="University, skills, looking-for tags, and a network panel for hackathons & career fairs."
                gradient="from-[#D97757] to-[#E0876A]"
                delay={0.5}
              />
              <ChoiceCard
                onClick={() => onSelect('professional')}
                icon={Briefcase} emoji="💼" title="Professional"
                desc="Company, role, skills, and saved follow-up message templates for after meetings."
                gradient="from-[#D97757] to-[#E0876A]"
                delay={0.6}
              />
            </div>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              className="relative text-[11px] text-white/30 text-center mt-8 uppercase tracking-widest"
            >
              You can switch anytime.
            </motion.p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ChoiceCard({
  onClick, icon: Icon, emoji, title, desc, gradient, delay,
}: {
  onClick: () => void; icon: any; emoji: string; title: string; desc: string; gradient: string; delay: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      whileHover={{ y: -6, scale: 1.02 }} whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative p-7 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 text-left overflow-hidden transition-all"
    >
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <span className="text-3xl">{emoji}</span>
        </div>
        <h3 className="text-2xl font-semibold text-[var(--text)] mb-2 font-display">{title}</h3>
        <p className="text-sm text-white/60 leading-relaxed mb-4">{desc}</p>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 group-hover:text-white transition-colors">
          Choose <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.button>
  );
}
