import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/memorizeStore';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function DialogueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dialogues = useStore(s => s.dialogues);
  const words = useStore(s => s.words);

  const d = dialogues.find(x => x.id === id);

  if (!d) {
    return (
      <div className="empty py-[60px]">
        <p className="mb-3">对话不存在</p>
        <button onClick={() => navigate('/dialogues')} className="btn btn-primary">返回对话库</button>
      </div>
    );
  }

  const linkedWords = d.wordIds.map(wid => words.find(w => w.id === wid)).filter(Boolean);

  // Parse content into lines (speaker: text format or alternating)
  const rawLines = d.content.split('\n').filter(Boolean);
  const parsedLines = rawLines.map((line, i) => {
    const colonIdx = line.indexOf(':');
    let speaker = '', text = line;
    if (colonIdx > 0 && colonIdx < 12) {
      speaker = line.slice(0, colonIdx).trim();
      text = line.slice(colonIdx + 1).trim();
    }
    return { speaker, text, isRight: i % 2 === 1 }; // alternating
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
          更新于 {new Date(d.updatedAt).toLocaleDateString('zh-CN')}
        </div>
      </div>

      {/* Chat bubbles */}
      <div className="lines flex flex-col">
        {parsedLines.map((line, i) => (
          <div key={i} className={`line flex gap-2 max-w-[84%] mb-[14px] ${line.isRight ? 'right ml-auto flex-row-reverse' : ''}`}>
            {line.speaker && (
              <div className="avatar w-[28px] h-[28px] rounded-full grid place-items-center text-[11px] font-semibold bg-[#f0f0f0] text-[#7a7a7a]">
                {line.speaker.slice(0, 1).toUpperCase()}
              </div>
            )}
            {!line.speaker && <div className="avatar w-[28px] h-[28px]" />}
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

      {/* Linked words */}
      {linkedWords.length > 0 && (
        <div className="mt-6 pt-6 border-t border-line">
          <h3 className="text-[11px] font-semibold text-muted tracking-wider uppercase mb-3">关联生词 ({linkedWords.length})</h3>
          <div className="flex flex-wrap gap-2">
            {linkedWords.map(w => (
              <button
                key={w!.id}
                onClick={() => navigate(`/words/${w!.id}`)}
                className="chip"
              >
                <b className="font-semibold mr-1.5">{w!.english}</b>
                {w!.chinese}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick add */}
      <div className="mt-6">
        <button
          onClick={() => navigate('/words/new')}
          className="text-[13px] text-muted hover:text-ink inline-flex items-center gap-1.5"
        >
          <BookOpen size={14} /> 在此对话中添加新单词
        </button>
      </div>
    </div>
  );
}
