export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(
  text: string,
  options: { lang?: string; rate?: number; volume?: number } = {}
): void {
  if (!isSpeechSupported() || !text.trim()) return;
  const { lang, rate = 1, volume = 1 } = options;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang ?? "zh-CN";
  u.rate = Math.max(0.5, Math.min(2, rate));
  u.volume = Math.max(0, Math.min(1, volume));
  window.speechSynthesis.speak(u);
}

export function stopSpeech(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/** 简单判断是否为中文为主（用于选 TTS 语言） */
export function isMainlyChinese(text: string): boolean {
  const ch = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const en = (text.match(/[a-zA-Z]/g) || []).length;
  return ch >= en;
}
