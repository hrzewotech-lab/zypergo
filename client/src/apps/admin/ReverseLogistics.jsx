import React, { useState, useEffect } from 'react';
import {
  RotateCcw, Search, Package, MapPin, Truck, AlertTriangle, 
  CheckCircle, Loader2, ArrowRight, X, User, DollarSign, Camera, Map
} from 'lucide-react';
import api from '../../api';

export default function ReverseLogistics() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState(null);
  
  // POD Form State
  const [podData, setPodData] = useState({ signatureUrl: '', photoUrl: '', lat: '', lng: '' });
  const [showPodModal, setShowPodModal] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/returns');
      setReturns(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/returns/${id}/status`, { status: newStatus });
      fetchReturns();
      if (selectedReturn?._id === id) {
        setSelectedReturn(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const submitPod = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/returns/${selectedReturn._id}/pod`, podData);
      setShowPodModal(false);
      fetchReturns();
      setSelectedReturn(null);
    } catch (err) {
      alert('Failed to capture POD');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Return Initiated': 'bg-amber-100 text-amber-800 border-amber-200',
      'Approved': 'bg-blue-100 text-blue-800 border-blue-200',
      'Returned to Sender': 'bg-green-100 text-green-800 border-green-200',
      'Rejected': 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const inboxReturns = returns.filter(r => r.status === 'Return Initiated');
  const activeReturns = returns.filter(r => r.status !== 'Return Initiated' && r.status !== 'Returned to Sender' && r.status !== 'Rejected');
  const completedReturns = returns.filter(r => r.status === 'Returned to Sender' || r.status === 'Rejected');

  const displayList = activeTab === 'inbox' ? inboxReturns : activeTab === 'active' ? activeReturns : completedReturns;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <RotateCcw className="text-[#006D77]" /> Reverse Logistics
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage returns, failed deliveries, and refunds.</p>
        </div>
        <div className="flex bg-slate-200/60 p-1 rounded-xl flex-wrap gap-1">
          <button onClick={() => setActiveTab('inbox')} className={`px-4 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'inbox' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Inbox ({inboxReturns.length})
          </button>
          <button onClick={() => setActiveTab('active')} className={`px-4 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Active Returns ({activeReturns.length})
          </button>
          <button onClick={() => setActiveTab('completed')} className={`px-4 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'completed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Completed
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
        {/* LIST COLUMN */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-200px)]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                {activeTab === 'inbox' ? 'Action Required' : activeTab === 'active' ? 'In Transit Back' : 'History'}
              </h2>
              <span className="text-xs font-bold text-slate-400">{displayList.length} items</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {loading ? (
                <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
              ) : displayList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">No returns found in this view.</div>
              ) : (
                displayList.map(r => (
                  <button 
                    key={r._id} 
                    onClick={() => setSelectedReturn(r)}
                    className={`w-full text-left p-3 rounded-xl border transition ${selectedReturn?._id === r._id ? 'bg-[#006D77]/5 border-[#006D77]' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-xs font-bold text-slate-600">{r.booking?.trackingId || 'N/A'}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(r.status)}`}>{r.status}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm mb-1">{r.reason}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Truck size={12} /> {r.booking?.metadata?.vehicleType || 'Local'}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* DETAILS COLUMN */}
        <div className="lg:col-span-2">
          {selectedReturn ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right-4">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-black text-slate-900">{selectedReturn.booking?.trackingId}</h2>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusColor(selectedReturn.status)}`}>{selectedReturn.status}</span>
                  </div>
                  <p className="text-sm font-bold text-red-600 flex items-center gap-1.5 mt-2">
                    <AlertTriangle size={16} /> Reason: {selectedReturn.reason}
                  </p>
                </div>
                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {selectedReturn.status === 'Return Initiated' && (
                    <>
                      <button onClick={() => updateStatus(selectedReturn._id, 'Approved')} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 shadow-sm">Approve Return</button>
                      <button onClick={() => updateStatus(selectedReturn._id, 'Rejected')} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-bold rounded-lg hover:bg-red-100">Reject</button>
                    </>
                  )}
                  {selectedReturn.status === 'Approved' && (
                    <button onClick={() => updateStatus(selectedReturn._id, 'Source Hub Received')} className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg hover:bg-slate-700 shadow-sm">Mark Hub Received</button>
                  )}
                  {selectedReturn.status === 'Source Hub Received' && (
                    <button onClick={() => updateStatus(selectedReturn._id, 'Out for Return')} className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg hover:bg-slate-700 shadow-sm">Mark Out For Return</button>
                  )}
                  {selectedReturn.status === 'Out for Return' && (
                    <button onClick={() => setShowPodModal(true)} className="px-4 py-2 bg-[#FFB703] text-slate-900 text-sm font-black rounded-lg hover:bg-[#e5a400] shadow-sm flex items-center gap-2">
                      <CheckCircle size={16} /> Capture POD
                    </button>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Financials */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2"><DollarSign size={14}/> Return Financials</h3>
                    <div className="space-y-3 font-mono text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Original Total Paid:</span>
                        <span className="font-bold">₹{selectedReturn.booking?.pricing?.total}</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>Reverse Journey Charge:</span>
                        <span className="font-bold">₹{selectedReturn.returnCharges}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex justify-between">
                        <span className="font-bold text-slate-900">Final Refund/Adjustment:</span>
                        <span className={`font-black ${selectedReturn.refundAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedReturn.refundAdjustment >= 0 ? '+' : '-'}₹{Math.abs(selectedReturn.refundAdjustment)}
                        </span>
                      </div>
                    </div>
                    {selectedReturn.refundAdjustment < 0 && (
                      <p className="text-xs text-slate-500 mt-2 italic">* Negative value means customer will be charged for return.</p>
                    )}
                  </div>

                  {/* Booking Details */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2"><Package size={14}/> Parcel Info</h3>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2">
                        <span className="text-slate-500">Category:</span>
                        <span className="font-bold text-slate-900">{selectedReturn.booking?.packageDetails?.category}</span>
                      </div>
                      <div className="grid grid-cols-2">
                        <span className="text-slate-500">Weight:</span>
                        <span className="font-bold text-slate-900">{selectedReturn.booking?.packageDetails?.weight} kg</span>
                      </div>
                      <div className="grid grid-cols-2">
                        <span className="text-slate-500">Declared Value:</span>
                        <span className="font-bold text-slate-900">₹{selectedReturn.booking?.packageDetails?.value}</span>
                      </div>
                      {selectedReturn.notes && (
                        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-xs font-medium">
                          <strong>Notes:</strong> {selectedReturn.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Routing Flow */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2"><MapPin size={14}/> Reverse Route</h3>
                  <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                    <div className="text-center min-w-[120px]">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Failed At</div>
                      <div className="font-bold text-slate-900 text-sm truncate" title={selectedReturn.booking?.dropLocation?.address}>
                        {selectedReturn.booking?.dropLocation?.pincode}
                      </div>
                    </div>
                    <ArrowRight className="text-slate-300 shrink-0" />
                    <div className="text-center min-w-[120px]">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Dest Hub</div>
                      <div className="font-bold text-slate-700 text-sm">Reverse Scan</div>
                    </div>
                    <ArrowRight className="text-slate-300 shrink-0" />
                    <div className="text-center min-w-[120px]">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Source Hub</div>
                      <div className="font-bold text-slate-700 text-sm">Return Sort</div>
                    </div>
                    <ArrowRight className="text-slate-300 shrink-0" />
                    <div className="text-center min-w-[120px] bg-green-50 p-2 rounded-lg border border-green-200">
                      <div className="text-[10px] font-bold text-green-600 uppercase mb-1">Return To</div>
                      <div className="font-bold text-slate-900 text-sm truncate" title={selectedReturn.booking?.pickupLocation?.address}>
                        {selectedReturn.booking?.pickupLocation?.pincode}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Proof of Return Delivery */}
                {selectedReturn.proofOfReturn?.timestamp && (
                  <div>
                    <h3 className="text-xs font-bold text-green-600 uppercase tracking-wide mb-3 flex items-center gap-2"><CheckCircle size={14}/> Proof of Return</h3>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] font-bold text-green-800 uppercase mb-1">Delivered At</div>
                        <div className="text-sm font-bold">{new Date(selectedReturn.proofOfReturn.timestamp).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-green-800 uppercase mb-1">GPS Coordinates</div>
                        <div className="text-sm font-mono font-bold">{selectedReturn.proofOfReturn.gps?.lat}, {selectedReturn.proofOfReturn.gps?.lng}</div>
                      </div>
                      <div className="col-span-2 text-xs font-medium text-green-700 italic">
                        Signature and photo assets linked in database.
                      </div>
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[calc(100vh-200px)] flex flex-col items-center justify-center text-slate-400">
              <RotateCcw size={48} className="mb-4 text-slate-200" />
              <p>Select a return request from the list to view details.</p>
            </div>
          )}
        </div>
      </div>

      {/* POD Modal */}
      {showPodModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle size={18} className="text-[#FFB703]" /> Capture Return POD
              </h2>
              <button onClick={() => setShowPodModal(false)} className="text-slate-400 hover:text-slate-700"><X size={22} /></button>
            </div>
            <form onSubmit={submitPod} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Signature URL</label>
                <input required type="text" value={podData.signatureUrl} onChange={e => setPodData({...podData, signatureUrl: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Photo URL (Package condition)</label>
                <input required type="text" value={podData.photoUrl} onChange={e => setPodData({...podData, photoUrl: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">GPS Lat</label>
                  <input required type="number" step="any" value={podData.lat} onChange={e => setPodData({...podData, lat: e.target.value})} className="w-full px-3 py-2 border rounded-lg font-mono" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">GPS Lng</label>
                  <input required type="number" step="any" value={podData.lng} onChange={e => setPodData({...podData, lng: e.target.value})} className="w-full px-3 py-2 border rounded-lg font-mono" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 mt-2 bg-[#FFB703] hover:bg-[#e5a400] text-slate-900 font-black rounded-xl transition shadow-sm">Complete Return</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
