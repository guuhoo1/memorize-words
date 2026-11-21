import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/memorizeStore';
import { Plus, Trash2, Play, Search } from 'lucide-react';

export default function Words() {
  const words = useStore(s => s.words);
  const deleteWord = useStore(s => s.deleteWord);
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [tag, setTag] = useState<string>('');

  const allTags = useMemo(() => {
    const s = new Set<string>();
    words.forEach(w => w.tags.forEach(t => s.add(t)));
    return [...s];
  }, [words]);

  const filtered = useMemo(() => {
    let list = words;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(w =>
        w.english.toLowerCase().includes(q) || w.chinese.includes(search)
      );
    }
    if (tag) list = list.filter(w => w.tags.includes(tag));
    return list;
  }, [words, search, tag]);

  return (
    <div className="animate-[fadeUp_0.5s_ease-out]">
      {/* Head */}
      <header className="flex items-center justify-between gap-4 mb-[30px]">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight text-ink">单词库</h2>
          <p className="text-[13px] text-muted mt-[5px]">
            共 {filtered.length} 个单词 {tag && <>· 筛选: <span className="text-accent">{tag}</span></>}
          </p>
        </div>
        <button
          onClick={() => navigate('/words/new')}
          className="btn btn-primary px-4 py-[9px] rounded-[12px] text-[13px] font-medium"
        >
          <Plus size={15} className="inline mr-1.5 -mt-0.5" /> 添加单词
        </button>
      </header>

      {/* Tag chips + search */}
      <div className="flex flex-wrap gap-2 mb-[22px]">
        <button
          onClick={() => setTag('')}
          className={`chip ${!tag ? 'text-ink bg-ink/[0.04]' : ''}`}
        >全部</button>
        {allTags.map(t => (
          <button
            key={t}
            onClick={() => setTag(t === tag ? '' : t)}
            className={`chip ${t === tag ? 'text-ink bg-ink/[0.04]' : ''}`}
          >{t}</button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <Search size={14} className="text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索..."
            className="w-[180px] form-field text-[13px] py-2"
          />
        </div>
      </div>

      {/* Word list */}
      {filtered.length === 0 ? (
        <div className="empty">没有找到匹配的单词</div>
      ) : (
        <div>
          {filtered.map(w => (
            <div
              key={w.id}
              onClick={() => navigate(`/words/${w.id}`)}
              className="flex justify-between gap-4 py-4 border-b border-line first:pt-1 cursor-pointer group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="w-en text-[16px] font-semibold tracking-tight text-ink">{w.english}</span>
                  {w.phonetic && <span className="w-ph text-[12px] text-muted">{w.phonetic}</span>}
                  <button
                    onClick={e => { e.stopPropagation(); speak(w.english); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-muted hover:text-ink"
                  >
                    <Play size={12} fill="currentColor" />
                  </button>
                </div>
                <div className="w-cn text-[13px] text-[#3d3d3d] mt-[5px]">{w.chinese}</div>
                {w.example && (
                  <div className="w-ex text-[12px] text-muted mt-[4px] line-clamp-1">{w.example}</div>
                )}
                {w.tags.length > 0 && (
                  <div className="mt-[6px] flex gap-1.5">
                    {w.tags.map(t => (
                      <span key={t} className="text-[10.5px] font-medium tracking-[0.3px] uppercase text-accent">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="w-side flex flex-col items-end gap-[7px]">
                <div className="dots flex gap-[3px]">
                  {[0,1,2,3,4].map(i => (
                    <i key={i} className={`w-[6px] h-[6px] rounded-full ${i < Math.min(w.repetitions + 1, 5) ? 'bg-ink' : 'bg-[#e8e8e8]'}`} />
                  ))}
                </div>
                <span className="w-due text-[11px] text-muted">{formatDue(w.nextReview)}</span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    if (confirm(`确定删除 "${w.english}"？`)) deleteWord(w.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-[#d94a5f]"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDue(ts: number) {
  const diff = Math.ceil((ts - Date.now()) / 86400000);
  if (diff < 0) return '已到期';
  if (diff === 0) return '今天';
  return `${diff} 天后`;
}

function speak(text: string) {
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }
}
