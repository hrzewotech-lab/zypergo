import React, { useState, useEffect } from 'react';
import { Truck, Navigation, CheckCircle2, MapPin, Package, AlertTriangle, Bell, Settings, Phone, Camera, ArrowRight, ShieldCheck, Clock, LayoutDashboard, Wallet, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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
        const unassigned = allBookings.filter(b => ['Booking Confirmed', 'Pending', 'Relay Handoff Pending', 'Transhipment Pending'].includes(b.status));
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
    
    // Poll for new jobs every 10 seconds
    const interval = setInterval(() => {
      fetchJobs();
    }, 10000);

    // Offline Listener
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      clearInterval(interval);
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
    if (job.status === 'Relay Handoff Pending' || job.status === 'Transhipment Pending') {
      const enteredOtp = window.prompt("Enter the 4-digit Handover OTP from the other Raider:");
      if (!enteredOtp) return;
      
      setLoading(true);
      try {
        const res = await api.post(`/raider/jobs/${job._id}/accept-handover`, { newRaiderId: user?._id, otp: enteredOtp });
        if (res.data.success) {
          fetchJobs();
          setActiveJob(res.data.data);
        }
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to accept handover');
        fetchJobs(); 
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const res = await api.put(`/admin/bookings/${job._id}/assign-raider`, { raiderId: user?._id });
      if (res.data.success) {
        fetchJobs();
        setActiveJob(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept job');
      fetchJobs(); 
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

      <main className="flex-1 p-4 md:p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-4 md:gap-6 pb-24 md:pb-6 relative z-10">
        
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-stretch lg:h-[calc(100vh-140px)] pb-8">
          
          {/* LEFT PANE - Active Delivery Flow */}
          <div className="w-full lg:w-7/12 xl:w-8/12 bg-white/50 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col h-auto lg:h-full relative">
            <div className="bg-white/40 border-b border-white/60 px-6 py-4 flex justify-between items-center backdrop-blur-md">
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
            <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex-1 flex flex-col overflow-hidden relative">
              <div className="flex border-b border-white/60 bg-white/40 backdrop-blur-md p-1.5 m-4 rounded-2xl shadow-sm">
                <button onClick={() => setActiveTab('Deliveries')} className={`flex-1 py-3 text-sm font-black text-center rounded-xl transition-all ${activeTab === 'Deliveries' ? 'bg-[#fb5c00] text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'}`}>
                  My Route ({myJobs.length})
                </button>
                <button onClick={() => setActiveTab('Available')} className={`flex-1 py-3 text-sm font-black text-center rounded-xl transition-all ${activeTab === 'Available' ? 'bg-[#fb5c00] text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'}`}>
                  Available Jobs ({availableJobs.length})
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-3">
                {activeTab === 'Available' ? (
                  availableJobs.map(job => (
                    <div key={job._id} className="border border-white/60 bg-white/60 backdrop-blur-sm rounded-3xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-black text-slate-900 tracking-tight">{job.pickupLocation?.pincode} &rarr; {job.dropLocation?.pincode}</h4>
                        <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-lg text-[10px] font-black tracking-widest shadow-sm">NEW</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-4 flex items-center gap-2 font-medium"><MapPin size={14} className="text-emerald-500"/> {job.pickupLocation?.address}</p>
                      <button onClick={() => acceptJob(job)} disabled={loading} className="w-full bg-gradient-to-r from-[#0F172A] to-slate-800 text-white font-black text-sm py-3 rounded-2xl shadow-[0_4px_15px_-4px_rgba(15,23,42,0.4)] hover:shadow-[0_6px_20px_-4px_rgba(15,23,42,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-50">
                        Accept Job
                      </button>
                    </div>
                  ))
                ) : (
                  myJobs.map((job, index) => (
                    <div key={job._id} onClick={() => setActiveJob(job)} className={`border rounded-3xl p-5 cursor-pointer transition-all ${activeJob?._id === job._id ? 'border-[#fb5c00]/50 bg-gradient-to-br from-[#fb5c00]/5 to-transparent shadow-md -translate-y-1' : 'border-white/60 bg-white/60 backdrop-blur-sm hover:shadow-md hover:-translate-y-0.5'}`}>
                      <div className="flex justify-between items-start mb-3">
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

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-3xl border-t border-white/60 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-40 px-6 py-4 pb-6 flex justify-between items-center">
        <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 text-[#fb5c00]">
          <div className="w-9 h-9 rounded-2xl bg-[#fb5c00]/10 flex items-center justify-center">
            <LayoutDashboard size={20} />
          </div>
          <span className="text-[10px] font-black">Dashboard</span>
        </button>
        <button onClick={() => navigate('/earnings')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-800 transition-colors">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center">
            <Wallet size={20} />
          </div>
          <span className="text-[10px] font-black">Earnings</span>
        </button>
        <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-800 transition-colors">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center">
            <UserIcon size={20} />
          </div>
          <span className="text-[10px] font-black">Profile</span>
        </button>
        <button onClick={() => navigate('/settings')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-800 transition-colors">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center">
            <Settings size={20} />
          </div>
          <span className="text-[10px] font-black">Settings</span>
        </button>
      </div>

    </div>
  );
}
