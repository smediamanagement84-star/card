import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../App';
import {
  Share2, Download, QrCode, UserPlus, CheckCircle2, X, ArrowLeft, ExternalLink
} from 'lucide-react';
import CardPreview, { CardPreviewData } from './CardPreview';
import { getTheme } from '../themes';

interface CardData extends CardPreviewData {
  id?: string;
  uid?: string;
  themeId?: string;
  slug: string;
  name: string;
}

const sampleCard: CardData = {
  userType: 'student',
  themeId: 'aurora',
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
  slug: 'sample',
};

const formatUrl = (url: string) => url.startsWith('http') ? url : `https://${url}`;

function buildVCard(d: CardData): string {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${d.name}`];
  if (d.title) lines.push(`TITLE:${d.title}`);
  if (d.company) lines.push(`ORG:${d.company}`);
  if (d.university) lines.push(`ORG:${d.university}`);
  if (d.mobile) lines.push(`TEL:${d.mobile}`);
  if (d.email) lines.push(`EMAIL:${d.email}`);
  if (d.website) lines.push(`URL:${formatUrl(d.website)}`);
  if (d.location) lines.push(`ADR:;;${d.location}`);
  if (d.bio) lines.push(`NOTE:${d.bio.replace(/\r?\n/g, ' ')}`);
  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export default function CardView() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => { fetchCard(); }, [slug]);

  const fetchCard = async () => {
    setLoading(true);
    setData(null);
    setConnected(false);
    if (slug === 'sample') {
      setData(sampleCard);
      setLoading(false);
      return;
    }
    try {
      const usernameRef = doc(db, 'usernames', slug || '');
      const usernameSnap = await getDoc(usernameRef);
      if (usernameSnap.exists()) {
        const cardId = usernameSnap.data().cardId;
        const cardRef = doc(db, 'cards', cardId);
        const cardSnap = await getDoc(cardRef);
        if (cardSnap.exists()) {
          setData({ ...(cardSnap.data() as CardData), id: cardId });
        }
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Trigger save-contact prompt after the card has rendered.
  // Only for non-owners and only once per session per card.
  useEffect(() => {
    if (!data) return;
    if (user && data.uid === user.uid) return;
    const key = `seen-save-prompt-${data.slug}`;
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(key)) return;
    const t = setTimeout(() => {
      setShowSavePrompt(true);
      try { sessionStorage.setItem(key, '1'); } catch {}
    }, 1800);
    return () => clearTimeout(t);
  }, [data, user]);

  // Check if already in viewer's network.
  useEffect(() => {
    const checkConnected = async () => {
      if (!user || !data?.id || data.uid === user.uid) return;
      try {
        const ref = doc(db, 'users', user.uid, 'connections', data.id);
        const snap = await getDoc(ref);
        if (snap.exists()) setConnected(true);
      } catch {}
    };
    checkConnected();
  }, [user, data?.id]);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const addToNetwork = async () => {
    if (!user || !data?.id) return;
    setConnecting(true);
    try {
      await setDoc(doc(db, 'users', user.uid, 'connections', data.id), {
        cardId: data.id,
        slug: data.slug,
        name: data.name,
        title: data.title || '',
        company: data.company || '',
        university: data.university || '',
        email: data.email || '',
        mobile: data.mobile || '',
        addedAt: serverTimestamp(),
      });
      setConnected(true);
      showToastMsg('Added to your network!');
    } catch (err) {
      console.error(err);
      showToastMsg('Could not add. Try again.');
    } finally { setConnecting(false); }
  };

  const shareCard = async () => {
    const url = window.location.href;
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({
          title: `${data?.name}${data?.company ? ' — ' + data.company : ''}`,
          text: `Connect with ${data?.name}.`,
          url,
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        showToastMsg('Link copied!');
      } catch {}
    }
  };

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] relative z-10">
      <div className="w-10 h-10 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="text-center py-20 px-4 relative z-10">
      <div className="text-6xl mb-4">🌫️</div>
      <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit' }}>Card not found</h2>
      <p className="text-white/50 mb-6">This card doesn't exist or has been moved.</p>
      <Link to="/" className="btn-primary inline-flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Go home
      </Link>
    </div>
  );

  const theme = getTheme(data.themeId);
  const isOwner = !!user && data.uid === user.uid;
  const vCard = buildVCard(data);
  const vCardHref = `data:text/vcard;charset=utf-8,${encodeURIComponent(vCard)}`;
  const fileName = `${data.name.replace(/\s+/g, '_')}.vcf`;

  return (
    <div className="relative z-10 py-6 sm:py-12 px-4 sm:px-6 min-h-[calc(100vh-64px)]">
      {/* Back bar */}
      <div className="max-w-md mx-auto mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        {isOwner && (
          <Link to="/dashboard" className="text-xs text-white/60 hover:text-white transition-colors inline-flex items-center gap-1">
            Edit <ExternalLink className="w-3 h-3" />
          </Link>
        )}
      </div>

      <div className="max-w-md mx-auto">
        <CardPreview data={data} theme={theme} />

        {/* Primary actions — save contact is most prominent */}
        <div className="mt-6 space-y-3">
          <a
            href={vCardHref}
            download={fileName}
            className="btn-primary w-full inline-flex items-center justify-center gap-2 !py-4 text-sm shadow-2xl shadow-fuchsia-500/40"
          >
            <Download className="w-4 h-4" />
            Save {data.name.split(' ')[0]} to my phone
          </a>

          <div className="grid grid-cols-3 gap-2">
            <button onClick={shareCard} className="btn-ghost inline-flex items-center justify-center gap-1.5 !py-3 !px-3 text-xs">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
            <button onClick={() => setShowQR(true)} className="btn-ghost inline-flex items-center justify-center gap-1.5 !py-3 !px-3 text-xs">
              <QrCode className="w-3.5 h-3.5" />
              QR
            </button>
            {user && data.uid !== user.uid ? (
              connected ? (
                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-3 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-400/40 text-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved
                </div>
              ) : (
                <button
                  onClick={addToNetwork}
                  disabled={connecting}
                  className="btn-ghost inline-flex items-center justify-center gap-1.5 !py-3 !px-3 text-xs disabled:opacity-60"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {connecting ? '…' : 'Connect'}
                </button>
              )
            ) : (
              <a
                href={data.mobile ? `tel:${data.mobile}` : data.email ? `mailto:${data.email}` : '#'}
                className="btn-ghost inline-flex items-center justify-center gap-1.5 !py-3 !px-3 text-xs"
              >
                Contact
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Save-contact prompt bottom sheet */}
      <AnimatePresence>
        {showSavePrompt && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 26 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-50 glass-strong rounded-2xl p-4 shadow-2xl"
            style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl flex-shrink-0">📥</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">
                  Save {data.name.split(' ')[0]} to your phone?
                </p>
                <p className="text-xs text-white/60 mt-0.5">
                  One tap adds {data.title || 'them'} to your contacts.
                </p>
                <div className="flex gap-2 mt-3">
                  <a
                    href={vCardHref}
                    download={fileName}
                    onClick={() => setShowSavePrompt(false)}
                    className="btn-primary inline-flex items-center gap-1.5 !py-2 !px-4 text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Save now
                  </a>
                  <button
                    onClick={() => setShowSavePrompt(false)}
                    className="px-3 py-2 rounded-full text-xs text-white/50 hover:text-white transition-colors"
                  >
                    Not now
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowSavePrompt(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white flex-shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR overlay */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowQR(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 22 }}
              className="relative glass-strong rounded-3xl p-6 sm:p-8 max-w-sm w-full"
            >
              <button
                onClick={() => setShowQR(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-lg font-bold text-white mb-1 text-center" style={{ fontFamily: 'Outfit' }}>Scan to connect</h3>
              <p className="text-xs text-white/50 text-center mb-5">Point your camera here to open this card.</p>
              <div className="bg-white p-4 rounded-2xl mx-auto w-fit">
                <QRCodeSVG value={window.location.href} size={220} level="H" />
              </div>
              <a
                href={vCardHref}
                download={fileName}
                onClick={() => setShowQR(false)}
                className="btn-primary w-full inline-flex items-center justify-center gap-2 mt-5 !py-3 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Or save to phone
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 30, x: '-50%' }}
            className="fixed bottom-24 left-1/2 px-5 py-2.5 glass-strong rounded-full text-xs text-white font-semibold z-[101]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
