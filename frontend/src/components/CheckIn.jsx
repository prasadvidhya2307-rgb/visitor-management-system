import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { captureFace, checkInVisitor, getEmployeeList } from '../services/api';
import toast from 'react-hot-toast';
import { FiCamera, FiCheck, FiUser, FiBuilding, FiArrowRight, FiArrowLeft } from 'react-icons/fi';

export default function CheckIn() {
  const [step, setStep] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [floor, setFloor] = useState('');
  const [notes, setNotes] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [idType, setIdType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [employees, setEmployees] = useState([]);
  const [capturedImage, setCapturedImage] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [existingVisitor, setExistingVisitor] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [visitResult, setVisitResult] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadEmployees();
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (step === 1) startCamera();
    return () => { if (step !== 1) stopCamera(); };
  }, [step]);

  const loadEmployees = async () => {
    try {
      const res = await getEmployeeList();
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to load employees:', err);
    }
  };

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
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
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
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      try {
        const res = await captureFace(imageData);
        if (res.data.detected) {
          setFaceDetected(true);
          setCapturedImage(imageData);

          if (res.data.welcome_back && res.data.existing_visitor) {
            setExistingVisitor(res.data.existing_visitor);
            setFirstName(res.data.existing_visitor.first_name);
            setLastName(res.data.existing_visitor.last_name);
            setEmail(res.data.existing_visitor.email || '');
            setPhone(res.data.existing_visitor.phone || '');
            setCompany(res.data.existing_visitor.company || '');
            toast.success('Welcome back! Visitor recognized.');
          }
        } else {
          setFaceDetected(false);
        }
      } catch (err) {
        console.error('Face detection error:', err);
      }
    }, 1500);
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    setFaceDetected(true);
    stopCamera();
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!purpose || !selectedEmployee) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!capturedImage) {
      toast.error('Please capture a photo first');
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        purpose,
        employee_id: selectedEmployee,
        floor,
        notes,
        image: capturedImage
      };

      if (existingVisitor) {
        data.visitor_id = existingVisitor.id;
      } else {
        if (!firstName || !lastName || !phone) {
          toast.error('Please fill in visitor name and phone');
          setSubmitting(false);
          return;
        }
        data.first_name = firstName;
        data.last_name = lastName;
        data.email = email;
        data.phone = phone;
        data.company = company;
        data.id_type = idType;
        data.id_number = idNumber;
      }

      const res = await checkInVisitor(data);
      if (res.data.success) {
        setVisitResult(res.data);
        setStep(4);
        toast.success('Visitor checked in successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Check-in failed');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setPurpose('');
    setSelectedEmployee('');
    setFloor('');
    setNotes('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setIdType('');
    setIdNumber('');
    setCapturedImage(null);
    setFaceDetected(false);
    setExistingVisitor(null);
    setVisitResult(null);
    startCamera();
  };

  const steps = [
    { num: 1, label: 'Face Capture' },
    { num: 2, label: 'Purpose & Host' },
    { num: 3, label: 'Visitor Details' },
    { num: 4, label: 'Complete' }
  ];

  return (
    <div className="row justify-content-center">
      <div className="col-xl-8 col-lg-10">
        <div className="card-custom">
          <div className="card-body-custom">
            <div className="step-indicator">
              {steps.map((s, i) => (
                <React.Fragment key={s.num}>
                  <div className="step-item">
                    <div className={`step-circle ${step > s.num ? 'completed' : step === s.num ? 'active' : ''}`}>
                      {step > s.num ? <FiCheck size={16} /> : s.num}
                    </div>
                    <span className={`step-label ${step > s.num ? 'completed' : step === s.num ? 'active' : ''}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`step-line ${step > s.num ? 'completed' : step === s.num + 1 ? 'active' : ''}`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {step === 1 && (
              <div className="text-center">
                {existingVisitor && (
                  <div className="welcome-banner">
                    <div className="welcome-avatar">
                      {existingVisitor.photo_path ? (
                        <img src={`http://localhost:5000/${existingVisitor.photo_path}`} alt="" />
                      ) : (
                        <span style={{ fontSize: 20, fontWeight: 700 }}>
                          {existingVisitor.first_name[0]}{existingVisitor.last_name[0]}
                        </span>
                      )}
                    </div>
                    <div className="welcome-text">
                      <h3>Welcome Back, {existingVisitor.first_name}!</h3>
                      <p>Visitor recognized. Previous details loaded automatically.</p>
                    </div>
                  </div>
                )}

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
                    ) : 'Position your face in the frame'}
                  </div>
                </div>

                <button
                  className="btn-primary-custom"
                  onClick={handleCapture}
                  disabled={!faceDetected}
                  style={{ fontSize: 15, padding: '12px 32px' }}
                >
                  <FiCamera size={18} />
                  {existingVisitor ? 'Confirm & Continue' : 'Capture Photo'}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="row justify-content-center">
                <div className="col-md-8">
                  <div className="form-group">
                    <label className="form-label-custom">Purpose of Visit *</label>
                    <select className="form-select" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                      <option value="">Select purpose</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Interview">Interview</option>
                      <option value="Delivery">Delivery</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Consultation">Consultation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label-custom">Host / Employee *</label>
                    <select className="form-select" value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
                      <option value="">Select employee</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} - {emp.department}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label-custom">Floor</label>
                    <select className="form-select" value={floor} onChange={(e) => setFloor(e.target.value)}>
                      <option value="">Select floor</option>
                      <option value="Ground Floor">Ground Floor</option>
                      <option value="1st Floor">1st Floor</option>
                      <option value="2nd Floor">2nd Floor</option>
                      <option value="3rd Floor">3rd Floor</option>
                      <option value="4th Floor">4th Floor</option>
                      <option value="5th Floor">5th Floor</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label-custom">Notes</label>
                    <textarea
                      className="form-input"
                      rows="3"
                      placeholder="Additional notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                  <div className="d-flex justify-content-between mt-4">
                    <button className="btn-outline-custom" onClick={() => { setStep(1); startCamera(); }}>
                      <FiArrowLeft size={16} /> Back
                    </button>
                    <button
                      className="btn-primary-custom"
                      onClick={() => existingVisitor ? setStep(4) : setStep(3)}
                      disabled={!purpose || !selectedEmployee}
                    >
                      {existingVisitor ? 'Submit Check-In' : 'Next'} <FiArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="row justify-content-center">
                <div className="col-md-8">
                  <div className="row g-3">
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label className="form-label-custom">First Name *</label>
                        <input className="form-input" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label className="form-label-custom">Last Name *</label>
                        <input className="form-input" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label className="form-label-custom">Phone *</label>
                        <input className="form-input" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label className="form-label-custom">Email</label>
                        <input className="form-input" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label className="form-label-custom">Company</label>
                        <input className="form-input" placeholder="Company name" value={company} onChange={(e) => setCompany(e.target.value)} />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label className="form-label-custom">ID Type</label>
                        <select className="form-select" value={idType} onChange={(e) => setIdType(e.target.value)}>
                          <option value="">Select ID type</option>
                          <option value="Driver's License">Driver's License</option>
                          <option value="Passport">Passport</option>
                          <option value="National ID">National ID</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-group">
                        <label className="form-label-custom">ID Number</label>
                        <input className="form-input" placeholder="ID number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between mt-4">
                    <button className="btn-outline-custom" onClick={() => setStep(2)}>
                      <FiArrowLeft size={16} /> Back
                    </button>
                    <button className="btn-primary-custom" onClick={handleSubmit} disabled={submitting}>
                      {submitting ? 'Processing...' : 'Complete Check-In'} <FiCheck size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && visitResult && (
              <div className="checkout-success">
                <div className="success-icon"><FiCheck size={36} /></div>
                <h2>Check-In Complete!</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
                  Visitor badge has been generated successfully.
                </p>
                <div className="checkout-details">
                  <div className="checkout-detail-item">
                    <div className="label">Visitor</div>
                    <div className="value">{visitResult.visitor_name}</div>
                  </div>
                  <div className="checkout-detail-item">
                    <div className="label">Badge Code</div>
                    <div className="value">{visitResult.badge_code}</div>
                  </div>
                </div>
                <div className="d-flex justify-content-center gap-3 mt-4">
                  <button className="btn-outline-custom" onClick={resetForm}>
                    Check-In Another
                  </button>
                  <button className="btn-primary-custom" onClick={() => navigate('/history')}>
                    View History
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
