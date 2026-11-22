import { useState, useMemo } from 'react';
import { useStore } from '@/store/memorizeStore';
import PatternForm from '@/components/PatternForm';
import Modal from '@/components/Modal';
import type { SentencePattern } from '@/types';
import { Plus, Trash2, Search, Pencil, Volume2 } from 'lucide-react';
import { speak, initSpeechVoices } from '@/utils/speech';

export default function SentencePatterns() {
  const sentencePatterns = useStore(s => s.sentencePatterns);
  const addPattern = useStore(s => s.addSentencePattern);
  const updatePattern = useStore(s => s.updateSentencePattern);
  const deletePattern = useStore(s => s.deleteSentencePattern);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<SentencePattern | null>(null);
  const [showExplain, setShowExplain] = useState<number | null>(null);

  // voices 预热（单页面一次）
  useMemo(() => { initSpeechVoices(); return null; }, []);

  const allCategories = useMemo(() => {
    const s = new Set<string>();
    sentencePatterns.forEach(sp => sp.category && s.add(sp.category));
    return [...s];
  }, [sentencePatterns]);

  const filtered = useMemo(() => {
    let list = sentencePatterns;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(sp =>
        sp.pattern.toLowerCase().includes(q) ||
        sp.english.toLowerCase().includes(q) ||
        sp.chinese.includes(search)
      );
    }
    if (category) list = list.filter(sp => sp.category === category);
    return list;
  }, [sentencePatterns, search, category]);

  return (
    <div className="animate-[fadeUp_0.5s_ease-out]">
      {/* Head */}
      <header className="flex items-center justify-between gap-4 mb-[30px]">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight text-ink">常用句型</h2>
          <p className="text-[13px] text-muted mt-[5px]">
            共 {filtered.length} 个句型 {category && <>· 筛选: <span className="text-accent">{category}</span></>}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="btn btn-primary px-4 py-[9px] rounded-[12px] text-[13px] font-medium"
        >
          <Plus size={15} className="inline mr-1.5 -mt-0.5" /> 添加句型
        </button>
      </header>

      {/* Category chips + search */}
      <div className="flex flex-wrap gap-2 mb-[22px]">
        <button
          onClick={() => setCategory('')}
          className={`chip ${!category ? 'text-ink bg-ink/[0.04]' : ''}`}
        >全部</button>
        {allCategories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c === category ? '' : c)}
            className={`chip ${c === category ? 'text-ink bg-ink/[0.04]' : ''}`}
          >{c}</button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <Search size={14} className="text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索模板/英文/中文..."
            className="w-[220px] form-field text-[13px] py-2"
          />
        </div>
      </div>

      {/* Pattern list */}
      {filtered.length === 0 ? (
        <div className="empty">还没有常用句型，点右上角添加一个吧</div>
      ) : (
        <div>
          {filtered.map(sp => (
            <div
              key={sp.id}
              onClick={() => setEditing(sp)}
              className="py-4 border-b border-line first:pt-1 cursor-pointer group hover:bg-black/[0.015] rounded-lg px-2 -mx-2 transition-colors"
            >
              {/* 第一行：句型模板 + 朗读 + 分类标签 */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-1.5 flex-1 min-w-0">
                  {renderPattern(sp.pattern)}
                </div>
                <span className="shrink-0 text-[10.5px] font-medium tracking-[0.3px] uppercase text-accent mt-0.5">
                  {sp.category || '未分类'}
                </span>
              </div>

              {/* 第二行：英文例句 + 朗读按钮 */}
              <div className="flex items-center gap-2 mt-[10px]">
                <button
                  onClick={e => { e.stopPropagation(); speak(sp.english); }}
                  title="朗读例句"
                  className="shrink-0 text-muted hover:text-ink transition-colors active:scale-90 touch-manipulation"
                >
                  <Volume2 size={13} />
                </button>
                <span className="text-[14px] font-medium text-ink leading-snug flex-1">
                  {sp.english}
                </span>
              </div>

              {/* 第三行：中文翻译 */}
              <div className="text-[13px] text-[#3d3d3d] mt-[5px] ml-[22px]">
                {sp.chinese}
              </div>

              {/* 第四行：用法说明（折叠） + 标签 + 操作按钮 */}
              <div className="flex items-end justify-between gap-2 mt-[8px] ml-[22px]">
                <div className="flex-1 min-w-0">
                  {sp.explanation && (
                    <button
                      onClick={e => { e.stopPropagation(); setShowExplain(showExplain === sp.id ? null : sp.id); }}
                      className="text-[11px] text-accent hover:underline"
                    >
                      {showExplain === sp.id ? '收起说明' : '查看用法'}
                    </button>
                  )}
                  {showExplain === sp.id && sp.explanation && (
                    <p className="text-[12px] text-muted mt-[4px] leading-relaxed bg-[#fafafa] px-3 py-2 rounded-[8px] border-l-2 border-accent/40">
                      {sp.explanation}
                    </p>
                  )}
                  {sp.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-[6px]">
                      {sp.tags.map(t => (
                        <span key={t} className="text-[10.5px] font-medium tracking-[0.3px] uppercase text-accent opacity-70">#{t}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 操作按钮：hover 显示 */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 items-center shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); setEditing(sp); }}
                    className="text-muted hover:text-ink"
                    title="编辑"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (confirm(`确定删除 "${sp.pattern}"？`)) deletePattern(sp.id);
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
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="添加常用句型" size="md">
        <PatternForm
          onSubmit={async (data) => {
            await addPattern(data);
            setShowAdd(false);
          }}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>

      {/* 编辑 Modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="编辑句型" size="md">
        {editing && (
          <PatternForm
            key={editing.id}
            initial={editing}
            onSubmit={async (data) => {
              await updatePattern(editing.id, data);
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
            onDelete={async () => {
              await deletePattern(editing.id);
              setEditing(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
