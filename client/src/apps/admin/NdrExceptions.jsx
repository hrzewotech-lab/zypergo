import React, { useState, useEffect } from 'react';
import {
  AlertCircle, MessageSquare, Clock, MapPin, Search, CheckCircle, 
  XCircle, Truck, Package, RotateCcw, AlertTriangle, Filter, Loader2, ArrowRight
} from 'lucide-react';
import api from '../../api';

export default function NdrExceptions() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [exceptions, setExceptions] = useState([]);
  const [agingData, setAgingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedException, setSelectedException] = useState(null);
  
  // Resolution Form
  const [resolutionAction, setResolutionAction] = useState('Reattempt');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [exRes, agingRes] = await Promise.all([
        api.get('/ndr'),
        api.get('/ndr/aging')
      ]);
      setExceptions(exRes.data.data || []);
      setAgingData(agingRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    setResolving(true);
    try {
      await api.put(`/ndr/${selectedException._id}/resolve`, {
        action: resolutionAction,
        notes: resolutionNotes
      });
      setSelectedException(null);
      setResolutionNotes('');
      fetchData();
    } catch (err) {
      alert('Failed to resolve exception.');
    } finally {
      setResolving(false);
    }
  };

  const getTypeColor = (type) => {
    if (type === 'Delivery NDR') return 'bg-orange-100 text-orange-800 border-orange-200';
    if (type === 'Pickup Exception') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (type === 'Partner Exception') return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const openExceptions = exceptions.filter(e => e.status === 'Open' || e.status === 'Action Required');
  const resolvedExceptions = exceptions.filter(e => e.status === 'Resolved' || e.status === 'Closed');

  const displayList = activeTab === 'inbox' ? openExceptions : resolvedExceptions;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <AlertCircle className="text-red-500" /> NDR & Exceptions Engine
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage Non-Delivery Reports, rider exceptions, and operational delays.</p>
        </div>
        <div className="flex bg-slate-200/60 p-1 rounded-xl flex-wrap gap-1">
          <button onClick={() => setActiveTab('inbox')} className={`px-4 py-2 text-sm font-bold rounded-lg transition flex items-center gap-2 ${activeTab === 'inbox' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Action Center {openExceptions.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{openExceptions.length}</span>}
          </button>
          <button onClick={() => setActiveTab('aging')} className={`px-4 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'aging' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Aging Report
          </button>
          <button onClick={() => setActiveTab('resolved')} className={`px-4 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'resolved' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Resolved
          </button>
        </div>
      </div>

      {activeTab === 'aging' ? (
        <div className="space-y-6 animate-in fade-in">
          <h2 className="font-bold text-slate-800 flex items-center gap-2"><Clock size={18} /> Open Exception Aging</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">0 - 24 Hours</div>
              <div className="text-4xl font-black text-green-500">{agingData?.['0-24h'] || 0}</div>
              <div className="text-xs text-slate-500 mt-2">Within SLA</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">24 - 48 Hours</div>
              <div className="text-4xl font-black text-amber-500">{agingData?.['24-48h'] || 0}</div>
              <div className="text-xs text-slate-500 mt-2">Approaching SLA</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">48 - 72 Hours</div>
              <div className="text-4xl font-black text-orange-500">{agingData?.['48-72h'] || 0}</div>
              <div className="text-xs text-slate-500 mt-2 font-bold text-orange-600">SLA Breached</div>
            </div>
            <div className="bg-white p-6 rounded-xl border-2 border-red-200 shadow-sm text-center bg-red-50">
              <div className="text-sm font-bold text-red-500 uppercase tracking-wide mb-2 flex items-center justify-center gap-1"><AlertTriangle size={14}/> 72+ Hours</div>
              <div className="text-4xl font-black text-red-600">{agingData?.['72h+'] || 0}</div>
              <div className="text-xs text-red-500 mt-2 font-bold">Critical Escalations</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          {/* LIST COLUMN */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-200px)]">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="relative flex-1 mr-4">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search AWB or Reason..." className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-[#006D77]" />
                </div>
                <button className="p-1.5 text-slate-400 hover:bg-slate-200 rounded"><Filter size={16} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {loading ? (
                  <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
                ) : displayList.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">No exceptions found.</div>
                ) : (
                  displayList.map(e => (
                    <button 
                      key={e._id} 
                      onClick={() => setSelectedException(e)}
                      className={`w-full text-left p-3 rounded-xl border transition ${selectedException?._id === e._id ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono text-xs font-bold text-slate-600">{e.booking?.trackingId || 'N/A'}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTypeColor(e.type)}`}>{e.type}</span>
                      </div>
                      <div className="font-bold text-slate-900 text-sm mb-1">{e.reason}</div>
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(e.createdAt).toLocaleDateString()}</span>
                        {e.reattemptCount > 0 && <span className="font-bold text-orange-600">Reattempts: {e.reattemptCount}</span>}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* DETAILS & RESOLUTION COLUMN */}
          <div className="lg:col-span-2">
            {selectedException ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[calc(100vh-200px)] flex flex-col animate-in slide-in-from-right-4">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start shrink-0">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-black text-slate-900">{selectedException.booking?.trackingId}</h2>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getTypeColor(selectedException.type)}`}>{selectedException.type}</span>
                      {selectedException.status === 'Resolved' && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-green-100 text-green-800 border-green-200">Resolved</span>}
                    </div>
                    <p className="text-lg font-bold text-red-600 flex items-center gap-1.5 mt-2">
                      <AlertTriangle size={18} /> {selectedException.reason}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-bold uppercase">Attempts</div>
                    <div className="text-2xl font-black text-slate-800">{selectedException.reattemptCount} <span className="text-sm text-slate-400">/ 3</span></div>
                  </div>
                </div>

                {/* Split Pane Body */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Left: Evidence & Parcel */}
                    <div className="space-y-6">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2"><MapPin size={14}/> Operational Evidence</h3>
                        <div className="space-y-4">
                          {selectedException.evidence?.photoUrl ? (
                            <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden border border-slate-300 relative">
                              {/* Using placeholder since real image might not exist */}
                              <img src={`https://placehold.co/600x400/png?text=Exception+Photo`} alt="Evidence" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="p-4 bg-slate-100 rounded-lg text-xs text-slate-500 text-center italic border border-slate-200 border-dashed">No photo evidence uploaded.</div>
                          )}
                          
                          {selectedException.evidence?.notes && (
                            <div className="p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 italic">
                              "{selectedException.evidence.notes}"
                            </div>
                          )}
                          
                          {selectedException.evidence?.gps?.lat && (
                            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#006D77] bg-[#006D77]/5 p-2 rounded border border-[#006D77]/20">
                              <MapPin size={14} /> Lat: {selectedException.evidence.gps.lat}, Lng: {selectedException.evidence.gps.lng}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2"><Package size={14}/> Parcel Info</h3>
                        <div className="space-y-2 text-sm">
                          <div className="grid grid-cols-2"><span className="text-slate-500">Destination:</span><span className="font-bold text-slate-900 truncate" title={selectedException.booking?.dropLocation?.address}>{selectedException.booking?.dropLocation?.address}</span></div>
                          <div className="grid grid-cols-2"><span className="text-slate-500">Receiver:</span><span className="font-bold text-slate-900">{selectedException.booking?.receiver?.name} ({selectedException.booking?.receiver?.phone})</span></div>
                          <div className="grid grid-cols-2"><span className="text-slate-500">Category:</span><span className="font-bold text-slate-900">{selectedException.booking?.packageDetails?.category}</span></div>
                          <div className="grid grid-cols-2"><span className="text-slate-500">COD/Payment:</span><span className="font-bold text-slate-900">{selectedException.booking?.payment?.mode} - {selectedException.booking?.payment?.status}</span></div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Resolution Panel */}
                    <div>
                      {selectedException.status === 'Resolved' || selectedException.status === 'Closed' ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6 h-full flex flex-col justify-center">
                          <CheckCircle size={48} className="text-green-500 mb-4" />
                          <h3 className="text-xl font-black text-green-900 mb-2">Exception Resolved</h3>
                          <div className="space-y-3 mt-4">
                            <div>
                              <div className="text-xs font-bold text-green-700 uppercase">Action Taken</div>
                              <div className="text-lg font-bold text-slate-900">{selectedException.resolution?.action}</div>
                            </div>
                            <div>
                              <div className="text-xs font-bold text-green-700 uppercase">Resolution Notes</div>
                              <div className="text-sm font-medium text-slate-700 bg-white p-3 rounded-lg border border-green-100 mt-1">{selectedException.resolution?.notes || 'No notes provided.'}</div>
                            </div>
                            <div>
                              <div className="text-xs font-bold text-green-700 uppercase">Resolved At</div>
                              <div className="text-sm font-bold text-slate-900">{new Date(selectedException.resolution?.resolvedAt).toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleResolve} className="bg-white border-2 border-blue-100 rounded-xl p-5 shadow-sm h-full flex flex-col">
                          <h3 className="text-sm font-black text-blue-900 uppercase tracking-wide mb-4 flex items-center gap-2"><CheckCircle size={16}/> Resolution Action</h3>
                          
                          <div className="space-y-5 flex-1">
                            <div>
                              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Select Action</label>
                              <div className="grid grid-cols-2 gap-2">
                                {['Reattempt', 'Reschedule', 'Address Update', 'Return to Sender', 'Refund', 'Damage Claim'].map(act => (
                                  <button
                                    key={act}
                                    type="button"
                                    onClick={() => setResolutionAction(act)}
                                    className={`py-2 px-3 text-xs font-bold rounded-lg border text-left transition ${resolutionAction === act ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                                  >
                                    {act}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Communication & Internal Notes</label>
                              <textarea 
                                required
                                rows={4}
                                value={resolutionNotes}
                                onChange={e => setResolutionNotes(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none resize-none" 
                                placeholder="e.g. Spoke to customer, confirmed they will be home tomorrow at 2 PM. Scheduled reattempt."
                              />
                            </div>
                          </div>

                          <div className="pt-4 mt-4 border-t border-slate-100">
                            <button type="submit" disabled={resolving} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-xl transition shadow-sm flex justify-center items-center gap-2">
                              {resolving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                              Apply Resolution
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[calc(100vh-200px)] flex flex-col items-center justify-center text-slate-400">
                <AlertCircle size={48} className="mb-4 text-slate-200" />
                <p>Select an exception from the list to view evidence and resolve.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
