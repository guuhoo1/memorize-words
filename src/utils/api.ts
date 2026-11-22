import axios from 'axios';
import type { Word, Dialogue, ReviewRecord, SentencePattern } from '@/types';

export interface ApiRes<T> {
  code: number;
  message: string;
  data: T;
}

export const TOKEN_KEY = 'satoken';

// 先挂拦截器（用原始 axios 实例），再用 as any 断言避免 TS 类型冲突
const raw = axios.create({
  baseURL: '/api',
  timeout: 10000
});

raw.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = token;
  return config;
});

raw.interceptors.response.use(
  (res) => {
    const body = res.data as ApiRes<unknown>;
    if (body.code === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
      return Promise.reject(new Error(body.message));
    }
    if (body.code !== 200) {
      return Promise.reject(new Error(body.message));
    }
    return body.data as any;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// 拦截器解包了 ApiRes<T>，所以所有调用返回的就是 T（不是 AxiosResponse<T>）
export const api = raw as unknown as {
  get<T = any>(url: string, config?: any): Promise<T>;
  post<T = any>(url: string, data?: any, config?: any): Promise<T>;
  put<T = any>(url: string, data?: any, config?: any): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: any): Promise<T>;
  delete<T = any>(url: string, config?: any): Promise<T>;
};

// ---- 后端 Entity → 前端类型 转换 ----

interface RawWord extends Omit<Word, 'tags'> {
  tags?: string; // 后端逗号分隔
}

function mapWord(raw: RawWord): Word {
  return {
    ...raw,
    tags: (raw.tags || '').split(',').map(s => s.trim()).filter(Boolean),
    intervalDays: (raw as any).intervalDays ?? 0
  };
}

function mapWordList(list: RawWord[]): Word[] {
  return list.map(mapWord);
}

// ---- 认证 ----
export interface User {
  id: number;
  username: string;
  nickname?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const authApi = {
  login: (username: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { username, password }),

  register: (username: string, password: string) =>
    api.post<User>('/auth/register', { username, password }),

  logout: () => api.post<void>('/auth/logout'),
  info: () => api.get<User>('/auth/info'),
  updateProfile: (data: { nickname?: string; avatar?: string }) =>
    api.patch<User>('/auth/profile', data),

  /** 上传头像：返回 { url, avatar }，后端同时写入用户表 */
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    // 不要手动设 Content-Type，axios 自动处理 FormData 的 boundary
    return api.post<{ url: string; avatar: string }>('/auth/upload-avatar', form);
  }
};

// ---- 单词 ----
export const wordsApi = {
  list: async (q?: string, tag?: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (tag) params.set('tag', tag);
    const qs = params.toString();
    const data = await api.get<RawWord[]>('/words' + (qs ? '?' + qs : ''));
    return mapWordList(data as any);
  },

  get: async (id: number) => {
    const data = await api.get<RawWord>(`/words/${id}`);
    return mapWord(data as any);
  },

  create: async (data: {
    english: string;
    chinese: string;
    phonetic?: string;
    example?: string;
    tags?: string[];
    sourceDialogueId?: number;
  }) => {
    const payload = { ...data, tags: (data.tags ?? []).join(',') };
    const res = await api.post<RawWord>('/words', payload);
    return mapWord(res as any);
  },

  update: async (id: number, data: {
    english?: string;
    chinese?: string;
    phonetic?: string;
    example?: string;
    tags?: string[];
    sourceDialogueId?: number;
  }) => {
    const payload: any = { ...data };
    if (data.tags) payload.tags = data.tags.join(',');
    const res = await api.put<RawWord>(`/words/${id}`, payload);
    return mapWord(res as any);
  },

  remove: (id: number) => api.delete<void>(`/words/${id}`),

  tags: () => api.get<string[]>('/words/tags')
};

// ---- 对话 ----
export const dialoguesApi = {
  list: (category?: string) =>
    api.get<Dialogue[]>(category ? `/dialogues?category=${encodeURIComponent(category)}` : '/dialogues'),

  get: (id: number) => api.get<Dialogue>(`/dialogues/${id}`),

  create: (data: { title: string; source?: string; category: string; content: string }) =>
    api.post<Dialogue>('/dialogues', data),

  update: (id: number, data: { title: string; source?: string; category: string; content: string }) =>
    api.put<Dialogue>(`/dialogues/${id}`, data),

  remove: (id: number) => api.delete<void>(`/dialogues/${id}`)
};

// ---- 常用句型 ----
interface RawSP extends Omit<SentencePattern, 'tags'> {
  tags?: string;
}

function mapSP(raw: RawSP): SentencePattern {
  return {
    ...raw,
    tags: (raw.tags || '').split(',').map(s => s.trim()).filter(Boolean)
  };
}

function mapSPList(list: RawSP[]): SentencePattern[] {
  return list.map(mapSP);
}

export const sentencePatternsApi = {
  list: async (category?: string, tag?: string) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (tag) params.set('tag', tag);
    const qs = params.toString();
    const data = await api.get<RawSP[]>('/sentence-patterns' + (qs ? '?' + qs : ''));
    return mapSPList(data as any);
  },

  get: async (id: number) => {
    const data = await api.get<RawSP>(`/sentence-patterns/${id}`);
    return mapSP(data as any);
  },

  create: async (data: {
    pattern: string;
    english: string;
    chinese: string;
    explanation?: string;
    category?: string;
    tags?: string[];
    sourceDialogueId?: number;
  }) => {
    const payload = { ...data, tags: (data.tags ?? []).join(',') };
    const res = await api.post<RawSP>('/sentence-patterns', payload);
    return mapSP(res as any);
  },

  update: async (id: number, data: {
    pattern: string;
    english: string;
    chinese: string;
    explanation?: string;
    category?: string;
    tags?: string[];
    sourceDialogueId?: number;
  }) => {
    const payload: any = { ...data };
    if (data.tags) payload.tags = data.tags.join(',');
    const res = await api.put<RawSP>(`/sentence-patterns/${id}`, payload);
    return mapSP(res as any);
  },

  remove: (id: number) => api.delete<void>(`/sentence-patterns/${id}`),

  categories: () => api.get<string[]>('/sentence-patterns/categories')
};

// ---- 复习 ----
export const reviewApi = {
  due: async () => {
    const data = await api.get<RawWord[]>('/review/due');
    return mapWordList(data as any);
  },

  submit: async (wordId: number, grade: number) => {
    const data = await api.post<RawWord>('/review/submit', { wordId, grade });
    return mapWord(data as any);
  },

  history: (wordId?: number) => {
    const qs = wordId ? `?wordId=${wordId}` : '';
    return api.get<ReviewRecord[]>('/review/history' + qs);
  }
};

// ---- 统计 ----
export const statsApi = {
  dashboard: () =>
    api.get<{ wordCount: number; dueCount: number; masteredCount: number; dialogueCount: number }>(
      '/stats/dashboard'
    )
};

// ---- 字典 ----
export interface DictItem {
  id: number;
  userId: number;
  dictType: string;
  itemLabel: string;
  sortOrder: number;
  createdAt?: string;
}

export const dictsApi = {
  list: (type: string) => api.get<DictItem[]>(`/dicts?type=${encodeURIComponent(type)}`),
  all: () => api.get<DictItem[]>('/dicts/all'),
  create: (type: string, label: string, sortOrder?: number) =>
    api.post<DictItem>('/dicts', { type, label, sortOrder }),
  update: (id: number, label: string, sortOrder?: number) =>
    api.put<DictItem>(`/dicts/${id}`, { label, sortOrder }),
  remove: (id: number) => api.delete<void>(`/dicts/${id}`)
};
