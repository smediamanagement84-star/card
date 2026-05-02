import { MessageSquare, Plus, Trash2 } from 'lucide-react';

interface Props {
  templates: string[];
  onChange: (next: string[]) => void;
}

const PRESETS = [
  'Hi {name}, great connecting at the event today. Let me know a good time to chat further this week.',
  'Hey {name}, following up on our conversation — would love to explore how we can collaborate.',
  'Hi {name}, sharing my deck as discussed. Looking forward to your thoughts.',
];

export default function TemplatesPanel({ templates, onChange }: Props) {
  const update = (idx: number, val: string) => {
    const next = [...templates]; next[idx] = val; onChange(next);
  };
  const add = () => onChange([...templates, '']);
  const remove = (idx: number) => onChange(templates.filter((_, i) => i !== idx));
  const seedPresets = () => onChange(PRESETS);

  return (
    <section className="glass rounded-3xl p-6 sm:p-7">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Follow-up templates</h3>
            <p className="text-xs text-white/50">Use <code className="text-amber-300">{'{name}'}</code> as a placeholder.</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/70">
          {templates.length}
        </span>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-8 space-y-3">
          <div className="text-4xl">✉️</div>
          <p className="text-xs text-white/50 max-w-sm mx-auto">No templates yet. Load a few starters or write your own.</p>
          <button type="button" onClick={seedPresets} className="btn-primary inline-flex !py-2 !px-5 text-xs">Load Starters</button>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((tpl, idx) => (
            <div key={idx} className="flex gap-3 items-start bg-black/20 border border-white/10 rounded-2xl p-3">
              <span className="text-xs text-amber-300 font-bold pt-2 w-7 text-center">#{idx + 1}</span>
              <textarea
                value={tpl} onChange={e => update(idx, e.target.value)} rows={2}
                className="flex-1 bg-transparent text-sm text-white outline-none resize-none leading-relaxed placeholder:text-white/30"
                placeholder="Hi {name}, great meeting you..."
              />
              <button type="button" onClick={() => remove(idx)} className="text-white/30 hover:text-red-400 transition-colors pt-2">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button type="button" onClick={add} className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add template
          </button>
        </div>
      )}
    </section>
  );
}
