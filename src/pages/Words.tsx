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
      <header className="flex items-center justify-between gap-3 mb-[22px] sm:mb-[30px]">
        <div>
          <h2 className="text-[18px] sm:text-[20px] font-semibold tracking-tight text-ink">单词库</h2>
          <p className="text-[12px] sm:text-[13px] text-muted mt-[3px] sm:mt-[5px]">
            共 {filtered.length} 个单词 {tag && <>· 筛选: <span className="text-accent">{tag}</span></>}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="btn btn-primary px-3 sm:px-4 py-2 sm:py-[9px] rounded-[12px] text-[13px] font-medium touch-manipulation"
        >
          <Plus size={15} className="inline mr-1.5 -mt-0.5" /> 添加
        </button>
      </header>

      {/* Tag chips + search */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-[18px] sm:mb-[22px]">
        <div className="flex flex-wrap gap-2">
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
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          <Search size={14} className="text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索英文或中文..."
            className="flex-1 sm:w-[200px] form-field text-[13px] py-2"
          />
        </div>
      </div>

      {/* Word list */}
      {filtered.length === 0 ? (
        <div className="empty">没有找到匹配的单词</div>
      ) : (
        <div className="space-y-2 sm:space-y-0">
          {filtered.map(w => (
            <div
              key={w.id}
              onClick={() => setEditing(w)}
              className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4 p-3 sm:py-4 sm:px-2 sm:border-b border-line sm:first:pt-1 bg-white sm:bg-transparent sm:rounded-none rounded-xl cursor-pointer active:bg-black/[0.03] sm:active:bg-transparent sm:hover:bg-black/[0.015] transition-colors touch-manipulation"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-[16px] sm:text-[16px] font-semibold tracking-tight text-ink">{w.english}</span>
                  {w.phonetic && <span className="text-[12px] text-muted">{w.phonetic}</span>}
                  <button
                    onClick={e => { e.stopPropagation(); speak(w.english); }}
                    title="朗读单词"
                    className="shrink-0 text-muted hover:text-ink transition-colors active:scale-90 touch-manipulation p-1 -m-1"
                  >
                    <Volume2 size={15} />
                  </button>
                </div>
                <div className="text-[13px] text-[#3d3d3d] mt-[4px] sm:mt-[5px]">{w.chinese}</div>
                {w.example && (
                  <div className="flex items-start gap-1.5 text-[12px] text-muted mt-[3px] sm:mt-[4px]">
                    <button
                      onClick={e => { e.stopPropagation(); speak(w.example!); }}
                      title="朗读例句"
                      className="shrink-0 text-muted hover:text-ink transition-colors active:scale-90 mt-0.5 p-1 -m-1"
                    >
                      <Play size={11} fill="currentColor" />
                    </button>
                    <span className="line-clamp-2">{w.example}</span>
                  </div>
                )}
                {w.tags.length > 0 && (
                  <div className="mt-[5px] flex gap-1.5 flex-wrap">
                    {w.tags.map(t => (
                      <span key={t} className="text-[10.5px] font-medium tracking-[0.3px] uppercase text-accent">{t}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* 桌面端右侧列 */}
              <div className="hidden sm:flex flex-col items-end gap-[7px]">
                <div className="dots flex gap-[3px]">
                  {[0,1,2,3,4].map(i => (
                    <i key={i} className={`w-[6px] h-[6px] rounded-full ${i < Math.min(w.repetitions + 1, 5) ? 'bg-ink' : 'bg-[#e8e8e8]'}`} />
                  ))}
                </div>
                <span className="text-[11px] text-muted">{formatDue(w.nextReview, w.repetitions)}</span>
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

              {/* 移动端底部行：状态 + 操作 */}
              <div className="flex sm:hidden items-center justify-between mt-1">
                <div className="flex items-center gap-2">
                  <div className="dots flex gap-[3px]">
                    {[0,1,2,3,4].map(i => (
                      <i key={i} className={`w-[5px] h-[5px] rounded-full ${i < Math.min(w.repetitions + 1, 5) ? 'bg-ink' : 'bg-[#e8e8e8]'}`} />
                    ))}
                  </div>
                  <span className="text-[11px] text-muted">{formatDue(w.nextReview, w.repetitions)}</span>
                </div>
                <div className="flex gap-1 items-center">
                  <button
                    onClick={e => { e.stopPropagation(); setEditing(w); }}
                    className="text-muted hover:text-ink p-1.5 touch-manipulation"
                    title="编辑"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (confirm(`确定删除 "${w.english}"？`)) deleteWord(w.id);
                    }}
                    className="text-muted hover:text-[#d94a5f] p-1.5 touch-manipulation"
                    title="删除"
                  >
                    <Trash2 size={16} />
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
          existingTags={allTags}
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
            existingTags={allTags}
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


