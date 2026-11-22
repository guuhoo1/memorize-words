// Web Speech API 封装
// Windows Chrome/Edge 默认只有 zh-CN 语音，英文语音需额外安装
// 本模块做了安全 fallback：找不到英文 voice 时让浏览器自行选择默认 voice

/** 预热 voices（某些浏览器 voices 异步加载，首次调用可能返回空数组） */
export function initSpeechVoices(): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return () => {};

  const ss = window.speechSynthesis;

  // 立即尝试一次（某些浏览器同步返回）
  ss.getVoices();

  const handler = () => ss.getVoices();
  ss.addEventListener('voiceschanged', handler);

  // 某些浏览器不会触发 voiceschanged，用定时器兜底
  const timer = setTimeout(() => ss.getVoices(), 1500);

  return () => {
    ss.removeEventListener('voiceschanged', handler);
    clearTimeout(timer);
  };
}

/** 查找匹配的语音 */
function findVoice(targetLang: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const targetPrefix = targetLang.toLowerCase().split('-')[0]; // 'en-US' → 'en'

  // 1. 精确匹配（en-US 优先 en-US）
  let v = voices.find(v => v.lang.toLowerCase() === targetLang.toLowerCase());
  if (v) return v;

  // 2. 同语言前缀（en-US → en-GB / en-AU 均可）
  v = voices.find(v => v.lang.toLowerCase().startsWith(targetPrefix + '-'));
  if (v) return v;

  // 3. 仅匹配语言代码（兜底，比如只有 zh-CN 但传了 en-US，也不匹配）
  //    → 返回 null，让浏览器选默认 voice

  return null;
}

/**
 * 播放文本语音
 * @param text 要朗读的文本
 * @param lang 目标语言，默认 'en-US'
 */
export function speak(text: string, lang = 'en-US'): boolean {
  if (!text || typeof window === 'undefined') return false;
  if (!('speechSynthesis' in window)) return false;

  const ss = window.speechSynthesis;

  // 取消之前正在播放的
  ss.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.95;
  u.pitch = 1;

  // 尝试获取 voices（如果还没加载完，也能拿到同步返回的）
  const voices = ss.getVoices();
  const matched = findVoice(lang, voices);

  if (matched) {
    u.voice = matched;
  }
  // 找不到匹配 voice 时，**不设置** u.voice，让浏览器用默认 voice
  // 浏览器会根据 u.lang 自行 fallback
  // （Windows Chrome 默认只有 zh-CN，此时 en-US 文本会被中文 voice 读出英文，体验尚可）

  // 触发播放
  ss.speak(u);
  return true;
}

/** 是否支持 Web Speech API */
export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}
