import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/memorizeStore';
import type { DialogueCategory } from '@/types';
import { Plus, FileText, ArrowLeft } from 'lucide-react';

const CATEGORIES: DialogueCategory[] = ['电影/剧集', '书籍', '演讲', '日常/工作'];

export default function Dialogues() {
  const dialogues = useStore(s => s.dialogues);
  const addDialogue = useStore(s => s.addDialogue);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState<DialogueCategory | ''>('');

  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [selCategory, setSelCategory] = useState<DialogueCategory>('电影/剧集');
  const [content, setContent] = useState('');

  const filtered = category ? dialogues.filter(d => d.category === category) : dialogues;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    addDialogue({ title, source, category: selCategory, content });
    setTitle(''); setSource(''); setContent(''); setShowModal(false);
  };

  return (
    <div className="animate-[fadeUp_0.5s_ease-out]">
      {/* Head */}
      <header className="flex items-center justify-between gap-4 mb-[30px]">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight text-ink">对话库</h2>
          <p className="text-[13px] text-muted mt-[5px]">共 {dialogues.length} 段素材</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary px-4 py-[9px] rounded-[12px] text-[13px] font-medium"
        >
          <Plus size={15} className="inline mr-1.5 -mt-0.5" /> 添加对话
        </button>
      </header>

      {/* Category segment */}
      <div className="flex gap-2 mb-6">
        <div className="seg flex gap-[2px] bg-[#f2f2f2] p-[3px] rounded-[13px] flex-wrap">
          {[['', '全部'], ...CATEGORIES.map(c => [c, c] as [string, string])].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setCategory(val as DialogueCategory | '')}
              className={`px-3 py-[7px] rounded-[10px] text-[12px] transition-all ${
                category === val
                  ? 'bg-white text-ink font-medium'
                  : 'text-muted'
              }`}
              style={category === val ? { boxShadow: '0 1px 4px rgba(0,0,0,0.07)' } : {}}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="empty bg-white rounded-[18px]">
          <FileText size={40} className="mx-auto mb-3 text-muted" />
          <div>还没有对话素材，粘贴台词或段落来积累吧</div>
        </div>
      ) : (
        <div className="dlg-grid grid grid-cols-2 gap-[12px]">
          {filtered.map(d => {
            const preview = d.content.split('\n').filter(Boolean)[0] || '';
            return (
              <button
                key={d.id}
                onClick={() => navigate(`/dialogues/${d.id}`)}
                className="dlg bg-white rounded-[18px] px-5 py-5 flex flex-col gap-[7px] cursor-pointer hover:-translate-y-[3px] transition-transform text-left"
              >
                <span className="dlg-scene text-[11px] font-medium tracking-[0.3px] text-accent uppercase">
                  {d.source ?? d.category}
                </span>
                <h3 className="text-[15px] font-semibold tracking-tight text-ink leading-tight">
                  {d.title}
                </h3>
                <p className="text-[12px] text-muted line-clamp-2 mt-1">
                  {preview.length > 80 ? preview.slice(0, 80) + '...' : preview}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-[18px] w-full max-w-[520px] max-h-[85vh] overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-5 py-4 border-b border-line">
              <h3 className="text-[16px] font-semibold text-ink">添加对话素材</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-[10px] text-muted hover:bg-[#f2f2f2] inline-flex items-center justify-center"
              >✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5">
              <div className="form grid grid-cols-2 gap-3 bg-white">
                <div className="field col-span-full">
                  <label className="text-[11px] text-muted tracking-wide">标题 *</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                    className="form-field mt-1.5"
                    placeholder="例如: Friends S01E01 · 咖啡馆偶遇" required />
                </div>
                <div className="field">
                  <label className="text-[11px] text-muted tracking-wide">来源</label>
                  <input type="text" value={source} onChange={e => setSource(e.target.value)}
                    className="form-field mt-1.5" placeholder="Friends 老友记" />
                </div>
                <div className="field">
                  <label className="text-[11px] text-muted tracking-wide">分类</label>
                  <select value={selCategory} onChange={e => setSelCategory(e.target.value as DialogueCategory)}
                    className="form-field mt-1.5">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field col-span-full">
                  <label className="text-[11px] text-muted tracking-wide">对话内容 *</label>
                  <textarea value={content} onChange={e => setContent(e.target.value)} rows={7}
                    className="form-field mt-1.5 resize-none" placeholder="粘贴或输入对话文本..." required />
                </div>
              </div>
              <div className="form-actions flex gap-2 mt-4 justify-end">
                <button type="button" onClick={() => setShowModal(false)}
                  className="btn bg-[#f2f2f2] text-ink hover:bg-[#e8e8e8] px-4 py-[9px] rounded-[12px] text-[13px] font-medium">
                  取消
                </button>
                <button type="submit" className="btn btn-primary px-4 py-[9px] rounded-[12px] text-[13px] font-medium">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Not used in this file - kept for potential future use in WordEdit redirects
export function _ArrowLeft() { return <ArrowLeft size={15} />; }
