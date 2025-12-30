import { useYouTubeBGM } from "../hooks/useYouTubeBGM";

export function ResultList({ results, onRetry, onHome }: {
  results: { name: string; originalExecutor: string; newExecutor: string }[];
  onRetry: () => void;
  onHome: () => void;
}) {
  // YouTube動画ID: ANVPnF3dnY4
  useYouTubeBGM("ANVPnF3dnY4", true);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-yellow-100 to-pink-200">
      <header className="text-center py-6 text-2xl font-bold tracking-widest text-pink-700 drop-shadow-md">
        結果発表
      </header>
      <main className="flex-1 flex flex-col items-center px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-4 mt-4">
          <h2 className="text-lg font-semibold text-center mb-4 text-pink-600">新しい執行者一覧</h2>
          <ul className="space-y-3 text-gray-700 text-base">
            {results.map((r, i) => (
              <li key={i} className="bg-white/95 rounded-2xl shadow-2xl border-2 border-transparent px-6 py-4 mb-4">
                <div className="flex flex-col min-w-0">
                  <span className="font-extrabold text-blue-800 text-lg truncate tracking-wide drop-shadow">十字架名：{r.name}</span>
                  <span className="mt-2 text-gray-600 text-base font-semibold">元の執行者：{r.originalExecutor}</span>
                  <span className="mt-2 text-yellow-700 text-base font-bold">執行者：{r.newExecutor}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <footer className="flex flex-col gap-2 items-center py-6">
        <button onClick={onRetry} className="w-11/12 max-w-md bg-pink-500 text-white font-bold rounded-xl py-3 text-lg shadow hover:bg-pink-600 transition mb-2">
          もう一度
        </button>
        <button onClick={onHome} className="w-11/12 max-w-md bg-yellow-300 text-pink-700 font-bold rounded-xl py-3 text-lg shadow hover:bg-yellow-400 transition">
          トップへ戻る
        </button>
      </footer>
    </div>
  );
}
