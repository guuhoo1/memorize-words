import { create } from 'zustand';
import { wordsApi, dialoguesApi, reviewApi, sentencePatternsApi } from '@/utils/api';
import type { Word, Dialogue, ReviewRecord, DialogueCategory, SentencePattern } from '@/types';

interface AddWordInput {
  english: string;
  chinese: string;
  phonetic?: string;
  example?: string;
  tags?: string[];
  sourceDialogueId?: number;
}

interface MemorizeStore {
  // state
  words: Word[];
  dialogues: Dialogue[];
  sentencePatterns: SentencePattern[];
  reviewHistory: ReviewRecord[];
  loading: boolean;
  loaded: boolean;

  // init
  reload: () => Promise<void>;

  // words
  addWord: (data: AddWordInput) => Promise<Word>;
  updateWord: (id: number, patch: Partial<Word>) => Promise<Word>;
  deleteWord: (id: number) => Promise<void>;
  dueWords: () => Promise<Word[]>;

  // dialogues
  addDialogue: (data: { title: string; source?: string; category: DialogueCategory; content: string }) => Promise<Dialogue>;
  updateDialogue: (id: number, patch: Partial<Dialogue>) => Promise<Dialogue>;
  deleteDialogue: (id: number) => Promise<void>;

  // sentence patterns
  addSentencePattern: (data: {
    pattern: string; english: string; chinese: string;
    explanation?: string; category?: string; tags?: string[]; sourceDialogueId?: number;
  }) => Promise<SentencePattern>;
  updateSentencePattern: (id: number, patch: Partial<SentencePattern>) => Promise<SentencePattern>;
  deleteSentencePattern: (id: number) => Promise<void>;

  // review
  submitReview: (wordId: number, grade: number) => Promise<Word>;
}

export const useStore = create<MemorizeStore>((set, get) => ({
  words: [],
  dialogues: [],
  sentencePatterns: [],
  reviewHistory: [],
  loading: false,
  loaded: false,

  reload: async () => {
    set({ loading: true });
    try {
      const [words, dialogues, sentencePatterns] = await Promise.all([
        wordsApi.list(),
        dialoguesApi.list(),
        sentencePatternsApi.list()
      ]);
      set({ words, dialogues, sentencePatterns, loaded: true, loading: false });
    } catch {
      set({ loading: false });
      throw new Error('加载数据失败');
    }
  },

  addWord: async (data) => {
    const word = await wordsApi.create(data);
    set({ words: [word, ...get().words] });
    return word;
  },

  updateWord: async (id, patch) => {
    const word = await wordsApi.update(id, patch as any);
    set({ words: get().words.map(w => (w.id === id ? word : w)) });
    return word;
  },

  deleteWord: async (id) => {
    await wordsApi.remove(id);
    set({ words: get().words.filter(w => w.id !== id) });
  },

  dueWords: async () => reviewApi.due(),

  addDialogue: async (data) => {
    const d = await dialoguesApi.create(data);
    set({ dialogues: [d, ...get().dialogues] });
    return d;
  },

  updateDialogue: async (id, patch) => {
    const d = await dialoguesApi.update(id, patch as any);
    set({ dialogues: get().dialogues.map(x => (x.id === id ? d : x)) });
    return d;
  },

  deleteDialogue: async (id) => {
    await dialoguesApi.remove(id);
    set({ dialogues: get().dialogues.filter(x => x.id !== id) });
  },

  addSentencePattern: async (data) => {
    const sp = await sentencePatternsApi.create(data);
    set({ sentencePatterns: [sp, ...get().sentencePatterns] });
    return sp;
  },

  updateSentencePattern: async (id, patch) => {
    const sp = await sentencePatternsApi.update(id, patch as any);
    set({ sentencePatterns: get().sentencePatterns.map(x => (x.id === id ? sp : x)) });
    return sp;
  },

  deleteSentencePattern: async (id) => {
    await sentencePatternsApi.remove(id);
    set({ sentencePatterns: get().sentencePatterns.filter(x => x.id !== id) });
  },

  submitReview: async (wordId, grade) => {
    const updated = await reviewApi.submit(wordId, grade);
    const history = await reviewApi.history();
    set({
      words: get().words.map(w => (w.id === wordId ? updated : w)),
      reviewHistory: history
    });
    return updated;
  }
}));
