const NOSE_TIP = 1;
const CHIN = 152;
const FOREHEAD = 10;

export function calculateHeadPitch(landmarks) {
  if (!landmarks || landmarks.length === 0) return 0;

  const chin = landmarks[CHIN];
  const forehead = landmarks[FOREHEAD];

  const faceVectorY = forehead.y - chin.y;
  const faceVectorZ = forehead.z - chin.z;

  const pitchRad = Math.atan2(faceVectorZ, -faceVectorY);
  const pitchDeg = pitchRad * (180 / Math.PI);

  return pitchDeg;
}

export function isLookingDown(pitchDeg, threshold = -15) {
  return pitchDeg < threshold;
}