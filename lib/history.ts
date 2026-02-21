export interface HistoryItem {
  id: string;
  sourceText: string;
  translatedText: string;
  createdAt: number;
  isFavorite?: boolean;
}

const STORAGE_KEY = "translate_history";
const MAX_ITEMS = 200;

export function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as HistoryItem[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveHistory(list: HistoryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = list.slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
}

export function addHistoryItem(
  sourceText: string,
  translatedText: string
): HistoryItem {
  const item: HistoryItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    sourceText,
    translatedText,
    createdAt: Date.now(),
    isFavorite: false,
  };
  const list = loadHistory();
  list.unshift(item);
  saveHistory(list);
  return item;
}

export function toggleFavorite(id: string): void {
  const list = loadHistory();
  const idx = list.findIndex((x) => x.id === id);
  if (idx === -1) return;
  list[idx].isFavorite = !list[idx].isFavorite;
  saveHistory(list);
}

export function deleteHistoryItem(id: string): void {
  const list = loadHistory().filter((x) => x.id !== id);
  saveHistory(list);
}

export function filterHistory(
  list: HistoryItem[],
  search: string,
  onlyFavorites: boolean
): HistoryItem[] {
  let out = list;
  if (onlyFavorites) out = out.filter((x) => x.isFavorite);
  const q = search.trim().toLowerCase();
  if (!q) return out;
  return out.filter(
    (x) =>
      x.sourceText.toLowerCase().includes(q) ||
      x.translatedText.toLowerCase().includes(q)
  );
}
