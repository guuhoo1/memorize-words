import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/memorizeStore';
import type { DialogueCategory } from '@/types';
import Modal from '@/components/Modal';
import { Plus, FileText } from 'lucide-react';
import { dictsApi } from '@/utils/api';

const FALLBACK_CATEGORIES: DialogueCategory[] = ['电影/剧集', '书籍', '演讲', '日常/工作'];

export default function Dialogues() {
  const dialogues = useStore(s => s.dialogues);
  const addDialogue = useStore(s => s.addDialogue);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<DialogueCategory[]>(FALLBACK_CATEGORIES);
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState<DialogueCategory | ''>('');

  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [selCategory, setSelCategory] = useState<DialogueCategory>('电影/剧集');
  const [content, setContent] = useState('');

  // 从字典表动态加载分类
  useEffect(() => {
    dictsApi.list('dialogue_category').then(items => {
      if (items.length > 0) {
        const labels = items.map(i => i.itemLabel) as DialogueCategory[];
        setCategories(labels);
        setSelCategory(prev => labels.includes(prev) ? prev : labels[0]);
      }
    }).catch(() => { /* 401 等拦截器已处理，保持 fallback */ });
  }, []);

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
          {[['', '全部'], ...categories.map(c => [c, c] as [string, string])].map(([val, label]) => (
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
      {dialogues.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-neutral-200 bg-white/60 py-[60px] px-5 text-center">
          <div className="w-14 h-14 rounded-[16px] bg-neutral-100 inline-flex items-center justify-center mb-4">
            <FileText size={24} className="text-neutral-400" strokeWidth={1.8} />
          </div>
          <h3 className="text-[16px] font-semibold text-neutral-800 mb-1">还没有对话素材</h3>
          <p className="text-[13px] text-neutral-500 mb-5 max-w-[300px] mx-auto leading-relaxed">
            把喜欢的电影台词、书摘、演讲片段贴进来，随时翻看跟读
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-[4px] h-10 px-5 rounded-[12px] bg-neutral-900 text-white text-[13.5px] font-medium hover:bg-neutral-800 transition-colors"
          >
            <Plus size={15} strokeWidth={2.2} /> 添加第一条
          </button>
          <div className="mt-5 flex items-center justify-center gap-3 text-[11.5px] text-neutral-400">
            <span>💡</span>
            <span>试试 Friends 咖啡馆那段 · 或 TED 演讲开头</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[20px] border border-neutral-100 bg-white py-[40px] text-center">
          <p className="text-[13.5px] text-neutral-500">当前分类下还没有对话</p>
          <button
            onClick={() => { setCategory(''); }}
            className="mt-3 text-[13px] text-neutral-900 underline underline-offset-2 hover:no-underline"
          >
            查看全部 {dialogues.length} 条
          </button>
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
      <Modal open={showModal} onClose={() => setShowModal(false)} title="添加对话素材" size="lg">
        <form onSubmit={handleSubmit} className="p-5">
          <div className="space-y-4">
            <div>
              <label className="text-[12px] text-neutral-600 mb-1.5 block font-medium">标题 *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                className="w-full h-11 px-4 rounded-[12px] bg-[#fafafa] focus:bg-[#f2f2f2] outline-none text-[14px]"
                placeholder="例如: Friends S01E01 · 咖啡馆偶遇" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] text-neutral-600 mb-1.5 block font-medium">来源</label>
                <input type="text" value={source} onChange={e => setSource(e.target.value)}
                  className="w-full h-10 px-4 rounded-[12px] bg-[#fafafa] focus:bg-[#f2f2f2] outline-none text-[13px]"
                  placeholder="Friends 老友记" />
              </div>
              <div>
                <label className="text-[12px] text-neutral-600 mb-1.5 block font-medium">分类</label>
                <select value={selCategory} onChange={e => setSelCategory(e.target.value as DialogueCategory)}
                  className="w-full h-10 px-4 rounded-[12px] bg-[#fafafa] focus:bg-[#f2f2f2] outline-none text-[13px]">
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[12px] text-neutral-600 mb-1.5 block font-medium">对话内容 *</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={8}
                className="w-full px-4 py-3 rounded-[12px] bg-[#fafafa] focus:bg-[#f2f2f2] outline-none text-[13px] resize-none leading-relaxed font-mono"
                placeholder="粘贴或输入对话文本..." required />
            </div>
          </div>
          <div className="flex gap-2 mt-5 justify-end">
            <button type="button" onClick={() => setShowModal(false)}
              className="btn bg-[#f2f2f2] text-ink hover:bg-[#e8e8e8] px-4 py-[9px] rounded-[12px] text-[13px] font-medium">
              取消
            </button>
            <button type="submit" className="btn btn-primary px-5 py-[9px] rounded-[12px] text-[13px] font-medium">保存</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
