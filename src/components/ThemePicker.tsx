import { motion } from 'motion/react';
import { Check, Palette } from 'lucide-react';
import { themes, CardTheme } from '../themes';

interface Props {
  selectedId?: string;
  onSelect: (theme: CardTheme) => void;
}

export default function ThemePicker({ selectedId, onSelect }: Props) {
  return (
    <section className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center">
            <Palette className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Pick your vibe</h3>
            <p className="text-xs text-white/50">Each theme is its own personality.</p>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-white/40">{themes.length} themes</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {themes.map((t, i) => {
          const isActive = selectedId === t.id;
          return (
            <motion.button
              key={t.id}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(t)}
              className="relative group rounded-2xl overflow-hidden text-left transition-all"
              style={{
                background: t.background,
                boxShadow: isActive ? `0 0 0 3px white, 0 0 0 5px ${t.accent}` : '0 8px 20px -8px rgba(0,0,0,0.4)',
                minHeight: '110px',
              }}
            >
              {t.pattern === 'mesh' && <div className="absolute inset-0 pattern-mesh" />}
              {t.pattern === 'dots' && <div className="absolute inset-0 pattern-dots" style={{ color: t.text }} />}
              {t.pattern === 'grid' && <div className="absolute inset-0 pattern-grid" style={{ color: t.accent }} />}

              <div className="relative p-3 flex flex-col h-full justify-between" style={{ color: t.text }}>
                <div className="text-2xl">{t.emoji}</div>
                <div>
                  <div className="text-sm font-bold" style={{ fontFamily: t.fontHeading }}>{t.name}</div>
                  <div className="text-[10px] opacity-80">{t.vibe}</div>
                </div>

                {isActive && (
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center"
                  >
                    <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
