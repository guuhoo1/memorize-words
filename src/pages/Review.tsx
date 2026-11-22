import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/memorizeStore';
import { dueWords } from '@/utils/sm2';
import type { ReviewGrade } from '@/types';
import { Home, RotateCcw, Volume2 } from 'lucide-react';

export default function Review() {
  const words = useStore(s => s.words);
  const submitReview = useStore(s => s.submitReview);
  const navigate = useNavigate();

  const [queue, setQueue] = useState(() => dueWords(words));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [againCount, setAgainCount] = useState(0);

  useEffect(() => {
    setQueue(dueWords(words));
  }, [words]);

  const current = queue[idx];

  const handleRate = useCallback((grade: ReviewGrade) => {
    if (!current || !flipped) return;
    submitReview(current.id, grade);
    if (grade < 3) setAgainCount(v => v + 1);
    else setCorrectCount(v => v + 1);
    setFlipped(false);
    setIdx(i => i + 1);
  }, [current, flipped, submitReview]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return;
      if (!current) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (!flipped) setFlipped(true);
      } else if (flipped && ['1', '2', '3', '4'].includes(e.key)) {
        const grades: ReviewGrade[] = [0, 2, 4, 5];
        handleRate(grades[parseInt(e.key) - 1]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, flipped, handleRate]);

  // Done state
  if (queue.length === 0 || idx >= queue.length) {
    const total = correctCount + againCount;
    const acc = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    return (
      <div className="done text-center py-[70px] px-5">
        <div className="emoji text-[44px]">✨</div>
        <h3 className="text-[18px] font-semibold mt-4 mb-[6px]">
          {total > 0 ? '今日复习完成！' : '没有待复习的单词'}
        </h3>
        <p className="text-[13px] text-muted">
          {total > 0
            ? `你完成了 ${total} 个单词，正确率 ${acc}%`
            : '明天再见，记得坚持哦～'}
        </p>

        {total > 0 && (
          <div className="flex justify-center gap-8 mt-6">
            <div>
              <b className="text-[22px] font-semibold text-[#16934a]">{correctCount}</b>
              <div className="text-[12px] text-muted mt-1">正确</div>
            </div>
            <div>
              <b className="text-[22px] font-semibold text-[#d94a5f]">{againCount}</b>
              <div className="text-[12px] text-muted mt-1">再来</div>
            </div>
            <div>
              <b className="text-[22px] font-semibold text-ink">{acc}%</b>
              <div className="text-[12px] text-muted mt-1">正确率</div>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => navigate('/')}
            className="btn bg-[#f2f2f2] text-ink hover:bg-[#e8e8e8] px-4 py-[9px] rounded-[12px] text-[13px] font-medium"
          >
            <Home size={15} className="inline mr-1.5 -mt-0.5" /> 返回首页
          </button>
          <button
            onClick={() => {
              setQueue(dueWords(useStore.getState().words));
              setIdx(0); setFlipped(false);
              setCorrectCount(0); setAgainCount(0);
            }}
            className="btn btn-primary px-4 py-[9px] rounded-[12px] text-[13px] font-medium"
          >
            <RotateCcw size={14} className="inline mr-1.5 -mt-0.5" /> 再来一轮
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-[fadeUp_0.5s_ease-out]">
      {/* Head */}
      <header className="flex items-center justify-between gap-4 mb-[30px]">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight text-ink">今日复习</h2>
          <p className="text-[13px] text-muted mt-[5px]">
            第 {idx + 1} / {queue.length} 个 · 空格翻面 · 1=再来 / 2=困难 / 3=还行 / 4=简单
          </p>
        </div>
      </header>

      {/* Flashcard */}
      <div className="flash-wrap">
        <div className={`flashcard ${flipped ? 'flipped' : ''}`}>
          <div className="flash-inner">
            {/* Front */}
            <div
              className="flash-face flash-face-front absolute inset-0 backface-hidden rounded-[26px] bg-white flex flex-col items-center justify-center gap-[10px] p-[36px] text-center cursor-pointer"
              onClick={() => setFlipped(v => !v)}
            >
              <button
                onClick={e => { e.stopPropagation(); speak(current.english); }}
                className="speak absolute top-[18px] right-[20px] text-[15px] opacity-[0.25] hover:opacity-[0.9] transition-opacity"
              >
                <Volume2 size={15} />
              </button>
              <div className="flash-word text-[40px] font-semibold tracking-[-1.2px] text-ink">
                {current.english}
              </div>
              <div className="flash-hint text-[12px] text-neutral-400 tracking-wide mt-[4px]">
                点击卡片翻面 · 空格
              </div>
            </div>

            {/* Back */}
            <div
              className="flash-face flash-back absolute inset-0 backface-hidden rounded-[26px] bg-white flex flex-col items-center justify-center gap-[14px] p-[36px] text-center"
              onClick={() => setFlipped(v => !v)}
              style={{ transform: 'rotateY(180deg)' }}
            >
              {current.phonetic && (
                <div className="flash-phon text-[14px] text-muted">{current.phonetic}</div>
              )}
              <div className="flash-meaning text-[19px] font-medium tracking-tight text-ink">
                {current.chinese}
              </div>
              {current.example && (
                <div className="flash-ex text-[14px] text-[#4a4a4a] leading-[1.6] max-w-[420px]">
                  "{current.example}"
                </div>
              )}
              {current.tags.length > 0 && (
                <div className="tag text-[10.5px] font-medium tracking-[0.5px] uppercase text-accent flex gap-2">
                  {current.tags.map(t => <span key={t}>{t}</span>)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div
        className={`grid grid-cols-4 gap-[9px] transition-all duration-300 ${flipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
      >
        <button
          onClick={() => handleRate(0)}
          className="ans ans-0 py-[14px] rounded-[14px] text-[13.5px] font-medium flex flex-col items-center gap-[3px]"
        >
          <span>再来</span>
          <span className="text-[11px] opacity-55 font-normal">立即复习</span>
        </button>
        <button
          onClick={() => handleRate(2)}
          className="ans ans-1 py-[14px] rounded-[14px] text-[13.5px] font-medium flex flex-col items-center gap-[3px]"
        >
          <span>困难</span>
          <span className="text-[11px] opacity-55 font-normal">1 天</span>
        </button>
        <button
          onClick={() => handleRate(4)}
          className="ans ans-2 py-[14px] rounded-[14px] text-[13.5px] font-medium flex flex-col items-center gap-[3px]"
        >
          <span>还行</span>
          <span className="text-[11px] opacity-55 font-normal">6 天</span>
        </button>
        <button
          onClick={() => handleRate(5)}
          className="ans ans-3 py-[14px] rounded-[14px] text-[13.5px] font-medium flex flex-col items-center gap-[3px]"
        >
          <span>简单</span>
          <span className="text-[11px] opacity-55 font-normal">14 天+</span>
        </button>
      </div>
    </div>
  );
}

function speak(text: string) {
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }
}
