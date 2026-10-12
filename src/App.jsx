import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useWebcam } from "./hooks/useWebcam";
import { useFaceDetection } from "./hooks/useFaceDetection";

const ALERT_THRESHOLD_SECONDS = 5; 

export default function App() {
  const { videoRef, isReady, error } = useWebcam();
  const { faceDetected, lookingDown, pitchAngle } = useFaceDetection(videoRef, isReady);

  const [scrollTimer, setScrollTimer] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const audioRef = useRef(null);


  // The signal is now just: face detected + looking down
  const isScrolling = faceDetected && lookingDown;

  useEffect(() => {
    if (!isScrolling || showAlert) return;

    const interval = setInterval(() => {
      setScrollTimer((prev) => {
        if (prev + 1 >= ALERT_THRESHOLD_SECONDS) {
          setShowAlert(true);
          playAlert();
          clearInterval(interval);
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isScrolling, showAlert]);

  // Reset timer when you stop looking down
  useEffect(() => {
    if (!isScrolling) {
      setScrollTimer(0);
    }
  }, [isScrolling]);

  function dismissAlert() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setShowAlert(false);
    setScrollTimer(0);  
  }

  if (error) {
    return (
      <div style={{ padding: 40, color: "red" }}>
        <h2>Camera Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  function playAlert() {
    if (!audioRef.current) {
      const audio = new Audio('/alert.mp3');
      audio.loop = true;
      audioRef.current = audio;
    }

  audioRef.current.play();
}



  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", background: "#0a0a0a" }}>
      <video
        ref={videoRef}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scaleX(-1)",
        }}
        muted
        playsInline
      />

      <div style={{
        position: "absolute",
        top: 20,
        left: 20,
        background: "rgba(0,0,0,0.7)",
        color: "white",
        padding: "12px 16px",
        borderRadius: 8,
        fontFamily: "monospace",
        fontSize: 14,
        lineHeight: 2,
      }}>
        <div>📷 Camera: {isReady ? "✅ Ready" : "⏳ Loading..."}</div>
        <div>😀 Face: {faceDetected ? "✅ Detected" : "❌ Not found"}</div>
        <div>📐 Pitch: {pitchAngle}°</div>
        <div>👇 Looking down: {lookingDown ? "✅ Yes" : "❌ No"}</div>
        <div>⏱ Timer: {scrollTimer}s / {ALERT_THRESHOLD_SECONDS}s</div>
      </div>

      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 60 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 60 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.85)",
              zIndex: 10,
            }}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ delay: 0.3, duration: 0.6 }}
              style={{ fontSize: 80 }}
            >
              📵
            </motion.div>
            <h1 style={{ color: "white", fontSize: 36, margin: "20px 0 10px" }}>
              Time to put it down.
            </h1>
            <p style={{ color: "#aaa", fontSize: 18, marginBottom: 32 }}>
              You've been looking down for {ALERT_THRESHOLD_SECONDS} seconds.
            </p>
            <button
              onClick={dismissAlert}
              style={{
                padding: "14px 32px",
                fontSize: 16,
                background: "white",
                border: "none",
                borderRadius: 50,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              I'm sorry, I'll continue
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
