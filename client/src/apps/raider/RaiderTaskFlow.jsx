import React, { useState } from 'react';
import { Navigation, MapPin, Camera, Key, CheckCircle, Package, ArrowRight, Upload, XCircle, ScanBarcode, Banknote } from 'lucide-react';

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

  const updateStatus = async (status, isComplete = false) => {
    setLoading(true);
    try {
      const payload = { 
        status, 
        reason: exceptionReason || 'Raider action',
        cashCollected: cash || 0
      };
      
      if (status === 'Picked Up' || status === 'Delivered' || status === 'Source Hub Received' || status === 'Destination Hub Received') {
        payload.otp = otp || '1234'; 
        payload.photoUrl = 'mock-url.jpg';
      }

      if (isComplete || status.includes('Hub Received')) {
        // Mock GPS capture
        payload.gpsLocation = { lat: 17.4401, lng: 78.3489 };
      }

      const res = await fetch(`/api/raider/jobs/${activeJob._id}/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        if (isComplete || status === 'Failed' || status === 'Cancelled') {
          onCompleteJob();
        } else {
          if (status === 'Picked Up') {
            setTaskStep(4);
          } else {
            setTaskStep(prev => prev + 1);
          }
          setOtp(''); // reset OTP for drop
          setCash(''); // reset cash
          setShowExceptionModal(false);
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update status.');
      }
    } catch (err) {
      alert('Network Error');
    } finally {
      setLoading(false);
    }
  };

  const handleTranshipment = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/raider/jobs/${activeJob._id}/transhipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRaiderId: scannedRaiderId || 'mock-raider-id-123' })
      });
      if (res.ok) {
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
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col relative">
      {/* Fixed Header */}
      <header className="bg-white p-4 shadow-sm z-10">
        <div className="flex justify-between items-center mb-2">
          <span className="bg-[#FFB703] text-slate-900 text-xs font-black px-2 py-1 rounded tracking-widest uppercase">
            Active Job
          </span>
          <span className="text-[#006D77] font-bold">₹{activeJob.pricing?.total}</span>
        </div>
        <p className="text-xs text-slate-500 font-mono">ID: {activeJob.trackingId}</p>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-4 pb-32">

          {/* Job Details Card (Always visible) */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
            <h3 className="font-bold text-slate-900 border-b pb-2 mb-3">Job Details</h3>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <div className="w-6 flex flex-col items-center">
                  <MapPin size={16} className="text-[#006D77]" />
                  <div className="w-0.5 h-full bg-slate-200 my-1"></div>
                </div>
                <div className="pb-4">
                  <p className="text-xs font-bold text-slate-400 uppercase">Pickup Location</p>
                  <p className="font-bold text-slate-800">{activeJob.pickupLocation?.address}</p>
                  <p className="text-slate-500">Sender: {activeJob.sender?.name || 'Customer'}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 flex flex-col items-center">
                  <MapPin size={16} className={isIntercity ? "text-[#FFB703]" : "text-green-600"} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">{isIntercity ? 'Drop to Source Hub' : 'Delivery Location'}</p>
                  <p className="font-bold text-slate-800">{isIntercity ? 'ZyperGo Central Hub, Madhapur' : activeJob.dropLocation?.address}</p>
                  <p className="text-slate-500">Receiver: {isIntercity ? 'Hub Manager' : activeJob.receiver?.name}</p>
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
          <div className="bg-white rounded-xl shadow-lg border-2 border-[#006D77]/20 p-6">
            
            {taskStep === 1 && (
              <div className="text-center animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Navigation size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Navigate to Pickup</h2>
                <p className="text-slate-500 text-sm mb-6">Head to the sender's location.</p>
                <button 
                  onClick={() => updateStatus('Rider On the Way')} 
                  disabled={loading}
                  className="w-full bg-[#0F172A] text-white font-bold py-4 rounded-xl text-lg flex justify-center items-center gap-2"
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
                  className="w-full text-center text-2xl tracking-widest font-bold py-4 px-4 border-2 border-slate-300 rounded-xl focus:border-[#006D77] outline-none mb-4"
                />
                
                <button 
                  onClick={() => setTaskStep(3)} 
                  disabled={otp.length !== 4}
                  className="w-full bg-[#006D77] text-white font-bold py-4 rounded-xl text-lg disabled:opacity-50 mb-3"
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
                
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 mb-4 bg-slate-50 cursor-pointer hover:border-[#006D77] transition flex flex-col items-center">
                   <ScanBarcode size={24} className="text-slate-400 mb-2" />
                   <p className="font-bold text-slate-600">Scan Package Barcode</p>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 mb-6 bg-slate-50 cursor-pointer hover:border-[#006D77] transition flex flex-col items-center">
                   <Camera size={24} className="text-slate-400 mb-2" />
                   <p className="font-bold text-slate-600">Capture Proof Photo</p>
                </div>

                {activeJob.payment?.payer === 'Sender' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-bold text-green-800 mb-2">Collect Payment: ₹{activeJob.pricing?.total}</p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white border border-r-0 border-slate-300 rounded-l-lg flex items-center justify-center text-slate-500"><Banknote size={16}/></div>
                      <input type="number" placeholder="Enter amount collected" value={cash} onChange={(e) => setCash(e.target.value)} className="w-full h-10 px-3 border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-[#006D77] outline-none text-sm font-bold" />
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => updateStatus('Picked Up')} 
                  disabled={loading}
                  className="w-full bg-[#006D77] text-white font-bold py-4 rounded-xl text-lg"
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
                
                <div className="bg-slate-100 p-4 rounded-lg mb-6">
                  <p className="text-sm font-bold text-slate-700 mb-2">Payment Collection Info:</p>
                  <p className="text-2xl font-black text-[#006D77]">₹{activeJob.pricing?.total}</p>
                  <p className="text-xs text-slate-500 uppercase font-bold mt-1">Status: {activeJob.payment?.status}</p>
                </div>

                <button 
                  onClick={() => updateStatus('Out for Delivery')} 
                  disabled={loading}
                  className="w-full bg-[#0F172A] text-white font-bold py-4 rounded-xl text-lg flex justify-center items-center gap-2 mb-4"
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
                  className="w-full text-center text-2xl tracking-widest font-bold py-4 px-4 border-2 border-slate-300 rounded-xl focus:border-[#006D77] outline-none mb-4"
                />
                
                <button 
                  onClick={() => setTaskStep(6)} 
                  disabled={otp.length !== 4}
                  className="w-full bg-[#006D77] text-white font-bold py-4 rounded-xl text-lg disabled:opacity-50 mb-3"
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
                <h2 className="text-xl font-bold text-slate-900 mb-2">Mandatory Drop Photo</h2>
                <p className="text-slate-500 text-sm mb-6">Take a clear photo of the delivered package as Proof of Delivery. GPS location will be captured automatically.</p>
                
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 mb-6 bg-slate-50 cursor-pointer">
                   <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                   <p className="font-bold text-slate-600">Tap to Camera</p>
                </div>

                {activeJob.payment?.payer === 'Receiver' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-bold text-green-800 mb-2">Collect Payment: ₹{activeJob.pricing?.total}</p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white border border-r-0 border-slate-300 rounded-l-lg flex items-center justify-center text-slate-500"><Banknote size={16}/></div>
                      <input type="number" placeholder="Enter amount collected" value={cash} onChange={(e) => setCash(e.target.value)} className="w-full h-10 px-3 border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-[#006D77] outline-none text-sm font-bold" />
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
                  className="w-full text-center text-lg font-bold py-4 px-4 border-2 border-slate-300 rounded-xl focus:border-[#006D77] outline-none mb-4 uppercase"
                />
                
                <button 
                  onClick={handleTranshipment} 
                  disabled={loading || !scannedRaiderId}
                  className="w-full bg-[#006D77] text-white font-bold py-4 rounded-xl text-lg mb-4"
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
