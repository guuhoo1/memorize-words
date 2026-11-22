import { useState, useEffect } from 'react';
import type { SentencePattern } from '@/types';

interface PatternFormProps {
  initial?: SentencePattern;
  onSubmit: (data: {
    pattern: string; english: string; chinese: string;
    explanation?: string; category?: string; tags?: string[];
  }) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
}

export default function PatternForm({ initial, onSubmit, onCancel, onDelete }: PatternFormProps) {
  const isEdit = !!initial;

  const [pattern, setPattern] = useState(initial?.pattern ?? '');
  const [english, setEnglish] = useState(initial?.english ?? '');
  const [chinese, setChinese] = useState(initial?.chinese ?? '');
  const [explanation, setExplanation] = useState(initial?.explanation ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [tagsInput, setTagsInput] = useState(initial?.tags?.join(', ') ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pattern.trim() || !english.trim() || !chinese.trim()) {
      setError('请填写句型模板、英文例句和中文翻译');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSubmit({
        pattern: pattern.trim(),
        english: english.trim(),
        chinese: chinese.trim(),
        explanation: explanation.trim() || undefined,
        category: category.trim() || undefined,
        tags: tagsInput.split(',').map(s => s.trim()).filter(Boolean)
      });
    } catch (err: any) {
      setError(err?.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-5">
      <div className="space-y-4">
        <Field label="句型模板" required>
          <input
            type="text"
            autoFocus
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            placeholder="It is + adj + for sb to do sth"
            className="w-full h-11 px-4 rounded-[12px] bg-[#fafafa] focus:bg-[#f2f2f2] outline-none text-[14px] font-mono"
          />
        </Field>

        <Field label="英文例句" required>
          <textarea
            value={english}
            onChange={e => setEnglish(e.target.value)}
            rows={2}
            placeholder="It is important for us to protect the environment."
            className="w-full px-4 py-3 rounded-[12px] bg-[#fafafa] focus:bg-[#f2f2f2] outline-none text-[14px] leading-relaxed resize-none"
          />
        </Field>

        <Field label="中文翻译" required>
          <input
            type="text"
            value={chinese}
            onChange={e => setChinese(e.target.value)}
            placeholder="对我们来说保护环境很重要。"
            className="w-full h-11 px-4 rounded-[12px] bg-[#fafafa] focus:bg-[#f2f2f2] outline-none text-[14px]"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="分类">
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="简单句 / 倒装句 / 强调句"
              className="w-full h-10 px-4 rounded-[12px] bg-[#fafafa] focus:bg-[#f2f2f2] outline-none text-[13px]"
            />
          </Field>
          <Field label="标签">
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="常用, cet4, 考研"
              className="w-full h-10 px-4 rounded-[12px] bg-[#fafafa] focus:bg-[#f2f2f2] outline-none text-[13px]"
            />
          </Field>
        </div>

        <Field label="用法说明（可选）">
          <textarea
            value={explanation}
            onChange={e => setExplanation(e.target.value)}
            rows={3}
            placeholder="用于描述某事对某人来说具有某种性质..."
            className="w-full px-4 py-3 rounded-[12px] bg-[#fafafa] focus:bg-[#f2f2f2] outline-none text-[13px] leading-relaxed resize-none"
          />
        </Field>
      </div>

      {error && <p className="text-[12px] text-red-500 mt-3">{error}</p>}

      <div className="flex gap-2 mt-5 justify-between">
        {onDelete ? (
          <button
            type="button"
            onClick={async () => { if (confirm(`确定删除 "${pattern}"？`)) await onDelete(); }}
            className="btn text-[#d94a5f] hover:bg-[#fff0f2] px-3 py-[9px] rounded-[12px] text-[13px] font-medium"
          >
            删除
          </button>
        ) : <span />}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="btn bg-[#f2f2f2] text-ink hover:bg-[#e8e8e8] px-4 py-[9px] rounded-[12px] text-[13px] font-medium"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary px-5 py-[9px] rounded-[12px] text-[13px] font-medium disabled:opacity-50"
          >
            {loading ? '保存中…' : isEdit ? '保存修改' : '添加句型'}
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[12px] text-neutral-600 mb-1.5 block font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
