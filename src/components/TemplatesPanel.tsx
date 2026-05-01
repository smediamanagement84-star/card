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
    const next = [...templates];
    next[idx] = val;
    onChange(next);
  };
  const add = () => onChange([...templates, '']);
  const remove = (idx: number) => onChange(templates.filter((_, i) => i !== idx));
  const seedPresets = () => onChange(PRESETS);

  return (
    <section className="space-y-6 bg-[#111111] p-8 rounded-lg border border-[#1A1A1A] md:col-span-2">
      <div className="flex items-center justify-between pb-2 border-b border-[#2A2010]">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-4 h-4 text-[#C9A84C]" />
          <h3 className="text-[#C9A84C] text-xs uppercase tracking-[0.3em]">Follow-up Templates</h3>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-[#7A7870]">{templates.length} saved</span>
      </div>

      <p className="text-[11px] text-[#7A7870] font-light leading-relaxed">
        Save messages you send after meetings. Use <code className="text-[#C9A84C] bg-[#0A0A0A] px-1.5 py-0.5 rounded text-[10px]">{'{name}'}</code> as a placeholder — when you message a contact from your network, it auto-fills.
      </p>

      {templates.length === 0 ? (
        <div className="text-center py-6">
          <button
            type="button"
            onClick={seedPresets}
            className="bg-[#C9A84C] text-[#0A0A0A] px-6 py-2.5 rounded text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#E8CC80] transition-colors"
          >
            Load Starter Templates
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((tpl, idx) => (
            <div key={idx} className="flex gap-3 items-start bg-[#0A0A0A] border border-[#2A2010] rounded p-3">
              <span className="text-[10px] text-[#C9A84C] font-bold pt-2 w-6 text-center">#{idx + 1}</span>
              <textarea
                value={tpl}
                onChange={e => update(idx, e.target.value)}
                rows={2}
                className="flex-1 bg-transparent text-xs text-[#F0EAD6] outline-none resize-none leading-relaxed"
                placeholder="Hi {name}, great meeting you..."
              />
              <button
                type="button"
                onClick={() => remove(idx)}
                className="text-[#3A3020] hover:text-red-400 transition-colors pt-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={add}
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#C9A84C] hover:text-[#E8CC80] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Template
          </button>
        </div>
      )}
    </section>
  );
}
