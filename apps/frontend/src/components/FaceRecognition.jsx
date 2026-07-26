import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RotateCcw, CheckCircle, AlertCircle, Loader2, UserCheck } from 'lucide-react';

function extractFaceData(video, canvas) {
  if (!video || !canvas) return null;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const w = canvas.width;
  const h = canvas.height;
  const faceX = Math.floor(w * 0.3);
  const faceY = Math.floor(h * 0.15);
  const faceW = Math.floor(w * 0.4);
  const faceH = Math.floor(h * 0.55);

  const data = ctx.getImageData(faceX, faceY, faceW, faceH);
  const pixels = data.data;

  const gridSize = 8;
  const cellW = Math.floor(faceW / gridSize);
  const cellH = Math.floor(faceH / gridSize);
  const grid = [];

  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      let rSum = 0, gSum = 0, bSum = 0, brightSum = 0, count = 0;
      const startX = gx * cellW;
      const startY = gy * cellH;
      for (let y = startY; y < startY + cellH && y < faceH; y++) {
        for (let x = startX; x < startX + cellW && x < faceW; x++) {
          const i = (y * faceW + x) * 4;
          rSum += pixels[i];
          gSum += pixels[i + 1];
          bSum += pixels[i + 2];
          brightSum += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
          count++;
        }
      }
      if (count > 0) {
        grid.push({
          r: rSum / count,
          g: gSum / count,
          b: bSum / count,
          brightness: brightSum / count,
        });
      }
    }
  }

  const totalBrightness = grid.reduce((s, c) => s + c.brightness, 0) / grid.length;
  const brightnessVariance = grid.reduce((s, c) => s + Math.pow(c.brightness - totalBrightness, 2), 0) / grid.length;
  const topHalfBright = grid.slice(0, 32).reduce((s, c) => s + c.brightness, 0) / 32;
  const botHalfBright = grid.slice(32).reduce((s, c) => s + c.brightness, 0) / 32;
  const centerBright = grid.slice(18, 22).concat(grid.slice(26, 30)).reduce((s, c) => s + c.brightness, 0) / 8;

  const edgeGradientH = [];
  for (let y = 0; y < gridSize; y++) {
    edgeGradientH.push(grid[y * gridSize + gridSize - 1].brightness - grid[y * gridSize].brightness);
  }
  const avgEdgeH = edgeGradientH.reduce((s, v) => s + Math.abs(v), 0) / edgeGradientH.length;

  return {
    grid,
    fingerprint: [
      totalBrightness,
      brightnessVariance,
      topHalfBright,
      botHalfBright,
      centerBright,
      avgEdgeH,
      grid[0].brightness,
      grid[7].brightness,
      grid[56].brightness,
      grid[63].brightness,
    ],
    timestamp: Date.now(),
  };
}

function compareFaces(a, b) {
  if (!a || !b || !a.fingerprint || !b.fingerprint) return { score: 0, match: false };
  const fp1 = a.fingerprint;
  const fp2 = b.fingerprint;
  let totalDiff = 0;
  for (let i = 0; i < fp1.length; i++) {
    totalDiff += Math.abs(fp1[i] - fp2[i]);
  }
  const maxPossibleDiff = 255 * fp1.length;
  const similarity = 1 - totalDiff / maxPossibleDiff;
  const score = Math.round(similarity * 100);
  return { score, match: score >= 65 };
}

function getPhotoFromDataUrl(dataUrl) {
  return dataUrl;
}

