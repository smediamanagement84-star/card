import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Share2,
  Download,
  QrCode
} from 'lucide-react';

interface CardData {
  name: string;
  title: string;
  bio: string;
  company: string;
  companySub: string;
  education: string;
  educationDegree: string;
  graduationYear: string;
  skills: string;
  mobile: string;
  email: string;
  website: string;
  location: string;
  linkedin: string;
  facebook: string;
  instagram: string;
  github: string;
  xSocial: string;
  photoUrl: string;
  logoUrl: string;
  themeColor?: string;
  accentColor?: string;
  fontHeading?: string;
  fontBody?: string;
  slug: string;
}

export default function CardView() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetchCard();
  }, [slug]);

  const fetchCard = async () => {
    setLoading(true);
    setData(null);
    if (slug === 'sample') {
      setData({
        name: 'Sakar Sharma',
        title: 'Business Development Head',
        bio: 'Driving growth through strategic partnerships and innovative education consultancy solutions.',
        company: 'Aspire Career Education',
        companySub: 'Nepal Operations',
        education: 'University of Kathmandu',
        educationDegree: 'BSc Business Administration',
        graduationYear: '2020',
        skills: 'Strategic Planning, CRM, Business Analysis',
        mobile: '+977 984-336-7435',
        email: 'sakar@aspire.com.np',
        website: 'aspire.com.np',
        location: 'Kathmandu, Nepal',
        linkedin: 'https://linkedin.com',
        facebook: 'https://facebook.com',
        instagram: '',
        github: '',
        xSocial: '',
        photoUrl: '',
        logoUrl: '',
        themeColor: '#0A0A0A',
        accentColor: '#C9A84C',
        fontHeading: 'Cormorant Garamond',
        fontBody: 'Montserrat',
        slug: 'sample'
      });
      setLoading(false);
      return;
    }

    try {
      // First try to look up via usernames collection (slug as ID)
      const usernameRef = doc(db, 'usernames', slug || '');
      const usernameSnap = await getDoc(usernameRef);
      
      if (usernameSnap.exists()) {
        const cardId = usernameSnap.data().cardId;
        const cardRef = doc(db, 'cards', cardId);
        const cardSnap = await getDoc(cardRef);
        if (cardSnap.exists()) {
          setData(cardSnap.data() as CardData);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const formatUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  const shareCard = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${data?.name} ${data?.company ? '— ' + data?.company : ''}`,
        text: `Connect with ${data?.name}${data?.title ? ', ' + data?.title : ''}${data?.company ? ' at ' + data?.company : ''}.`,
        url
      });
    } else {
      navigator.clipboard.writeText(url).then(() => showToastMsg('Link copied to clipboard!'));
    }
  };

  const getVCard = () => {
    if (!data) return '';
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${data.name}`,
    ];
    if (data.title) lines.push(`TITLE:${data.title}`);
    if (data.company) lines.push(`ORG:${data.company}`);
    if (data.mobile) lines.push(`TEL:${data.mobile}`);
    if (data.email) lines.push(`EMAIL:${data.email}`);
    if (data.website) lines.push(`URL:${formatUrl(data.website)}`);
    if (data.location) lines.push(`ADR:;;${data.location}`);
    lines.push('END:VCARD');
    return lines.join('\r\n');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!data) return (
    <div className="text-center py-20 px-4">
      <h2 className="text-3xl font-serif text-[#F0EAD6] mb-4">Profile Not Found</h2>
      <p className="text-[#7A7870]">The digital card you are looking for does not exist or has been moved.</p>
    </div>
  );

  const fontVarMap: Record<string, string> = {
    'Cormorant Garamond': '--font-serif',
    'Playfair Display': '--font-playfair',
    'Montserrat': '--font-sans',
    'Outfit': '--font-outfit',
    'Space Grotesk': '--font-space',
    'Inter': '--font-inter',
  };

  const themeStyle = {
    '--theme-bg': data.themeColor || '#0A0A0A',
    '--accent': data.accentColor || '#C9A84C',
    '--font-h': `var(${fontVarMap[data.fontHeading || ''] || '--font-serif'})`,
    '--font-b': `var(${fontVarMap[data.fontBody || ''] || '--font-sans'})`,
  } as React.CSSProperties;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 min-h-[calc(100vh-64px)] transition-colors duration-700" style={{ ...themeStyle, backgroundColor: 'var(--theme-bg)', fontFamily: 'var(--font-b)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px]"
      >
        <div className="relative bg-[#111111] border border-[#2E2510] rounded-sm overflow-hidden shadow-2xl" style={{ borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}>
          {/* Decorative Gold Bars */}
          <div className="h-[2px]" style={{ background: `linear-gradient(to right, transparent, var(--accent), transparent)` }} />
          
          {/* Corner Ornaments */}
          <div className="absolute top-2 left-2 w-8 h-8 z-10 pointer-events-none opacity-60">
            <svg viewBox="0 0 32 32" fill="none"><path d="M2 16V2h14" stroke="currentColor" strokeWidth="1" fill="none" style={{ color: 'var(--accent)' }}/><circle cx="2" cy="2" r="1.5" fill="currentColor" style={{ color: 'var(--accent)' }}/></svg>
          </div>
          <div className="absolute top-2 right-2 w-8 h-8 z-10 pointer-events-none opacity-60 rotate-90">
            <svg viewBox="0 0 32 32" fill="none"><path d="M2 16V2h14" stroke="currentColor" strokeWidth="1" fill="none" style={{ color: 'var(--accent)' }}/><circle cx="2" cy="2" r="1.5" fill="currentColor" style={{ color: 'var(--accent)' }}/></svg>
          </div>

          <div className="p-8 sm:p-10 relative z-0">
            {/* Header */}
            <div className="flex gap-5 items-start mb-8">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-full p-[2px] animate-pulse-subtle" style={{ background: `linear-gradient(to bottom right, var(--accent), #fff, var(--accent))` }}>
                  <div className="w-full h-full rounded-full bg-[#1A1A1A] flex items-center justify-center overflow-hidden border border-[#0A0A0A]">
                    {data.photoUrl ? (
                      <img src={data.photoUrl} alt={data.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-light tracking-widest" style={{ color: 'var(--accent)', fontFamily: 'var(--font-h)' }}>
                        {data.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 pt-1">
                <div className="text-[7px] uppercase tracking-[0.4em] mb-2" style={{ color: 'var(--accent)' }}>Profile Card</div>
                <h1 className="text-3xl font-light text-[#F0EAD6] leading-none mb-2" style={{ fontFamily: 'var(--font-h)' }}>
                  <span className="italic mr-1">{data.name.split(' ')[0]}</span>
                  {data.name.split(' ').slice(1).join(' ')}
                </h1>
                {data.title && (
                  <div className="text-[8px] uppercase tracking-[0.3em] text-[#7A7870] font-medium leading-relaxed">
                    {data.title}
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6 opacity-30">
              <div className="flex-1 h-[1px]" style={{ background: `linear-gradient(to right, var(--accent), transparent)` }} />
              <div className="w-1.5 h-1.5 rotate-45 shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
              <div className="flex-1 h-[1px]" style={{ background: `linear-gradient(to left, var(--accent), transparent)` }} />
            </div>

            {/* Bio */}
            {data.bio && (
              <p className="text-[11px] text-[#7A7870] font-light leading-relaxed mb-6 italic border-l border-[#2A2010] pl-3">
                "{data.bio}"
              </p>
            )}

            {/* Education / Organisation */}
            {(data.company || data.logoUrl || data.education) && (
              <div className="flex items-center gap-4 bg-[#1A1A1A] border border-[#252010] border-l-2 p-4 mb-6 rounded-sm" style={{ borderLeftColor: 'var(--accent)' }}>
                <div className="w-11 h-11 bg-[#222222] border border-dashed border-[#3A3020] rounded-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {data.logoUrl ? (
                     <img src={data.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-[6px] uppercase tracking-widest text-[#7A7870] text-center">Org /<br/>Uni</div>
                  )}
                </div>
                <div>
                  <div className="text-[7px] uppercase tracking-[0.3em] mb-0.5" style={{ color: 'var(--accent)' }}>Focus / Education</div>
                  <div className="text-lg text-[#F0EAD6] leading-tight" style={{ fontFamily: 'var(--font-h)' }}>
                    {data.company || data.education || 'Private'}
                  </div>
                  {(data.educationDegree || data.companySub) && (
                    <div className="text-[8px] uppercase tracking-[0.2em] text-[#7A7870] mt-1">
                      {data.educationDegree || data.companySub} {data.graduationYear ? `· ${data.graduationYear}` : ''}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Skills */}
            {data.skills && (
              <div className="mb-6">
                <div className="text-[7px] uppercase tracking-[0.3em] mb-2" style={{ color: 'var(--accent)' }}>Core Skills</div>
                <div className="flex flex-wrap gap-2">
                  {data.skills.split(',').map((skill, i) => (
                    <span key={i} className="text-[9px] text-[#F0EAD6] bg-[#1A1A1A] px-2 py-1 rounded-sm border border-[#2A2010]">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { icon: Phone, label: 'Mobile', value: data.mobile, href: `tel:${data.mobile}`, show: !!data.mobile },
                { icon: Mail, label: 'Email', value: data.email, href: `mailto:${data.email}`, show: !!data.email },
                { icon: Globe, label: 'Portfolio', value: data.website, href: formatUrl(data.website), show: !!data.website },
                { icon: MapPin, label: 'Location', value: data.location, href: `https://maps.google.com/?q=${data.location}`, show: !!data.location }
              ].filter(i => i.show).map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start group">
                  <div className="w-7 h-7 rounded-full border border-[#2A2010] flex items-center justify-center shrink-0 group-hover:border-[var(--accent)] transition-colors">
                    <item.icon className="w-3 h-3" style={{ color: 'var(--accent)' }} />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[7px] uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--accent)' }}>{item.label}</div>
                    <a href={item.href} target="_blank" rel="noreferrer" className="text-[10px] text-[#F0EAD6] font-light leading-snug block truncate transition-colors hover:text-[var(--accent)]">
                      {item.value}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Bar */}
            <div className="pt-5 border-t border-[#1E1A0D] flex items-center justify-between">
              <div className="flex flex-wrap gap-2 max-w-[70%]">
                {data.linkedin && (
                  <a href={formatUrl(data.linkedin)} target="_blank" rel="noreferrer" className="text-[7px] uppercase tracking-[0.2em] text-[#7A7870] border border-[#2A2010] rounded-full px-3 py-1.5 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
                    LinkedIn
                  </a>
                )}
                {data.github && (
                  <a href={formatUrl(data.github)} target="_blank" rel="noreferrer" className="text-[7px] uppercase tracking-[0.2em] text-[#7A7870] border border-[#2A2010] rounded-full px-3 py-1.5 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
                    GitHub
                  </a>
                )}
                {data.instagram && (
                  <a href={formatUrl(data.instagram)} target="_blank" rel="noreferrer" className="text-[7px] uppercase tracking-[0.2em] text-[#7A7870] border border-[#2A2010] rounded-full px-3 py-1.5 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
                    Instagram
                  </a>
                )}
                {data.xSocial && (
                  <a href={formatUrl(data.xSocial)} target="_blank" rel="noreferrer" className="text-[7px] uppercase tracking-[0.2em] text-[#7A7870] border border-[#2A2010] rounded-full px-3 py-1.5 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
                    X
                  </a>
                )}
                {data.facebook && (
                  <a href={formatUrl(data.facebook)} target="_blank" rel="noreferrer" className="text-[7px] uppercase tracking-[0.2em] text-[#7A7870] border border-[#2A2010] rounded-full px-3 py-1.5 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
                    Facebook
                  </a>
                )}
              </div>
              
              <button 
                onClick={() => setShowQR(!showQR)}
                className="flex items-center gap-2 group"
              >
                <div className="text-[7px] uppercase tracking-[0.3em] hidden sm:block" style={{ color: 'var(--accent)' }}>Scan Profile</div>
                <div className="w-8 h-8 rounded-sm border border-[#3A3020] flex items-center justify-center group-hover:border-[var(--accent)] transition-colors">
                  <QrCode className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                </div>
              </button>
            </div>

            {/* QR Expandable */}
            <AnimatePresence>
              {showQR && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col items-center gap-4 pt-8">
                    <div className="bg-white p-3 rounded shadow-inner border-2" style={{ borderColor: 'var(--accent)' }}>
                      <QRCodeSVG 
                        value={window.location.href} 
                        size={160} 
                        level="H" 
                      />
                    </div>
                    <div className="text-[8px] uppercase tracking-[0.3em] text-[#7A7870] text-center">Scan to open digital profile on your phone</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-[2px] opacity-60" style={{ background: `linear-gradient(to right, transparent, var(--accent), transparent)` }} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <button 
            onClick={shareCard}
            className="px-6 py-3 rounded text-[9px] uppercase tracking-[0.3em] border border-[#3A3020] hover:border-[var(--accent)] transition-all flex items-center gap-2" style={{ color: 'var(--accent)' }}
          >
            <Share2 className="w-3 h-3" />
            Share Profile
          </button>
          
          <a 
            href={`data:text/vcard;charset=utf-8,${encodeURIComponent(getVCard())}`}
            download={`${data.name.replace(/\s+/g, '_')}.vcf`}
            className="px-8 py-3 rounded text-[9px] uppercase tracking-[0.3em] font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-lg" style={{ backgroundColor: 'var(--accent)', color: 'var(--theme-bg)' }}
          >
            <Download className="w-3 h-3" />
            Save Contact
          </a>
        </div>
      </motion.div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-10 left-1/2 p-3 bg-[#1A1A1A] border border-[#C9A84C] text-[#C9A84C] text-[9px] uppercase tracking-widest rounded shadow-2xl z-[100]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
