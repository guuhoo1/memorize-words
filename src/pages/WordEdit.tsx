import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/memorizeStore';
import { ArrowLeft } from 'lucide-react';

export default function WordEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const words = useStore(s => s.words);
  const addWord = useStore(s => s.addWord);
  const updateWord = useStore(s => s.updateWord);

  const existing = id ? words.find(w => w.id === id) : undefined;
  const isEdit = !!existing;

  const [english, setEnglish] = useState(existing?.english ?? '');
  const [chinese, setChinese] = useState(existing?.chinese ?? '');
  const [phonetic, setPhonetic] = useState(existing?.phonetic ?? '');
  const [example, setExample] = useState(existing?.example ?? '');
  const [tagsInput, setTagsInput] = useState(existing?.tags.join(', ') ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!english.trim() || !chinese.trim()) return;
    const tags = tagsInput.split(',').map(s => s.trim()).filter(Boolean);
    if (isEdit && existing) {
      updateWord(existing.id, { english, chinese, phonetic, example, tags });
    } else {
      addWord({ english, chinese, phonetic, example, tags });
    }
    navigate('/words');
  };

  return (
    <div className="animate-[fadeUp_0.5s_ease-out]">
      <button
        onClick={() => navigate('/words')}
        className="btn-ghost text-muted hover:text-ink text-[13px] mb-4 inline-flex items-center gap-1"
      >
        <ArrowLeft size={15} /> 返回单词库
      </button>

      <h2 className="text-[20px] font-semibold tracking-tight mb-[22px]">
        {isEdit ? '编辑单词' : '添加新单词'}
      </h2>

      <form onSubmit={handleSubmit} className="form bg-white rounded-[18px] p-5">
        <div className="form-grid grid grid-cols-2 gap-3">
          <div className="field col-span-full">
            <label className="text-[11px] text-muted tracking-wide">英文 *</label>
            <input type="text" value={english} onChange={e => setEnglish(e.target.value)}
              className="form-field mt-1.5"
              placeholder="serendipity" required />
          </div>
          <div className="field col-span-full">
            <label className="text-[11px] text-muted tracking-wide">中文释义 *</label>
            <input type="text" value={chinese} onChange={e => setChinese(e.target.value)}
              className="form-field mt-1.5"
              placeholder="意外发现美好事物的运气" required />
          </div>
          <div className="field">
            <label className="text-[11px] text-muted tracking-wide">音标</label>
            <input type="text" value={phonetic} onChange={e => setPhonetic(e.target.value)}
              className="form-field mt-1.5"
              placeholder="/ˌserənˈdɪpəti/" />
          </div>
          <div className="field">
            <label className="text-[11px] text-muted tracking-wide">标签 (逗号分隔)</label>
            <input type="text" value={tagsInput} onChange={e => setTagsInput(e.target.value)}
              className="form-field mt-1.5"
              placeholder="雅思, 电影台词" />
          </div>
          <div className="field col-span-full">
            <label className="text-[11px] text-muted tracking-wide">例句</label>
            <textarea value={example} onChange={e => setExample(e.target.value)} rows={3}
              className="form-field mt-1.5 resize-none"
              placeholder="英文例句，帮助理解语境..." />
          </div>
        </div>
        <div className="form-actions flex gap-2 mt-4 justify-end">
          <button type="button" onClick={() => navigate('/words')}
            className="btn bg-[#f2f2f2] text-ink hover:bg-[#e8e8e8] px-4 py-[9px] rounded-[12px] text-[13px] font-medium">
            取消
          </button>
          <button type="submit" className="btn btn-primary px-4 py-[9px] rounded-[12px] text-[13px] font-medium">
            {isEdit ? '保存修改' : '添加'}
          </button>
        </div>
      </form>
    </div>
  );
}
