import { useState, useEffect } from 'react';
import type { Word } from '@/types';

interface WordFormProps {
  initial?: Word;
  existingTags?: string[];
  onSubmit: (data: {
    english: string;
    chinese: string;
    phonetic?: string;
    example?: string;
    tags: string[];
  }) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
}

export default function WordForm({ initial, onSubmit, onCancel, onDelete }: WordFormProps) {
  const isEdit = !!initial;

  const [english, setEnglish] = useState(initial?.english ?? '');
  const [chinese, setChinese] = useState(initial?.chinese ?? '');
  const [phonetic, setPhonetic] = useState(initial?.phonetic ?? '');
  const [example, setExample] = useState(initial?.example ?? '');
  const [tagsInput, setTagsInput] = useState(initial?.tags?.join(', ') ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // ESC 关闭
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!english.trim() || !chinese.trim()) {
      setError('请填写英文和中文释义');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSubmit({
        english: english.trim(),
        chinese: chinese.trim(),
        phonetic: phonetic.trim() || undefined,
        example: example.trim() || undefined,
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
        <Field label="英文单词" required>
          <input
            type="text"
            autoFocus
            value={english}
            onChange={e => setEnglish(e.target.value)}
            placeholder="serendipity"
            className="w-full h-11 px-4 rounded-[12px] bg-[#fafafa] focus:bg-[#f2f2f2] outline-none text-[15px] font-medium tracking-tight"
          />
        </Field>

        <Field label="中文释义" required>
          <input
            type="text"
            value={chinese}
            onChange={e => setChinese(e.target.value)}
            placeholder="意外发现美好事物的运气"
            className="w-full h-11 px-4 rounded-[12px] bg-[#fafafa] focus:bg-[#f2f2f2] outline-none text-[14px]"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="音标">
            <input
              type="text"
              value={phonetic}
              onChange={e => setPhonetic(e.target.value)}
              placeholder="/ˌserənˈdɪpəti/"
              className="w-full h-10 px-4 rounded-[12px] bg-[#fafafa] focus:bg-[#f2f2f2] outline-none text-[13px] font-mono"
            />
          </Field>
          <Field label="标签">
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="CET6, 雅思, 电影"
              className="w-full h-10 px-4 rounded-[12px] bg-[#fafafa] focus:bg-[#f2f2f2] outline-none text-[13px]"
            />
          </Field>
        </div>

        <Field label="例句（可选）">
          <textarea
            value={example}
            onChange={e => setExample(e.target.value)}
            rows={3}
            placeholder="Finding that rare book in a second-hand shop was pure serendipity."
            className="w-full px-4 py-3 rounded-[12px] bg-[#fafafa] focus:bg-[#f2f2f2] outline-none text-[13px] resize-none leading-relaxed"
          />
        </Field>
      </div>

      {error && <p className="text-[12px] text-red-500 mt-3">{error}</p>}

      <div className="flex gap-2 mt-5 justify-between">
        {onDelete ? (
          <button
            type="button"
            onClick={async () => { if (confirm(`确定删除 "${english}"？`)) await onDelete(); }}
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
            {loading ? '保存中…' : isEdit ? '保存修改' : '添加单词'}
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
