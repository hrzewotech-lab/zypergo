import React, { useState, useEffect, useRef } from 'react';
import {
  Scan, FileText, Plus, Search, RefreshCcw, CheckCircle, AlertTriangle, X,
  Download, Printer, Package, ChevronDown, Clock, MapPin, Loader2,
  Filter, Zap, Copy, ListOrdered
} from 'lucide-react';
import api from '../../api';

const SCAN_TYPES = [
  { value: 'Pickup', label: 'Pickup', color: '#3B82F6' },
  { value: 'SourceHubReceive', label: 'Source Hub Receive', color: '#10B981' },
  { value: 'Sort', label: 'Sort', color: '#F59E0B' },
  { value: 'PartnerHandover', label: 'Partner Handover', color: '#8B5CF6' },
  { value: 'PartnerAccept', label: 'Partner Accept', color: '#6366F1' },
  { value: 'DestinationHubReceive', label: 'Destination Hub Receive', color: '#EC4899' },
  { value: 'OutForDelivery', label: 'Out for Delivery', color: '#F97316' },
  { value: 'Delivered', label: 'Delivered', color: '#22C55E' },
  { value: 'Return', label: 'Return', color: '#EF4444' }
];

const MANIFEST_TYPES = [
  'Pickup', 'HubReceiving', 'PartnerHandover', 'IntercityTransport',
  'DestinationReceiving', 'LastMileDelivery', 'Return'
];

