import { useYouTubeBGM } from "../hooks/useYouTubeBGM";
import { useState } from "react";

export function ResultList({ results, onRetry, onHome }: {
  results: { name: string; originalExecutor: string; newExecutor: string }[];
  onRetry: () => void;
  onHome: () => void;
}) {
  const [bgmOn, setBgmOn] = useState(true);
  // YouTube動画ID: ANVPnF3dnY4
  useYouTubeBGM("ANVPnF3dnY4", bgmOn);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#ffffff' }}>
      <div className="fixed top-2 right-2 z-50">
        <button
          className="bg-white/80 border border-yellow-300 rounded-lg px-3 py-1 shadow hover:bg-yellow-100 transition text-sm font-bold"
          onClick={() => setBgmOn((v) => !v)}
        >
          {bgmOn ? "BGM OFF" : "BGM ON"}
        </button>
      </div>
      <header className="text-center py-6 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 mx-auto max-w-md border-4 border-pink-300">
          <h1 className="text-4xl font-black tracking-widest text-pink-700">
            🎉 結果発表 🎉
          </h1>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center px-4 py-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border-4 border-pink-200">
          <h2 className="text-2xl font-black text-center mb-6 text-pink-600">✨ 新しい執行者一覧 ✨</h2>
          <ul className="space-y-4 text-gray-700 max-h-[500px] overflow-y-auto">
            {results.map((r, i) => (
              <li key={i} className="bg-gradient-to-br from-white to-pink-50 rounded-2xl shadow-xl border-4 border-pink-200 p-6 hover:scale-[1.02] transition-transform">
                <div className="flex flex-col gap-3">
                  {/* 十字架名 */}
                  <div className="bg-blue-100 rounded-xl p-4 border-2 border-blue-300">
                    <p className="text-xs font-bold text-gray-600 mb-1">📛 十字架名</p>
                    <span className="font-black text-blue-800 text-2xl break-words leading-tight">
                      {r.name}
                    </span>
                  </div>
                  
                  {/* 新しい執行者 */}
                  <div className="bg-yellow-100 rounded-xl p-4 border-2 border-yellow-400">
                    <p className="text-xs font-bold text-gray-600 mb-1">⚡️ 新しい執行者</p>
                    <span className="font-black text-pink-600 text-3xl break-words leading-tight">
                      {r.newExecutor}
                    </span>
                  </div>
                  
                  {/* 元の執行者 */}
                  <div className="bg-gray-100 rounded-xl p-3 border-2 border-gray-300">
                    <p className="text-xs font-bold text-gray-500 mb-1">👤 元の執行者</p>
                    <span className="font-bold text-gray-600 text-lg break-words">
                      {r.originalExecutor}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <footer className="flex flex-col gap-3 items-center py-6 px-4">
        <button 
          onClick={onRetry} 
          className="w-full max-w-md bg-gradient-to-r from-pink-500 to-pink-600 text-white font-black rounded-2xl py-5 text-2xl shadow-xl hover:from-pink-600 hover:to-pink-700 transition-all transform hover:scale-[1.02] border-2 border-pink-700"
        >
          🔄 もう一度
        </button>
        <button 
          onClick={onHome} 
          className="w-full max-w-md bg-gradient-to-r from-yellow-400 to-yellow-300 text-pink-800 font-black rounded-2xl py-5 text-2xl shadow-xl hover:from-yellow-500 hover:to-yellow-400 transition-all transform hover:scale-[1.02] border-2 border-yellow-500"
        >
          🏠 トップへ戻る
        </button>
      </footer>
    </div>
  );
}
