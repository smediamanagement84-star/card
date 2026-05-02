import { useAuth } from '../App';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, QrCode, Users, Palette } from 'lucide-react';
import { useState } from 'react';
import AuthModal from './AuthModal';
import CardPreview from './CardPreview';
import { themes } from '../themes';

const sampleData = {
  userType: 'student' as const,
  name: 'Aarya Shrestha',
  title: 'Computer Science · KU',
  bio: 'Building a chatbot that explains code in Nepali. Always down for late-night hackathons.',
  university: 'Kathmandu University',
  educationDegree: 'BE Computer',
  graduationYear: '2027',
  skills: 'React, Python, Figma, AI',
  interests: 'Hackathon teammates · Internships',
  currentEvent: 'KU Hackathon 2026',
  email: 'aarya@ku.edu.np',
  mobile: '+977 9841234567',
  linkedin: 'linkedin.com',
  github: 'github.com',
  location: 'Dhulikhel, Nepal',
};

export default function Landing() {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [activeThemeIdx, setActiveThemeIdx] = useState(0);

  return (
    <div className="relative">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-12 sm:pb-20">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--accent)]" />
              </span>
              <span className="text-[var(--text-muted)]">Live at <span className="text-[var(--accent)] font-semibold">KU Hackathon 2026</span></span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-[2.75rem] leading-[1] sm:text-6xl lg:text-7xl font-semibold tracking-tight font-display"
            >
              <span className="text-[var(--text)]">Your card,</span>
              <br />
              <span className="gradient-text italic">your vibe.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-base sm:text-lg text-[var(--text-muted)] max-w-xl leading-relaxed"
            >
              Build a digital business card that actually feels like you. Pick a theme, share a QR, and grow your network at hackathons, fairs, and beyond.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              {user ? (
                <Link to="/dashboard" className="btn-primary inline-flex items-center justify-center gap-2 !py-3.5">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button onClick={() => setAuthOpen(true)} className="btn-primary inline-flex items-center justify-center gap-2 !py-3.5">
                  Make my card <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <Link to="/d/sample" className="btn-ghost inline-flex items-center justify-center gap-2 !py-3.5">
                <Sparkles className="w-4 h-4" /> See a sample
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="flex items-center gap-5 pt-2 text-xs text-[var(--text-faint)] flex-wrap"
            >
              <span>Free for students</span>
              <span className="w-1 h-1 rounded-full bg-[var(--text-faint)]" />
              <span>No NFC needed</span>
              <span className="w-1 h-1 rounded-full bg-[var(--text-faint)]" />
              <span>{themes.length} themes</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <CardPreview data={sampleData} theme={themes[activeThemeIdx]} />

            <div className="mt-5 mx-auto w-fit flex items-center gap-2 px-3 py-2 glass rounded-full">
              {themes.slice(0, 8).map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setActiveThemeIdx(i)}
                  title={t.name}
                  aria-label={`Try ${t.name} theme`}
                  className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                  style={{
                    background: t.background,
                    border: activeThemeIdx === i ? '2px solid var(--text)' : '2px solid transparent',
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-[var(--text)] mb-3 font-display">Built for the way you actually network</h2>
          <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-sm sm:text-base">QR-first, student-first, and made to feel as good as it looks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: QrCode, title: 'Scan-to-Save', desc: 'Anyone with a phone camera scans your QR and adds you to their contacts in two taps.' },
            { icon: Users, title: 'My Network', desc: "Sign in, scan a friend's card, and they land in your network — perfect for hackathons and career fairs." },
            { icon: Palette, title: 'Themes That Pop', desc: `${themes.length} pre-made vibes from playful pastels to neon cyberpunk. Match your card to your mood.` },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-3xl p-6"
            >
              <div className="w-11 h-11 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-1.5 font-display">{f.title}</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-4 py-10 mt-6 text-center">
        <p className="text-[10px] text-[var(--text-faint)] uppercase tracking-[0.3em]">Made for KU · 2026</p>
      </footer>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
