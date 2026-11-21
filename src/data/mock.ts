import type { AppState } from '@/types';

const now = Date.now();
const d = (daysAgo: number) => now - daysAgo * 86400000;

export const defaultState: AppState = {
  version: 1,
  words: [
    {
      id: 'w1',
      english: 'serendipity',
      chinese: '意外发现美好事物的运气',
      phonetic: '/ˌserənˈdɪpəti/',
      example: 'Finding that rare book at the flea market was pure serendipity.',
      tags: ['电影台词', '英语美文'],
      easeFactor: 2.5, interval: 6, repetitions: 2,
      nextReview: d(-1), lastReview: d(7),
      createdAt: d(30), updatedAt: d(2)
    },
    {
      id: 'w2',
      english: 'ephemeral',
      chinese: '短暂的，瞬息的',
      phonetic: '/ɪˈfemərəl/',
      example: 'Fame in the digital age is often ephemeral.',
      tags: ['雅思'],
      easeFactor: 2.5, interval: 1, repetitions: 0,
      nextReview: now,
      createdAt: d(3), updatedAt: d(3)
    },
    {
      id: 'w3',
      english: 'ubiquitous',
      chinese: '无处不在的，普遍存在的',
      phonetic: '/juːˈbɪkwɪtəs/',
      example: 'Smartphones have become ubiquitous in modern life.',
      tags: ['GRE', '科技'],
      easeFactor: 2.6, interval: 14, repetitions: 4,
      nextReview: d(-2), lastReview: d(12),
      createdAt: d(60), updatedAt: d(5)
    },
    {
      id: 'w4',
      english: 'resilience',
      chinese: '韧性，恢复力',
      phonetic: '/rɪˈzɪliəns/',
      example: 'Her resilience in the face of adversity was truly inspiring.',
      tags: ['商务英语'],
      easeFactor: 2.5, interval: 0, repetitions: 0,
      nextReview: now,
      createdAt: d(2), updatedAt: d(2)
    },
    {
      id: 'w5',
      english: 'eloquent',
      chinese: '雄辩的，有说服力的',
      phonetic: '/ˈeləkwənt/',
      example: 'She gave an eloquent speech at the conference.',
      tags: ['演讲'],
      easeFactor: 2.7, interval: 30, repetitions: 6,
      nextReview: d(-25), lastReview: d(5),
      createdAt: d(90), updatedAt: d(5)
    },
    {
      id: 'w6',
      english: 'procrastinate',
      chinese: '拖延，耽搁',
      phonetic: '/prəˈkræstɪneɪt/',
      example: 'Stop procrastinating and start working on your essay.',
      tags: ['日常口语'],
      easeFactor: 2.4, interval: 1, repetitions: 2,
      nextReview: now, lastReview: d(1),
      createdAt: d(14), updatedAt: d(1)
    }
  ],
  dialogues: [
    {
      id: 'd1',
      title: 'Friends S01E01 · 咖啡馆偶遇',
      source: 'Friends 老友记',
      category: '电影/剧集',
      content: `Rachel: I just realized I'm totally in love with Ross.\nMonica: I know!\nRachel: And I just had to get married again.\nMonica: I know!\nRachel: This is the most serendipitous moment of my life.`,
      wordIds: ['w1'],
      createdAt: d(30), updatedAt: d(28)
    },
    {
      id: 'd2',
      title: 'TED · The Power of Vulnerability',
      source: 'TED 演讲',
      category: '演讲',
      content: `What I've found is this: joy and resilience share the same roots.\n\nYou cannot selectively numb emotion. When we numb the dark, we also numb the light.`,
      wordIds: ['w4'],
      createdAt: d(20), updatedAt: d(18)
    }
  ],
  reviewHistory: [
    { wordId: 'w1', grade: 4, reviewedAt: d(7) },
    { wordId: 'w3', grade: 5, reviewedAt: d(12) },
    { wordId: 'w5', grade: 5, reviewedAt: d(5) },
    { wordId: 'w6', grade: 3, reviewedAt: d(1) }
  ]
};
