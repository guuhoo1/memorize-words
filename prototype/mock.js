/* ============================================================
   Mock Data — single source of truth
   ============================================================ */
const DB = {
  words: [
    {
      id: 'w1',
      english: 'serendipity',
      chinese: '意外发现美好事物的运气',
      phonetic: '/ˌserənˈdɪpəti/',
      example: 'Finding that rare book at the flea market was pure serendipity.',
      tags: ['英语美文', '电影台词'],
      easeFactor: 2.5, interval: 6, repetitions: 2,
      nextReview: Date.now() - 86400000, // 昨天到期
      lastReview: Date.now() - 7 * 86400000,
      createdAt: Date.now() - 30 * 86400000,
      source: 'd1'
    },
    {
      id: 'w2',
      english: 'ephemeral',
      chinese: '短暂的，瞬息的',
      phonetic: '/ɪˈfemərəl/',
      example: 'Fame in the digital age is often ephemeral.',
      tags: ['雅思'],
      easeFactor: 2.5, interval: 1, repetitions: 0,
      nextReview: Date.now() - 3600000, // 今天到期
      lastReview: null,
      createdAt: Date.now() - 3 * 86400000,
      source: null
    },
    {
      id: 'w3',
      english: 'ubiquitous',
      chinese: '无处不在的，普遍存在的',
      phonetic: '/juːˈbɪkwɪtəs/',
      example: 'Smartphones have become ubiquitous in modern life.',
      tags: ['GRE', '科技'],
      easeFactor: 2.6, interval: 14, repetitions: 4,
      nextReview: Date.now() + 2 * 86400000,
      lastReview: Date.now() - 12 * 86400000,
      createdAt: Date.now() - 60 * 86400000,
      source: null
    },
    {
      id: 'w4',
      english: 'mundane',
      chinese: '平凡的，单调的',
      phonetic: '/mʌnˈdeɪn/',
      example: 'She found solace in the mundane routines of everyday life.',
      tags: ['小说'],
      easeFactor: 2.5, interval: 3, repetitions: 1,
      nextReview: Date.now() - 86400000,
      lastReview: Date.now() - 2 * 86400000,
      createdAt: Date.now() - 10 * 86400000,
      source: 'd1'
    },
    {
      id: 'w5',
      english: 'resilience',
      chinese: '韧性，恢复力',
      phonetic: '/rɪˈzɪliəns/',
      example: 'Her resilience in the face of adversity was truly inspiring.',
      tags: ['商务英语'],
      easeFactor: 2.5, interval: 0, repetitions: 0,
      nextReview: Date.now(), // 今天
      lastReview: null,
      createdAt: Date.now() - 2 * 86400000,
      source: null
    },
    {
      id: 'w6',
      english: 'eloquent',
      chinese: '雄辩的，有说服力的',
      phonetic: '/ˈeləkwənt/',
      example: 'She gave an eloquent speech at the conference.',
      tags: ['演讲'],
      easeFactor: 2.7, interval: 30, repetitions: 6,
      nextReview: Date.now() + 25 * 86400000,
      lastReview: Date.now() - 5 * 86400000,
      createdAt: Date.now() - 90 * 86400000,
      source: null
    },
    {
      id: 'w7',
      english: 'ambiguous',
      chinese: '模棱两可的，含糊不清的',
      phonetic: '/æmˈbɪɡjuəs/',
      example: 'The contract language was deliberately ambiguous.',
      tags: ['法律英语'],
      easeFactor: 2.5, interval: 0, repetitions: 0,
      nextReview: Date.now(),
      lastReview: null,
      createdAt: Date.now() - 86400000,
      source: null
    },
    {
      id: 'w8',
      english: 'meticulous',
      chinese: '一丝不苟的，细致的',
      phonetic: '/məˈtɪkjələs/',
      example: 'He is meticulous about keeping records.',
      tags: ['GRE'],
      easeFactor: 2.5, interval: 1, repetitions: 1,
      nextReview: Date.now() + 86400000,
      lastReview: Date.now() - 86400000,
      createdAt: Date.now() - 7 * 86400000,
      source: null
    },
    {
      id: 'w9',
      english: 'whimsical',
      chinese: '异想天开的，古怪有趣的',
      phonetic: '/ˈwɪmzɪkəl/',
      example: 'The children loved the whimsical illustrations in the book.',
      tags: ['电影台词'],
      easeFactor: 2.5, interval: 2, repetitions: 1,
      nextReview: Date.now() - 86400000,
      lastReview: Date.now() - 86400000,
      createdAt: Date.now() - 5 * 86400000,
      source: 'd2'
    },
    {
      id: 'w10',
      english: 'procrastinate',
      chinese: '拖延，耽搁',
      phonetic: '/prəˈkræstɪneɪt/',
      example: 'Stop procrastinating and start working on your essay.',
      tags: ['日常口语'],
      easeFactor: 2.4, interval: 1, repetitions: 2,
      nextReview: Date.now(),
      lastReview: Date.now() - 86400000,
      createdAt: Date.now() - 14 * 86400000,
      source: null
    }
  ],

  dialogues: [
    {
      id: 'd1',
      title: 'Friends S01E01 · 咖啡馆偶遇',
      source: 'Friends 老友记',
      category: '电影/剧集',
      content: `Rachel: I just realized I'm totally in love with Ross.\nMonica: I know!\nRachel: And I just had to get married again.\nMonica: I know!\nRachel: This is the most serendipitous moment of my life.\nMonica: Really? Because I was gonna say "the most mundane".\nRachel: Well, that's because you never take a chance.\nMonica: Oh please, I took a chance on Chandler.\nRachel: Yeah, and look how that turned out.`,
      wordIds: ['w1', 'w4'],
      createdAt: Date.now() - 30 * 86400000,
      updatedAt: Date.now() - 28 * 86400000
    },
    {
      id: 'd2',
      title: 'The Little Prince · 狐狸的告别',
      source: 'The Little Prince 小王子',
      category: '书籍',
      content: `"I can't play with you," said the fox. "I'm not tamed."\n"What does that mean — tame?"\n"It means to establish ties."\n"Ties?"\n"To me, you are still nothing more than a little boy who is just like a hundred thousand other little boys. And I have no need of you. And you, on your part, have no need of me. To you, I am nothing more than a fox like a hundred thousand other foxes."\n"But if you tame me, then we shall need each other. To me, you will be unique in all the world. To you, I shall be unique in all the world."\nThe whimsical boy thought for a moment.`,
      wordIds: ['w9'],
      createdAt: Date.now() - 15 * 86400000,
      updatedAt: Date.now() - 10 * 86400000
    },
    {
      id: 'd3',
      title: ' TED Talk · The Power of Vulnerability',
      source: 'TED 演讲',
      category: '演讲',
      content: `I'm a researcher. I spend a lot of time studying human connection — our ability to empathize, belong, and love.\n\nAnd what I've found is this: the things that bring us the most joy are also the things that make us the most vulnerable. Joy and resilience, they share the same roots.\n\nYou cannot selectively numb emotion. When we numb the dark, we also numb the light.`,
      wordIds: ['w5'],
      createdAt: Date.now() - 20 * 86400000,
      updatedAt: Date.now() - 18 * 86400000
    },
    {
      id: 'd4',
      title: '面试对话 · 产品经理职位',
      source: '真实面试记录',
      category: '日常/工作',
      content: `Interviewer: Tell me about a time you had to deal with ambiguous requirements.\nCandidate: In my previous role, I was tasked with launching a new feature but the product vision wasn't fully defined. So I started by interviewing 20+ users to understand their pain points.\nInterviewer: That sounds very meticulous.\nCandidate: Thank you. I believe that careful research is the foundation of good product decisions.\nInterviewer: And the result?\nCandidate: We shipped on time with a 95% user satisfaction score.`,
      wordIds: ['w7', 'w8'],
      createdAt: Date.now() - 7 * 86400000,
      updatedAt: Date.now() - 5 * 86400000
    }
  ],

  reviewHistory: [
    { wordId: 'w1', grade: 4, reviewedAt: Date.now() - 7 * 86400000 },
    { wordId: 'w3', grade: 5, reviewedAt: Date.now() - 12 * 86400000 },
    { wordId: 'w4', grade: 2, reviewedAt: Date.now() - 2 * 86400000 },
    { wordId: 'w6', grade: 5, reviewedAt: Date.now() - 5 * 86400000 },
    { wordId: 'w8', grade: 4, reviewedAt: Date.now() - 86400000 },
    { wordId: 'w10', grade: 3, reviewedAt: Date.now() - 86400000 }
  ]
};

/* Generate 52-week heatmap data */
function generateHeatmap() {
  const weeks = 52;
  const result = [];
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const rand = Math.random();
      let level = 0;
      if (w > 20) { // recent weeks have more activity
        if (rand < 0.3) level = 0;
        else if (rand < 0.6) level = 1;
        else if (rand < 0.8) level = 2;
        else if (rand < 0.92) level = 3;
        else level = 4;
      } else {
        if (rand < 0.5) level = 0;
        else if (rand < 0.8) level = 1;
        else if (rand < 0.95) level = 2;
        else level = 3;
      }
      result.push(level);
    }
  }
  return result;
}
DB.heatmap = generateHeatmap();
