// "use client";
// import { useRef, useEffect, useState } from "react";

// // Define an array of your media sources
// const mediaSources = [
//   "/large-thumbnail20250216-3097548-1djrrxq.mp4",
//   "/caribou-animated-icon-gif-download-10411730.mp4", // <--- Make sure to add your second video here
//   "/original-714d05cb5b27afb143573a6567ddf2d8.gif", // Your fallback GIF
// ];

// export default function AnimatedBackground() {
//   const videoRef = useRef<HTMLVideoElement | null>(null); // Initialize with null
//   // Use state to manage the current media source
//   const [currentMediaSrc, setCurrentMediaSrc] = useState(mediaSources[0]);
//   // Use state to track if the current media is a video or a GIF
//   const [isCurrentMediaVideo, setIsCurrentMediaVideo] = useState(true);

//   useEffect(() => {
//     let mediaIndex = 0; // Keep track of the current index in the mediaSources array

//     // Function to update the current media source and its type
//     const updateMedia = () => {
//       mediaIndex = (mediaIndex + 1) % mediaSources.length;
//       const nextSrc = mediaSources[mediaIndex];
//       setCurrentMediaSrc(nextSrc);
//       setIsCurrentMediaVideo(nextSrc.endsWith(".mp4")); // Update based on file extension
//     };

//     // Set up the interval for changing the media source
//     const intervalId = setInterval(updateMedia, 3000); // Change every 3 seconds

//     // Cleanup the interval when the component unmounts
//     return () => clearInterval(intervalId);
//   }, []); // Empty dependency array means this runs once on mount

//   // Effect for handling video playback speed when a video is active
//   useEffect(() => {
//     const video = videoRef.current;

//     const setPlaybackSpeed = () => {
//       if (video && isCurrentMediaVideo) {
//         video.playbackRate = 0.25;
//         // console.log("Video playback speed set to 0.25"); // Debugging
//       }
//     };

//     if (video && isCurrentMediaVideo) {
//       // Set the speed immediately
//       setPlaybackSpeed();

//       // Ensure the speed is set when the video is ready to play
//       video.addEventListener("loadedmetadata", setPlaybackSpeed);
//       video.addEventListener("canplaythrough", setPlaybackSpeed);
//       video.addEventListener("play", setPlaybackSpeed);

//       // Cleanup event listeners
//       return () => {
//         video.removeEventListener("loadedmetadata", setPlaybackSpeed);
//         video.removeEventListener("canplaythrough", setPlaybackSpeed);
//         video.removeEventListener("play", setPlaybackSpeed);
//       };
//     }
//   }, [currentMediaSrc, isCurrentMediaVideo]); // Re-run when source or type changes

//   return (
//     <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none select-none">
//       {isCurrentMediaVideo ? (
//         <video
//           key={currentMediaSrc} // Add key to force re-render when src changes
//           ref={videoRef}
//           autoPlay
//           loop
//           muted
//           playsInline
//           className="absolute inset-0 w-full h-full object-cover opacity-40  scale-110"
//           src={currentMediaSrc}
//         />
//       ) : (
//         <img
//           key={currentMediaSrc} // Add key to force re-render when src changes
//           src={currentMediaSrc}
//           alt="Animated background"
//           className="absolute inset-0 w-full h-full object-cover opacity-40  scale-110" // Apply similar styling to GIF
//         />
//       )}
//     </div>
//   );
// }
"use client";
import { motion } from "framer-motion";

export const AnimatedBackground = () => {
  return (
    <motion.video
      src="/wave-loop.mp4"
      autoPlay
      muted
      loop
      controls={false}
      className="fixed grayscale object-cover bottom-0 z-[-1] hidden md:block pointer-events-none opacity-75 "
    />
  );
};
export default AnimatedBackground;