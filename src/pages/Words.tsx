import { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/store/memorizeStore';
import WordForm from '@/components/WordForm';
import Modal from '@/components/Modal';
import type { Word } from '@/types';
import { Plus, Trash2, Play, Search, Pencil, Volume2 } from 'lucide-react';
import { speak, initSpeechVoices } from '@/utils/speech';

export default function Words() {
  const words = useStore(s => s.words);
  const addWord = useStore(s => s.addWord);
  const updateWord = useStore(s => s.updateWord);
  const deleteWord = useStore(s => s.deleteWord);

  const [search, setSearch] = useState('');
  const [tag, setTag] = useState<string>('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Word | null>(null);

  useEffect(() => initSpeechVoices(), []);

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
          onClick={() => setShowAdd(true)}
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
            placeholder="搜索英文或中文..."
            className="w-[200px] form-field text-[13px] py-2"
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
              onClick={() => setEditing(w)}
              className="flex justify-between gap-4 py-4 border-b border-line first:pt-1 cursor-pointer group hover:bg-black/[0.015] rounded-lg px-2 -mx-2 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="w-en text-[16px] font-semibold tracking-tight text-ink">{w.english}</span>
                  {w.phonetic && <span className="w-ph text-[12px] text-muted">{w.phonetic}</span>}
                  <button
                    onClick={e => { e.stopPropagation(); speak(w.english); }}
                    title="朗读单词"
                    className="shrink-0 text-muted hover:text-ink transition-colors active:scale-90 touch-manipulation"
                  >
                    <Volume2 size={13} />
                  </button>
                </div>
                <div className="w-cn text-[13px] text-[#3d3d3d] mt-[5px]">{w.chinese}</div>
                {w.example && (
                  <div className="flex items-start gap-1.5 w-ex text-[12px] text-muted mt-[4px]">
                    <button
                      onClick={e => { e.stopPropagation(); speak(w.example!); }}
                      title="朗读例句"
                      className="shrink-0 text-muted hover:text-ink transition-colors active:scale-90 mt-0.5"
                    >
                      <Play size={10} fill="currentColor" />
                    </button>
                    <span className="line-clamp-2">{w.example}</span>
                  </div>
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
                <span className="w-due text-[11px] text-muted">{formatDue(w.nextReview, w.repetitions)}</span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 items-center">
                  <button
                    onClick={e => { e.stopPropagation(); setEditing(w); }}
                    className="text-muted hover:text-ink"
                    title="编辑"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (confirm(`确定删除 "${w.english}"？`)) deleteWord(w.id);
                    }}
                    className="text-muted hover:text-[#d94a5f]"
                    title="删除"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 添加 Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="添加新单词" size="md">
        <WordForm
          onSubmit={async (data) => {
            await addWord(data);
            setShowAdd(false);
          }}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>

      {/* 编辑 Modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="编辑单词" size="md">
        {editing && (
          <WordForm
            key={editing.id}
            initial={editing}
            onSubmit={async (data) => {
              await updateWord(editing.id, data);
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
            onDelete={async () => {
              await deleteWord(editing.id);
              setEditing(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function formatDue(ts?: string, repetitions?: number) {
  if (repetitions === 0 || !ts) return '待复习';
  const diff = Math.ceil((new Date(ts).getTime() - Date.now()) / 86400000);
  if (diff < 0) return '已到期';
  if (diff === 0) return '今天';
  return `${diff} 天后`;
}


