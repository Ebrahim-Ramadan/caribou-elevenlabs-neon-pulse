// Utility for background blur and animation
export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none select-none">
      {/* Large animated thumbnail as background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-60 blur-2xl scale-110"
        src="/large-thumbnail20250216-3097548-1djrrxq.mp4"
      />
      {/* Caribou animated logo as floating icon */}
      {/* <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute left-4 top-4 w-24 h-24 opacity-80 drop-shadow-xl"
        src="/caribou-animated-icon-gif-download-10411730.mp4"
      /> */}
      {/* Optional: fallback GIF for mobile or slow connections */}
      <img
        src="/original-714d05cb5b27afb143573a6567ddf2d8.gif"
        alt="Animated background fallback"
        className="absolute bottom-4 right-4 w-32 h-32 opacity-60 blur-md"
      />
    </div>
  );
}
