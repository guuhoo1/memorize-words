/* ============================================================
   API Stubs — future-backend-ready signatures
   All functions return mock data with simulated latency.
   TODO: replace each with real fetch('/api/...') later.
   ============================================================ */

function delay(ms = 300) {
  return new Promise(r => setTimeout(r, ms));
}

/* ---------- Words ---------- */

// GET /api/words?search=&tag=
async function fetchWords({ search = '', tag = '' } = {}) {
  await delay(200);
  // TODO: replace with fetch('/api/words?search=...&tag=...')
  let list = [...DB.words];
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(w =>
      w.english.toLowerCase().includes(s) ||
      w.chinese.includes(s)
    );
  }
  if (tag) {
    list = list.filter(w => w.tags.includes(tag));
  }
  return { code: 0, data: list };
}

// POST /api/words
async function createWord(payload) {
  await delay(300);
  // TODO: replace with fetch('/api/words', { method: 'POST', body: JSON.stringify(payload) })
  const newWord = {
    id: 'w' + Date.now(),
    easeFactor: 2.5, interval: 0, repetitions: 0,
    nextReview: Date.now(), lastReview: null,
    createdAt: Date.now(),
    ...payload
  };
  DB.words.unshift(newWord);
  return { code: 0, data: newWord };
}

// PATCH /api/words/:id
async function updateWord(id, patch) {
  await delay(200);
  // TODO: replace with fetch('/api/words/' + id, { method: 'PATCH', body: JSON.stringify(patch) })
  const idx = DB.words.findIndex(w => w.id === id);
  if (idx >= 0) {
    DB.words[idx] = { ...DB.words[idx], ...patch };
    return { code: 0, data: DB.words[idx] };
  }
  return { code: 404, error: 'not found' };
}

// DELETE /api/words/:id
async function deleteWord(id) {
  await delay(150);
  // TODO: replace with fetch('/api/words/' + id, { method: 'DELETE' })
  const idx = DB.words.findIndex(w => w.id === id);
  if (idx >= 0) { DB.words.splice(idx, 1); }
  return { code: 0 };
}

/* ---------- Review ---------- */

// GET /api/review/today — words due for review
async function fetchDueWords() {
  await delay(200);
  // TODO: replace with fetch('/api/review/today')
  const now = Date.now();
  return {
    code: 0,
    data: DB.words.filter(w => w.nextReview <= now)
  };
}

// POST /api/review/:wordId — submit grade, return updated word
async function submitReview(wordId, grade) {
  await delay(100);
  // TODO: replace with fetch('/api/review/' + wordId, { method: 'POST', body: JSON.stringify({ grade }) })
  const idx = DB.words.findIndex(w => w.id === wordId);
  if (idx < 0) return { code: 404 };
  const w = DB.words[idx];

  // SM-2 algorithm
  let { easeFactor, interval, repetitions } = w;
  if (grade < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }
  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));

  const updated = {
    ...w,
    easeFactor, interval, repetitions,
    nextReview: Date.now() + interval * 86400000,
    lastReview: Date.now()
  };
  DB.words[idx] = updated;
  DB.reviewHistory.push({ wordId, grade, reviewedAt: Date.now() });

  return { code: 0, data: updated, interval };
}

/* ---------- Dialogues ---------- */

// GET /api/dialogues
async function fetchDialogues({ category = '' } = {}) {
  await delay(200);
  // TODO: replace with fetch('/api/dialogues?category=...')
  let list = [...DB.dialogues];
  if (category) list = list.filter(d => d.category === category);
  return { code: 0, data: list };
}

// POST /api/dialogues
async function createDialogue(payload) {
  await delay(300);
  // TODO: replace with fetch('/api/dialogues', { method: 'POST', body: ... })
  const newItem = {
    id: 'd' + Date.now(),
    wordIds: [], createdAt: Date.now(), updatedAt: Date.now(),
    ...payload
  };
  DB.dialogues.unshift(newItem);
  return { code: 0, data: newItem };
}

/* ---------- Stats ---------- */

// GET /api/stats/overview
async function fetchOverview() {
  await delay(200);
  // TODO: replace with fetch('/api/stats/overview')
  const now = Date.now();
  const dueToday = DB.words.filter(w => w.nextReview <= now).length;
  const mastered = DB.words.filter(w => w.repetitions >= 4).length;

  return {
    code: 0,
    data: {
      totalWords: DB.words.length,
      dueToday,
      newWords: DB.words.filter(w => w.repetitions === 0 && !w.lastReview).length,
      mastered,
      heatmap: DB.heatmap,
      recentWords: [...DB.words].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5),
      recentDialogues: [...DB.dialogues].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3)
    }
  };
}

/* ---------- Tags ---------- */

function getAllTags() {
  const set = new Set();
  DB.words.forEach(w => w.tags.forEach(t => set.add(t)));
  return [...set];
}
