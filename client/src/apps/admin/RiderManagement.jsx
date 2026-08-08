import React, { useState, useEffect } from 'react';
import { UserCheck, Clock, MapPin, Truck, CheckCircle2, XCircle, Search } from 'lucide-react';
import api from '../../api';

export default function RiderManagement() {
  const [raiders, setRaiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending');
  const [search, setSearch] = useState('');

  const fetchRaiders = async () => {
    setLoading(true);
    try {
      // Using generic mock data fetching for now, ideally an endpoint specifically for raiders
      const res = await api.get('/admin/raiders/available'); // Currently only fetches online, let's mock the full list
      
      // MOCK FULL LIST FETCH
      const allRaidersRes = await fetch('http://localhost:5000/api/admin/raiders/available', { // This endpoint only gets online raiders right now, let's just mock the data directly in the UI for prototype since we didn't build a full getRaiders backend endpoint
         method: 'GET',
         headers: { 'Authorization': `Bearer ${localStorage.getItem('zypergo_token')}` }
      });
      // Fallback mock data since the endpoint doesn't fetch all users yet
      const mockRaiders = [
        { _id: '1', name: 'John Doe', phone: '9999999991', raiderDetails: { approvalStatus: 'Pending', vehicleType: 'Bike', vehicleRegistration: 'MH12AB1234', roleFlexibility: 'Both' } },
        { _id: '2', name: 'Mike Smith', phone: '9999999992', raiderDetails: { approvalStatus: 'Approved', isOnline: true, vehicleType: 'Mini Truck', earnings: { totalEarnings: 450 } } },
      ];
      setRaiders(mockRaiders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaiders();
  }, []);

  const approveRaider = async (id) => {
    try {
       // Mock the endpoint call since we didn't add full raider population in the backend
       // const res = await api.put(`/admin/raiders/${id}/approve`);
       setRaiders(raiders.map(r => r._id === id ? { ...r, raiderDetails: { ...r.raiderDetails, approvalStatus: 'Approved' } } : r));
    } catch (err) {
       alert("Failed to approve");
    }
  };

  const filteredRaiders = raiders.filter(r => r.raiderDetails?.approvalStatus === activeTab && r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Rider Management</h1>
          <p className="text-slate-500 text-sm mt-1">Approve, monitor, and manage delivery partners.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex space-x-4">
            <button onClick={() => setActiveTab('Pending')} className={`pb-2 px-2 font-bold text-sm border-b-2 transition ${activeTab === 'Pending' ? 'border-[#006D77] text-[#006D77]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Pending Approvals</button>
            <button onClick={() => setActiveTab('Approved')} className={`pb-2 px-2 font-bold text-sm border-b-2 transition ${activeTab === 'Approved' ? 'border-[#006D77] text-[#006D77]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Active Fleet</button>
          </div>
          <div className="relative w-64">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input type="text" placeholder="Search riders..." className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm outline-none" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredRaiders.length === 0 ? (
               <div className="col-span-2 text-center py-12 text-slate-500 font-bold">No riders found in this category.</div>
            ) : (
               filteredRaiders.map(rider => (
                 <div key={rider._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                   <div className="flex justify-between items-start mb-4">
                     <div className="flex gap-3">
                       <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-black text-slate-500 text-xl">{rider.name.charAt(0)}</div>
                       <div>
                         <h3 className="font-bold text-slate-900">{rider.name}</h3>
                         <p className="text-xs text-slate-500 flex items-center gap-1"><Truck size={12}/> {rider.raiderDetails?.vehicleType} ({rider.raiderDetails?.roleFlexibility})</p>
                       </div>
                     </div>
                     <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${activeTab === 'Pending' ? 'bg-amber-100 text-amber-700' : rider.raiderDetails?.isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {activeTab === 'Pending' ? 'Awaiting Review' : rider.raiderDetails?.isOnline ? 'Online' : 'Offline'}
                     </span>
                   </div>
                   
                   {activeTab === 'Pending' ? (
                     <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                       <button onClick={() => approveRaider(rider._id)} className="flex-1 bg-[#006D77] hover:bg-[#00585f] text-white font-bold text-sm py-2 rounded-lg transition flex items-center justify-center gap-2">
                         <CheckCircle2 size={16}/> Approve
                       </button>
                       <button className="flex-1 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-bold text-sm py-2 rounded-lg transition flex items-center justify-center gap-2">
                         <XCircle size={16}/> Reject
                       </button>
                     </div>
                   ) : (
                     <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Total Earnings</p>
                          <p className="font-bold text-slate-900">${rider.raiderDetails?.earnings?.totalEarnings || 0}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Punctuality</p>
                          <p className="font-bold text-emerald-600">98%</p>
                        </div>
                     </div>
                   )}
                 </div>
               ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
