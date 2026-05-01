import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db } from '../firebase';
import {
  collection, query, where, getDocs, doc,
  updateDoc, serverTimestamp, writeBatch
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import {
  Save, ExternalLink, RefreshCw, AlertCircle, CheckCircle2,
  GraduationCap, Briefcase, User, Link as LinkIcon,
  Image as ImageIcon, Settings2, Eye, EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Onboarding from './Onboarding';
import QRPanel from './QRPanel';
import NetworkPanel from './NetworkPanel';
import TemplatesPanel from './TemplatesPanel';
import CardPreview from './CardPreview';
import ThemePicker from './ThemePicker';
import { getTheme, CardTheme } from '../themes';

type UserType = 'student' | 'professional';

interface CardData {
  id?: string;
  userType: UserType;
  themeId: string;
  name: string;
  title: string;
  bio: string;
  company: string;
  companySub: string;
  university: string;
  education: string;
  educationDegree: string;
  graduationYear: string;
  skills: string;
  interests: string;
  currentEvent: string;
  followUpTemplates: string[];
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
  uid: string;
}

const emptyCard = (uid: string): CardData => ({
  userType: 'student',
  themeId: 'aurora',
  name: '', title: '', bio: '',
  company: '', companySub: '',
  university: '', education: '', educationDegree: '', graduationYear: '',
  skills: '', interests: '', currentEvent: '',
  followUpTemplates: [],
  mobile: '', email: '', website: '', location: '',
  linkedin: '', facebook: '', instagram: '', github: '', xSocial: '',
  photoUrl: '', logoUrl: '',
  slug: '',
  uid,
});

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<CardData>(emptyCard(user?.uid || ''));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const [activeSection, setActiveSection] = useState<'identity' | 'role' | 'links' | 'photos' | 'theme'>('identity');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) fetchCard();
  }, [user]);

  const fetchCard = async () => {
    try {
      const q = query(collection(db, 'cards'), where('uid', '==', user?.uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const cardDoc = snap.docs[0];
        const raw = cardDoc.data() as Partial<CardData>;
        setData({ ...emptyCard(user?.uid || ''), ...raw, id: cardDoc.id });
      } else {
        setData(prev => ({
          ...prev,
          name: user?.displayName || '',
          email: user?.email || '',
          photoUrl: user?.photoURL || '',
          slug: user?.displayName?.toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-') || `user-${user?.uid.slice(0, 5)}`,
          uid: user?.uid || '',
        }));
        setShowOnboarding(true);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSave = async (e: import('react').FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      if (data.id) {
        const cardRef = doc(db, 'cards', data.id);
        await updateDoc(cardRef, { ...data, updatedAt: serverTimestamp() });
        setMessage({ type: 'success', text: '✨ Card updated!' });
      } else {
        const newId = doc(collection(db, 'cards')).id;
        const batch = writeBatch(db);
        batch.set(doc(db, 'usernames', data.slug), { cardId: newId });
        batch.set(doc(db, 'cards', newId), {
          ...data,
          uid: user?.uid,
          id: newId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await batch.commit();
        setData(prev => ({ ...prev, id: newId }));
        setMessage({ type: 'success', text: '🎉 Card created — share your QR!' });
      }
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Failed to save card.' });
    } finally { setSaving(false); }
  };

  const onPickType = (type: UserType) => {
    setData(prev => ({ ...prev, userType: type }));
    setShowOnboarding(false);
  };

  const onPickTheme = (t: CardTheme) => {
    setData(prev => ({
      ...prev, themeId: t.id, accentColor: t.accent, themeColor: '',
      fontHeading: t.fontHeading, fontBody: t.fontBody
    }));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isStudent = data.userType === 'student';
  const TypeIcon = isStudent ? GraduationCap : Briefcase;
  const theme = getTheme(data.themeId);

  const sections = [
    { id: 'identity' as const, label: 'Identity', icon: User },
    { id: 'role' as const, label: isStudent ? 'Academic' : 'Work', icon: TypeIcon },
    { id: 'links' as const, label: 'Links', icon: LinkIcon },
    { id: 'photos' as const, label: 'Photos', icon: ImageIcon },
    { id: 'theme' as const, label: 'Theme', icon: Settings2 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 relative z-10">
      <Onboarding isOpen={showOnboarding} onSelect={onPickType} />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs">
            <TypeIcon className="w-3.5 h-3.5 text-fuchsia-400" />
            <span className="font-semibold text-white">{isStudent ? 'Student Profile' : 'Professional Profile'}</span>
            <button type="button" onClick={() => setShowOnboarding(true)} className="text-white/40 hover:text-white ml-1 underline-offset-2 hover:underline">
              switch
            </button>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: 'Outfit' }}>
            Hey, <span className="gradient-text">{(data.name || user?.displayName || 'there').split(' ')[0]}</span>
          </h2>
          <p className="text-white/50 text-sm max-w-md">
            {isStudent
              ? 'Build your card, pick a vibe, and share your QR at the next event.'
              : 'Refine your profile and prep follow-up templates.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setShowPreviewMobile(p => !p)} className="lg:hidden btn-ghost inline-flex items-center gap-2 !py-2 !px-4 text-xs">
            {showPreviewMobile ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showPreviewMobile ? 'Hide preview' : 'Show preview'}
          </button>
          {data.id && (
            <Link to={`/d/${data.slug}`} className="btn-ghost inline-flex items-center gap-2 !py-2 !px-4 text-xs">
              <ExternalLink className="w-3.5 h-3.5" /> Live card
            </Link>
          )}
        </div>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 p-4 rounded-2xl flex items-center gap-3 backdrop-blur-md border ${
              message.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-100'
                : 'bg-red-500/15 border-red-400/30 text-red-100'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="glass rounded-full p-1.5 flex gap-1 overflow-x-auto no-scrollbar">
            {sections.map(s => (
              <button
                key={s.id} type="button" onClick={() => setActiveSection(s.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeSection === s.id
                    ? 'bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white shadow-lg shadow-fuchsia-500/30'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {activeSection === 'identity' && (
                <Section title="Identity" desc="The basics — what people see first.">
                  <Field label="URL slug" hint="Your card lives at digicardapp.netlify.app/d/[slug]">
                    <input
                      type="text" value={data.slug}
                      onChange={e => setData({ ...data, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-') })}
                      disabled={!!data.id}
                      className="input-glass disabled:opacity-50"
                      placeholder="ram-shrestha" required
                    />
                  </Field>
                  <Field label="Full name">
                    <input type="text" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} className="input-glass" required />
                  </Field>
                  <Field label={isStudent ? 'Headline / field of study' : 'Position / title'}>
                    <input
                      type="text" value={data.title}
                      onChange={e => setData({ ...data, title: e.target.value })}
                      className="input-glass"
                      placeholder={isStudent ? 'CS Undergrad · Aspiring Designer' : 'Product Manager'}
                    />
                  </Field>
                  <Field label="Short bio">
                    <textarea
                      value={data.bio} onChange={e => setData({ ...data, bio: e.target.value })}
                      className="input-glass h-24 resize-none"
                      placeholder={isStudent ? "What you're building, learning, or looking for..." : 'What you do and who you help.'}
                    />
                  </Field>
                  <Field label="Currently at (event mode)" hint="Shows a live banner on your card. Leave blank to hide.">
                    <input
                      type="text" value={data.currentEvent}
                      onChange={e => setData({ ...data, currentEvent: e.target.value })}
                      className="input-glass" placeholder="KU Hackathon 2026"
                    />
                  </Field>
                </Section>
              )}

              {activeSection === 'role' && (
                <Section
                  title={isStudent ? 'Academic' : 'Work'}
                  desc={isStudent ? "Tell people about your studies and what you're looking for." : 'Where you work and what you do.'}
                >
                  {isStudent ? (
                    <>
                      <Field label="University">
                        <input type="text" value={data.university} onChange={e => setData({ ...data, university: e.target.value })} className="input-glass" placeholder="Kathmandu University" />
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Degree / programme">
                          <input type="text" value={data.educationDegree} onChange={e => setData({ ...data, educationDegree: e.target.value })} className="input-glass" placeholder="BE Computer" />
                        </Field>
                        <Field label="Graduation year">
                          <input type="text" value={data.graduationYear} onChange={e => setData({ ...data, graduationYear: e.target.value })} className="input-glass" placeholder="2027" />
                        </Field>
                      </div>
                      <Field label="Skills (comma separated)">
                        <input type="text" value={data.skills} onChange={e => setData({ ...data, skills: e.target.value })} className="input-glass" placeholder="React, Figma, Python" />
                      </Field>
                      <Field label="Looking for">
                        <input type="text" value={data.interests} onChange={e => setData({ ...data, interests: e.target.value })} className="input-glass" placeholder="Hackathon team · internship · study group" />
                      </Field>
                      <Field label="City">
                        <input type="text" value={data.location} onChange={e => setData({ ...data, location: e.target.value })} className="input-glass" placeholder="Dhulikhel, Nepal" />
                      </Field>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Company">
                          <input type="text" value={data.company} onChange={e => setData({ ...data, company: e.target.value })} className="input-glass" />
                        </Field>
                        <Field label="Department / sub">
                          <input type="text" value={data.companySub} onChange={e => setData({ ...data, companySub: e.target.value })} className="input-glass" />
                        </Field>
                      </div>
                      <Field label="Skills / specialties">
                        <input type="text" value={data.skills} onChange={e => setData({ ...data, skills: e.target.value })} className="input-glass" placeholder="Strategy, Sales, Ops" />
                      </Field>
                      <Field label="City / country">
                        <input type="text" value={data.location} onChange={e => setData({ ...data, location: e.target.value })} className="input-glass" placeholder="Kathmandu, Nepal" />
                      </Field>
                    </>
                  )}
                </Section>
              )}

              {activeSection === 'links' && (
                <Section title="Links" desc="Where people can reach you.">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Mobile"><input type="tel" value={data.mobile} onChange={e => setData({ ...data, mobile: e.target.value })} className="input-glass" placeholder="+977 …" /></Field>
                    <Field label="Email"><input type="email" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} className="input-glass" /></Field>
                    <Field label="Website"><input type="text" value={data.website} onChange={e => setData({ ...data, website: e.target.value })} className="input-glass" placeholder="yourname.dev" /></Field>
                    <Field label="LinkedIn"><input type="text" value={data.linkedin} onChange={e => setData({ ...data, linkedin: e.target.value })} className="input-glass" placeholder="linkedin.com/in/…" /></Field>
                    <Field label="GitHub"><input type="text" value={data.github} onChange={e => setData({ ...data, github: e.target.value })} className="input-glass" placeholder="github.com/…" /></Field>
                    <Field label="Instagram"><input type="text" value={data.instagram} onChange={e => setData({ ...data, instagram: e.target.value })} className="input-glass" /></Field>
                    <Field label="X (Twitter)"><input type="text" value={data.xSocial} onChange={e => setData({ ...data, xSocial: e.target.value })} className="input-glass" /></Field>
                    <Field label="Facebook"><input type="text" value={data.facebook} onChange={e => setData({ ...data, facebook: e.target.value })} className="input-glass" /></Field>
                  </div>
                </Section>
              )}

              {activeSection === 'photos' && (
                <Section title="Photos" desc="A profile photo and an org/uni logo.">
                  <Field label="Profile photo URL">
                    <input type="text" value={data.photoUrl} onChange={e => setData({ ...data, photoUrl: e.target.value })} className="input-glass" placeholder="https://…" />
                  </Field>
                  <Field label={isStudent ? 'University logo URL' : 'Organisation logo URL'}>
                    <input type="text" value={data.logoUrl} onChange={e => setData({ ...data, logoUrl: e.target.value })} className="input-glass" placeholder="https://…" />
                  </Field>
                  <p className="text-xs text-white/40">💡 Tip: paste a URL from imgur, GitHub avatars, or any public image host.</p>
                </Section>
              )}

              {activeSection === 'theme' && (
                <ThemePicker selectedId={data.themeId} onSelect={onPickTheme} />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="sticky bottom-4 flex justify-center pt-2 z-20">
            <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2.5 px-8 py-4 text-sm shadow-2xl shadow-fuchsia-500/40">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {data.id ? 'Save changes' : 'Create card'}
            </button>
          </div>

          {data.id && (
            <div className="space-y-6 pt-4">
              <QRPanel slug={data.slug} accentColor={theme.accent} />
              <NetworkPanel uid={user?.uid || ''} />
              {!isStudent && (
                <TemplatesPanel
                  templates={data.followUpTemplates}
                  onChange={tpls => setData({ ...data, followUpTemplates: tpls })}
                />
              )}
            </div>
          )}
        </form>

        <aside className={`${showPreviewMobile ? 'block' : 'hidden'} lg:block`}>
          <div className="lg:sticky lg:top-24">
            <div className="text-xs uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
              <span>Live preview</span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <CardPreview data={data} theme={theme} />
            <div className="mt-4 text-center">
              <span className="text-[10px] uppercase tracking-widest text-white/30">{theme.emoji} {theme.name} · {theme.vibe}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc?: string; children: import('react').ReactNode }) {
  return (
    <div className="glass rounded-3xl p-6 sm:p-7 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Outfit' }}>{title}</h3>
        {desc && <p className="text-xs text-white/50 mt-0.5">{desc}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: import('react').ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-white/70">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-white/40">{hint}</p>}
    </div>
  );
}
