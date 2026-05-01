import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Copy, ExternalLink, QrCode } from 'lucide-react';

interface Props {
  slug: string;
  accentColor?: string;
}

export default function QRPanel({ slug, accentColor = '#C9A84C' }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
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
    } catch {}
  };

  return (
    <section className="space-y-6 bg-[#111111] p-8 rounded-lg border border-[#1A1A1A] md:col-span-2">
      <div className="flex items-center gap-3 pb-2 border-b border-[#2A2010]">
        <QrCode className="w-4 h-4 text-[#C9A84C]" />
        <h3 className="text-[#C9A84C] text-xs uppercase tracking-[0.3em]">Your Shareable QR</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-start">
        <div ref={wrapperRef} className="bg-white p-4 rounded shadow-inner border-2 mx-auto" style={{ borderColor: accentColor }}>
          <QRCodeCanvas
            value={url}
            size={180}
            level="H"
            fgColor="#0A0A0A"
            bgColor="#FFFFFF"
            includeMargin={false}
          />
        </div>

        <div className="space-y-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#7A7870] mb-2">How it works</div>
            <ol className="text-xs text-[#F0EAD6]/80 font-light space-y-1.5 list-decimal list-inside">
              <li>Download this QR &amp; save it to your phone gallery.</li>
              <li>Show or print it — anyone scans it with their camera.</li>
              <li>Scanner sees your live card and taps <span style={{ color: accentColor }}>Save Contact</span>.</li>
            </ol>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A7870]">Your card URL</label>
            <div className="flex items-center gap-2 bg-[#0A0A0A] border border-[#2A2010] rounded px-3 py-2">
              <span className="text-[11px] text-[#F0EAD6] font-mono truncate flex-1">{url}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={downloadQR}
              className="inline-flex items-center gap-2 bg-[#C9A84C] text-[#0A0A0A] px-5 py-2.5 rounded text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#E8CC80] transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download PNG
            </button>
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-2 border border-[#3A3020] text-[#C9A84C] px-5 py-2.5 rounded text-[10px] uppercase tracking-[0.2em] hover:border-[#C9A84C] transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy Link
            </button>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-[#3A3020] text-[#7A7870] px-5 py-2.5 rounded text-[10px] uppercase tracking-[0.2em] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Card
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
