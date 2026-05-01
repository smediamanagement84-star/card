import { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Copy, ExternalLink, QrCode, Check } from 'lucide-react';

interface Props {
  slug: string;
  accentColor?: string;
}

export default function QRPanel({ slug, accentColor = '#a855f7' }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/d/${slug}`;

  const downloadQR = () => {
    const canvas = wrapperRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${slug}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <section className="glass rounded-3xl p-6 sm:p-7">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
          <QrCode className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Your QR code</h3>
          <p className="text-xs text-white/50">Save it to your phone, print it, share it.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-center">
        <div ref={wrapperRef} className="relative bg-white p-4 rounded-2xl mx-auto shadow-2xl" style={{ boxShadow: `0 20px 50px -10px ${accentColor}40` }}>
          <QRCodeCanvas value={url} size={180} level="H" fgColor="#0a0a14" bgColor="#FFFFFF" includeMargin={false} />
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: accentColor }}>✨</div>
        </div>

        <div className="space-y-4">
          <ol className="text-sm text-white/70 space-y-1.5 list-decimal list-inside">
            <li>Download &amp; save this QR to your phone gallery.</li>
            <li>Show or print it — anyone with a camera can scan.</li>
            <li>They tap <span style={{ color: accentColor }} className="font-semibold">Save Contact</span> &amp; you're in their phone.</li>
          </ol>

          <div className="bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 flex items-center gap-2">
            <code className="text-xs text-white/80 font-mono truncate flex-1">{url}</code>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={downloadQR} className="btn-primary inline-flex items-center gap-2 !py-2.5 !px-5 text-xs">
              <Download className="w-3.5 h-3.5" /> Download PNG
            </button>
            <button type="button" onClick={copyLink} className="btn-ghost inline-flex items-center gap-2 !py-2.5 !px-5 text-xs">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <a href={url} target="_blank" rel="noreferrer" className="btn-ghost inline-flex items-center gap-2 !py-2.5 !px-5 text-xs">
              <ExternalLink className="w-3.5 h-3.5" /> Open
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
