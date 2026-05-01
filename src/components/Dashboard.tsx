import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { motion } from 'motion/react';
import { Save, ExternalLink, RefreshCw, AlertCircle, CheckCircle2, GraduationCap, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import Onboarding from './Onboarding';
import QRPanel from './QRPanel';
import NetworkPanel from './NetworkPanel';
import TemplatesPanel from './TemplatesPanel';

type UserType = 'student' | 'professional';

interface CardData {
  id?: string;
  userType: UserType;
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
  name: '',
  title: '',
  bio: '',
  company: '',
  companySub: '',
  university: '',
  education: '',
  educationDegree: '',
  graduationYear: '',
  skills: '',
  interests: '',
  currentEvent: '',
  followUpTemplates: [],
  mobile: '',
  email: '',
  website: '',
  location: '',
  linkedin: '',
  facebook: '',
  instagram: '',
  github: '',
  xSocial: '',
  photoUrl: '',
  logoUrl: '',
  themeColor: '#0A0A0A',
  accentColor: '#C9A84C',
  fontHeading: 'Cormorant Garamond',
  fontBody: 'Montserrat',
  slug: '',
  uid,
});

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<CardData>(emptyCard(user?.uid || ''));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: import('react').FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (data.id) {
        const cardRef = doc(db, 'cards', data.id);
        await updateDoc(cardRef, { ...data, updatedAt: serverTimestamp() });
        setMessage({ type: 'success', text: 'Card updated successfully!' });
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
        setMessage({ type: 'success', text: 'Card created — share your QR!' });
      }
    } catch (err: any) {
      console.error('Save Error:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to save card.' });
    } finally {
      setSaving(false);
    }
  };

  const onPickType = (type: UserType) => {
    setData(prev => ({ ...prev, userType: type }));
    setShowOnboarding(false);
  };

  const inputCls = "w-full bg-[#0A0A0A] border border-[#2A2010] p-3 rounded text-sm focus:border-[#C9A84C] outline-none transition-colors";
  const labelCls = "text-[10px] uppercase tracking-[0.1em] text-[#7A7870]";

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isStudent = data.userType === 'student';
  const TypeIcon = isStudent ? GraduationCap : Briefcase;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Onboarding isOpen={showOnboarding} onSelect={onPickType} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/5">
            <TypeIcon className="w-3 h-3 text-[#C9A84C]" />
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#C9A84C]">{isStudent ? 'Student Profile' : 'Professional Profile'}</span>
            <button
              type="button"
              onClick={() => setShowOnboarding(true)}
              className="text-[9px] uppercase tracking-wider text-[#7A7870] hover:text-[#C9A84C] ml-1"
            >
              switch
            </button>
          </div>
          <h2 className="text-3xl font-serif text-[#F0EAD6]">{isStudent ? 'Your Student Card' : 'Your Executive Profile'}</h2>
          <p className="text-[#7A7870] font-light text-sm">
            {isStudent
              ? 'Build your card, share your QR, and grow your network at events.'
              : 'Customise your identity and prepare follow-up templates.'}
          </p>
        </div>

        {data.id && (
          <Link
            to={`/d/${data.slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded border border-[#3A3020] text-[#C9A84C] text-[10px] uppercase tracking-[0.2em] hover:border-[#C9A84C] transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            View Live Card
          </Link>
        )}
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 p-4 rounded flex items-center gap-3 border ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/50 text-green-200'
              : 'bg-red-500/10 border-red-500/50 text-red-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{message.text}</span>
        </motion.div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identity */}
        <section className="space-y-6 bg-[#111111] p-8 rounded-lg border border-[#1A1A1A]">
          <h3 className="text-[#C9A84C] text-xs uppercase tracking-[0.3em] pb-2 border-b border-[#2A2010]">Identity</h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className={labelCls}>Slug (URL Identifier)</label>
              <input
                type="text"
                value={data.slug}
                onChange={e => setData({ ...data, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-') })}
                disabled={!!data.id}
                className={inputCls + " disabled:opacity-50"}
                placeholder="e.g. ram-shrestha"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Full Name</label>
              <input type="text" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} className={inputCls} required />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>{isStudent ? 'Field of Study / Headline' : 'Position / Title'}</label>
              <input
                type="text"
                value={data.title}
                onChange={e => setData({ ...data, title: e.target.value })}
                className={inputCls}
                placeholder={isStudent ? 'e.g. CS Undergrad, Aspiring Designer' : 'e.g. Product Manager'}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Short Bio (Optional)</label>
              <textarea
                value={data.bio}
                onChange={e => setData({ ...data, bio: e.target.value })}
                className={inputCls + " h-24 resize-none"}
                placeholder={isStudent ? 'What you\'re building, learning, or looking for…' : 'What you do and who you help.'}
              />
            </div>
            {isStudent && (
              <div className="space-y-1.5">
                <label className={labelCls}>Currently at (Event Mode)</label>
                <input
                  type="text"
                  value={data.currentEvent}
                  onChange={e => setData({ ...data, currentEvent: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. KU Hackathon 2026"
                />
                <p className="text-[9px] text-[#3A3020] tracking-wider">Shows as a banner on your card. Leave blank to hide.</p>
              </div>
            )}
          </div>
        </section>

        {/* Type-specific section */}
        <section className="space-y-6 bg-[#111111] p-8 rounded-lg border border-[#1A1A1A]">
          <h3 className="text-[#C9A84C] text-xs uppercase tracking-[0.3em] pb-2 border-b border-[#2A2010]">
            {isStudent ? 'Academic' : 'Professional'}
          </h3>

          {isStudent ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className={labelCls}>University</label>
                <input
                  type="text"
                  value={data.university}
                  onChange={e => setData({ ...data, university: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. Kathmandu University"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelCls}>Degree / Programme</label>
                  <input
                    type="text"
                    value={data.educationDegree}
                    onChange={e => setData({ ...data, educationDegree: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. BE Computer"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Graduation Year</label>
                  <input
                    type="text"
                    value={data.graduationYear}
                    onChange={e => setData({ ...data, graduationYear: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. 2027"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Skills (comma separated)</label>
                <input
                  type="text"
                  value={data.skills}
                  onChange={e => setData({ ...data, skills: e.target.value })}
                  className={inputCls}
                  placeholder="React, Figma, Python"
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Interests / Looking for</label>
                <input
                  type="text"
                  value={data.interests}
                  onChange={e => setData({ ...data, interests: e.target.value })}
                  className={inputCls}
                  placeholder="Hackathon team, internship, study group…"
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>City</label>
                <input
                  type="text"
                  value={data.location}
                  onChange={e => setData({ ...data, location: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. Dhulikhel, Nepal"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelCls}>Company</label>
                  <input type="text" value={data.company} onChange={e => setData({ ...data, company: e.target.value })} className={inputCls} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Department / Sub</label>
                  <input type="text" value={data.companySub} onChange={e => setData({ ...data, companySub: e.target.value })} className={inputCls} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Skills / Specialties</label>
                <input type="text" value={data.skills} onChange={e => setData({ ...data, skills: e.target.value })} className={inputCls} placeholder="Strategy, Sales, Ops" />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>City / Country</label>
                <input type="text" value={data.location} onChange={e => setData({ ...data, location: e.target.value })} className={inputCls} placeholder="e.g. Kathmandu, Nepal" />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Currently at (Event Mode)</label>
                <input
                  type="text"
                  value={data.currentEvent}
                  onChange={e => setData({ ...data, currentEvent: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. Tech Summit Kathmandu"
                />
              </div>
            </div>
          )}
        </section>

        {/* Connectivity */}
        <section className="space-y-6 bg-[#111111] p-8 rounded-lg border border-[#1A1A1A] md:col-span-2">
          <h3 className="text-[#C9A84C] text-xs uppercase tracking-[0.3em] pb-2 border-b border-[#2A2010]">Connectivity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelCls}>Mobile Number</label>
              <input type="tel" value={data.mobile} onChange={e => setData({ ...data, mobile: e.target.value })} className={inputCls} placeholder="+977 …" />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Email</label>
              <input type="email" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Website / Portfolio</label>
              <input type="text" value={data.website} onChange={e => setData({ ...data, website: e.target.value })} className={inputCls} placeholder="yourname.dev" />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>LinkedIn</label>
              <input type="text" value={data.linkedin} onChange={e => setData({ ...data, linkedin: e.target.value })} className={inputCls} placeholder="linkedin.com/in/…" />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>GitHub</label>
              <input type="text" value={data.github} onChange={e => setData({ ...data, github: e.target.value })} className={inputCls} placeholder="github.com/…" />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Instagram</label>
              <input type="text" value={data.instagram} onChange={e => setData({ ...data, instagram: e.target.value })} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>X (Twitter)</label>
              <input type="text" value={data.xSocial} onChange={e => setData({ ...data, xSocial: e.target.value })} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Facebook</label>
              <input type="text" value={data.facebook} onChange={e => setData({ ...data, facebook: e.target.value })} className={inputCls} />
            </div>
          </div>
        </section>

        {/* Assets */}
        <section className="space-y-6 bg-[#111111] p-8 rounded-lg border border-[#1A1A1A] md:col-span-2">
          <h3 className="text-[#C9A84C] text-xs uppercase tracking-[0.3em] pb-2 border-b border-[#2A2010]">Photo & Logo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelCls}>Profile Photo URL</label>
              <input type="text" value={data.photoUrl} onChange={e => setData({ ...data, photoUrl: e.target.value })} className={inputCls} placeholder="https://…" />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>{isStudent ? 'University Logo URL' : 'Organisation Logo URL'}</label>
              <input type="text" value={data.logoUrl} onChange={e => setData({ ...data, logoUrl: e.target.value })} className={inputCls} placeholder="https://…" />
            </div>
          </div>
        </section>

        {/* Theme */}
        <section className="space-y-6 bg-[#111111] p-8 rounded-lg border border-[#1A1A1A] md:col-span-2">
          <h3 className="text-[#C9A84C] text-xs uppercase tracking-[0.3em] pb-2 border-b border-[#2A2010]">Theme</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: 'Classic Gold', theme: '#0A0A0A', accent: '#C9A84C' },
              { name: 'Midnight', theme: '#050A1A', accent: '#4C98C9' },
              { name: 'Emerald', theme: '#0A120A', accent: '#4CC97C' },
              { name: 'Imperial', theme: '#120A1A', accent: '#984CC9' },
              { name: 'Rose', theme: '#1A0A0A', accent: '#C94C4C' },
              { name: 'Slate', theme: '#1A1A1A', accent: '#F0EAD6' },
            ].map(p => (
              <button
                key={p.name}
                type="button"
                onClick={() => setData({ ...data, themeColor: p.theme, accentColor: p.accent })}
                className={`flex items-center gap-3 p-3 rounded border transition-all ${
                  data.themeColor === p.theme ? 'border-[#C9A84C] bg-[#1A1A1A]' : 'border-[#2A2010] hover:border-[#3A3020]'
                }`}
              >
                <div className="flex h-5 w-5 rounded-full overflow-hidden border border-[#2A2010]">
                  <div className="flex-1" style={{ backgroundColor: p.theme }} />
                  <div className="flex-1" style={{ backgroundColor: p.accent }} />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-[#F0EAD6]">{p.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Save button */}
        <div className="md:col-span-2 pt-2 flex justify-center">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#C9A84C] text-[#0A0A0A] px-12 py-4 rounded text-xs font-bold uppercase tracking-[0.3em] hover:bg-[#E8CC80] transition-all disabled:opacity-50 flex items-center gap-3 shadow-[0_15px_40px_rgba(201,168,76,0.2)]"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {data.id ? 'Publish Changes' : 'Create Card'}
          </button>
        </div>

        {/* Post-create panels */}
        {data.id && (
          <>
            <QRPanel slug={data.slug} accentColor={data.accentColor} />
            <NetworkPanel uid={user?.uid || ''} />
            {!isStudent && (
              <TemplatesPanel
                templates={data.followUpTemplates}
                onChange={tpls => setData({ ...data, followUpTemplates: tpls })}
              />
            )}
          </>
        )}
      </form>
    </div>
  );
}
