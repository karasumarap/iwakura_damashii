


import { useState, useEffect } from "react";
import { useYouTubeBGM } from "./hooks/useYouTubeBGM";
import { FullscreenVideo } from "./components/FullscreenVideo";
import { ResultList } from "./components/ResultList";

type Cross = {
  name: string;
  executor: string;
};

const STORAGE_KEY = "iwakuran_crosses";

type Phase = "menu" | "register" | "exchange" | "show" | "result";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function App() {
  const BGM_LIST = [
    { label: "通常BGM", videoId: "fFgLmwpd4FM" },
  ];
  const [bgmIdx, setBgmIdx] = useState(0);
  const [bgmOn, setBgmOn] = useState(true);
  const [name, setName] = useState("");
  const [executor, setExecutor] = useState("");
  const [crosses, setCrosses] = useState<Cross[]>([]);
  const [phase, setPhase] = useState<Phase>("menu");
  // 動画再生中と結果発表画面では基本BGMを停止
  useYouTubeBGM(BGM_LIST[bgmIdx].videoId, bgmOn && phase !== "exchange" && phase !== "result");
  const [showIdx, setShowIdx] = useState(0);
  const [results, setResults] = useState<{ name: string; originalExecutor: string; newExecutor: string }[]>([]);
  const [shuffledExecutors, setShuffledExecutors] = useState<string[]>([]);
  const [showedExecutor, setShowedExecutor] = useState<string | null>(null);

  // LocalStorageから初期値取得
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setCrosses(JSON.parse(saved));
    }
  }, []);

  // crossesが変わるたび保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(crosses));
  }, [crosses]);

  // 十字架交換ボタン押下
  const handleExchange = () => {
    if (crosses.length < 2) return alert("2件以上登録してください");
    setPhase("exchange");
  };

  // 動画終了後、執行者決定フェーズへ
  const handleVideoEnd = () => {
    // 執行者をシャッフル
    setShuffledExecutors(shuffle(crosses.map(c => c.executor)));
    setShowIdx(0);
    setResults([]);
    setShowedExecutor(null);
    setPhase("show");
  };

  // 執行者決定ボタン押下
  const handleShowExecutor = () => {
    if (!shuffledExecutors[showIdx]) return;
    setShowedExecutor(shuffledExecutors[showIdx]);
    setResults(prev => [
      ...prev,
      { name: crosses[showIdx].name, originalExecutor: crosses[showIdx].executor, newExecutor: shuffledExecutors[showIdx] }
    ]);
  };

  // 次の十字架へ
  const handleNext = () => {
    setShowIdx(idx => idx + 1);
    setShowedExecutor(null);
  };

  // 全て終わったら結果画面へ
  useEffect(() => {
    if (phase === "show" && results.length === crosses.length && crosses.length > 0) {
      setTimeout(() => setPhase("result"), 800);
    }
  }, [results, phase, crosses.length]);

  // トップへ戻る
  const handleHome = () => {
    setPhase("menu");
    setResults([]);
    setShowIdx(0);
    setShowedExecutor(null);
  };

  // もう一度
  const handleRetry = () => {
    setPhase("exchange");
    setResults([]);
    setShowIdx(0);
    setShowedExecutor(null);
  };

  // 十字架シャッフルを開始
  const handleStartShuffle = () => {
    setPhase("register");
  };

  // 新春福袋（準備中）
  const handleStartFukubukuro = () => {
    alert("新春福袋は準備中です！お楽しみに🎁");
  };

  // --- 画面分岐 ---
  if (phase === "menu") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-yellow-100 to-pink-200">
        <div className="fixed top-2 right-2 z-50">
          <button
            className="bg-white/80 border border-yellow-300 rounded-lg px-3 py-1 shadow hover:bg-yellow-100 transition text-sm font-bold"
            onClick={() => setBgmOn((v) => !v)}
          >
            {bgmOn ? "BGM OFF" : "BGM ON"}
          </button>
        </div>
        <header className="text-center py-12">
          <div className="inazuma-title inazuma-glow select-none text-6xl">岩倉魂</div>
          <p className="text-pink-600 font-bold mt-4 text-lg">ようこそ！モードを選択してください</p>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-4 gap-6 pb-20">
          <button
            onClick={handleStartShuffle}
            className="w-full max-w-md inazuma-btn text-2xl py-6 shadow-2xl transform hover:scale-105 transition-all"
          >
            <span className="inazuma-glow">⚡️ 十字架シャッフル ⚡️</span>
          </button>
          <button
            onClick={handleStartFukubukuro}
            className="w-full max-w-md bg-gradient-to-r from-red-400 via-pink-400 to-red-400 text-white font-bold rounded-xl text-2xl py-6 shadow-2xl hover:from-red-500 hover:via-pink-500 hover:to-red-500 transition-all transform hover:scale-105"
          >
            🎁 新春福袋 🎁
          </button>
        </main>
      </div>
    );
  }

  if (phase === "exchange") {
    return (
      <FullscreenVideo
        src={`${import.meta.env.BASE_URL}inazumabigban.mp4`}
        onEnd={handleVideoEnd}
      />
    );
  }

  if (phase === "show") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-yellow-100 to-pink-200">
        <header className="text-center py-6">
          <div className="bg-white rounded-lg shadow-lg p-4 mx-4 text-2xl font-bold tracking-widest text-pink-700">
            執行者決定
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center px-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 mt-4 flex flex-col items-center">
            <h2 className="text-xl font-semibold text-center mb-4 text-pink-600">{crosses[showIdx]?.name}</h2>
            {showedExecutor ? (
              <>
                <div className="text-4xl font-bold text-pink-500 mb-4 animate-bounce">{showedExecutor}</div>
                {showIdx < crosses.length - 1 ? (
                  <button onClick={handleNext} className="bg-yellow-300 text-pink-700 font-bold rounded-xl py-3 px-8 text-xl shadow hover:bg-yellow-400 transition mt-2">次へ</button>
                ) : null}
              </>
            ) : (
              <button onClick={handleShowExecutor} className="bg-pink-500 text-white font-bold rounded-xl py-3 px-8 text-xl shadow hover:bg-pink-600 transition">執行者を表示</button>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (phase === "result") {
    return <ResultList results={results} onRetry={handleRetry} onHome={handleHome} />;
  }

  // --- 登録画面 ---
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-yellow-100 to-pink-200">
      <div className="fixed top-2 right-2 z-50">
        <button
          className="bg-white/80 border border-yellow-300 rounded-lg px-3 py-1 shadow hover:bg-yellow-100 transition text-sm font-bold"
          onClick={() => setBgmOn((v) => !v)}
        >
          {bgmOn ? "BGM OFF" : "BGM ON"}
        </button>
      </div>
      <header className="text-center py-6">
        <div className="inazuma-title inazuma-glow select-none">岩倉魂</div>
      </header>
      <main className="flex-1 flex flex-col items-center px-4">
        <div className="w-full max-w-md inazuma-card mt-4">
          <h2 className="text-xl font-bold text-center mb-4 text-yellow-500 inazuma-glow select-none">十字架登録</h2>
          <form className="flex flex-col gap-3" onSubmit={e => { e.preventDefault(); if (!name.trim() || !executor.trim()) return; setCrosses([...crosses, { name: name.trim(), executor: executor.trim() }]); setName(""); setExecutor(""); }}>
            <input
              type="text"
              placeholder="十字架名"
              value={name}
              onChange={e => setName(e.target.value)}
              className="rounded px-3 py-2 border-2 border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white text-lg font-bold shadow"
            />
            <input
              type="text"
              placeholder="元の執行者"
              value={executor}
              onChange={e => setExecutor(e.target.value)}
              className="rounded px-3 py-2 border-2 border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white text-lg font-bold shadow"
            />
            <button
              type="submit"
              className="inazuma-btn mt-2"
              disabled={!name.trim() || !executor.trim()}
            >
              追加
            </button>
          </form>
          <div className="mt-6">
            <h3 className="font-bold text-yellow-500 mb-2 inazuma-glow select-none">登録済み十字架</h3>
            <ul className="space-y-1 text-gray-700 text-lg min-h-[2em]">
              {crosses.length === 0 ? (
                <li className="italic text-gray-400">（ここに十字架が表示されます）</li>
              ) : (
                crosses.map((c, i) => (
                  <li
                    key={i}
                    className="bg-white/95 rounded-2xl shadow-2xl border-2 border-transparent px-6 py-4 mb-4 hover:scale-105 hover:shadow-yellow-200 transition-all duration-200 group overflow-hidden"
                    style={{ boxShadow: '0 6px 32px 0 rgba(255, 193, 7, 0.10), 0 1.5px 6px 0 rgba(0,0,0,0.08)' }}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-extrabold text-blue-800 text-lg truncate tracking-wide drop-shadow">十字架名：{c.name}</span>
                      <span className="mt-2 text-yellow-700 text-base font-bold">執行者：{c.executor}</span>
                    </div>
                  </li>
                ))
              )}
            </ul>
            <button
              className="w-full inazuma-btn mt-4 py-3 disabled:opacity-50"
              onClick={handleExchange}
              disabled={crosses.length < 2}
            >
              <span className="inazuma-glow">⚡️ 十字架交換 ⚡️</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
