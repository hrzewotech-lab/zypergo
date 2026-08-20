import React, { useState, useEffect } from 'react';
import { UserCheck, Clock, MapPin, Truck, CheckCircle2, XCircle, Search, ExternalLink, FileText, X, ShieldCheck } from 'lucide-react';
import api from '../../api';

export default function RiderManagementPage() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending');
  const [search, setSearch] = useState('');
  const [selectedRider, setSelectedRider] = useState(null);

  const fetchRiders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/riders');
      if (res.data.success) {
        setRiders(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  const approveRider = async (id) => {
    try {
       const res = await api.put(`/admin/riders/${id}/approve`);
       if (res.data.success) {
         setRiders(riders.map(r => r._id === id ? { ...r, riderDetails: { ...r.riderDetails, approvalStatus: 'Approved' } } : r));
       }
       if (selectedRider && selectedRider._id === id) {
         setSelectedRider(null);
       }
    } catch (err) {
       alert("Failed to approve");
    }
  };

  const rejectRider = async (id) => {
    // Dummy function for now since there's no backend endpoint for rejecting a rider yet.
    alert("Rider application rejected.");
    setRiders(riders.filter(r => r._id !== id));
    if (selectedRider && selectedRider._id === id) {
      setSelectedRider(null);
    }
  };

  const filteredRiders = riders.filter(r => r.riderDetails?.approvalStatus === activeTab && r.name.toLowerCase().includes(search.toLowerCase()));

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
             <input type="text" placeholder="Search riders..." className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#006D77]" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredRiders.length === 0 ? (
               <div className="col-span-2 text-center py-12 text-slate-500 font-bold">No riders found in this category.</div>
            ) : (
               filteredRiders.map(rider => (
                 <div key={rider._id} onClick={() => setSelectedRider(rider)} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between cursor-pointer hover:border-slate-400 hover:shadow-md transition-all group">
                   <div className="flex justify-between items-start mb-4">
                     <div className="flex gap-3">
                       <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-black text-slate-500 text-xl">{rider.name.charAt(0)}</div>
                       <div>
                         <h3 className="font-bold text-slate-900">{rider.name}</h3>
                         <p className="text-xs text-slate-500 flex items-center gap-1"><Truck size={12}/> {rider.riderDetails?.vehicleType} ({rider.riderDetails?.roleFlexibility})</p>
                       </div>
                     </div>
                     <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${activeTab === 'Pending' ? 'bg-amber-100 text-amber-700' : rider.riderDetails?.isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {activeTab === 'Pending' ? 'Awaiting Review' : rider.riderDetails?.isOnline ? 'Online' : 'Offline'}
                     </span>
                   </div>
                   
                   {activeTab === 'Pending' ? (
                     <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                       <button onClick={(e) => { e.stopPropagation(); approveRider(rider._id); }} className="flex-1 bg-black hover:bg-slate-900 text-[#FFB703] font-black uppercase tracking-wider text-sm py-2 rounded-lg transition flex items-center justify-center gap-2">
                         <CheckCircle2 size={16}/> Approve
                       </button>
                     </div>
                   ) : (
                     <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Total Earnings</p>
                          <p className="font-bold text-slate-900">${rider.riderDetails?.earnings?.totalEarnings || 0}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Punctuality</p>
                          <p className="font-bold text-emerald-600">98%</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Completed Trips</p>
                          <p className="font-bold text-[#006D77]">{rider.riderDetails?.earnings?.completedTrips || 0}</p>
                        </div>
                     </div>
                   )}
                 </div>
               ))
            )}
          </div>
        </div>
      </div>

      {/* Rider Details Modal - A4 Form Style */}
      {selectedRider && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          
          <div className="bg-white w-full max-w-3xl my-auto rounded-none sm:rounded-lg shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">
            
            <button onClick={() => setSelectedRider(null)} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors z-10 shadow-sm border border-slate-200">
              <X size={20} />
            </button>

            {/* A4 Paper Container */}
            <div className="p-8 sm:p-12 bg-white relative font-serif text-slate-900">
              
              {/* Header / Watermark */}
              <div className="text-center border-b-4 border-double border-slate-800 pb-6 mb-8 relative">
                 <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                   <img src="/images/logo.png" alt="" className="h-16" />
                 </div>
                 <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-slate-900">Partner Registration Form</h1>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">ZyperGo Logistics Official Record</p>
                 <p className="text-xs font-bold text-slate-400 mt-1">ID: {selectedRider._id.toUpperCase()}</p>
              </div>

              {/* Top Section: Photo and Personal Details */}
              <div className="flex flex-col sm:flex-row gap-8 mb-10">
                 {/* Passport Photo Box */}
                 <div className="w-32 h-40 border-4 border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 relative">
                   {selectedRider.riderDetails?.documents?.profileImageUrl ? (
                     <img src={selectedRider.riderDetails.documents.profileImageUrl} alt="Applicant" className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-xs text-slate-400 uppercase font-bold text-center px-2">Affix Photo Here</span>
                   )}
                   <div className="absolute -bottom-3 bg-white px-2 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">Applicant</div>
                 </div>

                 <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="border-b border-dashed border-slate-300 pb-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</span>
                      <p className="text-lg font-bold uppercase">{selectedRider.name}</p>
                    </div>
                    <div className="border-b border-dashed border-slate-300 pb-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Number</span>
                      <p className="text-lg font-bold font-sans">{selectedRider.phone}</p>
                    </div>
                    <div className="border-b border-dashed border-slate-300 pb-1 col-span-1 sm:col-span-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</span>
                      <p className="text-base font-bold font-sans">{selectedRider.email}</p>
                    </div>
                    <div className="border-b border-dashed border-slate-300 pb-1 col-span-1 sm:col-span-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Residential Address</span>
                      <p className="text-base font-bold">{selectedRider.riderDetails?.address || 'Not Provided'}</p>
                    </div>
                 </div>
              </div>

              {/* Section 2: Vehicle Information */}
              <div className="mb-10">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-800 pb-1 mb-4 flex items-center gap-2">
                  <Truck size={16} /> Section A: Vehicle Particulars
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div className="border-b border-dashed border-slate-300 pb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</span>
                    <p className="text-sm font-bold uppercase">{selectedRider.riderDetails?.vehicleType}</p>
                  </div>
                  <div className="border-b border-dashed border-slate-300 pb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Make & Model</span>
                    <p className="text-sm font-bold uppercase">{selectedRider.riderDetails?.vehicleMake} {selectedRider.riderDetails?.vehicleModel}</p>
                  </div>
                  <div className="border-b border-dashed border-slate-300 pb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registration No.</span>
                    <p className="text-sm font-bold uppercase">{selectedRider.riderDetails?.vehicleRegistration}</p>
                  </div>
                  <div className="border-b border-dashed border-slate-300 pb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RC Number</span>
                    <p className="text-sm font-bold uppercase font-sans">{selectedRider.riderDetails?.rcNumber}</p>
                  </div>
                </div>
              </div>

              {/* Section 3: Bank Details */}
              <div className="mb-10">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-800 pb-1 mb-4 flex items-center gap-2">
                  <ShieldCheck size={16} /> Section B: Bank Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="border-b border-dashed border-slate-300 pb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Number</span>
                    <p className="text-sm font-bold font-sans tracking-wider">{selectedRider.riderDetails?.bankDetails?.accountNumber || 'Not Provided'}</p>
                  </div>
                  <div className="border-b border-dashed border-slate-300 pb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IFSC Code</span>
                    <p className="text-sm font-bold font-sans uppercase tracking-wider">{selectedRider.riderDetails?.bankDetails?.ifscCode || 'Not Provided'}</p>
                  </div>
                </div>
              </div>

              {/* Section 4: Attached Proofs (Images) */}
              <div className="mb-10">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-800 pb-1 mb-4 flex items-center gap-2">
                  <FileText size={16} /> Section C: Attached Proofs
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Aadhaar Card', url: selectedRider.riderDetails?.documents?.aadhaarUrl || selectedRider.riderDetails?.documents?.idProofUrl },
                    { label: 'PAN Card', url: selectedRider.riderDetails?.documents?.panUrl },
                    { label: 'Driving License', url: selectedRider.riderDetails?.documents?.drivingLicenseUrl },
                    { label: 'RC Book', url: selectedRider.riderDetails?.documents?.rcUrl },
                    { label: 'Vehicle Photo', url: selectedRider.riderDetails?.documents?.vehiclePicUrl }
                  ].map((doc, idx) => {
                    const isPdf = doc.url && doc.url.toLowerCase().includes('.pdf');
                    return (
                      <div key={idx} className="border border-slate-300 p-2 relative group flex flex-col">
                        <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1 block text-center bg-slate-50">{doc.label}</span>
                        {doc.url ? (
                          <a href={doc.url} target="_blank" rel="noreferrer" className="block w-full aspect-[4/3] bg-slate-100 relative flex items-center justify-center">
                             {isPdf ? (
                               <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                                 <FileText size={32} />
                                 <span className="text-xs font-bold uppercase">PDF Document</span>
                               </div>
                             ) : (
                               <img src={doc.url} alt={doc.label} className="w-full h-full object-cover border border-slate-200" />
                             )}
                             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                               <Search size={20} className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
                             </div>
                          </a>
                        ) : (
                          <div className="w-full aspect-[4/3] bg-slate-50 flex items-center justify-center border border-dashed border-slate-300">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Not Attached</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Signature & Actions Block */}
              <div className="mt-16 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 border-t border-slate-200 pt-8">
                 <div className="w-full sm:w-auto flex flex-col items-center sm:items-start order-2 sm:order-1">
                   <div className="border-b border-slate-900 w-48 mb-2"></div>
                   <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest text-center sm:text-left w-48">Admin Signature</p>
                 </div>
                 
                 <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
                   <button onClick={() => setSelectedRider(null)} className="px-6 py-4 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-sans w-full sm:w-auto text-sm tracking-wide">
                     Go Back
                   </button>
                   {selectedRider.riderDetails?.approvalStatus === 'Pending' && (
                     <>
                       <button onClick={() => rejectRider(selectedRider._id)} className="px-6 py-4 bg-white border border-red-200 text-red-600 font-bold uppercase tracking-widest text-sm shadow-sm hover:bg-red-50 active:scale-95 transition-all flex items-center justify-center gap-2 rounded-xl font-sans w-full sm:w-auto">
                         <XCircle size={18} /> Reject
                       </button>
                       <button onClick={() => approveRider(selectedRider._id)} className="px-8 py-4 bg-black text-[#FFB703] font-black uppercase tracking-widest text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 rounded-xl font-sans w-full sm:w-auto">
                         <CheckCircle2 size={20} /> Authorize & Approve
                       </button>
                     </>
                   )}
                 </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
