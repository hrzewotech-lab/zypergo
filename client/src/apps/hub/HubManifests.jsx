import React, { useState, useEffect } from 'react';
import { FileText, Plus, RefreshCcw, Printer, ChevronRight, X } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api';

const MANIFEST_TYPES = ['Pickup', 'HubReceiving', 'PartnerHandover', 'IntercityTransport', 'DestinationReceiving', 'LastMileDelivery', 'Return'];

export default function HubManifests() {
  const { selectedHub, hubs } = useOutletContext();
  const [manifests, setManifests] = useState([]);
  const [manifestLoading, setManifestLoading] = useState(false);
  const [showCreateManifest, setShowCreateManifest] = useState(false);
  const [selectedManifest, setSelectedManifest] = useState(null);
  const [newManifest, setNewManifest] = useState({ manifestType: 'HubReceiving', type: 'Bag', destinationHub: '', route: '', notes: '', parcels: '' });

  useEffect(() => {
    fetchManifests();
  }, []);

  const fetchManifests = async () => {
    setManifestLoading(true);
    try {
      const r = await api.get('/manifest');
      setManifests(r.data.data || []);
    } catch {} finally { setManifestLoading(false); }
  };

  const fetchManifestDetail = async (id) => {
    try {
      const r = await api.get(`/manifest/${id}`);
      setSelectedManifest(r.data.data);
    } catch {}
  };

  const handleCreateManifest = async (e) => {
    e.preventDefault();
    try {
      const parcelIds = newManifest.parcels.split(',').map(s => s.trim()).filter(Boolean);
      await api.post('/manifest', {
        manifestType: newManifest.manifestType,
        type: newManifest.type,
        sourceHub: selectedHub?._id,
        destinationHub: newManifest.destinationHub || undefined,
        route: newManifest.route || undefined,
        notes: newManifest.notes || undefined,
        parcels: parcelIds
      });
      setShowCreateManifest(false);
      setNewManifest({ manifestType: 'HubReceiving', type: 'Bag', destinationHub: '', route: '', notes: '', parcels: '' });
      fetchManifests();
    } catch (err) { alert(err.response?.data?.error || 'Failed to create manifest.'); }
  };

  const handleSealManifest = async (id) => {
    try { await api.put(`/manifest/${id}/seal`); fetchManifests(); if (selectedManifest?._id === id) fetchManifestDetail(id); }
    catch (err) { alert(err.response?.data?.error || 'Failed to seal'); }
  };

  const handleDispatchManifest = async (id) => {
    try { await api.put(`/manifest/${id}/dispatch`); fetchManifests(); if (selectedManifest?._id === id) fetchManifestDetail(id); }
    catch (err) { alert(err.response?.data?.error || 'Failed to dispatch'); }
  };

  const handlePrintManifest = async (id) => {
    try {
      const r = await api.get(`/manifest/${id}/pdf`);
      const d = r.data.data;
      const win = window.open('', '_blank');
      win.document.write(`<html><head><title>${d.manifestId}</title>
        <style>body{font-family:sans-serif;padding:24px;color:#0f172a}table{width:100%;border-collapse:collapse}th{background:#f1f5f9;padding:8px;text-align:left;font-size:11px;text-transform:uppercase}td{padding:8px;border-bottom:1px solid #e2e8f0;font-size:13px}@media print{body{padding:12px}}</style>
        </head><body>
        <h1 style="color:#006D77;margin:0">${d.manifestId}</h1>
        <p><strong>${d.manifestType}</strong> • ${new Date(d.createdAt).toLocaleString()} • ${d.parcelCount} parcels • ${d.totalWeight?.toFixed(2)} kg</p>
        <table><thead><tr><th>#</th><th>Tracking ID</th><th>Receiver</th><th>Weight</th><th>Status</th></tr></thead>
        <tbody>${(d.parcels||[]).map((p,i)=>`<tr><td>${i+1}</td><td>${p.trackingId||'N/A'}</td><td>${p.receiver?.name||''}</td><td>${p.weight}kg</td><td>${p.status||'N/A'}</td></tr>`).join('')}</tbody></table>
        <div style="margin-top:40px;border-top:1px dashed #94a3b8;padding-top:16px">Operator: ${d.operator?.name||'—'} &nbsp;&nbsp; Signature: ___________</div>
        <script>window.onload=()=>window.print();</script></body></html>`);
      win.document.close();
    } catch { alert('Failed to generate print'); }
  };

  const statusBadge = (s) => {
    const m = { Created: 'bg-slate-100 text-slate-700', Sealed: 'bg-blue-100 text-blue-700', Dispatched: 'bg-amber-100 text-amber-700', 'In Transit': 'bg-purple-100 text-purple-700', Completed: 'bg-green-100 text-green-700' };
    return m[s] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-white/50 backdrop-blur-xl p-5 rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2"><FileText size={22} className="text-[#006D77]" /> Manifests</h1>
        <button onClick={() => setShowCreateManifest(true)} className="bg-[#006D77] hover:bg-[#005f6a] text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-all">
          <Plus size={16} /> Create
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* List */}
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/60 flex justify-between items-center">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">All Manifests</span>
            <button onClick={fetchManifests} className="text-slate-400 hover:text-[#006D77]"><RefreshCcw size={16} className={manifestLoading ? 'animate-spin' : ''} /></button>
          </div>
          <div className="divide-y divide-white/60 max-h-[500px] overflow-y-auto custom-scrollbar">
            {manifests.length === 0 && <p className="text-center text-slate-400 py-8 text-sm font-bold">No manifests yet</p>}
            {manifests.map(m => (
              <button key={m._id} onClick={() => fetchManifestDetail(m._id)} className={`w-full text-left p-5 hover:bg-white/80 transition-colors ${selectedManifest?._id === m._id ? 'bg-white shadow-sm' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="font-black text-[#006D77] text-sm">{m.manifestId}</div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm ${statusBadge(m.status)}`}>{m.status}</span>
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{m.manifestType} • {m.parcelCount} parcels • {m.totalWeight?.toFixed(1)} kg</div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {selectedManifest ? (
            <div className="bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-white/60 flex flex-wrap gap-4 justify-between items-center bg-white/40">
                <div>
                  <div className="font-black text-2xl text-slate-900 tracking-tight">{selectedManifest.manifestId}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 bg-white px-3 py-1 rounded-full shadow-sm inline-block">{selectedManifest.manifestType} • {selectedManifest.type}</div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => handlePrintManifest(selectedManifest._id)} className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-[#006D77] hover:border-[#006D77] transition-colors shadow-sm">
                    <Printer size={16} /> Print
                  </button>
                  {selectedManifest.status === 'Created' && <button onClick={() => handleSealManifest(selectedManifest._id)} className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm transition-colors">Seal</button>}
                  {selectedManifest.status === 'Sealed' && <button onClick={() => handleDispatchManifest(selectedManifest._id)} className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-amber-500 text-white rounded-xl hover:bg-amber-600 shadow-sm transition-colors">Dispatch</button>}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-white/60 bg-white/20">
                {[
                  ['Parcels', selectedManifest.parcelCount],
                  ['Weight', `${selectedManifest.totalWeight?.toFixed(2)} kg`],
                  ['Status', selectedManifest.status],
                  ['Source', selectedManifest.sourceHub?.name || 'N/A'],
                  ['Destination', selectedManifest.destinationHub?.name || 'N/A'],
                  ['Route', selectedManifest.route || 'N/A'],
                  ['Operator', selectedManifest.operator?.name || 'N/A']
                ].map(([l, v]) => (
                  <div key={l} className="p-4 border-r border-b border-white/60">
                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{l}</div>
                    <div className="text-sm font-bold text-slate-800 truncate mt-1">{v}</div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-white/40 border-b border-white/60">
                    <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                    <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">AWB</th>
                    <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Receiver</th>
                    <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination</th>
                    <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Weight</th>
                  </tr></thead>
                  <tbody className="divide-y divide-white/60">
                    {(selectedManifest.parcels || []).map((p, i) => (
                      <tr key={i} className="hover:bg-white/60 transition-colors">
                        <td className="p-4 text-xs text-slate-400 font-bold">{i + 1}</td>
                        <td className="p-4 font-mono font-bold text-sm text-[#006D77]">{p.trackingId || p.bookingId?.trackingId || 'N/A'}</td>
                        <td className="p-4">
                          <div className="font-bold text-sm text-slate-800">{p.bookingId?.receiver?.name || 'N/A'}</div>
                          <div className="text-[10px] text-slate-500 font-bold">{p.bookingId?.receiver?.phone}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-sm text-slate-700 truncate max-w-[160px]">{p.bookingId?.dropLocation?.address || 'N/A'}</div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-amber-600 mt-1 bg-amber-50 inline-block px-2 py-0.5 rounded shadow-sm border border-amber-100">Hub: {selectedManifest.destinationHub?.name || 'Auto-assigned'}</div>
                        </td>
                        <td className="p-4 text-sm font-bold text-slate-700">{p.weight} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center h-64">
              <div className="text-center text-slate-400">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm font-bold">Select a manifest to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreateManifest && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-lg">Create Manifest</h3>
              <button onClick={() => setShowCreateManifest(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleCreateManifest} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Operation Type</label>
                  <select value={newManifest.manifestType} onChange={e=>setNewManifest({...newManifest, manifestType: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-[#006D77] outline-none text-sm font-bold">
                    {MANIFEST_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Container Type</label>
                  <select value={newManifest.type} onChange={e=>setNewManifest({...newManifest, type: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-[#006D77] outline-none text-sm font-bold">
                    <option value="Bag">Bag</option><option value="Box">Box</option><option value="Consignment">Consignment</option>
                  </select>
                </div>
              </div>
              
              {newManifest.manifestType === 'IntercityTransport' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Destination Hub</label>
                  <select value={newManifest.destinationHub} onChange={e=>setNewManifest({...newManifest, destinationHub: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-[#006D77] outline-none text-sm font-bold">
                    <option value="">Select Hub</option>
                    {hubs.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Parcel Tracking IDs (comma separated)</label>
                <textarea rows="3" value={newManifest.parcels} onChange={e=>setNewManifest({...newManifest, parcels: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-[#006D77] outline-none font-mono text-sm" placeholder="ZYP123, ZYP456..."></textarea>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Notes (Optional)</label>
                <input type="text" value={newManifest.notes} onChange={e=>setNewManifest({...newManifest, notes: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-[#006D77] outline-none text-sm" />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreateManifest(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={!newManifest.parcels} className="px-5 py-2.5 text-sm font-bold text-white bg-[#006D77] hover:bg-[#005a63] rounded-xl transition-colors shadow-md disabled:opacity-50">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
