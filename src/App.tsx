


import { useState, useEffect } from "react";
import { useYouTubeBGM } from "./hooks/useYouTubeBGM";
import { FullscreenVideo } from "./components/FullscreenVideo";
import { ResultList } from "./components/ResultList";
import sakuBg from "./assets/saku.png";

type Cross = {
  name: string;
  executor: string;
};

const STORAGE_KEY = "iwakuran_crosses";

type Phase = "menu" | "intro" | "register" | "exchange" | "ready" | "show" | "result" | "tripleIntro" | "tripleConfirm" | "tripleRoulette" | "tripleResult";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function App() {
  const BGM_VIDEO_ID = "fFgLmwpd4FM";
  const [bgmOn, setBgmOn] = useState(true);
  const [name, setName] = useState("");
  const [executor, setExecutor] = useState("");
  const [crosses, setCrosses] = useState<Cross[]>([]);
  const [phase, setPhase] = useState<Phase>("menu");
  // 準備画面と結果発表画面では基本BGMを停止
  useYouTubeBGM(BGM_VIDEO_ID, bgmOn && phase !== "ready" && phase !== "result");
  const [showIdx, setShowIdx] = useState(0);
  const [results, setResults] = useState<{ name: string; originalExecutor: string; newExecutor: string }[]>([]);
  const [shuffledExecutors, setShuffledExecutors] = useState<string[]>([]);
  const [showedExecutor, setShowedExecutor] = useState<string | null>(null);
  const [rouletteResult, setRouletteResult] = useState<"消滅" | "3倍" | null>(null);
  const [isRouletteSpinning, setIsRouletteSpinning] = useState(false);
  const [tripleCrossName, setTripleCrossName] = useState("");
  const [tripleCrossExecutor, setTripleCrossExecutor] = useState("");
  const [currentRouletteText, setCurrentRouletteText] = useState<"消滅" | "3倍">("消滅");
  const [rouletteInterval, setRouletteInterval] = useState<number | null>(null);

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

  // 十字架交換ボタン押下（動画をスキップして直接準備画面へ）
  const handleExchange = () => {
    if (crosses.length < 2) return alert("2件以上登録してください");
    // 執行者をシャッフル
    setShuffledExecutors(shuffle(crosses.map(c => c.executor)));
    setShowIdx(0);
    setResults([]);
    setShowedExecutor(null);
    setPhase("ready");
  };

  // 動画終了後、準備画面へ
  const handleVideoEnd = () => {
    // 執行者をシャッフル
    setShuffledExecutors(shuffle(crosses.map(c => c.executor)));
    setShowIdx(0);
    setResults([]);
    setShowedExecutor(null);
    setPhase("ready");
  };

  // 準備完了、執行者決定開始
  const handleStartShow = () => {
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

  // 十字架を削除
  const handleDeleteCross = (index: number) => {
    setCrosses(crosses.filter((_, i) => i !== index));
  };

  // 十字架シャッフルを開始（説明画面へ）
  const handleStartShuffle = () => {
    setPhase("intro");
  };

  // 登録画面へ進む
  const handleStartRegister = () => {
    setPhase("register");
  };

  // 新春福袋（準備中）
  const handleStartFukubukuro = () => {
    alert("新春福袋は準備中です！お楽しみに🎁");
  };

  // 町田商店公式HP
  const handleMachidaShoten = () => {
    const confirmed = window.confirm("あなたは20歳以上ですか？");
    if (confirmed) {
      window.open("https://www.machidashoten.com/", "_blank");
    }
  };

  // 岩倉発アーティスト紹介
  const handleArtistIntro = () => {
    const confirmed = window.confirm("もしかして、さんとうへい -3T0HE-？");
    if (confirmed) {
      window.open("https://www.youtube.com/watch?v=ANVPnF3dnY4", "_blank");
    } else {
      window.open("https://www.youtube.com/watch?v=btTopEkZqOM", "_blank");
    }
  };

  // 十字架消滅or3倍を開始
  const handleStartTriple = () => {
    setTripleCrossName("");
    setTripleCrossExecutor("");
    setRouletteResult(null);
    setPhase("tripleIntro");
  };

  // 十字架入力画面へ
  const handleSelectCross = () => {
    setPhase("tripleConfirm");
  };

  // ルーレット開始
  const handleStartRoulette = () => {
    if (!tripleCrossName.trim() || !tripleCrossExecutor.trim()) {
      alert("十字架名と執行者を入力してください！");
      return;
    }
    setPhase("tripleRoulette");
    setRouletteResult(null);
  };

  // ルーレット実行
  const handleSpinRoulette = () => {
    setIsRouletteSpinning(true);
    
    // テキストを高速で切り替える（ユーザーがstopボタンを押すまで無限に）
    const interval = setInterval(() => {
      setCurrentRouletteText(prev => prev === "消滅" ? "3倍" : "消滅");
    }, 100);
    
    setRouletteInterval(interval);
  };

  // ルーレット停止
  const handleStopRoulette = () => {
    if (rouletteInterval) {
      clearInterval(rouletteInterval);
      setRouletteInterval(null);
    }
    
    // 現在表示されているテキストを結果とする
    setRouletteResult(currentRouletteText);
    setIsRouletteSpinning(false);
    
    // 1秒後に結果画面へ
    setTimeout(() => {
      setPhase("tripleResult");
    }, 1000);
  };

  // 3倍チャレンジ後にメニューへ戻る
  const handleTripleHome = () => {
    // インターバルをクリア
    if (rouletteInterval) {
      clearInterval(rouletteInterval);
      setRouletteInterval(null);
    }
    // 消滅or3倍の結果は表示のみで、実際の処理はユーザー任せ
    setTripleCrossName("");
    setTripleCrossExecutor("");
    setRouletteResult(null);
    setCurrentRouletteText("消滅");
    setIsRouletteSpinning(false);
    setPhase("menu");
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
            onClick={handleStartTriple}
            className="w-full max-w-md bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white font-bold rounded-xl text-2xl py-6 shadow-2xl hover:from-purple-600 hover:via-pink-600 hover:to-purple-600 transition-all transform hover:scale-105"
          >
            💀 十字架〜消滅or3倍〜 💀
          </button>
          <button
            onClick={handleStartFukubukuro}
            className="w-full max-w-md bg-gradient-to-r from-red-400 via-pink-400 to-red-400 text-white font-bold rounded-xl text-2xl py-6 shadow-2xl hover:from-red-500 hover:via-pink-500 hover:to-red-500 transition-all transform hover:scale-105"
          >
            🎁 新春福袋 🎁
          </button>
          <button
            onClick={handleMachidaShoten}
            className="w-full max-w-md bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white font-bold rounded-xl text-2xl py-6 shadow-2xl hover:from-amber-700 hover:via-amber-600 hover:to-amber-700 transition-all transform hover:scale-105"
          >
            🍜 町田商店公式HP 🍜
          </button>
          <button
            onClick={handleArtistIntro}
            className="w-full max-w-md bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 text-white font-bold rounded-xl text-2xl py-6 shadow-2xl hover:from-purple-700 hover:via-purple-600 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            🎤 岩倉発アーティスト紹介 🎤
          </button>
        </main>
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div className="min-h-screen flex flex-col bg-white py-6" style={{ backgroundColor: '#ffffff' }}>
        <div className="fixed top-2 right-2 z-50">
          <button
            className="bg-white/80 border border-yellow-300 rounded-lg px-3 py-1 shadow hover:bg-yellow-100 transition text-sm font-bold"
            onClick={() => setBgmOn((v) => !v)}
          >
            {bgmOn ? "BGM OFF" : "BGM ON"}
          </button>
        </div>
        <header className="text-center py-6 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 mx-auto max-w-md border-4 border-yellow-300" style={{ backgroundColor: '#ffffff' }}>
            <div className="inazuma-title inazuma-glow select-none text-5xl">岩倉魂</div>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-4 pb-12">
          <div className="w-full max-w-2xl space-y-6">
            {/* タイトルカード */}
            <div className="bg-white rounded-3xl shadow-2xl p-8" style={{ backgroundColor: '#ffffff' }}>
              <h1 className="text-4xl font-black text-center text-pink-700">
                ⚡️ 十字架シャッフルとは ⚡️
              </h1>
            </div>

            {/* 説明テキストカード */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-5" style={{ backgroundColor: '#ffffff' }}>
              <p className="font-bold text-2xl leading-relaxed text-gray-800 text-center">
                人は皆、<span className="text-pink-600 font-black">十字架（罰ゲーム）</span>を背負っている。
              </p>

              <p className="font-bold text-2xl leading-relaxed text-gray-800 text-center">
                そんな十字架を背負いし者のみが参加できる<span className="text-yellow-700 font-black">儀式</span>があるのだ。
              </p>

              <p className="font-black text-3xl text-center text-pink-700 leading-tight">
                その名は、<br />
                <span className="text-5xl inazuma-glow block mt-3">「十字架シャッフル」</span>
              </p>

              <p className="font-bold text-2xl leading-relaxed text-gray-800 text-center">
                自分の十字架と、他のプレイヤーの十字架を<span className="text-red-600 font-black">交換</span>する悪魔的儀式。
              </p>

              <p className="font-bold text-3xl text-center text-gray-800 leading-tight">
                参加するもしないも<br />
                <span className="text-pink-600 font-black text-4xl">諸君次第</span>だ。
              </p>
            </div>

            {/* ボタンカード */}
            <div className="bg-white rounded-3xl shadow-2xl p-6 flex flex-col gap-4" style={{ backgroundColor: '#ffffff' }}>
              <button
                onClick={handleStartRegister}
                className="w-full inazuma-btn text-2xl py-6 shadow-2xl transform hover:scale-105 transition-all"
              >
                <span className="inazuma-glow">⚡️ 儀式に参加する ⚡️</span>
              </button>
              <button
                onClick={() => setPhase("menu")}
                className="w-full bg-gray-300 text-gray-700 font-bold rounded-xl text-xl py-4 shadow hover:bg-gray-400 transition"
              >
                戻る
              </button>
            </div>
          </div>
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

  if (phase === "ready") {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{
          background: `url(${sakuBg}) center center/cover no-repeat fixed`,
          backgroundColor: '#f0f0f0'
        }}
      >
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center">
          <button
            onClick={handleStartShow}
            className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white font-black rounded-2xl py-6 text-2xl shadow-xl hover:from-pink-600 hover:to-pink-700 transition-all transform hover:scale-105"
          >
            ⚡️ 執行者決定を開始 ⚡️
          </button>
        </div>
      </div>
    );
  }

  if (phase === "show") {
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
          <div className="bg-white rounded-lg shadow-lg p-4 mx-4 text-2xl font-bold tracking-widest text-pink-700">
            執行者決定
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-md flex flex-col items-center gap-6">
            {/* 十字架名カード */}
            <div className="w-full bg-white/100 rounded-2xl shadow-2xl p-10 border-4 border-pink-300" style={{ backgroundColor: '#ffffff' }}>
              <h2 className="text-5xl font-black text-center text-pink-700 break-words leading-tight">{crosses[showIdx]?.name}</h2>
            </div>
            
            {showedExecutor ? (
              <>
                {/* 執行者名カード */}
                <div className="w-full bg-white/100 rounded-2xl shadow-2xl p-10 border-4 border-pink-400" style={{ backgroundColor: '#ffffff' }}>
                  <div className="text-6xl font-black text-pink-600 text-center animate-bounce break-words leading-tight">{showedExecutor}</div>
                </div>
                {showIdx < crosses.length - 1 ? (
                  <button onClick={handleNext} className="w-full bg-yellow-300 text-pink-700 font-bold rounded-xl py-5 px-8 text-2xl shadow-xl hover:bg-yellow-400 transition transform hover:scale-[1.02]">次へ</button>
                ) : null}
              </>
            ) : (
              <button onClick={handleShowExecutor} className="w-full bg-yellow-300 text-pink-700 font-bold rounded-xl py-5 px-8 text-2xl shadow-xl hover:bg-yellow-400 transition transform hover:scale-[1.02]">執行者を表示</button>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (phase === "result") {
    return <ResultList results={results} onRetry={handleRetry} onHome={handleHome} />;
  }

  // --- 消滅or3倍 説明画面 ---
  if (phase === "tripleIntro") {
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
          <div className="bg-white rounded-2xl shadow-2xl p-6 mx-auto max-w-md border-4 border-purple-300">
            <h1 className="text-4xl font-black text-purple-700">
              💀 十字架〜消滅or3倍〜 💀
            </h1>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-2xl space-y-6">
            <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-5 border-4 border-purple-200">
              <p className="font-bold text-2xl leading-relaxed text-gray-800 text-center">
                <span className="text-purple-600 font-black">50%の確率</span>で貴方の十字架が<span className="text-red-600 font-black">消滅</span>し、
              </p>
              <p className="font-bold text-2xl leading-relaxed text-gray-800 text-center">
                <span className="text-purple-600 font-black">50%の確率</span>で貴方の十字架が<span className="text-pink-600 font-black">3倍</span>になります。
              </p>
              <div className="bg-pink-50 rounded-2xl p-6 border-2 border-pink-300">
                <p className="font-bold text-xl text-gray-700 text-center">
                  （例：米1週間禁止 → 米3週間禁止）
                </p>
              </div>
              <p className="font-black text-3xl text-center text-purple-700 leading-tight mt-6">
                覚悟は<br />
                <span className="text-5xl block mt-3">できているか？</span>
              </p>
            </div>
            
            <div className="bg-white rounded-3xl shadow-2xl p-6 flex flex-col gap-4">
              <button
                onClick={handleSelectCross}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-black rounded-2xl text-2xl py-6 shadow-xl hover:from-purple-600 hover:to-pink-700 transition-all transform hover:scale-105"
              >
                💀 挑戦する 💀
              </button>
              <button
                onClick={() => setPhase("menu")}
                className="w-full bg-gray-300 text-gray-700 font-bold rounded-xl text-xl py-4 shadow hover:bg-gray-400 transition"
              >
                戻る
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- 消滅or3倍 十字架入力画面 ---
  if (phase === "tripleConfirm") {
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
          <div className="bg-white rounded-2xl shadow-2xl p-6 mx-auto max-w-md border-4 border-purple-300">
            <h1 className="text-3xl font-black text-purple-700">
              消滅or3倍チャレンジ<br />やりますか？
            </h1>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center px-4 py-6">
          <div className="w-full max-w-md space-y-6">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-purple-200">
              <h2 className="text-xl font-black text-center mb-6 text-purple-600">挑戦する十字架を入力</h2>
              
              <form className="flex flex-col gap-6" onSubmit={(e) => { e.preventDefault(); handleStartRoulette(); }}>
                {/* 十字架名入力 */}
                <div>
                  <label className="block text-base font-black text-gray-700 mb-2 ml-1">
                    📛 十字架名
                  </label>
                  <input
                    type="text"
                    placeholder="例：1週間の米禁止"
                    value={tripleCrossName}
                    onChange={e => setTripleCrossName(e.target.value)}
                    className="w-full rounded-2xl px-6 py-7 border-4 border-purple-300 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-500 bg-white text-3xl font-black shadow-xl transition-all focus:scale-[1.02] placeholder:text-gray-300"
                  />
                </div>
                
                {/* 執行者入力 */}
                <div>
                  <label className="block text-base font-black text-gray-700 mb-2 ml-1">
                    👤 執行者
                  </label>
                  <input
                    type="text"
                    placeholder="例：佐倉 杏子"
                    value={tripleCrossExecutor}
                    onChange={e => setTripleCrossExecutor(e.target.value)}
                    className="w-full rounded-2xl px-6 py-7 border-4 border-purple-300 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-500 bg-white text-3xl font-black shadow-xl transition-all focus:scale-[1.02] placeholder:text-gray-300"
                  />
                </div>
              </form>
            </div>

            <button
              onClick={handleStartRoulette}
              disabled={!tripleCrossName.trim() || !tripleCrossExecutor.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-black rounded-2xl text-2xl py-6 shadow-xl hover:from-purple-600 hover:to-pink-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🎰 ルーレットを回す 🎰
            </button>
            <button
              onClick={() => setPhase("tripleIntro")}
              className="w-full bg-gray-300 text-gray-700 font-bold rounded-xl text-xl py-4 shadow hover:bg-gray-400 transition"
            >
              戻る
            </button>
          </div>
        </main>
      </div>
    );
  }

  // --- 消滅or3倍 ルーレット画面 ---
  if (phase === "tripleRoulette") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#ffffff' }}>
        <main className="flex-1 flex flex-col items-center justify-center px-4 w-full">
          <div className="w-full max-w-md space-y-8">
            {/* 選択された十字架を表示 */}
            <div className="bg-purple-100 rounded-3xl shadow-2xl p-6 border-4 border-purple-400">
              <h2 className="text-2xl font-black text-center text-purple-700 mb-4">挑戦する十字架</h2>
              <div className="bg-white rounded-2xl p-6 shadow-inner">
                <div className="font-black text-3xl text-center text-gray-800 break-words">
                  📛 {tripleCrossName}
                </div>
                <div className="text-xl text-center text-gray-600 mt-3">
                  👤 {tripleCrossExecutor}
                </div>
              </div>
            </div>

            {/* ルーレット */}
            <div className="bg-white rounded-3xl shadow-2xl p-6 border-4 border-purple-300">
              {/* ルーレット表示エリア */}
              <div className="relative w-full max-w-[200px] h-[200px] mx-auto flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl border-8 border-gray-800 shadow-inner">
                {!rouletteResult && (
                  <div className={`text-center ${isRouletteSpinning ? "animate-pulse" : ""}`}>
                    <div 
                      className={`text-7xl font-black transition-all duration-100 ${
                        currentRouletteText === "消滅" ? "text-red-500" : "text-green-500"
                      }`}
                    >
                      {currentRouletteText}
                    </div>
                  </div>
                )}
                
                {rouletteResult && (
                  <div className="text-center">
                    <div 
                      className="text-7xl font-black animate-bounce"
                      style={{ color: rouletteResult === "消滅" ? "#ef4444" : "#22c55e" }}
                    >
                      {rouletteResult}
                    </div>
                  </div>
                )}
              </div>

              {!isRouletteSpinning && !rouletteResult && (
                <button
                  onClick={handleSpinRoulette}
                  className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-black rounded-2xl text-2xl py-6 shadow-xl hover:from-purple-600 hover:to-pink-700 transition-all transform hover:scale-105"
                >
                  🎰 回す！ 🎰
                </button>
              )}

              {isRouletteSpinning && !rouletteResult && (
                <div className="mt-4 space-y-3">
                  <p className="text-center text-2xl font-black text-purple-700 animate-pulse">
                    ドキドキ...
                  </p>
                  <button
                    onClick={handleStopRoulette}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-black rounded-2xl text-3xl py-8 shadow-xl hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 animate-pulse"
                  >
                    ⏹️ STOP！ ⏹️
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- 消滅or3倍 結果画面 ---
  if (phase === "tripleResult") {
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
          <div className="bg-white rounded-2xl shadow-2xl p-6 mx-auto max-w-md border-4 border-purple-300">
            <h1 className="text-4xl font-black text-purple-700">
              結果発表
            </h1>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-md space-y-6">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-purple-200">
              <div className="text-center space-y-6">
                <div className="bg-purple-50 rounded-2xl p-6">
                  <p className="text-xl font-bold text-gray-700 mb-2">十字架</p>
                  <p className="text-3xl font-black text-gray-800 break-words">
                    {tripleCrossName}
                  </p>
                  <p className="text-lg text-gray-600 mt-2">
                    👤 {tripleCrossExecutor}
                  </p>
                </div>

                <div className="text-6xl font-black animate-bounce" style={{ color: rouletteResult === "消滅" ? "#ef4444" : "#22c55e" }}>
                  {rouletteResult}！
                </div>

                {rouletteResult === "消滅" && (
                  <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-300">
                    <p className="text-2xl font-bold text-red-700">
                      🎉 おめでとうございます！<br />
                      十字架が消滅しました！
                    </p>
                  </div>
                )}

                {rouletteResult === "3倍" && (
                  <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-300">
                    <p className="text-2xl font-bold text-green-700">
                      😱 残念！<br />
                      十字架が3倍になりました！<br />
                      <span className="text-lg mt-2 block">
                        （期間を3倍に変更してください）
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleTripleHome}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-300 text-purple-800 font-black rounded-2xl py-6 text-2xl shadow-xl hover:from-yellow-500 hover:to-yellow-400 transition-all transform hover:scale-105"
            >
              🏠 トップへ戻る
            </button>
          </div>
        </main>
      </div>
    );
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
      <main className="flex-1 flex flex-col items-center px-4 pb-6">
        <div className="w-full max-w-md inazuma-card mt-4">
          <h2 className="text-2xl font-bold text-center mb-6 text-yellow-500 inazuma-glow select-none">⚡️ 十字架登録 ⚡️</h2>
          
          <form className="flex flex-col gap-6" onSubmit={e => { e.preventDefault(); if (!name.trim() || !executor.trim()) return; setCrosses([...crosses, { name: name.trim(), executor: executor.trim() }]); setName(""); setExecutor(""); }}>
            {/* 十字架名入力 */}
            <div>
              <label className="block text-base font-black text-gray-700 mb-2 ml-1">
                📛 十字架名
              </label>
              <input
                type="text"
                placeholder="例：1週間の米禁止"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-2xl px-6 py-7 border-4 border-yellow-300 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-yellow-500 bg-white text-3xl font-black shadow-xl transition-all focus:scale-[1.02] placeholder:text-gray-300"
              />
              <p className="text-xs text-gray-500 mt-1 ml-1">罰ゲームや課題の内容を入力</p>
            </div>
            
            {/* 執行者入力 */}
            <div>
              <label className="block text-base font-black text-gray-700 mb-2 ml-1">
                👤 元の執行者
              </label>
              <input
                type="text"
                placeholder="例：佐倉 杏子"
                value={executor}
                onChange={e => setExecutor(e.target.value)}
                className="w-full rounded-2xl px-6 py-7 border-4 border-yellow-300 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-yellow-500 bg-white text-3xl font-black shadow-xl transition-all focus:scale-[1.02] placeholder:text-gray-300"
              />
              <p className="text-xs text-gray-500 mt-1 ml-1">現在の実行者の名前を入力</p>
            </div>
            
            <button
              type="submit"
              className="inazuma-btn mt-2 py-5 text-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!name.trim() || !executor.trim()}
            >
              ✨ 追加する
            </button>
          </form>
          
          <div className="mt-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-yellow-500 inazuma-glow select-none text-lg">📋 登録済み十字架</h3>
              <span className="text-sm font-bold text-gray-700 bg-yellow-100 px-4 py-2 rounded-full shadow-md">
                {crosses.length}件
              </span>
            </div>
            
            <ul className="space-y-3 text-gray-700 text-lg min-h-[2em] max-h-[400px] overflow-y-auto">
              {crosses.length === 0 ? (
                <li className="italic text-gray-400 text-center py-8 bg-white/50 rounded-xl">
                  （ここに十字架が表示されます）
                </li>
              ) : (
                crosses.map((c, i) => (
                  <li
                    key={i}
                    className="bg-white/95 rounded-2xl shadow-2xl border-2 border-transparent hover:scale-[1.02] hover:shadow-yellow-200 transition-all duration-200 group overflow-hidden flex items-center gap-3 pr-3 pl-6 py-5"
                    style={{ boxShadow: '0 6px 32px 0 rgba(255, 193, 7, 0.10), 0 1.5px 6px 0 rgba(0,0,0,0.08)' }}
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-extrabold text-blue-800 text-xl truncate tracking-wide drop-shadow">📛 {c.name}</span>
                      <span className="mt-2 text-yellow-700 text-lg font-bold">👤 {c.executor}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCross(i)}
                      className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500 text-white font-bold hover:bg-red-600 transition-all hover:scale-110 flex items-center justify-center text-xl shadow-lg"
                      aria-label="削除"
                    >
                      ✕
                    </button>
                  </li>
                ))
              )}
            </ul>
            
            {crosses.length > 0 && crosses.length < 2 && (
              <div className="mt-4 text-center bg-pink-50 border-2 border-pink-300 rounded-xl py-3 px-4">
                <p className="text-sm text-pink-700 font-bold">
                  ⚠️ あと{2 - crosses.length}件登録すると交換できます
                </p>
              </div>
            )}
            
            <button
              className="w-full inazuma-btn mt-4 py-5 text-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleExchange}
              disabled={crosses.length < 2}
            >
              <span className="inazuma-glow">⚡️ 十字架交換 ⚡️</span>
            </button>
            
            <button
              onClick={() => setPhase("menu")}
              className="w-full bg-gray-300 text-gray-700 font-bold rounded-xl text-xl py-4 shadow hover:bg-gray-400 transition mt-3"
            >
              🏠 トップへ戻る
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
