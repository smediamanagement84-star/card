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
import { Save, ExternalLink, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface CardData {
  id?: string;
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
  uid: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<CardData>({
    name: '',
    title: '',
    bio: '',
    company: '',
    companySub: '',
    education: '',
    educationDegree: '',
    graduationYear: '',
    skills: '',
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
    uid: user?.uid || ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetchCard();
    }
  }, [user]);

  const handleFirestoreError = (error: any, operationType: OperationType, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: user?.uid,
        email: user?.email,
        emailVerified: user?.emailVerified,
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(error.message || 'Operation failed');
  };

  const fetchCard = async () => {
    try {
      const q = query(collection(db, 'cards'), where('uid', '==', user?.uid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const cardDoc = querySnapshot.docs[0];
        setData({ ...cardDoc.data() as CardData, id: cardDoc.id });
      } else {
        // Initial setup for new user
        setData(prev => ({
          ...prev,
          name: user?.displayName || '',
          email: user?.email || '',
          photoUrl: user?.photoURL || '',
          slug: user?.displayName?.toLowerCase().replace(/\s+/g, '-') || `user-${user?.uid.slice(0, 5)}`
        }));
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
        const updatePayload = {
          ...data,
          updatedAt: serverTimestamp()
        };
        await updateDoc(cardRef, updatePayload);
        setMessage({ type: 'success', text: 'Card updated successfully!' });
      } else {
        const newId = doc(collection(db, 'cards')).id;
        const batch = writeBatch(db);
        
        // 1. Create username mapping
        const usernameRef = doc(db, 'usernames', data.slug);
        batch.set(usernameRef, { cardId: newId });
        
        // 2. Create card doc
        const cardRef = doc(db, 'cards', newId);
        batch.set(cardRef, {
          ...data,
          uid: user?.uid,
          id: newId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        await batch.commit();
        
        setData(prev => ({ ...prev, id: newId }));
        setMessage({ type: 'success', text: 'Card created successfully!' });
      }
    } catch (err: any) {
      console.error('Save Error:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to save card.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-1">
          <h2 className="text-3xl font-serif text-[#F0EAD6]">Your Executive Profile</h2>
          <p className="text-[#7A7870] font-light">Customise your digital identity and sharing settings.</p>
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

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-6 bg-[#111111] p-8 rounded-lg border border-[#1A1A1A]">
          <h3 className="text-[#C9A84C] text-xs uppercase tracking-[0.3em] pb-2 border-b border-[#2A2010]">Identity</h3>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[#7A7870]">Slug (URL Identifier)</label>
              <input 
                type="text" 
                value={data.slug} 
                onChange={e => setData({...data, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})}
                disabled={!!data.id}
                className="w-full bg-[#0A0A0A] border border-[#2A2010] p-3 rounded text-sm focus:border-[#C9A84C] outline-none disabled:opacity-50 transition-colors"
                placeholder="e.g. john-doe"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[#7A7870]">Full Name</label>
              <input 
                type="text" 
                value={data.name} 
                onChange={e => setData({...data, name: e.target.value})}
                className="w-full bg-[#0A0A0A] border border-[#2A2010] p-3 rounded text-sm focus:border-[#C9A84C] outline-none transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[#7A7870]">Position / Title (Optional)</label>
              <input 
                type="text" 
                value={data.title} 
                onChange={e => setData({...data, title: e.target.value})}
                className="w-full bg-[#0A0A0A] border border-[#2A2010] p-3 rounded text-sm focus:border-[#C9A84C] outline-none transition-colors"
                placeholder="e.g. CEO, Student, Designer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[#7A7870]">Bio (Optional)</label>
              <textarea 
                value={data.bio} 
                onChange={e => setData({...data, bio: e.target.value})}
                className="w-full bg-[#0A0A0A] border border-[#2A2010] p-3 rounded text-sm focus:border-[#C9A84C] outline-none transition-colors h-24 resize-none"
                placeholder="Describe your expertise or background..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.1em] text-[#7A7870]">Company (Optional)</label>
                <input 
                  type="text" 
                  value={data.company} 
                  onChange={e => setData({...data, company: e.target.value})}
                  className="w-full bg-[#0A0A0A] border border-[#2A2010] p-3 rounded text-sm focus:border-[#C9A84C] outline-none transition-colors"
                  placeholder="e.g. Meta, University..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.1em] text-[#7A7870]">Location (Optional)</label>
                <input 
                  type="text" 
                  value={data.companySub} 
                  onChange={e => setData({...data, companySub: e.target.value})}
                  className="w-full bg-[#0A0A0A] border border-[#2A2010] p-3 rounded text-sm focus:border-[#C9A84C] outline-none transition-colors"
                  placeholder="e.g. Dubai, UAE"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6 bg-[#111111] p-8 rounded-lg border border-[#1A1A1A]">
          <h3 className="text-[#C9A84C] text-xs uppercase tracking-[0.3em] pb-2 border-b border-[#2A2010]">Professional / Academic</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.1em] text-[#7A7870]">Org / University</label>
                <input 
                  type="text" 
                  value={data.company} 
                  onChange={e => setData({...data, company: e.target.value})}
                  className="w-full bg-[#0A0A0A] border border-[#2A2010] p-3 rounded text-sm focus:border-[#C9A84C] outline-none transition-colors"
                  placeholder="e.g. Apple / Harvard"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.1em] text-[#7A7870]">Dept / Degree</label>
                <input 
                  type="text" 
                  value={data.educationDegree} 
                  onChange={e => setData({...data, educationDegree: e.target.value})}
                  className="w-full bg-[#0A0A0A] border border-[#2A2010] p-3 rounded text-sm focus:border-[#C9A84C] outline-none transition-colors"
                  placeholder="e.g. Sales / CS"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.1em] text-[#7A7870]">Location / City</label>
                <input 
                  type="text" 
                  value={data.companySub} 
                  onChange={e => setData({...data, companySub: e.target.value})}
                  className="w-full bg-[#0A0A0A] border border-[#2A2010] p-3 rounded text-sm focus:border-[#C9A84C] outline-none transition-colors"
                  placeholder="e.g. Cupertino, CA"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.1em] text-[#7A7870]">Year / Tenure</label>
                <input 
                  type="text" 
                  value={data.graduationYear} 
                  onChange={e => setData({...data, graduationYear: e.target.value})}
                  className="w-full bg-[#0A0A0A] border border-[#2A2010] p-3 rounded text-sm focus:border-[#C9A84C] outline-none transition-colors"
                  placeholder="e.g. 2025"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[#7A7870]">Skills / Specialties (Comma separated)</label>
              <input 
                type="text" 
                value={data.skills} 
                onChange={e => setData({...data, skills: e.target.value})}
                className="w-full bg-[#0A0A0A] border border-[#2A2010] p-3 rounded text-sm focus:border-[#C9A84C] outline-none transition-colors"
                placeholder="e.g. UI/UX, Sales, Coding"
              />
            </div>
          </div>
        </section>

        <section className="space-y-6 bg-[#111111] p-8 rounded-lg border border-[#1A1A1A]">
          <h3 className="text-[#C9A84C] text-xs uppercase tracking-[0.3em] pb-2 border-b border-[#2A2010]">Connectivity</h3>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[#7A7870]">Mobile Number</label>
              <input 
                type="tel" 
                value={data.mobile} 
                onChange={e => setData({...data, mobile: e.target.value})}
                className="w-full bg-[#0A0A0A] border border-[#2A2010] p-3 rounded text-sm focus:border-[#C9A84C] outline-none transition-colors"
                placeholder="+977 ..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[#7A7870]">Email Address</label>
              <input 
                type="email" 
                value={data.email} 
                onChange={e => setData({...data, email: e.target.value})}
                className="w-full bg-[#0A0A0A] border border-[#2A2010] p-3 rounded text-sm focus:border-[#C9A84C] outline-none transition-colors"
                placeholder="name@email.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[#7A7870]">Portfolio / Web</label>
              <input 
                type="text" 
                value={data.website} 
                onChange={e => setData({...data, website: e.target.value})}
                className="w-full bg-[#0A0A0A] border border-[#2A2010] p-3 rounded text-sm focus:border-[#C9A84C] outline-none transition-colors"
                placeholder="www.yourportfolio.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[#7A7870]">Direct Location</label>
              <input 
                type="text" 
                value={data.location} 
                onChange={e => setData({...data, location: e.target.value})}
                className="w-full bg-[#0A0A0A] border border-[#2A2010] p-3 rounded text-sm focus:border-[#C9A84C] outline-none transition-colors"
                placeholder="City, Country"
              />
            </div>
          </div>
        </section>

        <section className="space-y-6 bg-[#111111] p-8 rounded-lg border border-[#1A1A1A] md:col-span-2">
          <h3 className="text-[#C9A84C] text-xs uppercase tracking-[0.3em] pb-2 border-b border-[#2A2010]">Theme Customisation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A7870]">Primary Palette</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Classic Gold', theme: '#0A0A0A', accent: '#C9A84C' },
                    { name: 'Midnight', theme: '#050A1A', accent: '#4C98C9' },
                    { name: 'Emerald', theme: '#0A120A', accent: '#4CC97C' },
                    { name: 'Imperial', theme: '#120A1A', accent: '#984CC9' },
                    { name: 'Rose', theme: '#1A0A0A', accent: '#C94C4C' },
                    { name: 'Slate', theme: '#1A1A1A', accent: '#F0EAD6' },
                  ].map((p) => (
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A7870]">Custom Theme</label>
                  <input 
                    type="color" 
                    value={data.themeColor || '#0A0A0A'} 
                    onChange={e => setData({...data, themeColor: e.target.value})}
                    className="w-full h-10 bg-transparent border-none cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A7870]">Custom Accent</label>
                  <input 
                    type="color" 
                    value={data.accentColor || '#C9A84C'} 
                    onChange={e => setData({...data, accentColor: e.target.value})}
                    className="w-full h-10 bg-transparent border-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A7870]">Heading Font</label>
                <select 
                  value={data.fontHeading} 
                  onChange={e => setData({...data, fontHeading: e.target.value})}
                  className="w-full bg-[#0A0A0A] border border-[#2A2010] p-3 rounded text-sm text-[#F0EAD6] focus:border-[#C9A84C] outline-none"
                >
                  <option value="Cormorant Garamond">Cormorant Garamond (Serif)</option>
                  <option value="Playfair Display">Playfair Display (Serif)</option>
                  <option value="Montserrat">Montserrat (Sans)</option>
                  <option value="Outfit">Outfit (Geometric)</option>
                  <option value="Space Grotesk">Space Grotesk (Tech)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A7870]">Body Font</label>
                <select 
                  value={data.fontBody} 
                  onChange={e => setData({...data, fontBody: e.target.value})}
                  className="w-full bg-[#0A0A0A] border border-[#2A2010] p-3 rounded text-sm text-[#F0EAD6] focus:border-[#C9A84C] outline-none"
                >
                  <option value="Montserrat">Montserrat</option>
                  <option value="Inter">Inter</option>
                  <option value="Outfit">Outfit</option>
                  <option value="Cormorant Garamond">Cormorant Garamond</option>
                </select>
              </div>

              <div className="p-4 rounded border border-dashed border-[#2A2010] bg-[#0A0A0A]/50 mt-4">
                <p className="text-[10px] uppercase tracking-widest text-[#C9A84C] mb-2">Preview Tip</p>
                <p className="text-[9px] text-[#7A7870] leading-relaxed">
                  Fonts will be applied to your live profile. Use high-contrast pairings for better readability.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6 bg-[#111111] p-8 rounded-lg border border-[#1A1A1A] md:col-span-2">
          <h3 className="text-[#C9A84C] text-xs uppercase tracking-[0.3em] pb-2 border-b border-[#2A2010]">Assets & Social Presence</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.1em] text-[#7A7870]">LinkedIn</label>
                  <input type="text" value={data.linkedin} onChange={e => setData({...data, linkedin: e.target.value})} className="w-full bg-[#0A0A0A] border border-[#2A2010] p-3 rounded text-sm focus:border-[#C9A84C] outline-none" placeholder="linkedin.com/in/..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.1em] text-[#7A7870]">GitHub</label>
                  <input type="text" value={data.github} onChange={e => setData({...data, github: e.target.value})} className="w-full bg-[#0A0A0A] border border-[#2A2010] p-3 rounded text-sm focus:border-[#C9A84C] outline-none" placeholder="github.com/..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.1em] text-[#7A7870]">X (Twitter)</label>
                  <input type="text" value={data.xSocial} onChange={e => setData({...data, xSocial: e.target.value})} className="w-full bg-[#0A0A0A] border border-[#2A2010] p-3 rounded text-sm focus:border-[#C9A84C] outline-none" placeholder="x.com/..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.1em] text-[#7A7870]">Instagram</label>
                  <input type="text" value={data.instagram} onChange={e => setData({...data, instagram: e.target.value})} className="w-full bg-[#0A0A0A] border border-[#2A2010] p-3 rounded text-sm focus:border-[#C9A84C] outline-none" placeholder="instagram.com/..." />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.1em] text-[#7A7870]">Profile Photo URL</label>
                <input type="text" value={data.photoUrl} onChange={e => setData({...data, photoUrl: e.target.value})} className="w-full bg-[#0A0A0A] border border-[#2A2010] p-3 rounded text-sm focus:border-[#C9A84C] outline-none" placeholder="https://..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.1em] text-[#7A7870]">Organisation Logo URL</label>
                <input type="text" value={data.logoUrl} onChange={e => setData({...data, logoUrl: e.target.value})} className="w-full bg-[#0A0A0A] border border-[#2A2010] p-3 rounded text-sm focus:border-[#C9A84C] outline-none" placeholder="https://..." />
              </div>
            </div>
          </div>
        </section>

        <div className="md:col-span-2 pt-8 flex justify-center">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#C9A84C] text-[#0A0A0A] px-12 py-4 rounded text-xs font-bold uppercase tracking-[0.3em] hover:bg-[#E8CC80] transition-all disabled:opacity-50 flex items-center gap-3 shadow-[0_15px_40px_rgba(201,168,76,0.2)]"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {data.id ? 'Publish Changes' : 'Create Card'}
          </button>
        </div>
      </form>
    </div>
  );
}
