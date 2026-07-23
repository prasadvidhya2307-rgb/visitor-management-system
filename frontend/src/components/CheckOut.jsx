import React, { useState, useRef, useEffect } from 'react';
import { checkOutVisitor } from '../services/api';
import toast from 'react-hot-toast';
import { FiCamera, FiCheck, FiUserX } from 'react-icons/fi';

export default function CheckOut() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      startFaceScan();
    } catch (err) {
      toast.error('Camera access denied. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
  };

  const startFaceScan = () => {
    scanIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || scanning) return;
      const video = videoRef.current;
      if (video.readyState !== 4) return;

      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      try {
        const { default: api } = await import('../services/api');
        const res = await api.captureFace(imageData);
        setFaceDetected(res.data.detected);
      } catch (err) {}
    }, 1500);
  };

  const handleCheckOut = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setScanning(true);
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    try {
      const res = await checkOutVisitor(imageData);
      if (res.data.recognized) {
        setResult(res.data);
        stopCamera();
        toast.success('Visitor checked out successfully!');
      } else {
        toast.error('Visitor not recognized. Please try again.');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Check-out failed');
    } finally {
      setScanning(false);
    }
  };

  const reset = () => {
    setResult(null);
    startCamera();
  };

  if (result) {
    return (
      <div className="row justify-content-center">
        <div className="col-xl-6 col-lg-8">
          <div className="card-custom">
            <div className="card-body-custom">
              <div className="checkout-success">
                <div className="success-icon"><FiCheck size={36} /></div>
                <h2>Check-Out Complete!</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
                  {result.visitor_name} has been checked out successfully.
                </p>
                <div className="checkout-details">
                  <div className="checkout-detail-item">
                    <div className="label">Visitor</div>
                    <div className="value">{result.visitor_name}</div>
                  </div>
                  <div className="checkout-detail-item">
                    <div className="label">Check In Time</div>
                    <div className="value">{result.check_in_time}</div>
                  </div>
                  <div className="checkout-detail-item">
                    <div className="label">Check Out Time</div>
                    <div className="value">{result.check_out_time}</div>
                  </div>
                  <div className="checkout-detail-item">
                    <div className="label">Duration</div>
                    <div className="value">{result.duration_minutes} minutes</div>
                  </div>
                </div>
                <button className="btn-primary-custom mt-4" onClick={reset}>
                  Check Out Another Visitor
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-xl-6 col-lg-8">
        <div className="card-custom">
          <div className="card-body-custom text-center">
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Face Recognition Check-Out</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
              Position the visitor's face in the frame to check out
            </p>

            <div className="webcam-container" style={{ marginBottom: 24 }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ transform: 'scaleX(-1)' }} />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <div className="webcam-overlay">
                <div className={`face-frame ${faceDetected ? 'detected' : ''}`} />
              </div>
              <div className="webcam-status">
                {faceDetected ? (
                  <span style={{ color: '#10B981' }}>
                    <FiCheck size={14} style={{ marginRight: 6 }} /> Face Detected
                  </span>
                ) : 'Position face in the frame'}
              </div>
            </div>

            <button
              className="btn-danger-custom"
              onClick={handleCheckOut}
              disabled={scanning || !faceDetected}
              style={{ fontSize: 15, padding: '12px 32px' }}
            >
              {scanning ? (
                <>Processing...</>
              ) : (
                <><FiUserX size={18} /> Check Out Visitor</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