export default function FaceRecognition({ mode = 'capture', storedFace = null, storedFaces = [], onCapture, onMatch, onFail, onIdentified, onNewFace, label }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);

  const startCamera = useCallback(async () => {
    setError('');
    setState('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setState('streaming');
        startDetection();
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera access and try again.');
      setState('error');
    }
  }, []);

  const startDetection = useCallback(() => {
    const detect = () => {
      if (!videoRef.current || !canvasRef.current || !streamRef.current) return;
      const vid = videoRef.current;
      if (vid.readyState >= 2) {
        const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
        canvasRef.current.width = vid.videoWidth || 640;
        canvasRef.current.height = vid.videoHeight || 480;
        ctx.drawImage(vid, 0, 0);
        const w = canvasRef.current.width;
        const h = canvasRef.current.height;
        const faceX = Math.floor(w * 0.3);
        const faceY = Math.floor(h * 0.15);
        const faceW = Math.floor(w * 0.4);
        const faceH = Math.floor(h * 0.55);
        const data = ctx.getImageData(faceX, faceY, faceW, faceH);
        const pixels = data.data;
        let brightSum = 0, edgeCount = 0, count = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          brightSum += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
          count++;
        }
        const avgBright = brightSum / count;
        setFaceDetected(avgBright > 20 && avgBright < 240);
      }
      if (streamRef.current) requestAnimationFrame(detect);
    };
    detect();
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const startCountdownAndCapture = () => {
    setCountdown(3);
    let count = 3;
    const timer = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(timer);
        setCountdown(null);
        doCapture();
      } else {
        setCountdown(count);
      }
    }, 800);
  };

  const doCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const faceData = extractFaceData(videoRef.current, canvasRef.current);
    const ctx = canvasRef.current.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    const image = canvasRef.current.toDataURL('image/jpeg', 0.8);

    stopCamera();
    setCapturedImage(image);
    setState('captured');

    if (mode === 'capture') {
      onCapture && onCapture({ image, faceData });
    } else if (mode === 'verify') {
      setState('comparing');
      setTimeout(() => {
        const result = compareFaces(storedFace, faceData);
        setMatchResult(result);
        setState('verified');
        if (result.match) {
          onMatch && onMatch(result);
        } else {
          onFail && onFail(result);
        }
      }, 1000);
    } else if (mode === 'identify') {
      setState('comparing');
      setTimeout(() => {
        let bestResult = { score: 0, match: false, visitor: null };
        for (const sf of storedFaces) {
          const result = compareFaces(sf.faceData, faceData);
          if (result.match && result.score > bestResult.score) {
            bestResult = { ...result, visitor: sf.visitor, photo: sf.photo };
          }
        }
        setMatchResult(bestResult);
        setState('verified');
        if (bestResult.match) {
          onIdentified && onIdentified(bestResult.visitor, bestResult.photo);
        } else {
          onNewFace && onNewFace(faceData, image);
        }
      }, 1000);
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setMatchResult(null);
    setFaceDetected(false);
    setState('idle');
    setError('');
  };

  return (
    <div className="face-recognition">
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="face-idle">
            <div className="webcam-box">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, color: '#fff' }}>
                <Camera size={56} style={{ opacity: 0.3 }} />
                <p style={{ fontSize: 14, opacity: 0.7 }}>{label || (mode === 'capture' ? 'Click to start camera for face capture' : mode === 'identify' ? 'Click to scan your face for identification' : 'Click to start camera for face verification')}</p>
                <button className="btn-p" onClick={startCamera}><Camera size={16} /> Start Camera</button>
              </div>
            </div>
          </motion.div>
        )}

        {state === 'error' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="face-idle">
            <div className="webcam-box">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, color: '#fff' }}>
                <AlertCircle size={56} style={{ color: '#EF4444' }} />
                <p style={{ fontSize: 13, color: '#EF4444', maxWidth: 300, textAlign: 'center' }}>{error}</p>
                <button className="btn-p" onClick={startCamera}><RotateCcw size={16} /> Retry</button>
              </div>
            </div>
          </motion.div>
        )}

        {(state === 'starting' || state === 'streaming' || state === 'captured') && (
          <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="webcam-box">
              <video ref={videoRef} autoPlay playsInline muted style={{ display: capturedImage ? 'none' : 'block' }} />
              {capturedImage && <img src={capturedImage} alt="captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              {state === 'streaming' && (
                <div className="webcam-overlay">
                  <div className={`face-frame ${faceDetected ? 'detected' : ''}`} />
                </div>
              )}
              {state === 'streaming' && (
                <div className="webcam-status">
                  {faceDetected ? '✓ Face detected' : 'Position your face in the frame'}
                </div>
              )}
              {countdown !== null && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
                  <motion.div key={countdown} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: 72, fontWeight: 800, color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                    {countdown}
                  </motion.div>
                </div>
              )}
            </div>
            {state === 'streaming' && (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
                  <button className="btn-p" onClick={startCountdownAndCapture} disabled={!faceDetected}>
                    <Camera size={16} /> {mode === 'capture' ? 'Capture Face' : mode === 'identify' ? 'Scan Face' : 'Verify Face'}
                  </button>
                <button className="btn-o" onClick={() => { stopCamera(); reset(); }}>Cancel</button>
              </div>
            )}
          </motion.div>
        )}

        {state === 'comparing' && (
          <motion.div key="comparing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="face-idle">
            <div className="webcam-box">
              <img src={capturedImage} alt="captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', gap: 12 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                  <Loader2 size={48} color="#fff" />
                </motion.div>
                <p style={{ color: '#fff', fontSize: 14 }}>{mode === 'identify' ? 'Identifying visitor...' : 'Comparing faces...'}</p>
              </div>
            </div>
          </motion.div>
        )}

        {state === 'verified' && matchResult && (
          <motion.div key="verified" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <div className="webcam-box">
              <img src={capturedImage} alt="captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: matchResult.match ? 'rgba(16,185,129,0.7)' : 'rgba(239,68,68,0.7)', gap: 12 }}>
                {matchResult.match ? <UserCheck size={56} color="#fff" /> : <AlertCircle size={56} color="#fff" />}
                <p style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>{mode === 'identify' ? (matchResult.match ? `Welcome back, ${matchResult.visitor?.name}!` : 'Visitor Not Recognized') : (matchResult.match ? 'Face Matched!' : 'Face Not Matched')}</p>
                <p style={{ color: '#fff', fontSize: 14, opacity: 0.9 }}>Confidence: {matchResult.score}%</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
              <button className="btn-o" onClick={reset}><RotateCcw size={16} /> Try Again</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
