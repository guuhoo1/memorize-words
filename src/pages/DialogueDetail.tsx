import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/memorizeStore';
import { ArrowLeft, BookOpen } from 'lucide-react';
import WordForm from '@/components/WordForm';
import Modal from '@/components/Modal';
import type { Word } from '@/types';

export default function DialogueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dialogues = useStore(s => s.dialogues);
  const words = useStore(s => s.words);
  const addWord = useStore(s => s.addWord);
  const updateWord = useStore(s => s.updateWord);

  const [editing, setEditing] = useState<Word | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const d = dialogues.find(x => x.id === Number(id));

  if (!d) {
    return (
      <div className="empty py-[60px]">
        <p className="mb-3">对话不存在</p>
        <button onClick={() => navigate('/dialogues')} className="btn btn-primary">返回对话库</button>
      </div>
    );
  }

  // 关联生词：word.sourceDialogueId === d.id
  const linkedWords = words.filter(w => w.sourceDialogueId === d.id);
  const allTags = Array.from(new Set(words.flatMap(w => w.tags)));

  const rawLines = d.content.split('\n').filter(Boolean);

  // speaker → 颜色映射（稳定 hash）
  const speakerColors: Record<string, string> = {};
  const palette = ['#5b7bff', '#dc2743', '#16934a', '#bc1888', '#f09433', '#6f5bf7'];
  let colorIdx = 0;

  const parsedLines = rawLines.map((line, i) => {
    const colonIdx = line.indexOf(':');
    let speaker = '', text = line;
    if (colonIdx > 0 && colonIdx < 12) {
      speaker = line.slice(0, colonIdx).trim();
      text = line.slice(colonIdx + 1).trim();
      if (speaker && !speakerColors[speaker]) {
        speakerColors[speaker] = palette[colorIdx % palette.length];
        colorIdx++;
      }
    }
    return { speaker, text, isRight: i % 2 === 1 };
  });

  return (
    <div className="animate-[fadeUp_0.5s_ease-out]">
      <button
        onClick={() => navigate('/dialogues')}
        className="btn-ghost text-muted hover:text-ink text-[13px] mb-4 inline-flex items-center gap-1"
      >
        <ArrowLeft size={15} /> 返回对话库
      </button>

      <div className="dp-head mb-[22px]">
        <div className="dlg-scene text-[11px] font-medium tracking-[0.3px] uppercase text-accent">
          {d.source ?? d.category}
        </div>
        <h3 className="text-[17px] font-semibold mt-[10px]">{d.title}</h3>
        <div className="muted text-[12px] text-muted mt-1">
          更新于 {d.updatedAt ? new Date(d.updatedAt).toLocaleDateString('zh-CN') : ''}
        </div>
      </div>

      <div className="lines flex flex-col">
        {parsedLines.map((line, i) => (
          <div key={i} className={`line flex gap-2 max-w-[84%] mb-[14px] ${line.isRight ? 'right ml-auto flex-row-reverse' : ''}`}>
            {line.speaker && (
              <div
                className="avatar w-[28px] h-[28px] rounded-full grid place-items-center text-[11px] font-semibold text-white flex-shrink-0"
                style={{ background: speakerColors[line.speaker] ?? '#f0f0f0' }}
              >
                {line.speaker.slice(0, 1).toUpperCase()}
              </div>
            )}
            {!line.speaker && <div className="avatar w-[28px] h-[28px] flex-shrink-0" />}
            <div>
              <div className={`bubble rounded-[18px] px-[15px] py-[11px] text-[14px] leading-[1.5] ${
                line.isRight ? 'bg-ink text-white' : 'bg-[#f5f5f5] text-ink'
              }`}>
                {line.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      {linkedWords.length > 0 && (
        <div className="mt-6 pt-6 border-t border-line">
          <h3 className="text-[11px] font-semibold text-muted tracking-wider uppercase mb-3">关联生词 ({linkedWords.length})</h3>
          <div className="flex flex-wrap gap-2">
            {linkedWords.map(w => (
              <button
                key={w.id}
                onClick={() => setEditing(w)}
                className="chip cursor-pointer hover:bg-ink/[0.08]"
              >
                <b className="font-semibold mr-1.5">{w.english}</b>
                {w.chinese}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => setShowAdd(true)}
          className="text-[13px] text-muted hover:text-ink inline-flex items-center gap-1.5"
        >
          <BookOpen size={14} /> 在此对话中添加新单词
        </button>
      </div>

      {/* 添加 Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="在此对话中添加新单词" size="md">
        <WordForm
          defaultSourceDialogueId={d.id}
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
          />
        )}
      </Modal>
    </div>
  );
}
