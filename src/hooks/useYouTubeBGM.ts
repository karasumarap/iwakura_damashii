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
            autoplay: play ? 1 : 0,
            loop: 1,
            playlist: videoId, // ループのために必要
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
          },
          events: {
            onReady: (event: any) => {
              readyRef.current = true;
              if (play) {
                event.target.playVideo();
              }
            },
            onStateChange: (event: any) => {
              // 動画が終了したら再生
              if (event.data === window.YT.PlayerState.ENDED) {
                event.target.playVideo();
              }
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
    if (!playerRef.current || !readyRef.current) return;

    try {
      if (play) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch (e) {
      console.error("YouTube player error:", e);
    }
  }, [play]);

  return playerRef;
}
