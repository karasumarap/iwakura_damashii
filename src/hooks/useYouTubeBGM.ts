import { useEffect, useRef } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

let playerIdCounter = 0;

export function useYouTubeBGM(videoId: string, play: boolean) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerIdRef = useRef<string>(`youtube-player-${++playerIdCounter}`);
  const readyRef = useRef(false);
  const pendingPlayRef = useRef(false);

  useEffect(() => {
    // YouTube IFrame APIスクリプトを読み込む
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // コンテナ要素を作成
    if (!containerRef.current) {
      containerRef.current = document.createElement('div');
      containerRef.current.id = playerIdRef.current;
      containerRef.current.style.display = 'none';
      document.body.appendChild(containerRef.current);
    }

    const initPlayer = () => {
      if (window.YT && window.YT.Player && containerRef.current) {
        playerRef.current = new window.YT.Player(playerIdRef.current, {
          videoId: videoId,
          playerVars: {
            autoplay: 0, // モバイル対応のため自動再生を無効化
            loop: 1,
            playlist: videoId, // ループのために必要
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1, // iOS対応
          },
          events: {
            onReady: (event: any) => {
              readyRef.current = true;
              // 待機中の再生リクエストがあれば実行
              if (pendingPlayRef.current || play) {
                pendingPlayRef.current = false;
                // 少し遅延させて確実に再生
                setTimeout(() => {
                  try {
                    event.target.playVideo();
                  } catch (e) {
                    console.warn("初回再生失敗、リトライします:", e);
                    // 再度試行
                    setTimeout(() => {
                      try {
                        event.target.playVideo();
                      } catch (e2) {
                        console.error("再生失敗:", e2);
                      }
                    }, 500);
                  }
                }, 100);
              }
            },
            onStateChange: (event: any) => {
              // 動画が終了したら再生
              if (event.data === window.YT.PlayerState.ENDED) {
                event.target.playVideo();
              }
            },
            onError: (event: any) => {
              console.error("YouTube player error:", event.data);
            }
          }
        });
      }
    };

    const checkAndInit = () => {
      if (window.YT && window.YT.Player) {
        initPlayer();
      } else {
        window.onYouTubeIframeAPIReady = initPlayer;
      }
    };

    // 少し遅延させてAPIの読み込みを待つ
    const timer = setTimeout(checkAndInit, 100);

    return () => {
      clearTimeout(timer);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
      if (containerRef.current && containerRef.current.parentNode) {
        containerRef.current.parentNode.removeChild(containerRef.current);
      }
      containerRef.current = null;
      readyRef.current = false;
    };
  }, [videoId]);

  // play状態の変更に対応
  useEffect(() => {
    if (!playerRef.current) {
      if (play) {
        // プレイヤーがまだ初期化されていない場合、再生待ちフラグを立てる
        pendingPlayRef.current = true;
      }
      return;
    }

    if (!readyRef.current) {
      if (play) {
        pendingPlayRef.current = true;
      }
      return;
    }

    const attemptPlay = () => {
      try {
        if (play) {
          playerRef.current.playVideo();
          // 再生が開始されたか確認
          setTimeout(() => {
            try {
              const state = playerRef.current.getPlayerState();
              // 1 = 再生中, 3 = バッファリング中
              if (state !== 1 && state !== 3) {
                console.warn("再生が開始されていません。リトライします。");
                playerRef.current.playVideo();
              }
            } catch (e) {
              console.error("状態確認エラー:", e);
            }
          }, 300);
        } else {
          playerRef.current.pauseVideo();
        }
      } catch (e) {
        console.error("YouTube player error:", e);
        if (play) {
          // エラーの場合、少し待ってリトライ
          setTimeout(() => {
            try {
              playerRef.current.playVideo();
            } catch (e2) {
              console.error("リトライも失敗:", e2);
            }
          }, 500);
        }
      }
    };

    attemptPlay();
  }, [play]);

  return playerRef;
}
