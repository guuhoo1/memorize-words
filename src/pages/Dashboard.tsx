import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/memorizeStore';
import { dueWords } from '@/utils/sm2';

export default function Dashboard() {
  const words = useStore(s => s.words);
  const dialogues = useStore(s => s.dialogues);
  const navigate = useNavigate();

  const due = dueWords(words);
  const mastered = words.filter(w => w.repetitions >= 4).length;

  const recentWords = [...words]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 8);

  const recentDialogues = [...dialogues]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 6);

  return (
    <div className="animate-[fadeUp_0.5s_ease-out]">
      {/* Head */}
      <header className="flex items-center justify-between gap-4 mb-[30px]">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight text-ink">概览</h2>
          <p className="text-[13px] text-muted mt-[5px]">每天一点点，记忆自己长出来</p>
        </div>
        <button
          onClick={() => navigate('/review')}
          className="btn btn-primary px-4 py-[9px] rounded-[12px] text-[13px] font-medium transition-colors whitespace-nowrap"
        >
          开始复习
        </button>
      </header>

      {/* Stats - 4 cols, each pure white */}
      <div className="grid grid-cols-4 gap-[10px] mb-[34px]">
        <div className="stat">
          <b className="text-[24px] font-semibold tracking-tight text-ink">{words.length}</b>
          <span className="text-[11px] text-muted mt-[5px] block">单词</span>
        </div>
        <div className="stat">
          <b className="text-[24px] font-semibold tracking-tight text-ink">{due.length}</b>
          <span className="text-[11px] text-muted mt-[5px] block">待复习</span>
        </div>
        <div className="stat">
          <b className="text-[24px] font-semibold tracking-tight text-ink">{mastered}</b>
          <span className="text-[11px] text-muted mt-[5px] block">已掌握</span>
        </div>
        <div className="stat">
          <b className="text-[24px] font-semibold tracking-tight text-ink">{dialogues.length}</b>
          <span className="text-[11px] text-muted mt-[5px] block">对话</span>
        </div>
      </div>

      {/* Recent words */}
      <section className="mb-[34px]">
        <h3 className="text-[11px] font-semibold text-muted tracking-wider uppercase mb-[14px]">最近添加</h3>
        <div className="flex flex-wrap gap-2">
          {recentWords.map(w => (
            <button
              key={w.id}
              onClick={() => navigate(`/words/${w.id}`)}
              className="chip text-ink"
            >
              <b className="font-semibold mr-[7px]">{w.english}</b>
              {w.chinese}
            </button>
          ))}
          {recentWords.length === 0 && (
            <div className="empty text-[13px] text-muted py-[44px] px-5 text-center w-full">
              还没有单词
            </div>
          )}
        </div>
      </section>

      {/* Recent dialogues */}
      <section>
        <h3 className="text-[11px] font-semibold text-muted tracking-wider uppercase mb-[14px]">对话练习</h3>
        <div className="flex flex-wrap gap-2">
          {recentDialogues.map(d => (
            <button
              key={d.id}
              onClick={() => navigate(`/dialogues/${d.id}`)}
              className="chip text-ink"
            >
              <b className="font-semibold mr-[7px]">{d.title}</b>
              <span className="text-muted">{d.source ?? d.category}</span>
            </button>
          ))}
          {recentDialogues.length === 0 && (
            <div className="empty text-[13px] text-muted py-[44px] px-5 text-center w-full">
              还没有对话素材
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
