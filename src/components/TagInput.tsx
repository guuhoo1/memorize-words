import { useState, useEffect, useRef, useMemo } from 'react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  className?: string;
}

/**
 * 一体化标签输入：已选 chip + 透明输入框 + 自动补全 + 候选面板
 * 参考 Linear / Notion / Raycast 的 tag input 风格
 */
export default function TagInput({ value, onChange, suggestions = [], placeholder, className = '' }: TagInputProps) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = input.trim().toLowerCase();
    const selectedSet = new Set(value.map(v => v.toLowerCase()));
    const existing = suggestions.filter(s => !selectedSet.has(s.toLowerCase()));
    if (!q) return existing.slice(0, 8);
    return existing
      .filter(s => s.toLowerCase().includes(q))
      .slice(0, 8);
  }, [input, suggestions, value]);

  const creatingNew = input.trim().length > 0 && !filtered.some(s => s.toLowerCase() === input.trim().toLowerCase());

  useEffect(() => {
    const onClickOut = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOut);
    return () => document.removeEventListener('mousedown', onClickOut);
  }, []);

  const add = (tag: string) => {
    const t = tag.trim();
    if (!t) return;
    const exists = new Set(value.map(v => v.toLowerCase()));
    if (!exists.has(t.toLowerCase())) onChange([...value, t]);
    setInput('');
    setHighlight(0);
    inputRef.current?.focus();
  };

  const remove = (tag: string) => {
    onChange(value.filter(v => v !== tag));
    inputRef.current?.focus();
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (open && filtered.length > 0 && highlight < filtered.length) {
        add(filtered[highlight]);
      } else if (creatingNew) {
        add(input);
      }
      setOpen(true);
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      e.preventDefault();
      remove(value[value.length - 1]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlight(h => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* 主容器 — chip + 输入框 一体化 */}
      <div
        className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-[#f7f7f7] focus-within:bg-[#f2f2f2] transition-colors min-h-[44px] px-2.5 py-2 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map(t => (
          <span
            key={t}
            className="inline-flex items-center gap-1 h-[26px] rounded-md bg-ink/8 text-ink text-[12px] font-medium px-2 group"
          >
            {t}
            <button
              type="button"
              aria-label={`移除 ${t}`}
              onClick={(e) => { e.stopPropagation(); remove(t); }}
              className="inline-flex items-center justify-center w-[16px] h-[16px] rounded-full hover:bg-ink/12 text-ink/50 hover:text-ink transition-colors leading-none"
            >
              ×
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => { setInput(e.target.value); setHighlight(0); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder={value.length === 0 ? (placeholder ?? '输入或选择标签…') : ''}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-[13px] text-ink placeholder:text-neutral-400 h-7"
        />
      </div>

      {/* 候选面板 */}
      {open && (filtered.length > 0 || creatingNew) && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 ring-ink/6 overflow-hidden animate-[fadeUp_120ms_ease-out]">
          <div className="py-1 max-h-[240px] overflow-y-auto">
            {filtered.map((s, i) => (
              <button
                key={s}
                type="button"
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => { e.preventDefault(); add(s); }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-left transition-colors ${
                  i === highlight ? 'bg-ink/6 text-ink' : 'text-neutral-700 hover:bg-ink/4'
                }`}
              >
                <span className="truncate">{s}</span>
                <span className="ml-auto text-[11px] text-neutral-400">已有</span>
              </button>
            ))}
            {creatingNew && (
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); add(input); }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-left transition-colors ${
                  highlight >= filtered.length ? 'bg-ink/6 text-ink' : 'text-neutral-700 hover:bg-ink/4'
                }`}
              >
                <span className="truncate">
                  <span className="text-neutral-400">新建标签：</span>
                  <span className="font-medium">{input.trim()}</span>
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