export default function ScanningManifest() {
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'manifests'
  const [hubs, setHubs] = useState([]);

  // Scan Desk state
  const [scanInput, setScanInput] = useState('');
  const [scanType, setScanType] = useState('SourceHubReceive');
  const [scanHubId, setScanHubId] = useState('');
  const [parcelCondition, setParcelCondition] = useState('Good');
  const [scanNotes, setScanNotes] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [unscannedAlerts, setUnscannedAlerts] = useState([]);
  const scanInputRef = useRef(null);

  // Manifest state
  const [manifests, setManifests] = useState([]);
  const [manifestLoading, setManifestLoading] = useState(true);
  const [showCreateManifest, setShowCreateManifest] = useState(false);
  const [selectedManifest, setSelectedManifest] = useState(null);
  const [newManifest, setNewManifest] = useState({
    manifestType: 'HubReceiving', type: 'Bag',
    sourceHub: '', destinationHub: '', route: '', notes: '', parcels: ''
  });

  useEffect(() => {
    fetchHubs();
    fetchManifests();
    fetchUnscannedAlerts();
    if (activeTab === 'scan' && scanInputRef.current) scanInputRef.current.focus();
  }, []);

  const fetchHubs = async () => {
    try { const r = await api.get('/hub'); setHubs(r.data.data || []); } catch {}
  };

  const fetchManifests = async () => {
    setManifestLoading(true);
    try {
      const r = await api.get('/manifest');
      setManifests(r.data.data || []);
    } catch (e) { console.error(e); }
    finally { setManifestLoading(false); }
  };

  const fetchUnscannedAlerts = async () => {
    try {
      const r = await api.get('/scan/alerts/unscanned');
      setUnscannedAlerts(r.data.data || []);
    } catch {}
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    setScanLoading(true);
    setScanResult(null);
    try {
      const res = await api.post('/scan', {
        trackingId: scanInput.trim(),
        scanType,
        hubId: scanHubId || undefined,
        parcelCondition,
        notes: scanNotes || undefined
      });
      const result = {
        type: 'success',
        data: res.data.data,
        warning: res.data.warning,
        trackingId: scanInput.trim()
      };
      setScanResult(result);
      setRecentScans(prev => [{ ...result, id: Date.now() }, ...prev.slice(0, 9)]);
      setScanInput('');
      setScanNotes('');
    } catch (err) {
      const errData = err.response?.data;
      setScanResult({
        type: errData?.warning === 'DUPLICATE_SCAN' ? 'duplicate' : 'error',
        message: errData?.error || 'Scan failed',
        trackingId: scanInput.trim()
      });
    } finally {
      setScanLoading(false);
      setTimeout(() => scanInputRef.current?.focus(), 100);
    }
  };

  const handleCreateManifest = async (e) => {
    e.preventDefault();
    try {
      const parcelIds = newManifest.parcels.split(',').map(s => s.trim()).filter(Boolean);
      await api.post('/manifest', {
        manifestType: newManifest.manifestType,
        type: newManifest.type,
        sourceHub: newManifest.sourceHub || undefined,
        destinationHub: newManifest.destinationHub || undefined,
        route: newManifest.route || undefined,
        notes: newManifest.notes || undefined,
        parcels: parcelIds
      });
      setShowCreateManifest(false);
      setNewManifest({ manifestType: 'HubReceiving', type: 'Bag', sourceHub: '', destinationHub: '', route: '', notes: '', parcels: '' });
      fetchManifests();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create manifest.');
    }
  };

  const handleSealManifest = async (id) => {
    try { await api.put(`/manifest/${id}/seal`); fetchManifests(); if (selectedManifest?._id === id) fetchManifestDetail(id); }
    catch (err) { alert(err.response?.data?.error || 'Failed to seal'); }
  };

  const handleDispatchManifest = async (id) => {
    try { await api.put(`/manifest/${id}/dispatch`); fetchManifests(); if (selectedManifest?._id === id) fetchManifestDetail(id); }
    catch (err) { alert(err.response?.data?.error || 'Failed to dispatch'); }
  };

  const fetchManifestDetail = async (id) => {
    try { const r = await api.get(`/manifest/${id}`); setSelectedManifest(r.data.data); }
    catch {}
  };

  const handlePrintManifest = async (id) => {
    try {
      const r = await api.get(`/manifest/${id}/pdf`);
      const d = r.data.data;
      const win = window.open('', '_blank');
      win.document.write(`
        <html><head><title>Manifest ${d.manifestId}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 32px; color: #0f172a; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #006D77; padding-bottom: 16px; margin-bottom: 24px; }
          .logo { font-size: 28px; font-weight: 900; color: #006D77; }
          .badge { background: #006D77; color: white; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; }
          h2 { margin: 0 0 4px; font-size: 18px; }
          .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
          .meta-item label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; }
          .meta-item span { font-size: 14px; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; }
          td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          .totals { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; display: flex; gap: 32px; margin-bottom: 24px; }
          .sig-area { border: 1px dashed #94a3b8; border-radius: 8px; padding: 32px; text-align: center; color: #94a3b8; font-size: 12px; }
          @media print { body { padding: 16px; } }
        </style></head><body>
        <div class="header">
          <div><div class="logo">ZyperGo</div><p style="margin:4px 0 0;color:#64748b;font-size:13px;">Logistics Intelligence Platform</p></div>
          <div style="text-align:right;">
            <h2>${d.manifestId}</h2>
            <span class="badge">${d.manifestType} Manifest</span>
            <p style="margin:8px 0 0;font-size:12px;color:#64748b;">${new Date(d.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <div class="meta">
          <div class="meta-item"><label>Source Hub</label><span>${d.sourceHub?.name || 'N/A'}</span></div>
          <div class="meta-item"><label>Destination Hub</label><span>${d.destinationHub?.name || 'N/A'}</span></div>
          <div class="meta-item"><label>Route</label><span>${d.route || 'N/A'}</span></div>
          <div class="meta-item"><label>Operator</label><span>${d.operator?.name || 'N/A'}</span></div>
          <div class="meta-item"><label>Status</label><span>${d.status}</span></div>
          <div class="meta-item"><label>Partner</label><span>${d.assignedPartner?.name || 'N/A'}</span></div>
        </div>
        <div class="totals">
          <div><strong style="font-size:22px;color:#006D77;">${d.parcelCount}</strong><br><span style="font-size:12px;color:#64748b;">Total Parcels</span></div>
          <div><strong style="font-size:22px;color:#006D77;">${d.totalWeight?.toFixed(2)} kg</strong><br><span style="font-size:12px;color:#64748b;">Total Weight</span></div>
        </div>
        <table>
          <thead><tr><th>#</th><th>Tracking ID</th><th>Receiver</th><th>Destination</th><th>Weight</th><th>Status</th></tr></thead>
          <tbody>${(d.parcels || []).map((p, i) => `
            <tr>
              <td>${i + 1}</td>
              <td style="font-family:monospace;font-weight:700;">${p.trackingId || 'N/A'}</td>
              <td>${p.receiver?.name || 'N/A'} <br><small>${p.receiver?.phone || ''}</small></td>
              <td>${p.destination || 'N/A'}</td>
              <td>${p.weight} kg</td>
              <td>${p.status || 'N/A'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
        ${d.notes ? `<p><strong>Notes:</strong> ${d.notes}</p>` : ''}
        <div class="sig-area">Digital Signature / Operator Sign Here<br>${d.operator?.name || ''} — ${d.operator?.phone || ''}</div>
        <script>window.onload = () => window.print();</script>
        </body></html>
      `);
      win.document.close();
    } catch (err) { alert('Failed to generate print view'); }
  };

  const statusColor = (s) => {
    const m = { Created: 'bg-slate-100 text-slate-600', Sealed: 'bg-blue-50 text-blue-700', Dispatched: 'bg-amber-50 text-amber-700', 'In Transit': 'bg-purple-50 text-purple-700', Received: 'bg-teal-50 text-teal-700', Completed: 'bg-green-50 text-green-700' };
    return m[s] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Scanning & Manifest</h1>
          <p className="text-slate-500 text-sm mt-1">Process parcel scans and manage movement manifests.</p>
        </div>
        <div className="flex bg-slate-200/50 p-1 rounded-lg">
          <button onClick={() => setActiveTab('scan')} className={`px-4 py-2 text-sm font-bold rounded-md transition flex items-center gap-2 ${activeTab === 'scan' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <Scan size={16} /> Scan Desk
          </button>
          <button onClick={() => setActiveTab('manifests')} className={`px-4 py-2 text-sm font-bold rounded-md transition flex items-center gap-2 ${activeTab === 'manifests' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <FileText size={16} /> Manifests
          </button>
        </div>
      </div>

      {/* SCAN DESK TAB */}
      {activeTab === 'scan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">

          {/* Left: Scan Form */}
          <div className="lg:col-span-2 space-y-4">
            <form onSubmit={handleScan} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Scan size={20} className="text-[#006D77]" /> Scan Parcel</h2>

              {/* Tracking ID input - big and prominent */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tracking ID / AWB (Scan Barcode or Type)</label>
                <input
                  ref={scanInputRef}
                  type="text"
                  value={scanInput}
                  onChange={e => setScanInput(e.target.value)}
                  className="w-full px-5 py-4 text-xl font-black font-mono border-2 border-slate-200 rounded-xl focus:border-[#006D77] outline-none bg-slate-50"
                  placeholder="Scan or enter AWB..."
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Scan Type / Checkpoint</label>
                  <select value={scanType} onChange={e => setScanType(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium">
                    {SCAN_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Hub Context</label>
                  <select value={scanHubId} onChange={e => setScanHubId(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium">
                    <option value="">-- Select Hub (Optional) --</option>
                    {hubs.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Parcel Condition</label>
                  <select value={parcelCondition} onChange={e => setParcelCondition(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium">
                    <option>Good</option>
                    <option>Damaged</option>
                    <option>Tampered</option>
                    <option>Wet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Notes (Optional)</label>
                  <input type="text" value={scanNotes} onChange={e => setScanNotes(e.target.value)} placeholder="Condition notes..." className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium" />
                </div>
              </div>

              <button type="submit" disabled={scanLoading || !scanInput.trim()} className="w-full py-4 bg-[#006D77] hover:bg-[#005f6a] text-white font-black text-lg rounded-xl transition flex items-center justify-center gap-3 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                {scanLoading ? <Loader2 size={22} className="animate-spin" /> : <Zap size={22} />}
                {scanLoading ? 'Processing...' : 'Process Scan'}
              </button>
            </form>

            {/* Scan Result */}
            {scanResult && (
              <div className={`rounded-xl p-5 border flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                scanResult.type === 'success' ? 'bg-green-50 border-green-200' :
                scanResult.type === 'duplicate' ? 'bg-amber-50 border-amber-200' :
                'bg-red-50 border-red-200'
              }`}>
                {scanResult.type === 'success' ? <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={24} /> :
                 scanResult.type === 'duplicate' ? <Copy className="text-amber-600 shrink-0 mt-0.5" size={24} /> :
                 <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={24} />}
                <div>
                  <div className={`font-bold text-lg ${scanResult.type === 'success' ? 'text-green-800' : scanResult.type === 'duplicate' ? 'text-amber-800' : 'text-red-800'}`}>
                    {scanResult.type === 'success' ? `✓ Scan Successful` :
                     scanResult.type === 'duplicate' ? `⚠ Duplicate Scan Detected` :
                     `✗ Scan Failed`}
                  </div>
                  {scanResult.type === 'success' && (
                    <div className="text-sm text-green-700 mt-1 space-y-1">
                      <p><strong>Tracking ID:</strong> {scanResult.data?.trackingId}</p>
                      <p><strong>New Status:</strong> {scanResult.data?.newStatus}</p>
                      <p><strong>Checkpoint:</strong> {scanResult.data?.scanType}</p>
                      <p><strong>Condition:</strong> {scanResult.data?.parcelCondition}</p>
                      {scanResult.warning && <p className="text-amber-700 font-bold mt-2">⚠ {scanResult.warning}</p>}
                    </div>
                  )}
                  {(scanResult.type === 'duplicate' || scanResult.type === 'error') && (
                    <p className="text-sm mt-1">{scanResult.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Stats & Recent Scans */}
          <div className="space-y-4">
            {/* Unscanned Alerts */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500" /> Unscanned Alerts</h3>
                <button onClick={fetchUnscannedAlerts} className="text-slate-400 hover:text-slate-600"><RefreshCcw size={14} /></button>
              </div>
              {unscannedAlerts.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-3">No stuck parcels 🎉</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {unscannedAlerts.slice(0, 5).map(b => (
                    <div key={b._id} className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <div className="font-bold text-amber-900 text-xs font-mono">{b.trackingId}</div>
                      <div className="text-xs text-amber-700 mt-0.5">Status: {b.status}</div>
                      <div className="text-xs text-amber-600 mt-0.5">Since: {new Date(b.updatedAt).toLocaleDateString()}</div>
                    </div>
                  ))}
                  {unscannedAlerts.length > 5 && (
                    <p className="text-xs text-center text-amber-700 font-bold">+{unscannedAlerts.length - 5} more alerts</p>
                  )}
                </div>
              )}
            </div>

            {/* Recent Scans */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Clock size={16} className="text-[#006D77]" /> Recent Scans</h3>
              {recentScans.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-3">No scans yet in this session</p>
              ) : (
                <div className="space-y-2">
                  {recentScans.map(s => (
                    <div key={s.id} className={`p-3 rounded-lg text-xs flex items-center gap-2 ${s.type === 'success' ? 'bg-green-50' : s.type === 'duplicate' ? 'bg-amber-50' : 'bg-red-50'}`}>
                      {s.type === 'success' ? <CheckCircle size={14} className="text-green-600 shrink-0" /> : <AlertTriangle size={14} className="text-red-500 shrink-0" />}
                      <div>
                        <div className="font-bold font-mono">{s.trackingId}</div>
                        {s.data && <div className="text-slate-600">{s.data.newStatus}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MANIFESTS TAB */}
      {activeTab === 'manifests' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button onClick={fetchManifests} className="p-2 text-slate-400 hover:text-[#006D77] bg-white border border-slate-200 rounded-lg transition">
                <RefreshCcw size={18} className={manifestLoading ? 'animate-spin' : ''} />
              </button>
              <span className="text-sm text-slate-500 font-medium">{manifests.length} manifests found</span>
            </div>
            <button onClick={() => setShowCreateManifest(true)} className="bg-[#006D77] hover:bg-[#005f6a] text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm">
              <Plus size={18} /> Create Manifest
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Manifest List */}
            <div className="xl:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <p className="text-xs font-bold text-slate-500 uppercase">All Manifests</p>
              </div>
              {manifests.length === 0 && !manifestLoading ? (
                <p className="text-slate-400 text-center py-8 font-medium">No manifests yet</p>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                  {manifests.map(m => (
                    <button key={m._id} onClick={() => fetchManifestDetail(m._id)}
                      className={`w-full text-left p-4 hover:bg-slate-50 transition ${selectedManifest?._id === m._id ? 'bg-[#006D77]/5 border-l-2 border-[#006D77]' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-xs font-mono text-slate-900">{m.manifestId}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{m.manifestType}</div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor(m.status)}`}>{m.status}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Package size={12} /> {m.parcelCount} parcels</span>
                        <span>{m.totalWeight?.toFixed(1)} kg</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Manifest Detail */}
            <div className="xl:col-span-2">
              {selectedManifest ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                    <div>
                      <div className="font-black text-lg text-slate-900 font-mono">{selectedManifest.manifestId}</div>
                      <div className="text-sm text-slate-500 mt-1">{selectedManifest.manifestType} Manifest • {selectedManifest.type}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handlePrintManifest(selectedManifest._id)} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                        <Printer size={16} /> Print
                      </button>
                      {selectedManifest.status === 'Created' && (
                        <button onClick={() => handleSealManifest(selectedManifest._id)} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
                          Seal Manifest
                        </button>
                      )}
                      {selectedManifest.status === 'Sealed' && (
                        <button onClick={() => handleDispatchManifest(selectedManifest._id)} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition">
                          Dispatch
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-0 border-b border-slate-100">
                    {[
                      ['Status', selectedManifest.status],
                      ['Parcel Count', selectedManifest.parcelCount],
                      ['Total Weight', `${selectedManifest.totalWeight?.toFixed(2)} kg`],
                      ['Source Hub', selectedManifest.sourceHub?.name || 'N/A'],
                      ['Destination Hub', selectedManifest.destinationHub?.name || 'N/A'],
                      ['Route', selectedManifest.route || 'N/A'],
                      ['Operator', selectedManifest.operator?.name || 'N/A'],
                      ['Created', new Date(selectedManifest.createdAt).toLocaleString()],
                      ['Notes', selectedManifest.notes || '—']
                    ].map(([label, value]) => (
                      <div key={label} className="p-4 border-b border-r border-slate-100">
                        <p className="text-xs text-slate-400 font-bold uppercase">{label}</p>
                        <p className="text-sm font-bold text-slate-800 mt-1 truncate">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-xs text-slate-500 uppercase font-bold">
                          <th className="p-3 text-left">#</th>
                          <th className="p-3 text-left">Tracking ID</th>
                          <th className="p-3 text-left">Receiver</th>
                          <th className="p-3 text-left">Status</th>
                          <th className="p-3 text-left">Weight</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(selectedManifest.parcels || []).map((p, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-3 text-slate-400 font-bold text-xs">{i + 1}</td>
                            <td className="p-3 font-mono font-bold text-xs text-[#006D77]">{p.trackingId || p.bookingId?.trackingId || 'N/A'}</td>
                            <td className="p-3">
                              <div className="font-medium">{p.bookingId?.receiver?.name || 'N/A'}</div>
                              <div className="text-xs text-slate-400">{p.bookingId?.receiver?.phone || ''}</div>
                            </td>
                            <td className="p-3"><span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-bold">{p.bookingId?.status || 'N/A'}</span></td>
                            <td className="p-3 font-medium">{p.weight} kg</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center h-64">
                  <div className="text-center text-slate-400">
                    <FileText size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Select a manifest to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Manifest Modal */}
      {showCreateManifest && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Create Manifest</h2>
              <button onClick={() => setShowCreateManifest(false)} className="text-slate-400 hover:text-slate-700"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateManifest} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Manifest Type</label>
                  <select value={newManifest.manifestType} onChange={e => setNewManifest({ ...newManifest, manifestType: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium">
                    {MANIFEST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Container Type</label>
                  <select value={newManifest.type} onChange={e => setNewManifest({ ...newManifest, type: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium">
                    <option>Bag</option>
                    <option>Bundle</option>
                    <option>Consignment</option>
                    <option>Partner Manifest</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Source Hub</label>
                  <select value={newManifest.sourceHub} onChange={e => setNewManifest({ ...newManifest, sourceHub: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium">
                    <option value="">Select Hub</option>
                    {hubs.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Destination Hub</label>
                  <select value={newManifest.destinationHub} onChange={e => setNewManifest({ ...newManifest, destinationHub: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium">
                    <option value="">Select Hub</option>
                    {hubs.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Route</label>
                <input type="text" value={newManifest.route} onChange={e => setNewManifest({ ...newManifest, route: e.target.value })} placeholder="e.g. RT-HYD-04" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Booking IDs (Comma Separated)</label>
                <textarea required rows="3" value={newManifest.parcels} onChange={e => setNewManifest({ ...newManifest, parcels: e.target.value })} placeholder="Paste or scan booking IDs..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Notes</label>
                <input type="text" value={newManifest.notes} onChange={e => setNewManifest({ ...newManifest, notes: e.target.value })} placeholder="Optional notes..." className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium" />
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreateManifest(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-[#006D77] hover:bg-[#005f6a] rounded-lg transition shadow-md">Create Manifest</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
