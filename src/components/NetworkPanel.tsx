import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { Users, Trash2, ExternalLink, Mail, Phone, Calendar } from 'lucide-react';

interface Props {
  uid: string;
}

interface Connection {
  cardId: string;
  slug: string;
  name: string;
  title?: string;
  company?: string;
  university?: string;
  email?: string;
  mobile?: string;
  addedAt?: any;
}

export default function NetworkPanel({ uid }: Props) {
  const [items, setItems] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const load = async () => {
      try {
        const q = query(collection(db, 'users', uid, 'connections'), orderBy('addedAt', 'desc'));
        const snap = await getDocs(q);
        setItems(snap.docs.map(d => ({ ...(d.data() as Connection), cardId: d.id })));
      } catch (err) {
        console.error('Load connections', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uid]);

  const remove = async (cardId: string) => {
    try {
      await deleteDoc(doc(db, 'users', uid, 'connections', cardId));
      setItems(prev => prev.filter(i => i.cardId !== cardId));
    } catch (err) {
      console.error(err);
    }
  };

  const fmtDate = (ts: any) => {
    if (!ts?.toDate) return '';
    return ts.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <section className="space-y-6 bg-[#111111] p-8 rounded-lg border border-[#1A1A1A] md:col-span-2">
      <div className="flex items-center justify-between pb-2 border-b border-[#2A2010]">
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-[#C9A84C]" />
          <h3 className="text-[#C9A84C] text-xs uppercase tracking-[0.3em]">My Network</h3>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-[#7A7870]">{items.length} {items.length === 1 ? 'contact' : 'contacts'}</span>
      </div>

      {loading ? (
        <div className="py-8 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <div className="text-sm text-[#F0EAD6] font-light">No connections yet.</div>
          <p className="text-[11px] text-[#7A7870] max-w-md mx-auto leading-relaxed">
            Scan or open another EliteCard while signed in and tap <span className="text-[#C9A84C]">Add to my network</span> — they'll appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map(c => (
            <div key={c.cardId} className="bg-[#0A0A0A] border border-[#2A2010] rounded-lg p-4 flex flex-col gap-2 hover:border-[#3A3020] transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-[#F0EAD6] font-medium truncate">{c.name}</div>
                  {(c.title || c.company || c.university) && (
                    <div className="text-[10px] uppercase tracking-wider text-[#7A7870] truncate">
                      {[c.title, c.company || c.university].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => remove(c.cardId)}
                  title="Remove"
                  className="text-[#3A3020] hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#7A7870] mt-1">
                {c.email && (
                  <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 hover:text-[#C9A84C]">
                    <Mail className="w-3 h-3" />
                    Email
                  </a>
                )}
                {c.mobile && (
                  <a href={`tel:${c.mobile}`} className="inline-flex items-center gap-1 hover:text-[#C9A84C]">
                    <Phone className="w-3 h-3" />
                    Call
                  </a>
                )}
                {c.addedAt && (
                  <span className="inline-flex items-center gap-1 ml-auto">
                    <Calendar className="w-3 h-3" />
                    {fmtDate(c.addedAt)}
                  </span>
                )}
                <Link
                  to={`/d/${c.slug}`}
                  className="inline-flex items-center gap-1 text-[#C9A84C] hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
