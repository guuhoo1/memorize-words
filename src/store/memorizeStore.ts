import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Word, Dialogue, ReviewRecord, ReviewGrade, DialogueCategory } from '@/types';
import { sm2 } from '@/utils/sm2';
import { generateId } from '@/utils/storage';
import { defaultState } from '@/data/mock';

interface AddWordInput {
  english: string;
  chinese: string;
  phonetic?: string;
  example?: string;
  tags?: string[];
  source?: string;
}

interface MemorizeStore {
  // state
  words: Word[];
  dialogues: Dialogue[];
  reviewHistory: ReviewRecord[];
  version: number;

  // words
  addWord: (data: AddWordInput) => Word;
  updateWord: (id: string, patch: Partial<Word>) => void;
  deleteWord: (id: string) => void;

  // dialogues
  addDialogue: (data: { title: string; source?: string; category: DialogueCategory; content: string }) => Dialogue;
  updateDialogue: (id: string, patch: Partial<Dialogue>) => void;
  deleteDialogue: (id: string) => void;

  // review
  submitReview: (wordId: string, grade: ReviewGrade) => void;

  // misc
  resetAll: () => void;
}

export const useStore = create<MemorizeStore>()(
  persist(
    (set, get) => ({
      ...defaultState,

      addWord: (data) => {
        const now = Date.now();
        const word: Word = {
          id: generateId('w'),
          english: data.english,
          chinese: data.chinese,
          phonetic: data.phonetic,
          example: data.example,
          tags: data.tags ?? [],
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          nextReview: now,
          createdAt: now,
          updatedAt: now,
          source: data.source
        };
        set({ words: [word, ...get().words] });
        return word;
      },

      updateWord: (id, patch) =>
        set({
          words: get().words.map(w =>
            w.id === id ? { ...w, ...patch, updatedAt: Date.now() } : w
          )
        }),

      deleteWord: (id) =>
        set({
          words: get().words.filter(w => w.id !== id),
          dialogues: get().dialogues.map(d => ({
            ...d,
            wordIds: d.wordIds.filter(wid => wid !== id)
          }))
        }),

      addDialogue: (data) => {
        const now = Date.now();
        const d: Dialogue = {
          id: generateId('d'),
          title: data.title,
          source: data.source,
          category: data.category,
          content: data.content,
          wordIds: [],
          createdAt: now,
          updatedAt: now
        };
        set({ dialogues: [d, ...get().dialogues] });
        return d;
      },

      updateDialogue: (id, patch) =>
        set({
          dialogues: get().dialogues.map(d =>
            d.id === id ? { ...d, ...patch, updatedAt: Date.now() } : d
          )
        }),

      deleteDialogue: (id) =>
        set({ dialogues: get().dialogues.filter(d => d.id !== id) }),

      submitReview: (wordId, grade) => {
        const { words, reviewHistory } = get();
        const word = words.find(w => w.id === wordId);
        if (!word) return;
        const updated = sm2(word, grade);
        const now = Date.now();
        set({
          words: words.map(w =>
            w.id === wordId
              ? {
                  ...w,
                  easeFactor: updated.easeFactor,
                  interval: updated.interval,
                  repetitions: updated.repetitions,
                  nextReview: updated.nextReview,
                  lastReview: now,
                  updatedAt: now
                }
              : w
          ),
          reviewHistory: [...reviewHistory, { wordId, grade, reviewedAt: now } as ReviewRecord]
        });
      },

      resetAll: () => {
        localStorage.removeItem('memorize-words:v1');
        location.reload();
      }
    }),
    {
      name: 'memorize-words:v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        words: state.words,
        dialogues: state.dialogues,
        reviewHistory: state.reviewHistory,
        version: state.version
      })
    }
  )
);
