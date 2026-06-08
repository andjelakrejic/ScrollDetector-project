import { useEffect, useRef, useState, useCallback } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { calculateHeadPitch, isLookingDown } from "../utils/headPose";

export function useFaceDetection(videoRef, isVideoReady) {
  const landmarkerRef = useRef(null);
  const animFrameRef = useRef(null);

  const [faceDetected, setFaceDetected] = useState(false);
  const [lookingDown, setLookingDown] = useState(false);
  const [pitchAngle, setPitchAngle] = useState(0);

  useEffect(() => {
    async function initMediaPipe() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces: 1,
      });
    }

    initMediaPipe();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const detect = useCallback(() => {
    const video = videoRef.current;
    if (!landmarkerRef.current || !video || !isVideoReady || video.videoWidth === 0) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    const timestamp = performance.now();
    const results = landmarkerRef.current.detectForVideo(video, timestamp);

    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
      const landmarks = results.faceLandmarks[0];
      const pitch = calculateHeadPitch(landmarks);

      setFaceDetected(true);
      setPitchAngle(Math.round(pitch));
      setLookingDown(isLookingDown(pitch));
    } else {
      setFaceDetected(false);
      setLookingDown(false);
    }

    animFrameRef.current = requestAnimationFrame(detect);
  }, [videoRef, isVideoReady]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [detect]);

  return { faceDetected, lookingDown, pitchAngle };
}