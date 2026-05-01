import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../App';
import {
  Share2, Download, QrCode, UserPlus, CheckCircle2, X
} from 'lucide-react';
import CardPreview, { CardPreviewData } from './CardPreview';
import { getTheme } from '../themes';

interface CardData extends CardPreviewData {
  id?: string;
  uid?: string;
  themeId?: string;
  themeColor?: string;
  accentColor?: string;
  fontHeading?: string;
  fontBody?: string;
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

export default function CardView() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [data, setData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetchCard();
  }, [slug]);

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

  const formatUrl = (url: string) => url.startsWith('http') ? url : `https://${url}`;

  const shareCard = () => {
    const url = window.location.href;
    if ((navigator as any).share) {
      (navigator as any).share({
        title: `${data?.name}${data?.company ? ' — ' + data.company : ''}`,
        text: `Connect with ${data?.name}.`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url).then(() => showToastMsg('Link copied!'));
    }
  };

  const getVCard = () => {
    if (!data) return '';
    const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${data.name}`];
    if (data.title) lines.push(`TITLE:${data.title}`);
    if (data.company) lines.push(`ORG:${data.company}`);
    if (data.university) lines.push(`ORG:${data.university}`);
    if (data.mobile) lines.push(`TEL:${data.mobile}`);
    if (data.email) lines.push(`EMAIL:${data.email}`);
    if (data.website) lines.push(`URL:${formatUrl(data.website)}`);
    if (data.location) lines.push(`ADR:;;${data.location}`);
    lines.push('END:VCARD');
    return lines.join('\r\n');
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
      <p className="text-white/50">This card doesn't exist or has been moved.</p>
    </div>
  );

  const theme = getTheme(data.themeId);

  return (
    <div className="relative z-10 py-12 px-4 sm:px-6 min-h-[calc(100vh-64px)]">
      <div className="max-w-md mx-auto">
        <CardPreview data={data} theme={theme} />

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <button onClick={shareCard} className="btn-ghost inline-flex items-center gap-2 !py-3 !px-5 text-xs">
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>

          <a
            href={`data:text/vcard;charset=utf-8,${encodeURIComponent(getVCard())}`}
            download={`${data.name.replace(/\s+/g, '_')}.vcf`}
            className="btn-primary inline-flex items-center gap-2 !py-3 !px-5 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Save Contact
          </a>

          <button
            onClick={() => setShowQR(true)}
            className="btn-ghost inline-flex items-center gap-2 !py-3 !px-5 text-xs"
          >
            <QrCode className="w-3.5 h-3.5" />
            QR
          </button>

          {user && data.uid !== user.uid && (
            connected ? (
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-400/40 text-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                In Network
              </div>
            ) : (
              <button
                onClick={addToNetwork}
                disabled={connecting}
                className="btn-ghost inline-flex items-center gap-2 !py-3 !px-5 text-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {connecting ? 'Adding…' : 'Add to Network'}
              </button>
            )
          )}
        </div>
      </div>

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
              className="relative glass-strong rounded-3xl p-8 max-w-sm w-full"
            >
              <button
                onClick={() => setShowQR(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-lg font-bold text-white mb-1 text-center" style={{ fontFamily: 'Outfit' }}>Scan to connect</h3>
              <p className="text-xs text-white/50 text-center mb-5">Point your camera here to open this card.</p>
              <div className="bg-white p-4 rounded-2xl mx-auto w-fit">
                <QRCodeSVG value={window.location.href} size={220} level="H" />
              </div>
              <div className="mt-5 text-center text-[10px] uppercase tracking-widest text-white/40">{theme.emoji} {theme.name}</div>
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
            className="fixed bottom-8 left-1/2 px-5 py-2.5 glass-strong rounded-full text-xs text-white font-semibold z-[100]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
