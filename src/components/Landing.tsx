import { useAuth } from '../App';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, QrCode, Users, Palette, Zap, Heart } from 'lucide-react';
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
    <div className="relative overflow-hidden">
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
          <div className="space-y-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500" />
              </span>
              <span className="text-white/80">Live at <span className="text-fuchsia-400 font-semibold">KU Hackathon 2026</span></span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight"
              style={{ fontFamily: 'Outfit' }}
            >
              <span className="text-white">Your card,</span>
              <br />
              <span className="gradient-text">your vibe.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white/60 max-w-xl leading-relaxed"
            >
              Build a digital business card that actually feels like you. Pick a theme, share a QR, and grow your network at hackathons, fairs, and beyond.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              {user ? (
                <Link to="/dashboard" className="btn-primary inline-flex items-center justify-center gap-2">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button onClick={() => setAuthOpen(true)} className="btn-primary inline-flex items-center justify-center gap-2">
                  Make My Card <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <Link to="/d/sample" className="btn-ghost inline-flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" /> See a sample
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-6 pt-4 text-xs text-white/50 flex-wrap"
            >
              <div className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-pink-400" /> Free for students</div>
              <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-yellow-400" /> No NFC needed</div>
              <div className="flex items-center gap-1.5"><Palette className="w-3.5 h-3.5 text-purple-400" /> {themes.length} themes</div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: 'spring' }}
            className="relative"
          >
            <div className="float">
              <CardPreview data={sampleData} theme={themes[activeThemeIdx]} />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 glass-strong rounded-full"
            >
              {themes.slice(0, 8).map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setActiveThemeIdx(i)}
                  title={t.name}
                  className="w-5 h-5 rounded-full transition-transform hover:scale-125"
                  style={{
                    background: t.background,
                    border: activeThemeIdx === i ? '2px solid white' : '2px solid transparent',
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: 'Outfit' }}>Built for the way you actually network</h2>
          <p className="text-white/50 max-w-2xl mx-auto">QR-first, student-first, and made to feel as good as it looks.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: QrCode, title: 'Scan-to-Save', desc: 'Anyone with a phone camera scans your QR and adds you to their contacts in two taps.', color: 'from-fuchsia-500 to-pink-500' },
            { icon: Users, title: 'My Network', desc: "Sign in, scan a friend's card, and they land in your network — perfect for hackathons and career fairs.", color: 'from-blue-500 to-cyan-400' },
            { icon: Palette, title: 'Themes That Pop', desc: `${themes.length} pre-made vibes from playful pastels to neon cyberpunk. Match your card to your mood.`, color: 'from-amber-400 to-orange-500' },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="glass rounded-3xl p-7 transition-all"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit' }}>{f.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="relative max-w-7xl mx-auto px-4 py-12 mt-12 text-center">
        <p className="text-xs text-white/30 uppercase tracking-[0.3em]">Made with 💜 for KU · 2026</p>
      </footer>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
