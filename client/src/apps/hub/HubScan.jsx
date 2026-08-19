import React, { useState, useRef, useEffect } from 'react';
import { Scan, CheckCircle, AlertTriangle, RefreshCcw, Loader2 } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api';

const SCAN_TYPES = [
  { value: 'Pickup', label: 'Pickup', color: '#3B82F6' },
  { value: 'SourceHubReceive', label: 'Hub Receive', color: '#10B981' },
  { value: 'Sort', label: 'Sort', color: '#F59E0B' },
  { value: 'PartnerHandover', label: 'Partner Handover', color: '#8B5CF6' },
  { value: 'PartnerAccept', label: 'Partner Accept', color: '#6366F1' },
  { value: 'DestinationHubReceive', label: 'Dest. Hub Receive', color: '#EC4899' },
  { value: 'OutForDelivery', label: 'Out for Delivery', color: '#F97316' },
  { value: 'Delivered', label: 'Delivered', color: '#22C55E' },
  { value: 'Return', label: 'Return', color: '#EF4444' }
];

export default function HubScan() {
  const { selectedHub, fetchUnscannedAlerts } = useOutletContext();
  const [scanInput, setScanInput] = useState('');
  const [scanType, setScanType] = useState('SourceHubReceive');
  const [parcelCondition, setParcelCondition] = useState('Good');
  const [scanNotes, setScanNotes] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const scanInputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => scanInputRef.current?.focus(), 200);
  }, []);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    setScanLoading(true);
    setScanResult(null);
    try {
      const res = await api.post('/scan', {
        trackingId: scanInput.trim(),
        scanType,
        hubId: selectedHub?._id,
        parcelCondition,
        notes: scanNotes || undefined
      });
      const result = { type: 'success', data: res.data.data, warning: res.data.warning, trackingId: scanInput.trim(), ts: new Date() };
      setScanResult(result);
      setRecentScans(prev => [result, ...prev.slice(0, 9)]);
      setScanInput('');
      setScanNotes('');
      fetchUnscannedAlerts();
    } catch (err) {
      const errData = err.response?.data;
      const result = { type: errData?.warning === 'DUPLICATE_SCAN' ? 'duplicate' : 'error', message: errData?.error || 'Scan failed', trackingId: scanInput.trim(), ts: new Date() };
      setScanResult(result);
      setRecentScans(prev => [result, ...prev.slice(0, 9)]);
    } finally {
      setScanLoading(false);
      setTimeout(() => scanInputRef.current?.focus(), 100);
    }
  };

  if (!selectedHub) {
    return (
      <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/80 p-8 text-center text-slate-400 font-bold">
        No hub selected. Please select a hub from the header.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/50 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#006D77] to-[#83C5BE] text-white flex items-center justify-center shadow-lg">
              <Scan size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Scan Terminal</h2>
              <p className="text-slate-500 text-sm font-bold">Process inbound & outbound items</p>
            </div>
          </div>
          <form onSubmit={handleScan} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Scan Mode</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SCAN_TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => { setScanType(t.value); setTimeout(() => scanInputRef.current?.focus(), 100); }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${scanType === t.value ? 'bg-white shadow-md border-transparent text-slate-900 scale-105' : 'bg-transparent border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-white/30'}`}
                  >
                    <div className="w-2 h-2 rounded-full mb-1" style={{ backgroundColor: t.color }}></div>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Tracking Barcode</label>
              <div className="relative">
                <input
                  ref={scanInputRef}
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="Scan or type Tracking ID"
                  className="w-full bg-white text-slate-900 px-5 py-4 rounded-2xl border-2 border-slate-200 outline-none focus:border-[#006D77] focus:ring-4 focus:ring-[#006D77]/10 font-mono font-bold text-lg transition-all"
                  disabled={scanLoading}
                />
                <button type="submit" disabled={scanLoading || !scanInput.trim()} className="absolute right-2 top-2 bottom-2 bg-[#006D77] text-white px-6 rounded-xl font-black hover:bg-[#005a63] disabled:opacity-50 transition-colors flex items-center justify-center">
                  {scanLoading ? <Loader2 className="animate-spin" size={20}/> : 'ENTER'}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Condition</label>
                <select value={parcelCondition} onChange={(e) => setParcelCondition(e.target.value)} className="w-full bg-white text-slate-700 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#006D77] font-bold">
                  <option value="Good">Good</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Tampered">Tampered</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Notes (Opt)</label>
                <input type="text" value={scanNotes} onChange={(e) => setScanNotes(e.target.value)} placeholder="e.g. Box dented" className="w-full bg-white text-slate-700 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#006D77] font-bold"/>
              </div>
            </div>
          </form>

          {/* Current Scan Result */}
          {scanResult && (
            <div className={`mt-6 p-4 rounded-2xl border flex items-start gap-4 animate-in slide-in-from-bottom-2 ${scanResult.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : scanResult.type === 'duplicate' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              {scanResult.type === 'success' ? <CheckCircle className="text-green-500 mt-1" /> : scanResult.type === 'duplicate' ? <RefreshCcw className="text-amber-500 mt-1" /> : <AlertTriangle className="text-red-500 mt-1" />}
              <div>
                <h4 className="font-black text-base">{scanResult.type === 'success' ? 'Success' : scanResult.type === 'duplicate' ? 'Already Scanned' : 'Error'}</h4>
                <p className="text-sm font-medium opacity-90 mt-0.5">{scanResult.type === 'success' ? `Parcel ${scanResult.trackingId} marked as ${scanType}.` : scanResult.message}</p>
                {scanResult.warning && <p className="text-xs font-bold text-amber-600 mt-2 bg-amber-100/50 px-2 py-1 rounded inline-block">{scanResult.warning}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Recent Scans */}
        <div className="bg-white/30 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 shadow-sm flex flex-col h-full max-h-[600px]">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Recent Scans</h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {recentScans.length === 0 ? (
              <div className="text-center text-slate-400 py-10 font-bold">No recent scans</div>
            ) : (
              recentScans.map((rs, i) => (
                <div key={i} className="bg-white/60 border border-white/80 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${rs.type === 'success' ? 'bg-green-500' : rs.type === 'duplicate' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                    <div>
                      <div className="font-mono font-bold text-slate-800 text-sm">{rs.trackingId}</div>
                      <div className="text-[10px] text-slate-500 font-bold">{rs.ts.toLocaleTimeString()}</div>
                    </div>
                  </div>
                  {rs.type !== 'success' && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md max-w-[120px] truncate">{rs.message}</span>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
