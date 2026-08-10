import React, { useState } from 'react';
import { Navigation, MapPin, Camera, Key, CheckCircle, Package, ArrowRight, Upload, XCircle, ScanBarcode, Banknote, Phone, CreditCard, FileText } from 'lucide-react';
import api from '../../api';

export default function RaiderTaskFlow({ activeJob, onCompleteJob }) {
  const [taskStep, setTaskStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [cash, setCash] = useState('');
  const [loading, setLoading] = useState(false);
  const [transhipmentMode, setTranshipmentMode] = useState(false);
  const [scannedRaiderId, setScannedRaiderId] = useState('');
  
  // NDR (Exception Handling) State
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [exceptionReason, setExceptionReason] = useState('');
  const [parcelCondition, setParcelCondition] = useState('Good');
  
  // UX State
  const [barcodeScanned, setBarcodeScanned] = useState(false);
  const [photoCaptured, setPhotoCaptured] = useState(false);
  
  const updateStatus = async (status, isComplete = false) => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('zypergo_user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      const payload = { 
        status, 
        reason: exceptionReason || 'Raider action',
        cashCollected: cash || 0,
        parcelCondition,
        userId: user?._id
      };
      
      if (status === 'Picked Up' || status === 'Delivered' || status === 'Source Hub Received' || status === 'Destination Hub Received' || status === 'Failed') {
        payload.otp = otp || '1234'; 
        payload.photoUrl = 'mock-url.jpg'; // Mock photo upload for both success and exceptions
      }

      if (isComplete || status.includes('Hub Received') || status === 'Failed') {
        // Mock GPS capture
        payload.gpsLocation = { lat: 17.4401, lng: 78.3489 };
      }

      const res = await api.post(`/raider/jobs/${activeJob._id}/update-status`, payload);
      
      if (res.data.success) {
        if (isComplete || status === 'Failed' || status === 'Cancelled') {
          onCompleteJob();
        } else {
          // Progress task step based on standard flow
          if (status === 'Arrived at Pickup') setTaskStep(2);
          if (status === 'Picked Up') setTaskStep(4);
          if (status === 'In Transit') setTaskStep(5);
          setOtp(''); // reset OTP for drop
          setCash(''); // reset cash
          setShowExceptionModal(false);
        }
      } else {
        alert(res.data.error || 'Failed to update status.');
      }
    } catch (err) {
      alert(err.response?.data?.details || err.response?.data?.error || 'Network Error');
    } finally {
      setLoading(false);
    }
  };

  const handleTranshipment = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/raider/jobs/${activeJob._id}/transhipment`, { targetRaiderId: scannedRaiderId || 'mock-raider-id-123' });
      if (res.data.success) {
        alert('Transhipment Handover Successful!');
        onCompleteJob(); // Removes it from this raider's active list
      } else {
        alert('Failed to handover package.');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const isIntercity = activeJob.metadata?.deliveryType === 'Intercity Hub-and-Spoke';

  return (
    <div className="h-full bg-slate-100 font-sans flex flex-col relative">
      {/* Fixed Header */}
      <header className="bg-white p-4 shadow-sm z-10">
        <div className="flex justify-between items-center mb-2">
          <span className="bg-[#FFB703] text-slate-900 text-xs font-black px-2 py-1 rounded tracking-widest uppercase">
            Active Job
          </span>
          <span className="text-[#fb5c00] font-bold">₹{activeJob.pricing?.total}</span>
        </div>
        <p className="text-xs text-slate-500 font-mono">ID: {activeJob.trackingId}</p>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-4 pb-32">

          {/* Job Details Card (Always visible) */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
            <h3 className="font-bold text-slate-900 border-b pb-2 mb-3">Job Details</h3>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <div className="w-6 flex flex-col items-center">
                  <MapPin size={16} className="text-[#fb5c00]" />
                  <div className="w-0.5 h-full bg-slate-200 my-1"></div>
                </div>
                <div className="pb-4">
                  <p className="text-xs font-bold text-slate-400 uppercase">Pickup Location</p>
                  <p className="font-bold text-slate-800">{activeJob.pickupLocation?.address}</p>
                  <p className="text-slate-500 flex items-center gap-1 mt-1"><Phone size={14}/> {activeJob.sender?.phone || 'Customer Phone'}</p>
                  {activeJob.preferences?.handlingNotes && (
                    <p className="text-slate-500 flex items-center gap-1 mt-1 text-xs italic"><FileText size={14}/> {activeJob.preferences.handlingNotes}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 flex flex-col items-center">
                  <MapPin size={16} className={isIntercity ? "text-[#FFB703]" : "text-green-600"} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">{isIntercity ? 'Drop to Source Hub' : 'Delivery Location'}</p>
                  <p className="font-bold text-slate-800">{isIntercity ? 'ZyperGo Central Hub, Madhapur' : activeJob.dropLocation?.address}</p>
                  <p className="text-slate-500 flex items-center gap-1 mt-1"><Phone size={14}/> {isIntercity ? 'Hub Manager' : activeJob.receiver?.phone}</p>
                  <p className="text-slate-500 flex items-center gap-1 mt-1 text-xs font-bold"><CreditCard size={14}/> Pay Mode: {activeJob.payment?.mode}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase">Category</p>
                <p className="font-bold text-slate-800">{activeJob.packageDetails?.category}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Weight</p>
                <p className="font-bold text-slate-800">{activeJob.packageDetails?.weight} kg</p>
              </div>
            </div>
          </div>

          {/* Dynamic Task Action Card */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-[#fb5c00]/20 p-6">
            
            {taskStep === 1 && (
              <div className="text-center animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Navigation size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Navigate to Pickup</h2>
                <p className="text-slate-500 text-sm mb-6">Head to the sender's location.</p>
                <button 
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeJob.pickupLocation?.address || '')}`, '_blank')}
                  className="w-full bg-[#fb5c00] text-white font-bold py-4 rounded-xl text-lg flex justify-center items-center gap-2 mb-4 shadow-md"
                >
                  <Navigation size={20}/> Open Google Maps
                </button>
                <button 
                  onClick={() => updateStatus('Arrived at Pickup')} 
                  disabled={loading}
                  className="w-full bg-[#0F172A] text-white font-bold py-4 rounded-xl text-lg flex justify-center items-center gap-2 shadow-md"
                >
                  Mark 'Arrived at Pickup' <ArrowRight size={20}/>
                </button>
              </div>
            )}

            {taskStep === 2 && (
              <div className="text-center animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 bg-[#FFB703]/20 text-[#FFB703] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Pickup Verification</h2>
                <p className="text-slate-500 text-sm mb-6">Ask the sender for the 4-digit OTP.</p>
                
                <input 
                  type="number" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  placeholder="Enter OTP" 
                  className="w-full text-center text-2xl tracking-widest font-bold py-4 px-4 border-2 border-slate-300 rounded-xl focus:border-[#fb5c00] outline-none mb-4"
                />
                
                <button 
                  onClick={() => setTaskStep(3)} 
                  disabled={otp.length !== 4}
                  className="w-full bg-[#fb5c00] text-white font-bold py-4 rounded-xl text-lg disabled:opacity-50 mb-3"
                >
                  Verify OTP
                </button>

                <button 
                  onClick={() => setShowExceptionModal(true)} 
                  className="text-red-500 font-bold text-sm hover:underline"
                >
                  Report Issue (Pickup Failed)
                </button>
              </div>
            )}

            {taskStep === 3 && (
              <div className="text-center animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ScanBarcode size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Package Intake</h2>
                <p className="text-slate-500 text-sm mb-6">Scan the barcode and take a photo of the package.</p>
                
                <button 
                  onClick={() => setBarcodeScanned(true)}
                  className={`w-full border-2 ${barcodeScanned ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-dashed border-slate-300 bg-slate-50 hover:border-[#fb5c00] text-slate-600'} rounded-xl p-6 mb-4 transition flex flex-col items-center justify-center font-bold`}
                >
                   {barcodeScanned ? <CheckCircle size={24} className="mb-2" /> : <ScanBarcode size={24} className="mb-2" />}
                   {barcodeScanned ? 'Barcode Scanned ✓' : 'Scan Package Barcode'}
                </button>

                <button 
                  onClick={() => setPhotoCaptured(true)}
                  className={`w-full border-2 ${photoCaptured ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-dashed border-slate-300 bg-slate-50 hover:border-[#fb5c00] text-slate-600'} rounded-xl p-6 mb-4 transition flex flex-col items-center justify-center font-bold`}
                >
                   {photoCaptured ? <CheckCircle size={24} className="mb-2" /> : <Camera size={24} className="mb-2" />}
                   {photoCaptured ? 'Proof Photo Captured ✓' : 'Capture Proof Photo'}
                </button>
                
                <div className="mb-6 text-left">
                  <p className="text-sm font-bold text-slate-700 mb-2">Package Condition Verification</p>
                  <select 
                    value={parcelCondition}
                    onChange={(e) => setParcelCondition(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:border-[#fb5c00] font-bold text-slate-700 bg-white"
                  >
                    <option value="Good">Good (Intact)</option>
                    <option value="Damaged">Damaged / Torn</option>
                    <option value="Poor Packaging">Poorly Packaged / Loose</option>
                  </select>
                </div>

                {activeJob.payment?.payer === 'Sender' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-bold text-green-800 mb-2">Collect Payment: ₹{activeJob.pricing?.total}</p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white border border-r-0 border-slate-300 rounded-l-lg flex items-center justify-center text-slate-500"><Banknote size={16}/></div>
                      <input type="number" placeholder="Enter amount collected" value={cash} onChange={(e) => setCash(e.target.value)} className="w-full h-10 px-3 border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-[#fb5c00] outline-none text-sm font-bold" />
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => updateStatus('Picked Up')} 
                  disabled={loading}
                  className="w-full bg-[#fb5c00] text-white font-bold py-4 rounded-xl text-lg"
                >
                  Confirm Pickup & Start Trip
                </button>
              </div>
            )}

            {taskStep === 4 && (
              <div className="text-center animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Navigate to Drop</h2>
                <p className="text-slate-500 text-sm mb-6">Head to the {isIntercity ? 'Source Hub' : 'Delivery Address'}.</p>
                
                <div className="bg-slate-100 p-4 rounded-lg mb-6 shadow-inner">
                  <p className="text-sm font-bold text-slate-700 mb-2">Payment Collection Info:</p>
                  <p className="text-2xl font-black text-[#fb5c00]">₹{activeJob.pricing?.total}</p>
                  <p className="text-xs text-slate-500 uppercase font-bold mt-1">Status: {activeJob.payment?.status}</p>
                </div>

                <button 
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(isIntercity ? 'ZyperGo Central Hub' : activeJob.dropLocation?.address || '')}`, '_blank')}
                  className="w-full bg-[#fb5c00] text-white font-bold py-4 rounded-xl text-lg flex justify-center items-center gap-2 mb-4 shadow-md"
                >
                  <Navigation size={20}/> Open Google Maps
                </button>

                <button 
                  onClick={() => updateStatus('Out for Delivery')} 
                  disabled={loading}
                  className="w-full bg-[#0F172A] text-white font-bold py-4 rounded-xl text-lg flex justify-center items-center gap-2 mb-4 shadow-md"
                >
                  Mark 'Arrived at Drop' <ArrowRight size={20}/>
                </button>
                
                <button 
                  onClick={() => { setTaskStep(7); setTranshipmentMode(true); }}
                  disabled={loading}
                  className="w-full bg-white border-2 border-slate-300 text-slate-700 font-bold py-3 rounded-xl text-sm flex justify-center items-center gap-2 hover:bg-slate-50"
                >
                  Initiate Transhipment Handover
                </button>
              </div>
            )}

            {taskStep === 5 && (
              <div className="text-center animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 bg-[#FFB703]/20 text-[#FFB703] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Delivery Verification</h2>
                <p className="text-slate-500 text-sm mb-6">Ask the {isIntercity ? 'Hub Staff' : 'Receiver'} for the 4-digit OTP.</p>
                
                <input 
                  type="number" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  placeholder="Enter OTP" 
                  className="w-full text-center text-2xl tracking-widest font-bold py-4 px-4 border-2 border-slate-300 rounded-xl focus:border-[#fb5c00] outline-none mb-4"
                />
                
                <button 
                  onClick={() => setTaskStep(6)} 
                  disabled={otp.length !== 4}
                  className="w-full bg-[#fb5c00] text-white font-bold py-4 rounded-xl text-lg disabled:opacity-50 mb-3"
                >
                  Verify OTP
                </button>

                <button 
                  onClick={() => setShowExceptionModal(true)} 
                  className="text-red-500 font-bold text-sm hover:underline"
                >
                  Report Issue (Delivery Failed)
                </button>
              </div>
            )}

            {taskStep === 6 && (
              <div className="text-center animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Capture Signature & Photo</h2>
                <p className="text-slate-500 text-sm mb-6">Take a clear photo of the delivered package and capture receiver signature as Proof of Delivery. GPS location will be captured automatically.</p>
                
                <button 
                  onClick={() => setPhotoCaptured(true)}
                  className={`w-full border-2 ${photoCaptured ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-dashed border-slate-300 bg-slate-50 hover:border-[#fb5c00] text-slate-600'} rounded-xl p-6 mb-6 transition flex flex-col items-center justify-center font-bold`}
                >
                   {photoCaptured ? <CheckCircle size={24} className="mb-2" /> : <Upload size={24} className="mb-2" />}
                   {photoCaptured ? 'Proof Uploaded ✓' : 'Capture Proof Photo / Signature'}
                </button>

                {activeJob.payment?.payer === 'Receiver' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-bold text-green-800 mb-2">Collect Payment: ₹{activeJob.pricing?.total}</p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white border border-r-0 border-slate-300 rounded-l-lg flex items-center justify-center text-slate-500"><Banknote size={16}/></div>
                      <input type="number" placeholder="Enter amount collected" value={cash} onChange={(e) => setCash(e.target.value)} className="w-full h-10 px-3 border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-[#fb5c00] outline-none text-sm font-bold" />
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => updateStatus(isIntercity ? 'Source Hub Received' : 'Delivered', true)} 
                  disabled={loading}
                  className="w-full bg-green-600 text-white font-bold py-4 rounded-xl text-lg flex justify-center items-center gap-2 hover:bg-green-700"
                >
                  Complete Job <CheckCircle size={20}/>
                </button>
              </div>
            )}

            {taskStep === 7 && transhipmentMode && (
              <div className="text-center animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Transhipment Handover</h2>
                <p className="text-slate-500 text-sm mb-6">Enter the Target Raider's ID to transfer custody of this package.</p>
                
                <input 
                  type="text" 
                  value={scannedRaiderId} 
                  onChange={(e) => setScannedRaiderId(e.target.value)} 
                  placeholder="Raider ID / Scan QR" 
                  className="w-full text-center text-lg font-bold py-4 px-4 border-2 border-slate-300 rounded-xl focus:border-[#fb5c00] outline-none mb-4 uppercase"
                />
                
                <button 
                  onClick={handleTranshipment} 
                  disabled={loading || !scannedRaiderId}
                  className="w-full bg-[#fb5c00] text-white font-bold py-4 rounded-xl text-lg mb-4"
                >
                  Transfer Package Custody
                </button>
                
                <button onClick={() => { setTaskStep(4); setTranshipmentMode(false); }} className="text-slate-500 font-bold text-sm hover:underline">
                  Cancel Transhipment
                </button>
              </div>
            )}

          </div>

        </div>
      </main>

      {/* Exception (NDR) Modal */}
      {showExceptionModal && (
        <div className="absolute inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <XCircle className="text-red-500" /> Report Issue
            </h3>
            <p className="text-sm text-slate-500 mb-6">Please select the reason why this task cannot be completed. This will be logged for operations.</p>
            
            <div className="space-y-3 mb-6">
              {['Customer Unavailable', 'Parcel Not Ready / Unpacked', 'Prohibited Item Detected', 'Wrong Address Provided', 'Payment Not Ready', 'Customer Cancelled'].map(reason => (
                <button 
                  key={reason}
                  onClick={() => setExceptionReason(reason)}
                  className={`w-full text-left p-4 rounded-xl border ${exceptionReason === reason ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-700'} font-bold text-sm transition`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 mb-6 bg-slate-50 cursor-pointer flex items-center gap-3">
                <Camera size={20} className="text-slate-400" />
                <span className="font-bold text-slate-600 text-sm">Upload Proof (Mandatory)</span>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowExceptionModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
              <button 
                onClick={() => updateStatus('Failed', true)} 
                disabled={!exceptionReason || loading}
                className="flex-[2] py-3 bg-red-600 text-white font-bold rounded-xl disabled:opacity-50"
              >
                Submit & Mark Failed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
