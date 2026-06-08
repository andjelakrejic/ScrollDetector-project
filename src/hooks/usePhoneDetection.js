import { useEffect, useRef, useState, useCallback } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

// How often we check for a phone — every 500ms
// (phone detection is heavier than face detection, so we run it less often)
const DETECTION_INTERVAL_MS = 500;

// Only count it as a phone if the model is at least 60% confident
const PHONE_CONFIDENCE_THRESHOLD = 0.6;

export function usePhoneDetection(videoRef, isVideoReady) {
  const modelRef = useRef(null);
  const intervalRef = useRef(null);
  const [phoneDetected, setPhoneDetected] = useState(false);
  const [confidence, setConfidence] = useState(0);

  // Load the COCO-SSD model once when the component mounts
  // This downloads a pre-trained model that knows 80 object types
  // including "cell phone" — we don't train anything ourselves
  useEffect(() => {
    async function loadModel() {
      console.log("Loading COCO-SSD model...");
      modelRef.current = await cocoSsd.load();
      console.log("COCO-SSD ready ✓");
    }

    loadModel();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // This runs every 500ms — takes a snapshot of the video,
  // runs it through COCO-SSD, and checks if "cell phone" is in the results
  const detect = useCallback(async () => {
    if (!modelRef.current || !videoRef.current || !isVideoReady) return;

    const predictions = await modelRef.current.detect(videoRef.current);

    // predictions is an array like:
    // [{ class: "cell phone", score: 0.82, bbox: [x, y, w, h] }, ...]
    const phones = predictions.filter(
      (p) => p.class === "cell phone" && p.score >= PHONE_CONFIDENCE_THRESHOLD
    );

    if (phones.length > 0) {
      setPhoneDetected(true);
      setConfidence(Math.round(phones[0].score * 100));
    } else {
      setPhoneDetected(false);
      setConfidence(0);
    }
  }, [videoRef, isVideoReady]);

  // Start the interval once the video is ready
  useEffect(() => {
    if (!isVideoReady) return;
    intervalRef.current = setInterval(detect, DETECTION_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [detect, isVideoReady]);

  return { phoneDetected, confidence };
}