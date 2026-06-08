# ScrollDetector — Focus & Scroll Awareness App

ScrollDetector is a browser-based computer vision app that detects when a user is looking down at their phone and triggers a real-time intervention animation to help improve focus and reduce distraction.

It runs entirely in the browser using webcam input and on-device machine learning — no backend and no external inference APIs required.

ScrollDetector uses real-time facial landmark detection to estimate head pose.

---

## Demo

When the webcam is enabled:
- The app tracks your face in real time
- Detects head position (looking down)
- Starts a timer while distracted
- Triggers a focus reminder popup after a set threshold

---

### Detection Pipeline

Webcam stream  
→ MediaPipe FaceLandmarker  
→ 468 facial landmarks  
→ Head pitch angle calculation  
→ Detect “looking down” state  
→ Start timer  
→ Trigger alert after threshold

---

## Tech

- React (Vite)
- MediaPipe Tasks Vision (`@mediapipe/tasks-vision`)
- WebRTC (webcam access via `getUserMedia`)
- JavaScript (no backend)
