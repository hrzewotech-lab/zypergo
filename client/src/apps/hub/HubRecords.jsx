import React, { useState, useEffect } from 'react';
import { Activity, RefreshCcw, Loader2 } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api';

export default function HubRecords() {
  const { selectedHub } = useOutletContext();
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordFilter, setRecordFilter] = useState('');

  useEffect(() => {
    if (selectedHub) {
      fetchRecords(selectedHub._id);
    }
  }, [selectedHub, recordFilter]);

  const fetchRecords = async (hubId) => {
    setRecordsLoading(true);
    try {
      const url = `/hub/${hubId}/records${recordFilter ? `?recordType=${recordFilter}` : ''}`;
      const r = await api.get(url);
      setRecords(r.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setRecordsLoading(false);
    }
  };

  if (!selectedHub) {
    return (
      <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/80 p-8 text-center text-slate-400 font-bold mt-4">
        No hub selected. Please select a hub from the header.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-white/50 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hub Records</h1>
          <p className="text-slate-500 text-sm mt-1 font-bold">Detailed log of all inbound and outbound parcels for this hub.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={recordFilter}
            onChange={(e) => setRecordFilter(e.target.value)}
            className="bg-white/60 backdrop-blur-md text-slate-800 text-sm font-bold px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#006D77] shadow-sm hover:bg-white transition-colors"
          >
            <option value="">All Records</option>
            <option value="Inbound From Rider">Inbound From Rider</option>
            <option value="Outbound To Hub">Outbound To Hub</option>
            <option value="Inbound From Hub">Inbound From Hub</option>
            <option value="Outbound To Rider">Outbound To Rider</option>
          </select>
          <button onClick={() => fetchRecords(selectedHub._id)} className="p-2.5 bg-white/60 backdrop-blur-md border border-slate-200 rounded-xl hover:bg-white transition-colors text-slate-600 shadow-sm">
            <RefreshCcw size={18} className={recordsLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/40 border-b border-white/60">
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Tracking ID</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Type</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Date & Time</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Customer</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Destination</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Action By / Mode</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Related Hub</th>
              </tr>
            </thead>
            <tbody>
              {recordsLoading ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-500 font-bold"><Loader2 size={24} className="animate-spin mx-auto mb-2 text-[#006D77]"/>Loading records...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-500 font-bold">No records found for this hub.</td></tr>
              ) : (
                records.map((r, i) => (
                  <tr key={r._id} className={`border-b border-white/40 hover:bg-white/60 transition-colors ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/20'}`}>
                    <td className="p-4 font-mono text-sm font-bold text-slate-800 whitespace-nowrap">{r.trackingId}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block border ${r.recordType.includes('Inbound') ? 'bg-green-100 text-green-700 border-green-200' : r.recordType.includes('Outbound') ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {r.recordType}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-600 whitespace-nowrap">
                      {new Date(r.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {r.customerDetails?.name ? (
                        <div>
                          <div className="text-sm font-bold text-slate-800">{r.customerDetails.name}</div>
                          <div className="text-xs text-slate-500">{r.customerDetails.phone}</div>
                        </div>
                      ) : <span className="text-slate-400 text-sm">-</span>}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {r.destination?.address ? (
                        <div>
                          <div className="text-sm font-bold text-slate-800 truncate max-w-[150px]" title={r.destination.address}>{r.destination.address}</div>
                          <div className="text-xs text-slate-500">{r.destination.pincode}</div>
                        </div>
                      ) : <span className="text-slate-400 text-sm">-</span>}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {r.actionBy ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {r.actionBy.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800">{r.actionBy.name}</div>
                            <div className="text-[10px] text-slate-500 uppercase font-black">{r.actionBy.role || 'Rider'}</div>
                          </div>
                        </div>
                      ) : <span className="text-slate-400 text-sm">-</span>}
                      {r.modeOfTransfer && (
                        <div className="text-xs text-slate-500 mt-0.5">Mode: {r.modeOfTransfer}</div>
                      )}
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-800 whitespace-nowrap">
                      {r.associatedHub?.name || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
