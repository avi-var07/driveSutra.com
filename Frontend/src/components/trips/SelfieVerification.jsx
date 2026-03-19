import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCamera, FaUpload, FaTimes, FaCheckCircle, FaExclamationTriangle, FaRedo } from 'react-icons/fa';

/**
 * SelfieVerification — Camera capture or file upload for trip verification
 * Used when GPS lag is detected to prove the user is actually traveling
 */
export default function SelfieVerification({ isOpen, onClose, onSelfieSubmit, lagCount, maxLags = 3 }) {
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera access denied. Please use file upload instead.');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    // Mirror for selfie
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(dataUrl);
    stopCamera();
  }, [stopCamera]);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setCapturedImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  // Submit selfie
  const handleSubmit = async () => {
    if (!capturedImage) return;
    setSubmitting(true);
    try {
      await onSelfieSubmit(capturedImage);
      setCapturedImage(null);
    } catch (err) {
      setError('Failed to submit selfie. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Retake
  const handleRetake = () => {
    setCapturedImage(null);
    setError('');
    startCamera();
  };

  // Cleanup on close
  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  const isWarning = lagCount >= maxLags - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 w-full max-w-md p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                isWarning ? 'bg-red-500/20' : 'bg-amber-500/20'
              }`}>
                {isWarning ? <FaExclamationTriangle className="text-red-400" /> : <FaCamera className="text-amber-400" />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Selfie Verification</h2>
                <p className="text-xs text-slate-400">GPS lag detected — verify your presence</p>
              </div>
            </div>
          </div>

          {/* Lag Warning */}
          <div className={`mb-4 p-3 rounded-xl text-sm ${
            isWarning
              ? 'bg-red-500/10 border border-red-500/30 text-red-300'
              : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
          }`}>
            {isWarning ? (
              <>⚠️ This is your {lagCount + 1}th lag — exceeding {maxLags} will flag your trip as suspicious.</>
            ) : (
              <>📡 GPS signal lost for over 60 seconds. Please take a selfie to verify you're on your trip.</>
            )}
            <div className="mt-1 text-xs opacity-75">
              Lag events: {lagCount + 1} / {maxLags} allowed
            </div>
          </div>

          {/* Camera / Preview */}
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-700/50 mb-4">
            {isCameraActive && !capturedImage && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
            )}

            {capturedImage && (
              <img src={capturedImage} alt="Selfie" className="w-full h-full object-cover" />
            )}

            {!isCameraActive && !capturedImage && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <FaCamera className="text-4xl mb-3" />
                <p className="text-sm">Take a selfie or upload a photo</p>
              </div>
            )}
          </div>

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Action Buttons */}
          <div className="space-y-3">
            {!capturedImage ? (
              <div className="flex gap-3">
                {isCameraActive ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={capturePhoto}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold flex items-center justify-center gap-2"
                  >
                    <FaCamera /> Capture
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startCamera}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold flex items-center justify-center gap-2"
                  >
                    <FaCamera /> Open Camera
                  </motion.button>
                )}

                <label className="flex-1 py-3 px-4 rounded-xl bg-slate-700 text-slate-300 font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-600 transition-colors">
                  <FaUpload /> Upload
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRetake}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-700 text-slate-300 font-semibold flex items-center justify-center gap-2"
                >
                  <FaRedo /> Retake
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><FaCheckCircle /> Submit</>
                  )}
                </motion.button>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-sm text-red-400 text-center"
            >
              {error}
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
