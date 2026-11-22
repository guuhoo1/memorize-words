// Core domain types — 与后端 MySQL / Spring Boot 接口对齐

export interface Word {
  id: number;
  english: string;
  chinese: string;
  phonetic?: string;
  example?: string;
  tags: string[];

  // SM-2 spaced repetition fields
  easeFactor: number;
  intervalDays: number;
  repetitions: number;

  nextReview?: string;       // ISO datetime
  lastReview?: string;
  sourceDialogueId?: number;

  createdAt?: string;
  updatedAt?: string;
}

export interface Dialogue {
  id: number;
  title: string;
  source?: string;
  category: DialogueCategory;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export type DialogueCategory =
  | '电影/剧集'
  | '书籍'
  | '演讲'
  | '日常/工作';

export interface ReviewRecord {
  id?: number;
  wordId: number;
  grade: number;
  reviewedAt?: string;
}

export interface AppState {
  words: Word[];
  dialogues: Dialogue[];
  reviewHistory: ReviewRecord[];
}

export type ReviewGrade = 0 | 2 | 4 | 5;
