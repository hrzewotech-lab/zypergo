import React, { useState, useEffect } from 'react';
import { Truck, Navigation, CheckCircle2, MapPin, Package, AlertTriangle, Bell, Settings, Phone, Camera, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import api from '../../api';

export default function RaiderDashboard({ user }) {
  const [isOnline, setIsOnline] = useState(user?.raiderDetails?.isOnline || false);
  const [isOnShift, setIsOnShift] = useState(user?.raiderDetails?.isOnShift || false);
  const [isOnBreak, setIsOnBreak] = useState(user?.raiderDetails?.isOnBreak || false);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  
  const [activeTab, setActiveTab] = useState('Deliveries');
  const [loading, setLoading] = useState(false);

  // Form State
  const [otp, setOtp] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Fetch Jobs
  const fetchJobs = async () => {
    try {
      // Mocking endpoints, in reality we'd have a getMyJobs and getAvailableJobs endpoint
      // Using generic admin bookings fetch with a filter for the sake of the prototype
      const res = await api.get('/admin/bookings');
      if (res.data.success) {
        const allBookings = res.data.data;
        
        // Mock filtering logic for the rider
        const unassigned = allBookings.filter(b => b.status === 'Booking Confirmed' || b.status === 'Pending');
        setAvailableJobs(unassigned);
        
        // Mock active jobs for this raider (any active route statuses)
        const active = allBookings.filter(b => ['Rider Assigned', 'Rider On the Way', 'Picked Up', 'In Transit', 'Out for Delivery'].includes(b.status));
        setMyJobs(active);
        
        if (active.length > 0 && !activeJob) {
          setActiveJob(active[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleStatusUpdate = async (newStatus, payload = {}) => {
    if (!activeJob) return;
    setLoading(true);
    try {
      const res = await api.put(`/admin/bookings/${activeJob._id}`, { status: newStatus, ...payload });
      if (res.data.success) {
        setActiveJob(res.data.data);
        fetchJobs();
        // Clear forms
        setOtp('');
        setPhotoUrl('');
      }
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const acceptJob = async (job) => {
    setLoading(true);
    try {
      const res = await api.put(`/admin/bookings/${job._id}/assign-raider`, { raiderId: '60d0fe4f5311236168a109ca' }); // Mock Raider ID
      if (res.data.success) {
        fetchJobs();
        setActiveJob(res.data.data);
      }
    } catch (err) {
      alert('Failed to accept job');
    } finally {
      setLoading(false);
    }
  };

  const handleStrictUpdate = async (newStatus, requireOtp = false, requirePhoto = false) => {
    if (requireOtp && otp !== '1234') {
      alert("Invalid OTP! Please enter 1234 for testing.");
      return;
    }
    if (requirePhoto && !photoUrl) {
      alert("You must capture a photo to proceed!");
      return;
    }

    try {
      // Use the actual raider endpoint which has the strict validations
      const res = await api.post(`/raider/jobs/${activeJob._id}/update-status`, {
        status: newStatus,
        otp,
        photoUrl,
        reason: 'Updated via Raider App'
      });
      if (res.data.success) {
        setActiveJob(res.data.data);
        fetchJobs();
        setOtp('');
        setPhotoUrl('');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update job');
    }
  };

  const handleShiftToggle = async (type) => {
    try {
      let payload = { userId: user._id };
      if (type === 'online') {
        payload.isOnline = !isOnline;
      } else if (type === 'shift') {
        payload.isOnShift = !isOnShift;
        if (!isOnShift) payload.isOnline = true; // start shift goes online
        else {
          payload.isOnline = false;
          payload.isOnBreak = false;
        }
      } else if (type === 'break') {
        payload.isOnBreak = !isOnBreak;
        if (!isOnBreak) payload.isOnline = false; // pause online on break
      }

      const res = await api.post('/raider/shift', payload);
      if (res.data.success) {
         if (type === 'online') setIsOnline(payload.isOnline);
         if (type === 'shift') { setIsOnShift(payload.isOnShift); setIsOnline(payload.isOnline); setIsOnBreak(payload.isOnBreak || false); }
         if (type === 'break') { setIsOnBreak(payload.isOnBreak); setIsOnline(payload.isOnline); }
      }
    } catch (err) {
      alert('Failed to update shift status');
    }
  };

  // State Machine Render Logic
  const renderActiveJobState = () => {
    if (!activeJob) return null;

    const s = activeJob.status;

    return (
      <div className="flex flex-col flex-1 relative">
        {/* Job Details Header */}
        <div className="p-6 flex justify-between items-start z-10 bg-white/90 backdrop-blur-sm">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">{activeJob.receiver?.name || 'Customer'}</h2>
            <div className="flex gap-3 text-slate-600 text-sm mb-4">
              <MapPin size={18} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-slate-800">
                   {['Rider Assigned', 'Rider On the Way'].includes(s) ? 'Pickup:' : 'Drop-off:'}
                </p>
                <p>{['Rider Assigned', 'Rider On the Way'].includes(s) ? activeJob.pickupLocation?.address : activeJob.dropLocation?.address}</p>
                <p className="mt-1 text-slate-500">Contact: {activeJob.receiver?.phone}</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button className="flex-1 border border-slate-200 py-2 rounded-lg font-bold text-[#006D77] text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition">
                <Phone size={16} /> Call
              </button>
              <button className="flex-1 border border-[#006D77] text-[#006D77] py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#006D77]/5 transition">
                <Navigation size={16} /> Navigate
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
            <p className="text-lg font-black text-[#006D77] mb-1">{s}</p>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="flex-1 bg-slate-100 relative min-h-[250px] overflow-hidden flex items-center justify-center">
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
           <div className="relative z-10 w-full h-full p-8 flex flex-col items-center justify-center opacity-50">
              <MapPin size={48} className="text-[#006D77] mb-4 drop-shadow-md" />
              <p className="font-bold text-slate-500">Live GPS Navigation Active</p>
           </div>
        </div>

        {/* Verification & Action Bar */}
        <div className="p-6 bg-white border-t border-slate-200 z-10 space-y-4">
          
          {/* STATE: Rider Assigned / En Route -> Arrive at Pickup */}
          {s === 'Rider Assigned' && (
            <button 
              onClick={() => handleStrictUpdate('Rider On the Way')}
              className="w-full bg-[#006D77] hover:bg-[#00585f] text-white font-bold text-lg py-4 rounded-xl shadow-md transition flex justify-center items-center gap-2"
            >
              Start Navigation to Pickup <Navigation size={20} />
            </button>
          )}

          {s === 'Rider On the Way' && (
            <button 
              onClick={() => handleStrictUpdate('Rider Arrived')} // Note: backend needs Arrived status or just Picked Up directly. Using custom flow.
              className="w-full bg-[#FFB703] hover:bg-[#e5a400] text-slate-900 font-bold text-lg py-4 rounded-xl shadow-md transition flex justify-center items-center gap-2"
            >
              Mark Arrived at Pickup <MapPin size={20} />
            </button>
          )}

          {/* STATE: Arrived -> OTP & Photo required to Pick Up */}
          {(s === 'Rider Arrived' || s === 'Booking Confirmed') && ( // Fallback to Booking confirmed if arrived is skipped
             <>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                  <p className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-600"/> Mandatory Verification</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setPhotoUrl('https://mock-photo-url.com/pickup.jpg')}
                      className={`border-2 border-dashed rounded-xl py-4 flex flex-col items-center justify-center transition ${photoUrl ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-300 text-slate-500 hover:border-[#006D77]'}`}
                    >
                      <Camera size={24} className="mb-2" />
                      <span className="text-sm font-bold">{photoUrl ? 'Photo Uploaded ✓' : 'Capture Parcel'}</span>
                    </button>
                    <div className="flex flex-col justify-center">
                      <label className="text-xs font-bold text-slate-500 mb-1">Customer OTP</label>
                      <input 
                        type="text" 
                        maxLength="4" 
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        placeholder="1234" 
                        className="w-full text-center text-xl tracking-widest font-mono font-bold p-3 border border-slate-300 rounded-lg outline-none focus:border-[#006D77]"
                      />
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleStrictUpdate('Picked Up', true, true)}
                  disabled={!photoUrl || otp.length !== 4}
                  className="w-full bg-[#006D77] hover:bg-[#00585f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg py-4 rounded-xl shadow-md transition flex justify-center items-center gap-2"
                >
                  Confirm Pickup <CheckCircle2 size={20} />
                </button>
             </>
          )}

          {/* STATE: Picked Up -> In Transit */}
          {s === 'Picked Up' && (
            <button 
              onClick={() => handleStrictUpdate('In Transit')}
              className="w-full bg-[#006D77] hover:bg-[#00585f] text-white font-bold text-lg py-4 rounded-xl shadow-md transition flex justify-center items-center gap-2"
            >
              Start Trip to Destination <Truck size={20} />
            </button>
          )}

          {/* STATE: In Transit -> Arrive at Delivery */}
          {s === 'In Transit' && (
            <button 
              onClick={() => handleStrictUpdate('Out for Delivery')} // Use out for delivery or Arrived
              className="w-full bg-[#FFB703] hover:bg-[#e5a400] text-slate-900 font-bold text-lg py-4 rounded-xl shadow-md transition flex justify-center items-center gap-2"
            >
              Mark Arrived at Destination <MapPin size={20} />
            </button>
          )}

          {/* STATE: Arrived at Destination -> Deliver (Needs Photo) */}
          {s === 'Out for Delivery' && (
             <>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                  <p className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-600"/> Delivery Proof</p>
                  <button 
                    onClick={() => setPhotoUrl('https://mock-photo-url.com/delivery.jpg')}
                    className={`w-full border-2 border-dashed rounded-xl py-6 flex flex-col items-center justify-center transition ${photoUrl ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-300 text-slate-500 hover:border-[#006D77]'}`}
                  >
                    <Camera size={24} className="mb-2" />
                    <span className="text-sm font-bold">{photoUrl ? 'Delivery Photo Uploaded ✓' : 'Capture Drop-off Photo'}</span>
                  </button>
                </div>
                <button 
                  onClick={() => handleStrictUpdate('Delivered', false, true)}
                  disabled={!photoUrl}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg py-4 rounded-xl shadow-md transition flex justify-center items-center gap-2"
                >
                  Complete Delivery <CheckCircle2 size={20} />
                </button>
             </>
          )}
          
          {/* STATE: Delivered */}
          {s === 'Delivered' && (
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Delivery Complete!</h3>
              <p className="text-slate-500 mb-6">Great job. Return to queue.</p>
              <button 
                onClick={() => {setActiveJob(null); fetchJobs();}}
                className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold"
              >
                Find Next Job
              </button>
            </div>
          )}

        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center gap-8">
          <img src="/images/logo.png" alt="ZyperGo Logo" className="h-8" />
          <div className="h-6 w-px bg-slate-300"></div>
          <nav className="flex gap-6">
            <button className="text-[#006D77] font-bold text-sm border-b-2 border-[#006D77] pb-1">Dashboard</button>
            <button className="text-slate-500 font-bold text-sm hover:text-slate-800 pb-1">Earnings (${user?.raiderDetails?.earnings?.totalEarnings || 0})</button>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          {!isOnShift ? (
             <button onClick={() => handleShiftToggle('shift')} className="bg-[#006D77] text-white px-4 py-1.5 rounded-full text-xs font-bold">Start Shift</button>
          ) : (
             <>
               <button onClick={() => handleShiftToggle('break')} className={`px-4 py-1.5 rounded-full text-xs font-bold border transition ${isOnBreak ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-white text-slate-500 border-slate-200'}`}>{isOnBreak ? 'End Break' : 'Take Break'}</button>
               <button onClick={() => handleShiftToggle('shift')} className="bg-slate-800 text-white px-4 py-1.5 rounded-full text-xs font-bold">End Shift</button>
             </>
          )}

          <div className="bg-slate-100 rounded-full p-1 flex items-center ml-2">
            <button onClick={() => handleShiftToggle('online')} disabled={!isOnShift} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${isOnline ? 'bg-emerald-500 text-white' : 'text-slate-400 opacity-50'}`}>Online</button>
            <button onClick={() => handleShiftToggle('online')} disabled={!isOnShift} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${!isOnline ? 'bg-slate-400 text-white' : 'text-slate-400 opacity-50'}`}>Offline</button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-[calc(100vh-140px)] pb-8">
          
          {/* LEFT PANE - Active Delivery Flow */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="bg-[#F8FAFC] border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[#006D77] font-bold text-sm tracking-wide">
                <Truck size={18} /> ACTIVE MISSION
              </div>
              {activeJob && (
                <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-mono border border-slate-200 font-bold">
                  ID: {activeJob.trackingId}
                </div>
              )}
            </div>

            {activeJob ? renderActiveJobState() : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                <Package size={64} className="mb-4 opacity-20" />
                <p className="font-bold text-xl text-slate-500">No Active Mission</p>
                <p className="text-sm mt-2">Select a job from the queue to start earning.</p>
              </div>
            )}
          </div>

          {/* RIGHT PANE - Job Queue */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 h-full">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
              <div className="flex border-b border-slate-200 bg-slate-50">
                <button onClick={() => setActiveTab('Deliveries')} className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition ${activeTab === 'Deliveries' ? 'border-[#006D77] text-[#006D77] bg-white' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}>
                  My Route ({myJobs.length})
                </button>
                <button onClick={() => setActiveTab('Available')} className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition ${activeTab === 'Available' ? 'border-[#006D77] text-[#006D77] bg-white' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}>
                  Available Jobs ({availableJobs.length})
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                {activeTab === 'Available' ? (
                  availableJobs.map(job => (
                    <div key={job._id} className="border border-slate-200 bg-white rounded-lg p-4 shadow-sm hover:border-[#006D77]/50 transition">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-900">{job.pickupLocation?.pincode} &rarr; {job.dropLocation?.pincode}</h4>
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider">NEW</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3 flex items-center gap-1"><MapPin size={12}/> {job.pickupLocation?.address}</p>
                      <button onClick={() => acceptJob(job)} disabled={loading} className="w-full bg-slate-900 text-white font-bold text-xs py-2 rounded shadow hover:bg-slate-800 transition">
                        Accept Job
                      </button>
                    </div>
                  ))
                ) : (
                  myJobs.map(job => (
                    <div key={job._id} onClick={() => setActiveJob(job)} className={`border rounded-lg p-4 cursor-pointer transition ${activeJob?._id === job._id ? 'border-[#006D77] bg-white shadow-md ring-2 ring-[#006D77]/10' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-900 tracking-tight">{job.trackingId}</h4>
                        <span className="bg-[#E0F2F1] text-[#006D77] text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider">{job.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 truncate"><MapPin size={12}/> {['Rider Assigned', 'Rider On the Way'].includes(job.status) ? job.pickupLocation?.address : job.dropLocation?.address}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
