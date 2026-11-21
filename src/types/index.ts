// Core domain types

export interface Word {
  id: string;
  english: string;
  chinese: string;
  phonetic?: string;
  example?: string;
  tags: string[];

  // SM-2 spaced repetition fields
  easeFactor: number;
  interval: number; // days
  repetitions: number;

  nextReview: number; // timestamp ms
  lastReview?: number;

  createdAt: number;
  updatedAt: number;
  source?: string; // dialogue id
}

export interface Dialogue {
  id: string;
  title: string;
  source?: string;
  category: DialogueCategory;
  content: string;
  wordIds: string[];
  createdAt: number;
  updatedAt: number;
}

export type DialogueCategory =
  | '电影/剧集'
  | '书籍'
  | '演讲'
  | '日常/工作';

export interface ReviewRecord {
  wordId: string;
  grade: number;
  reviewedAt: number;
}

export interface AppState {
  words: Word[];
  dialogues: Dialogue[];
  reviewHistory: ReviewRecord[];
  version: number;
}

export type ReviewGrade = 0 | 2 | 4 | 5;
