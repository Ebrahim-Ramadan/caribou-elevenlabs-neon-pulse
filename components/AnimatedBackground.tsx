"use client";
import { useRef, useEffect } from "react";

export default function AnimatedBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const setRate = () => {
      if (videoRef.current) {
        videoRef.current.playbackRate = 0.25; // More compatible slow speed
      }
    };
    setRate();
    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadedmetadata', setRate);
      video.addEventListener('play', setRate);
    }
    return () => {
      if (video) {
        video.removeEventListener('loadedmetadata', setRate);
        video.removeEventListener('play', setRate);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none select-none">
      {/* Large animated thumbnail as background video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-60 blur-2xl scale-110"
        src="/large-thumbnail20250216-3097548-1djrrxq.mp4"
      />
      {/* Optional fallback GIF */}
      {/* <img
        src="/original-714d05cb5b27afb143573a6567ddf2d8.gif"
        alt="Animated background fallback"
        className="absolute bottom-4 right-4 w-32 h-32 opacity-60 blur-md"
      /> */}
    </div>
  );
}
