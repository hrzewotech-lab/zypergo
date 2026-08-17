import React, { useRef, useState, useCallback } from 'react';
import { Camera, X, RefreshCcw, Check, Upload } from 'lucide-react';

export default function CameraModal({ isOpen, onClose, onCapture, onFileUpload }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' for front, 'environment' for back
  const [error, setError] = useState('');

  // Start camera when opened
  React.useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
      setError('');
    }
    return () => stopCamera();
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setError('');
    stopCamera();
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageUrl);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      // Convert base64 to File object
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
          onClose();
        });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col justify-between">
      {/* Header */}
      <div className="flex justify-between items-center p-4 text-white z-10">
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
          <X size={24} />
        </button>
        <span className="font-bold">Capture Document</span>
        <button onClick={switchCamera} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors" disabled={!!capturedImage}>
          <RefreshCcw size={24} className={capturedImage ? 'opacity-50' : ''} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-white text-center p-6 bg-red-500/20 rounded-xl border border-red-500/50 max-w-sm">
            <p className="font-bold">{error}</p>
            <p className="text-sm text-red-200 mt-2">Try uploading a file instead.</p>
          </div>
        ) : capturedImage ? (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          ></video>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Footer Controls */}
      <div className="p-6 pb-safe-area flex justify-center items-center gap-8 bg-black/50 backdrop-blur-md">
        {capturedImage ? (
          <>
            <button onClick={retakePhoto} className="px-6 py-3 rounded-full bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors">
              Retake
            </button>
            <button onClick={confirmPhoto} className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-105 transition-transform">
              <Check size={32} />
            </button>
          </>
        ) : (
          <>
            <div className="relative">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
              <button onClick={() => fileInputRef.current.click()} className="p-4 bg-slate-800 rounded-full text-white hover:bg-slate-700 transition-colors" title="Upload File">
                <Upload size={24} />
              </button>
            </div>
            
            <button 
              onClick={takePhoto} 
              disabled={!!error}
              className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${error ? 'border-slate-600 opacity-50' : 'border-white'}`}
            >
              <div className={`w-16 h-16 rounded-full ${error ? 'bg-slate-600' : 'bg-white'}`}></div>
            </button>
            
            <div className="w-14"></div> {/* Spacer to center the shutter button */}
          </>
        )}
      </div>
    </div>
  );
}
