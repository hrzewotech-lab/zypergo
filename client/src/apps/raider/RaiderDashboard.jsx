import React, { useState, useEffect } from 'react';
import { Truck, Navigation, CheckCircle2, MapPin, Package, AlertTriangle, Bell, Settings, Phone, Camera, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import api from '../../api';
import RaiderTaskFlow from './RaiderTaskFlow';
import RaiderHeader from './RaiderHeader';

export default function RaiderDashboard({ user, onLogout }) {
  const [availableJobs, setAvailableJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  
  const [activeTab, setActiveTab] = useState('Deliveries');
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showEarningsModal, setShowEarningsModal] = useState(false);

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
        const active = allBookings.filter(b => ['Rider Assigned', 'Rider On the Way', 'Arrived at Pickup', 'Picked Up', 'In Transit', 'Out for Delivery'].includes(b.status));
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
    
    // Offline Listener
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
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
      const res = await api.put(`/admin/bookings/${job._id}/assign-raider`, { raiderId: user?._id });
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

  const handleDepositCash = async () => {
    try {
      // Use existing endpoint
      const res = await api.post('/finance-settlements/deposit', {
        riderId: user?._id,
        amount: user?.raiderDetails?.earnings?.pendingDeposit || 0,
        expectedAmount: user?.raiderDetails?.earnings?.pendingDeposit || 0,
        notes: 'Deposited at Hub via App'
      });
      if (res.data.success) {
        alert('Cash Deposit Logged Successfully!');
        setShowEarningsModal(false);
      }
    } catch (err) {
      alert('Failed to log deposit');
    }
  };

  // State Machine Render Logic
  const renderActiveJobState = () => {
    if (!activeJob) return null;

    return (
      <RaiderTaskFlow 
        activeJob={activeJob} 
        onCompleteJob={() => {
          setActiveJob(null);
          fetchJobs();
        }} 
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <RaiderHeader user={user} onLogout={onLogout} onShowEarnings={() => setShowEarningsModal(true)} />
      
      {isOffline && (
        <div className="bg-red-600 text-white text-center py-2 text-sm font-bold flex items-center justify-center gap-2">
           <AlertTriangle size={16} /> No Internet Connection. Actions will sync when online.
        </div>
      )}

      <main className="flex-1 p-4 md:p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-4 md:gap-6">
        
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-stretch lg:h-[calc(100vh-140px)] pb-8">
          
          {/* LEFT PANE - Active Delivery Flow */}
          <div className="w-full lg:w-7/12 xl:w-8/12 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-auto lg:h-full relative">
            <div className="bg-[#F8FAFC] border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[#fb5c00] font-bold text-sm tracking-wide">
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
          <div className="w-full lg:w-5/12 xl:w-4/12 flex flex-col gap-4 md:gap-6 h-[500px] lg:h-full">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
              <div className="flex border-b border-slate-200 bg-slate-50">
                <button onClick={() => setActiveTab('Deliveries')} className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition ${activeTab === 'Deliveries' ? 'border-[#fb5c00] text-[#fb5c00] bg-white' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}>
                  My Route ({myJobs.length})
                </button>
                <button onClick={() => setActiveTab('Available')} className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition ${activeTab === 'Available' ? 'border-[#fb5c00] text-[#fb5c00] bg-white' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}>
                  Available Jobs ({availableJobs.length})
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                {activeTab === 'Available' ? (
                  availableJobs.map(job => (
                    <div key={job._id} className="border border-slate-200 bg-white rounded-lg p-4 shadow-sm hover:border-[#fb5c00]/50 transition">
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
                  myJobs.map((job, index) => (
                    <div key={job._id} onClick={() => setActiveJob(job)} className={`border rounded-lg p-4 cursor-pointer transition ${activeJob?._id === job._id ? 'border-[#fb5c00] bg-white shadow-md ring-2 ring-[#fb5c00]/10' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-900 tracking-tight flex items-center gap-2">
                          <span className="bg-slate-800 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">{index + 1}</span>
                          {job.trackingId}
                        </h4>
                        <div className="flex flex-col items-end">
                          <span className="bg-[#fffaf7] text-[#fb5c00] text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider">{job.status}</span>
                          <span className="text-[10px] text-slate-500 font-bold mt-1">ETA: {15 + (index * 20)} mins</span>
                        </div>
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

      {/* Earnings & Cash Modal */}
      {showEarningsModal && (
        <div className="absolute inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Earnings & Cash</h3>
              <button onClick={() => setShowEarningsModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">Close</button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Today's Earnings</p>
                  <p className="text-2xl font-black text-slate-900">₹{user?.raiderDetails?.earnings?.totalEarnings || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-500 uppercase">Performance</p>
                  <p className="text-lg font-bold text-emerald-600">{user?.raiderDetails?.performance?.completionRate || 100}%</p>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
                <p className="text-xs font-bold text-orange-800 uppercase mb-1">Cash in Hand (Pending Deposit)</p>
                <p className="text-2xl font-black text-orange-600">₹{user?.raiderDetails?.earnings?.pendingDeposit || 0}</p>
                <p className="text-xs text-orange-700 mt-2">You must deposit this cash to the Hub Manager at the end of your shift.</p>
              </div>
            </div>

            <button 
              onClick={handleDepositCash}
              disabled={!user?.raiderDetails?.earnings?.pendingDeposit}
              className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl text-lg hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Deposit Cash to Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
