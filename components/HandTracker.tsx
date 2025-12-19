
import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { useStore } from '../store';

const HandTracker: React.FC = () => {
  const { isCameraOn, setGesture, setHandPos, phase, setPhase, setZoom } = useStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const initLandmarker = async () => {
      setLoading(true);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm"
        );
        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
      } catch (e) {
        console.error("Failed to init MediaPipe", e);
        setHasError(true);
      }
      setLoading(false);
    };
    initLandmarker();
  }, []);

  useEffect(() => {
    let animationId: number;
    const detect = async () => {
      if (videoRef.current && landmarkerRef.current && isCameraOn && videoRef.current.readyState >= 2) {
        const results = landmarkerRef.current.detectForVideo(videoRef.current, performance.now());
        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          
          const thumbTip = landmarks[4];
          const indexTip = landmarks[8];
          const middleTip = landmarks[12];
          const ringTip = landmarks[16];
          const pinkyTip = landmarks[20];

          const isIndexUp = indexTip.y < landmarks[6].y;
          const isMiddleUp = middleTip.y < landmarks[10].y;
          const isRingUp = ringTip.y < landmarks[14].y;
          const isPinkyUp = pinkyTip.y < landmarks[18].y;
          const isThumbUp = Math.sqrt(Math.pow(thumbTip.x - landmarks[2].x, 2) + Math.pow(thumbTip.y - landmarks[2].y, 2)) > 0.08;

          const fingersUpCount = [isIndexUp, isMiddleUp, isRingUp, isPinkyUp].filter(Boolean).length;

          if (fingersUpCount === 1 && isIndexUp && !isThumbUp) {
            const posX = (0.5 - indexTip.x) * 2; 
            const posY = (0.5 - indexTip.y) * 2;
            setHandPos({ x: posX, y: posY });
            setGesture('none');
          }

          if (isIndexUp && isThumbUp && fingersUpCount === 1) {
            const pinchDistance = Math.sqrt(
              Math.pow(thumbTip.x - indexTip.x, 2) +
              Math.pow(thumbTip.y - indexTip.y, 2)
            );
            const targetZoom = Math.max(0.4, Math.min(3.0, pinchDistance * 10));
            setZoom(targetZoom);
          }

          const isPalmOpen = isIndexUp && isMiddleUp && isRingUp && isPinkyUp;
          const isFist = !isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp && !isThumbUp;

          if (isPalmOpen) {
            setGesture('open');
            if (phase === 'tree') setPhase('blooming');
          } else if (isFist) {
            setGesture('fist');
            if (phase === 'nebula') setPhase('collapsing');
          }
        } else {
          setGesture('none');
        }
      }
      animationId = requestAnimationFrame(detect);
    };

    if (isCameraOn) {
      navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch(console.error);
              detect();
            };
          }
        })
        .catch((err) => {
          console.error("Camera access failed", err);
          setHasError(true);
        });
    }

    return () => {
      cancelAnimationFrame(animationId);
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isCameraOn, phase, setPhase, setGesture, setHandPos, setZoom]);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-2">
      <div className={`w-48 h-36 rounded-2xl overflow-hidden glass-morphism transition-all duration-500 border-2 border-pink-200/30 ${loading ? 'animate-pulse bg-pink-200/10' : ''}`}>
        {hasError ? (
          <div className="w-full h-full flex items-center justify-center text-white/50 text-[10px] text-center px-4 font-cute">
            Camera error. Please allow access.
          </div>
        ) : (
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover mirror transform -scale-x-100" 
            muted 
            playsInline 
          />
        )}
      </div>
      <div className="px-4 py-1 glass-morphism rounded-full text-white font-cute text-[10px] uppercase tracking-wider border border-white/10 opacity-60">
        {loading ? 'Starting Neural Vision...' : 'Live Tracker Active'}
      </div>
    </div>
  );
};

export default HandTracker;
