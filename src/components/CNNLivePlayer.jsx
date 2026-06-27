import React, { useEffect, useRef, useState } from 'react';

// Load YouTube API script once globally
let ytApiPromise = null;
function loadYoutubeApi() {
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousCallback) previousCallback();
      resolve(window.YT);
    };
    
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  });
  return ytApiPromise;
}

export default function CNNLivePlayer() {
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const [apiReady, setApiReady] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    loadYoutubeApi().then(() => {
      setApiReady(true);
    });
  }, []);

  useEffect(() => {
    if (!apiReady || !iframeRef.current || playerRef.current) return;

    playerRef.current = new window.YT.Player(iframeRef.current, {
      events: {
        onReady: () => {
          setPlayerReady(true);
        }
      }
    });

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
        setPlayerReady(false);
      }
    };
  }, [apiReady]);

  useEffect(() => {
    if (!playerReady || !playerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!playerRef.current || typeof playerRef.current.playVideo !== 'function') return;
        if (entry.intersectionRatio >= 0.40) {
          try {
            playerRef.current.playVideo();
          } catch (e) {
            console.warn('Failed to auto-play YouTube live video:', e);
          }
        } else if (entry.intersectionRatio < 0.30) {
          try {
            playerRef.current.pauseVideo();
          } catch (e) {
            console.warn('Failed to auto-pause YouTube live video:', e);
          }
        }
      },
      {
        threshold: [0.30, 0.40]
      }
    );

    const currentIframe = iframeRef.current;
    if (currentIframe) {
      observer.observe(currentIframe);
    }

    return () => {
      if (currentIframe) {
        observer.unobserve(currentIframe);
      }
    };
  }, [playerReady]);

  return (
    <iframe
      ref={iframeRef}
      src="https://www.youtube.com/embed/live_stream?channel=UCupvZG-5ko_eiXAupbDfxWw&autoplay=1&mute=1&enablejsapi=1"
      title="CNN International Live"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      className="live-iframe-player"
    ></iframe>
  );
}
