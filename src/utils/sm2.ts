import type { Word } from '@/types';

/**
 * 计算今天到期（包括过期）的单词。
 * 后端已经跑了 SM-2，这里用后端返回的 nextReview 字段做判断。
 */
export function dueWords(words: Word[]): Word[] {
  const now = new Date().toISOString();
  return words.filter(w => !w.nextReview || w.nextReview <= now);
}

export function fmtInterval(intervalDays: number): string {
  if (intervalDays <= 1) return '1 天';
  if (intervalDays < 7) return `${intervalDays} 天`;
  if (intervalDays < 30) return `${Math.round(intervalDays / 7)} 周`;
  return `${Math.round(intervalDays / 30)} 月`;
}
