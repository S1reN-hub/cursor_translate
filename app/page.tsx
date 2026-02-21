"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addHistoryItem,
  filterHistory,
  loadHistory,
  toggleFavorite,
  type HistoryItem,
} from "@/lib/history";
import { isMainlyChinese, isSpeechSupported, speak, stopSpeech } from "@/lib/speech";

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function Home() {
  const [input, setInput] = useState("");
  const [translated, setTranslated] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"full" | "compare">("full");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechVolume, setSpeechVolume] = useState(1);
  const [copyTip, setCopyTip] = useState(false);

  const refreshHistory = useCallback(() => setHistory(loadHistory()), []);
  useEffect(() => refreshHistory(), [refreshHistory]);

  const handleTranslate = useCallback(async () => {
    const text = input.trim();
    if (!text) {
      setError("请输入要翻译的内容");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "翻译失败");
        return;
      }
      const result = (data.translated ?? "").trim();
      setTranslated(result);
      addHistoryItem(text, result);
      refreshHistory();
    } catch (e) {
      setError(e instanceof Error ? e.message : "网络错误");
    } finally {
      setLoading(false);
    }
  }, [input, refreshHistory]);

  const handleCopy = useCallback(() => {
    if (!translated) return;
    navigator.clipboard.writeText(translated);
    setCopyTip(true);
    setTimeout(() => setCopyTip(false), 1500);
  }, [translated]);

  const handleSpeak = useCallback(() => {
    if (!translated) return;
    stopSpeech();
    const lang = isMainlyChinese(translated) ? "zh-CN" : "en-US";
    speak(translated, { lang, rate: speechRate, volume: speechVolume });
  }, [translated, speechRate, speechVolume]);

  const filteredHistory = filterHistory(history, search, onlyFavorites);
  const sourceParagraphs = splitParagraphs(input);
  const translatedParagraphs = splitParagraphs(translated);
  const comparePairs = sourceParagraphs.map((src, i) => ({
    source: src,
    translated: translatedParagraphs[i] ?? "",
  }));
  if (translatedParagraphs.length > sourceParagraphs.length) {
    translatedParagraphs.slice(sourceParagraphs.length).forEach((t, i) => {
      comparePairs.push({ source: "", translated: t });
    });
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <main className="flex-1 p-4 md:p-6 max-w-3xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-4 text-center md:text-left">
          Translate 中英文互译
        </h1>

        <div className="space-y-4">
          <div>
            <textarea
              placeholder="输入中文或英文，点击翻译..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 resize-y"
              disabled={loading}
            />
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <button
                onClick={handleTranslate}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium"
              >
                {loading ? "翻译中…" : "翻译"}
              </button>
              <button
                type="button"
                onClick={() => setHistoryOpen((o) => !o)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                历史
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {translated && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 overflow-hidden">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setViewMode("full")}
                  className={`flex-1 py-2 text-sm font-medium ${
                    viewMode === "full"
                      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  整体
                </button>
                <button
                  onClick={() => setViewMode("compare")}
                  className={`flex-1 py-2 text-sm font-medium ${
                    viewMode === "compare"
                      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  对照
                </button>
              </div>
              <div className="p-4">
                {viewMode === "full" ? (
                  <div className="flex flex-wrap items-start gap-2">
                    <p className="flex-1 min-w-0 whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                      {translated}
                    </p>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={handleCopy}
                        className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
                        title="复制译文"
                      >
                        {copyTip ? "已复制" : "复制"}
                      </button>
                      {isSpeechSupported() && (
                        <button
                          onClick={handleSpeak}
                          className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
                          title="朗读"
                        >
                          朗读
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comparePairs.map((pair, i) => (
                      <div key={i} className="space-y-1">
                        {pair.source && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 border-l-2 border-gray-300 dark:border-gray-600 pl-2 py-0.5">
                            {pair.source}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 pl-2">
                          {pair.translated}
                        </p>
                      </div>
                    ))}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleCopy}
                        className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
                      >
                        {copyTip ? "已复制" : "复制译文"}
                      </button>
                      {isSpeechSupported() && (
                        <button
                          onClick={handleSpeak}
                          className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
                        >
                          朗读
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {isSpeechSupported() && (
                <div className="px-4 pb-3 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <label className="flex items-center gap-2">
                    语速
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={speechRate}
                      onChange={(e) => setSpeechRate(Number(e.target.value))}
                      className="w-24"
                    />
                    <span>{speechRate.toFixed(1)}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    音量
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={speechVolume}
                      onChange={(e) => setSpeechVolume(Number(e.target.value))}
                      className="w-24"
                    />
                    <span>{Math.round(speechVolume * 100)}%</span>
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {historyOpen && (
        <aside className="w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 flex flex-col max-h-[60vh] md:max-h-screen overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium">历史记录</span>
            <button
              onClick={() => setHistoryOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label="关闭"
            >
              ×
            </button>
          </div>
          <input
            type="text"
            placeholder="搜索原文或译文..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent text-sm mb-2"
          />
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <input
              type="checkbox"
              checked={onlyFavorites}
              onChange={(e) => setOnlyFavorites(e.target.checked)}
            />
            仅收藏
          </label>
          <ul className="flex-1 overflow-y-auto space-y-2 min-h-0">
            {filteredHistory.length === 0 ? (
              <li className="text-sm text-gray-500 dark:text-gray-400 py-4">
                暂无记录
              </li>
            ) : (
              filteredHistory.map((item) => (
                <li
                  key={item.id}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-sm"
                >
                  <p className="text-gray-500 dark:text-gray-400 line-clamp-2 mb-1">
                    {item.sourceText}
                  </p>
                  <p className="text-gray-800 dark:text-gray-200 line-clamp-2 mb-2">
                    {item.translatedText}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setInput(item.sourceText);
                        setTranslated(item.translatedText);
                        setHistoryOpen(false);
                      }}
                      className="text-blue-600 dark:text-blue-400"
                    >
                      使用
                    </button>
                    <button
                      onClick={() => {
                        toggleFavorite(item.id);
                        refreshHistory();
                      }}
                      className={item.isFavorite ? "text-amber-500" : "text-gray-400"}
                      title={item.isFavorite ? "取消收藏" : "收藏"}
                    >
                      {item.isFavorite ? "★" : "☆"}
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </aside>
      )}
    </div>
  );
}
