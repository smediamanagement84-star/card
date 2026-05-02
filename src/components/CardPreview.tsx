import { motion } from 'motion/react';
import { Phone, Mail, Globe, MapPin, Sparkles, GraduationCap, Briefcase } from 'lucide-react';
import { CardTheme } from '../themes';
import { safeImageSrc } from '../utils/sanitize';

export interface CardPreviewData {
  userType?: 'student' | 'professional';
  name?: string;
  title?: string;
  bio?: string;
  company?: string;
  university?: string;
  educationDegree?: string;
  graduationYear?: string;
  skills?: string;
  interests?: string;
  currentEvent?: string;
  mobile?: string;
  email?: string;
  website?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
  xSocial?: string;
  facebook?: string;
  photoUrl?: string;
  logoUrl?: string;
}

interface Props {
  data: CardPreviewData;
  theme: CardTheme;
  scale?: number;
  showShadow?: boolean;
}

export default function CardPreview({ data, theme, scale = 1, showShadow = true }: Props) {
  const isStudent = data.userType === 'student';
  const TypeIcon = isStudent ? GraduationCap : Briefcase;

  const initials = (data.name || 'YN')
    .split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();

  const skillList = (data.skills || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 6);
  const orgName = isStudent ? data.university : data.company;

  return (
    <div className="relative w-full max-w-[420px] mx-auto" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
      {data.currentEvent && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold backdrop-blur-md mx-auto w-fit left-1/2 -translate-x-1/2 relative"
          style={{ background: theme.accentSoft, color: theme.accent, border: `1px solid ${theme.accent}40` }}
        >
          <Sparkles className="w-3 h-3" /> Live at {data.currentEvent}
        </motion.div>
      )}

      <motion.div
        className="relative rounded-3xl overflow-hidden"
        style={{ background: theme.background, boxShadow: showShadow ? theme.shadow : 'none', fontFamily: theme.fontBody }}
      >
        {theme.pattern === 'dots' && <div className="absolute inset-0 pattern-dots" style={{ color: theme.text }} />}
        {theme.pattern === 'grid' && <div className="absolute inset-0 pattern-grid" style={{ color: theme.accent }} />}
        {theme.pattern === 'mesh' && <div className="absolute inset-0 pattern-mesh" />}

        <div
          className="relative m-3 p-6 rounded-2xl"
          style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.text }}
        >
          <div className="flex items-center justify-between mb-5">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
              style={{ background: theme.accentSoft, color: theme.accent }}
            >
              <TypeIcon className="w-3 h-3" />
              {isStudent ? 'Student' : 'Professional'}
            </div>
            {safeImageSrc(data.logoUrl) && (
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                <img src={safeImageSrc(data.logoUrl)} alt="" className="w-full h-full object-contain" />
              </div>
            )}
          </div>

          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden font-bold text-xl"
              style={{
                background: data.photoUrl ? 'transparent' : theme.accentSoft,
                border: `2px solid ${theme.accent}`,
              }}
            >
              {safeImageSrc(data.photoUrl)
                ? <img src={safeImageSrc(data.photoUrl)} alt={data.name} className="w-full h-full object-cover" />
                : <span style={{ color: theme.text }}>{initials}</span>}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold leading-tight truncate" style={{ fontFamily: theme.fontHeading, color: theme.text }}>
                {data.name || 'Your Name'}
              </h2>
              {data.title && <div className="text-sm font-medium mt-0.5 truncate" style={{ color: theme.textMuted }}>{data.title}</div>}
              {orgName && (
                <div className="text-xs mt-1 truncate" style={{ color: theme.textMuted }}>
                  {[orgName, data.educationDegree, data.graduationYear].filter(Boolean).join(' · ')}
                </div>
              )}
            </div>
          </div>

          {data.bio && <p className="text-[13px] leading-relaxed mb-4 italic" style={{ color: theme.textMuted }}>"{data.bio}"</p>}

          {data.interests && (
            <div className="mb-4 px-3 py-2 rounded-xl text-xs" style={{ background: theme.accentSoft, color: theme.accent, border: `1px solid ${theme.accent}30` }}>
              <span className="font-bold">Looking for:</span> <span style={{ color: theme.text }}>{data.interests}</span>
            </div>
          )}

          {skillList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {skillList.map((s, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
                  style={{ background: theme.accentSoft, color: theme.accent, border: `1px solid ${theme.accent}30` }}>
                  {s}
                </span>
              ))}
            </div>
          )}

          <div className="space-y-2 mb-4">
            {data.mobile && <ContactRow icon={Phone} label={data.mobile} theme={theme} />}
            {data.email && <ContactRow icon={Mail} label={data.email} theme={theme} />}
            {data.website && <ContactRow icon={Globe} label={data.website} theme={theme} />}
            {data.location && <ContactRow icon={MapPin} label={data.location} theme={theme} />}
          </div>

          {(data.linkedin || data.github || data.instagram || data.xSocial || data.facebook) && (
            <div className="flex flex-wrap gap-1.5 pt-3" style={{ borderTop: `1px solid ${theme.accent}20` }}>
              {data.linkedin && <SocialChip label="LinkedIn" theme={theme} />}
              {data.github && <SocialChip label="GitHub" theme={theme} />}
              {data.instagram && <SocialChip label="Instagram" theme={theme} />}
              {data.xSocial && <SocialChip label="X" theme={theme} />}
              {data.facebook && <SocialChip label="Facebook" theme={theme} />}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ContactRow({ icon: Icon, label, theme }: { icon: any; label: string; theme: CardTheme }) {
  return (
    <div className="flex items-center gap-2.5 text-[12px]" style={{ color: theme.text }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: theme.accentSoft, color: theme.accent }}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <span className="truncate" style={{ color: theme.textMuted }}>{label}</span>
    </div>
  );
}

function SocialChip({ label, theme }: { label: string; theme: CardTheme }) {
  return (
    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
      style={{ background: theme.accentSoft, color: theme.accent, border: `1px solid ${theme.accent}30` }}>
      {label}
    </span>
  );
}
