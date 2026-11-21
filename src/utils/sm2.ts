import type { Word, ReviewGrade } from '@/types';

/**
 * SM-2 spaced repetition algorithm.
 * Input an item and user grade (0-5), return updated fields.
 *
 * grade < 3   → forgot, reset repetition, interval = 1
 * grade >= 3  → remembered, advance
 */
export function sm2(
  word: Pick<Word, 'easeFactor' | 'interval' | 'repetitions'>,
  grade: ReviewGrade
): Pick<Word, 'easeFactor' | 'interval' | 'repetitions' | 'nextReview'> {
  let { easeFactor, interval, repetitions } = word;

  if (grade < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)
  );

  const nextReview = Date.now() + interval * 86400000;

  return { easeFactor, interval, repetitions, nextReview };
}

export function dueWords(words: Word[]): Word[] {
  const now = Date.now();
  return words.filter(w => w.nextReview <= now);
}

export function fmtInterval(intervalDays: number): string {
  if (intervalDays <= 1) return '1 天';
  if (intervalDays < 7) return `${intervalDays} 天`;
  if (intervalDays < 30) return `${Math.round(intervalDays / 7)} 周`;
  return `${Math.round(intervalDays / 30)} 月`;
}
