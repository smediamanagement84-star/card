import { useRef, useState } from 'react';
import { Camera, RefreshCw, Trash2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { uploadImage } from '../utils/upload';

interface Props {
  value?: string;
  uid: string;
  kind: 'profile' | 'logo';
  shape?: 'circle' | 'square';
  label: string;
  onChange: (url: string) => void;
}

export default function PhotoUpload({ value, uid, kind, shape = 'circle', label, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showUrl, setShowUrl] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setErr(null);
    setBusy(true);
    try {
      const url = await uploadImage(uid, kind, file);
      onChange(url);
    } catch (e: any) {
      setErr(e?.message || 'Upload failed');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const radius = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';
  const size = shape === 'circle' ? 'w-20 h-20' : 'w-20 h-20';

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-white/70">{label}</label>
      <div className="flex items-center gap-3">
        <div
          className={`${size} ${radius} relative flex-shrink-0 bg-white/5 border-2 border-dashed border-white/15 flex items-center justify-center overflow-hidden`}
        >
          {value ? (
            // eslint-disable-next-line jsx-a11y/img-redundant-alt
            <img src={value} alt="Uploaded photo preview" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-6 h-6 text-white/30" />
          )}
          {busy && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="btn-ghost inline-flex items-center gap-2 !py-2 !px-4 text-xs disabled:opacity-50"
          >
            <Camera className="w-3.5 h-3.5" />
            {value ? 'Replace' : 'Choose photo'}
          </button>
          {value && !busy && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowUrl(s => !s)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs text-white/50 hover:text-white transition-colors"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            URL
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
          onChange={e => handleFile(e.target.files?.[0])}
          className="hidden"
        />
      </div>

      {showUrl && (
        <input
          type="url"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="https://… (paste image URL)"
          className="input-glass"
        />
      )}

      {err && (
        <div className="flex items-center gap-2 text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{err}</span>
        </div>
      )}

      <p className="text-[10px] text-white/40 leading-relaxed">
        🔒 Photos are compressed in your browser and stripped of EXIF/location data before saving. Stored inside your card document — never sent to a third party.
      </p>
    </div>
  );
}
