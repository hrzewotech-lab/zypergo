import React, { useState, useEffect, useRef } from 'react';
import {
  Scan, FileText, Package, LayoutDashboard, LogOut, Warehouse,
  CheckCircle, AlertTriangle, RefreshCcw, Zap, Loader2, Clock,
  Copy, X, Plus, Printer, Power, BarChart3, Archive, Menu, Bell,
  ChevronRight, Activity, TrendingUp, MapPin, User
} from 'lucide-react';
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

const MANIFEST_TYPES = ['Pickup', 'HubReceiving', 'PartnerHandover', 'IntercityTransport', 'DestinationReceiving', 'LastMileDelivery', 'Return'];

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'scan', label: 'Scan Desk', icon: Scan },
  { id: 'manifests', label: 'Manifests', icon: FileText },
  { id: 'inventory', label: 'Hub Inventory', icon: Warehouse },
];

export default function HubManagerDashboard() {
  const [user, setUser] = useState({ name: 'Hub Manager', role: 'HubManager', phone: '' });
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hubs, setHubs] = useState([]);
  const [selectedHub, setSelectedHub] = useState(null);
  const [inventory, setInventory] = useState(null);

  // Scan state
  const [scanInput, setScanInput] = useState('');
  const [scanType, setScanType] = useState('SourceHubReceive');
  const [parcelCondition, setParcelCondition] = useState('Good');
  const [scanNotes, setScanNotes] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [unscannedAlerts, setUnscannedAlerts] = useState([]);
  const scanInputRef = useRef(null);

  // Manifest state
  const [manifests, setManifests] = useState([]);
  const [manifestLoading, setManifestLoading] = useState(false);
  const [showCreateManifest, setShowCreateManifest] = useState(false);
  const [selectedManifest, setSelectedManifest] = useState(null);
  const [newManifest, setNewManifest] = useState({ manifestType: 'HubReceiving', type: 'Bag', route: '', notes: '', parcels: '' });

  useEffect(() => {
    const saved = localStorage.getItem('zypergo_user');
    if (saved) setUser(JSON.parse(saved));
    fetchHubs();
    fetchManifests();
    fetchUnscannedAlerts();
  }, []);

  useEffect(() => {
    if (activePage === 'scan') setTimeout(() => scanInputRef.current?.focus(), 200);
    if (activePage === 'inventory' && selectedHub) fetchInventory(selectedHub._id);
  }, [activePage, selectedHub]);

  const handleLogout = () => {
    localStorage.removeItem('zypergo_token');
    localStorage.removeItem('zypergo_user');
    window.location.reload();
  };

  const fetchHubs = async () => {
    try {
      const r = await api.get('/hub');
      const hubList = r.data.data || [];
      setHubs(hubList);
      if (hubList.length > 0) setSelectedHub(hubList[0]);
    } catch {}
  };

  const fetchInventory = async (hubId) => {
    try {
      const r = await api.get(`/hub/${hubId}/inventory`);
      setInventory(r.data.data);
    } catch {}
  };

  const fetchManifests = async () => {
    setManifestLoading(true);
    try {
      const r = await api.get('/manifest');
      setManifests(r.data.data || []);
    } catch {} finally { setManifestLoading(false); }
  };

  const fetchUnscannedAlerts = async () => {
    try {
      const r = await api.get('/scan/alerts/unscanned');
      setUnscannedAlerts(r.data.data || []);
    } catch {}
  };

  const fetchManifestDetail = async (id) => {
    try {
      const r = await api.get(`/manifest/${id}`);
      setSelectedManifest(r.data.data);
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
        hubId: selectedHub?._id,
        parcelCondition,
        notes: scanNotes || undefined
      });
      const result = { type: 'success', data: res.data.data, warning: res.data.warning, trackingId: scanInput.trim(), ts: new Date() };
      setScanResult(result);
      setRecentScans(prev => [result, ...prev.slice(0, 9)]);
      setScanInput('');
      setScanNotes('');
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

  const handleCreateManifest = async (e) => {
    e.preventDefault();
    try {
      const parcelIds = newManifest.parcels.split(',').map(s => s.trim()).filter(Boolean);
      await api.post('/manifest', {
        manifestType: newManifest.manifestType,
        type: newManifest.type,
        sourceHub: selectedHub?._id,
        route: newManifest.route || undefined,
        notes: newManifest.notes || undefined,
        parcels: parcelIds
      });
      setShowCreateManifest(false);
      setNewManifest({ manifestType: 'HubReceiving', type: 'Bag', route: '', notes: '', parcels: '' });
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
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
      {/* TOP HEADER */}
      <header className="bg-[#0F172A] text-white px-4 md:px-6 h-14 flex items-center justify-between shrink-0 shadow-lg z-40">
        <div className="flex items-center gap-3">
          <button className="md:hidden text-slate-400 hover:text-white mr-1" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={22} />
          </button>
          <div className="w-7 h-7 rounded bg-[#FFB703] text-slate-900 flex items-center justify-center font-black text-sm">Z</div>
          <img src="/src/assets/logo.jpeg" alt="ZyperGo Logo" className="h-8" />
        </div>

        {/* Hub Selector (center) */}
        {hubs.length > 0 && (
          <div className="hidden md:flex items-center gap-2">
            <MapPin size={14} className="text-[#006D77]" />
            <select
              value={selectedHub?._id || ''}
              onChange={e => setSelectedHub(hubs.find(h => h._id === e.target.value))}
              className="bg-slate-800 text-white text-sm font-medium px-3 py-1 rounded-lg border border-slate-700 outline-none"
            >
              {hubs.map(h => <option key={h._id} value={h._id}>{h.name} ({h.hubType})</option>)}
            </select>
          </div>
        )}

        <div className="flex items-center gap-3">
          {unscannedAlerts.length > 0 && (
            <button onClick={() => setActivePage('scan')} className="relative">
              <Bell size={20} className="text-slate-400 hover:text-white" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center">{unscannedAlerts.length}</span>
            </button>
          )}
          <div className="hidden md:flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#006D77] flex items-center justify-center text-xs font-bold">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-white">{user.name}</div>
              <div className="text-[10px] text-slate-400">{user.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition p-1.5 rounded-lg hover:bg-red-500/10">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className={`
          fixed md:relative inset-y-0 left-0 z-30 w-56 bg-[#0F172A] flex flex-col pt-14 md:pt-0 transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-3 flex-1 overflow-y-auto">
            {/* Hub info card */}
            {selectedHub && (
              <div className="bg-slate-800/60 rounded-xl p-3 mb-4 border border-slate-700">
                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Active Hub</div>
                <div className="text-white font-bold text-sm truncate">{selectedHub.name}</div>
                <div className="text-xs text-[#006D77] font-medium">{selectedHub.hubType} Hub</div>
              </div>
            )}

            <nav className="space-y-1">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activePage === item.id
                      ? 'bg-[#006D77] text-white shadow-lg shadow-[#006D77]/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-3 border-t border-slate-800">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Sidebar Overlay */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">

          {/* ===== DASHBOARD PAGE ===== */}
          {activePage === 'dashboard' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div>
                <h1 className="text-xl font-black text-slate-900">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user.name.split(' ')[0]}! 👋</h1>
                <p className="text-slate-500 text-sm mt-0.5">Hub operations overview for today.</p>
              </div>

              {/* Hub Selector (mobile) */}
              {hubs.length > 0 && (
                <div className="md:hidden">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Active Hub</label>
                  <select value={selectedHub?._id || ''} onChange={e => setSelectedHub(hubs.find(h => h._id === e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium bg-white outline-none focus:border-[#006D77]">
                    {hubs.map(h => <option key={h._id} value={h._id}>{h.name} ({h.hubType})</option>)}
                  </select>
                </div>
              )}

              {/* Stats Grid */}
              {selectedHub && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Current Load', value: selectedHub.capacity?.currentParcels || 0, max: selectedHub.capacity?.maxCapacity, color: '#006D77', icon: Package },
                    { label: 'Max Capacity', value: selectedHub.capacity?.maxCapacity || 0, color: '#3B82F6', icon: Archive },
                    { label: 'Manifests Today', value: manifests.filter(m => new Date(m.createdAt).toDateString() === new Date().toDateString()).length, color: '#8B5CF6', icon: FileText },
                    { label: 'Unscanned Alerts', value: unscannedAlerts.length, color: unscannedAlerts.length > 0 ? '#EF4444' : '#22C55E', icon: AlertTriangle }
                  ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg" style={{ background: stat.color + '15' }}>
                          <stat.icon size={18} style={{ color: stat.color }} />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-slate-900">{stat.value.toLocaleString()}</div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">{stat.label}</div>
                      {stat.max && (
                        <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${Math.min(100, (stat.value / stat.max) * 100)}%`, background: stat.color }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-[#006D77] to-[#004d55] rounded-xl p-5 text-white shadow-lg">
                  <Scan size={28} className="mb-3 opacity-80" />
                  <h3 className="font-black text-lg">Scan Desk</h3>
                  <p className="text-sm opacity-70 mt-1 mb-4">Process parcel scans at any checkpoint</p>
                  <button onClick={() => setActivePage('scan')} className="bg-white text-[#006D77] font-bold px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition flex items-center gap-2">
                    Open Scan Desk <ChevronRight size={16} />
                  </button>
                </div>

                <div className="bg-gradient-to-br from-[#6366F1] to-[#4338ca] rounded-xl p-5 text-white shadow-lg">
                  <FileText size={28} className="mb-3 opacity-80" />
                  <h3 className="font-black text-lg">Create Manifest</h3>
                  <p className="text-sm opacity-70 mt-1 mb-4">Group parcels into bags & consignments</p>
                  <button onClick={() => { setActivePage('manifests'); setShowCreateManifest(true); }} className="bg-white text-indigo-600 font-bold px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition flex items-center gap-2">
                    Create Now <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Recent Manifests */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Recent Manifests</h3>
                  <button onClick={() => setActivePage('manifests')} className="text-xs font-bold text-[#006D77] hover:underline">View All</button>
                </div>
                {manifests.slice(0, 5).map(m => (
                  <div key={m._id} onClick={() => { setActivePage('manifests'); fetchManifestDetail(m._id); }}
                    className="flex items-center justify-between px-4 py-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition">
                    <div>
                      <div className="font-bold text-xs font-mono text-slate-800">{m.manifestId}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{m.manifestType} • {m.parcelCount} parcels</div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusBadge(m.status)}`}>{m.status}</span>
                  </div>
                ))}
                {manifests.length === 0 && <p className="text-slate-400 text-center py-6 text-sm">No manifests yet</p>}
              </div>

              {/* Unscanned Alerts */}
              {unscannedAlerts.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-3"><AlertTriangle size={18} /> {unscannedAlerts.length} Unscanned Parcel Alert{unscannedAlerts.length > 1 ? 's' : ''}</h3>
                  <div className="space-y-2">
                    {unscannedAlerts.slice(0, 3).map(b => (
                      <div key={b._id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-amber-100">
                        <div>
                          <div className="font-bold font-mono text-xs text-amber-900">{b.trackingId}</div>
                          <div className="text-xs text-amber-700">Stuck at: {b.status}</div>
                        </div>
                        <button onClick={() => { setScanInput(b.trackingId); setActivePage('scan'); }} className="text-xs font-bold text-amber-700 border border-amber-300 px-2 py-1 rounded hover:bg-amber-100 transition">Scan Now</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== SCAN DESK PAGE ===== */}
          {activePage === 'scan' && (
            <div className="space-y-4 max-w-2xl mx-auto animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-black text-slate-900 flex items-center gap-2"><Scan size={22} className="text-[#006D77]" /> Scan Desk</h1>
                  <p className="text-sm text-slate-500">Hub: {selectedHub?.name || 'None selected'}</p>
                </div>
                <button onClick={fetchUnscannedAlerts} className="p-2 text-slate-400 hover:text-[#006D77] bg-white border border-slate-200 rounded-lg">
                  <RefreshCcw size={16} />
                </button>
              </div>

              {/* Scan Form */}
              <form onSubmit={handleScan} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                <input
                  ref={scanInputRef}
                  type="text"
                  value={scanInput}
                  onChange={e => setScanInput(e.target.value)}
                  className="w-full px-5 py-4 text-2xl font-black font-mono border-2 border-slate-200 rounded-xl focus:border-[#006D77] outline-none bg-slate-50 text-center tracking-widest"
                  placeholder="SCAN AWB / TRACKING ID"
                  autoFocus
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Checkpoint</label>
                    <select value={scanType} onChange={e => setScanType(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium">
                      {SCAN_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Condition</label>
                    <select value={parcelCondition} onChange={e => setParcelCondition(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium">
                      <option>Good</option><option>Damaged</option><option>Tampered</option><option>Wet</option>
                    </select>
                  </div>
                </div>

                <input type="text" value={scanNotes} onChange={e => setScanNotes(e.target.value)} placeholder="Notes (optional)" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm" />

                <button type="submit" disabled={scanLoading || !scanInput.trim()} className="w-full py-4 bg-[#006D77] hover:bg-[#005f6a] text-white font-black text-lg rounded-xl flex items-center justify-center gap-3 shadow-md disabled:opacity-50 transition">
                  {scanLoading ? <Loader2 size={22} className="animate-spin" /> : <Zap size={22} />}
                  {scanLoading ? 'Processing...' : 'Process Scan'}
                </button>
              </form>

              {/* Scan Result */}
              {scanResult && (
                <div className={`rounded-xl p-4 border flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                  scanResult.type === 'success' ? 'bg-green-50 border-green-200' :
                  scanResult.type === 'duplicate' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
                }`}>
                  {scanResult.type === 'success' ? <CheckCircle className="text-green-600 shrink-0" size={22} /> :
                   scanResult.type === 'duplicate' ? <Copy className="text-amber-600 shrink-0" size={22} /> :
                   <AlertTriangle className="text-red-600 shrink-0" size={22} />}
                  <div className="flex-1">
                    <div className={`font-bold ${scanResult.type === 'success' ? 'text-green-800' : scanResult.type === 'duplicate' ? 'text-amber-800' : 'text-red-800'}`}>
                      {scanResult.type === 'success' ? '✓ Scan Successful' : scanResult.type === 'duplicate' ? '⚠ Duplicate Scan' : '✗ Scan Failed'}
                    </div>
                    {scanResult.type === 'success' && (
                      <div className="text-sm text-green-700 mt-1 space-y-0.5">
                        <p><strong>{scanResult.data?.trackingId}</strong> → {scanResult.data?.newStatus}</p>
                        <p>Condition: {scanResult.data?.parcelCondition}</p>
                        {scanResult.warning && <p className="text-amber-700 font-bold">⚠ {scanResult.warning}</p>}
                      </div>
                    )}
                    {(scanResult.type !== 'success') && <p className="text-sm mt-1">{scanResult.message}</p>}
                  </div>
                </div>
              )}

              {/* Recent Scans Log */}
              {recentScans.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-600 uppercase">Session Scan Log</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {recentScans.map((s, i) => (
                      <div key={i} className={`flex items-center gap-3 px-4 py-2.5 ${s.type === 'success' ? 'bg-green-50/40' : s.type === 'duplicate' ? 'bg-amber-50/40' : 'bg-red-50/40'}`}>
                        {s.type === 'success' ? <CheckCircle size={14} className="text-green-600 shrink-0" /> : <AlertTriangle size={14} className="text-red-500 shrink-0" />}
                        <span className="font-mono font-bold text-xs flex-1 text-slate-700">{s.trackingId}</span>
                        {s.data && <span className="text-xs text-slate-500">{s.data.newStatus}</span>}
                        <span className="text-[10px] text-slate-400">{s.ts?.toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== MANIFESTS PAGE ===== */}
          {activePage === 'manifests' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                <h1 className="text-xl font-black text-slate-900 flex items-center gap-2"><FileText size={22} className="text-[#006D77]" /> Manifests</h1>
                <button onClick={() => setShowCreateManifest(true)} className="bg-[#006D77] hover:bg-[#005f6a] text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm">
                  <Plus size={16} /> Create
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* List */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-600 uppercase">All Manifests</span>
                    <button onClick={fetchManifests} className="text-slate-400 hover:text-[#006D77]"><RefreshCcw size={14} className={manifestLoading ? 'animate-spin' : ''} /></button>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                    {manifests.length === 0 && <p className="text-center text-slate-400 py-8 text-sm">No manifests yet</p>}
                    {manifests.map(m => (
                      <button key={m._id} onClick={() => fetchManifestDetail(m._id)} className={`w-full text-left p-4 hover:bg-slate-50 transition ${selectedManifest?._id === m._id ? 'border-l-2 border-[#006D77] bg-[#006D77]/5' : ''}`}>
                        <div className="flex justify-between items-start">
                          <div className="font-bold text-xs font-mono text-slate-900">{m.manifestId}</div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${statusBadge(m.status)}`}>{m.status}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{m.manifestType} • {m.parcelCount} parcels • {m.totalWeight?.toFixed(1)} kg</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detail */}
                <div className="lg:col-span-3">
                  {selectedManifest ? (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-slate-100 flex flex-wrap gap-2 justify-between items-start">
                        <div>
                          <div className="font-black font-mono text-slate-900">{selectedManifest.manifestId}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{selectedManifest.manifestType} • {selectedManifest.type}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button onClick={() => handlePrintManifest(selectedManifest._id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                            <Printer size={14} /> Print
                          </button>
                          {selectedManifest.status === 'Created' && <button onClick={() => handleSealManifest(selectedManifest._id)} className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700">Seal</button>}
                          {selectedManifest.status === 'Sealed' && <button onClick={() => handleDispatchManifest(selectedManifest._id)} className="px-3 py-1.5 text-xs font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-700">Dispatch</button>}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 border-b border-slate-100">
                        {[
                          ['Parcels', selectedManifest.parcelCount],
                          ['Weight', `${selectedManifest.totalWeight?.toFixed(2)} kg`],
                          ['Status', selectedManifest.status],
                          ['Source', selectedManifest.sourceHub?.name || 'N/A'],
                          ['Route', selectedManifest.route || 'N/A'],
                          ['Operator', selectedManifest.operator?.name || 'N/A']
                        ].map(([l, v]) => (
                          <div key={l} className="p-3 border-r border-b border-slate-100">
                            <div className="text-[10px] text-slate-400 uppercase font-bold">{l}</div>
                            <div className="text-sm font-bold text-slate-800 truncate mt-0.5">{v}</div>
                          </div>
                        ))}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead><tr className="bg-slate-50 text-[10px] text-slate-500 uppercase">
                            <th className="p-3 text-left">#</th>
                            <th className="p-3 text-left">AWB</th>
                            <th className="p-3 text-left">Receiver</th>
                            <th className="p-3 text-left">Weight</th>
                          </tr></thead>
                          <tbody className="divide-y divide-slate-100">
                            {(selectedManifest.parcels || []).map((p, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="p-3 text-xs text-slate-400 font-bold">{i + 1}</td>
                                <td className="p-3 font-mono font-bold text-xs text-[#006D77]">{p.trackingId || p.bookingId?.trackingId || 'N/A'}</td>
                                <td className="p-3">
                                  <div className="font-medium text-xs">{p.bookingId?.receiver?.name || 'N/A'}</div>
                                  <div className="text-[10px] text-slate-400">{p.bookingId?.receiver?.phone}</div>
                                </td>
                                <td className="p-3 text-xs font-medium">{p.weight} kg</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center h-48">
                      <div className="text-center text-slate-400">
                        <FileText size={36} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Select a manifest to view</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===== INVENTORY PAGE ===== */}
          {activePage === 'inventory' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-black text-slate-900 flex items-center gap-2"><Warehouse size={22} className="text-[#006D77]" /> Hub Inventory</h1>
                <button onClick={() => selectedHub && fetchInventory(selectedHub._id)} className="p-2 text-slate-400 hover:text-[#006D77] bg-white border border-slate-200 rounded-lg">
                  <RefreshCcw size={16} />
                </button>
              </div>

              {selectedHub ? (
                <>
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h2 className="font-bold text-slate-900">{selectedHub.name}</h2>
                        <p className="text-xs text-slate-500">{selectedHub.hubType} Hub • {selectedHub.address?.city}</p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${selectedHub.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-500'}`}>
                        {selectedHub.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-bold text-slate-700">{selectedHub.capacity?.currentParcels || 0} parcels</span>
                      <span className="text-slate-400">/ {selectedHub.capacity?.maxCapacity || 0} max</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, ((selectedHub.capacity?.currentParcels || 0) / (selectedHub.capacity?.maxCapacity || 1)) * 100)}%`,
                          background: '#006D77'
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">{(((selectedHub.capacity?.currentParcels || 0) / (selectedHub.capacity?.maxCapacity || 1)) * 100).toFixed(1)}% capacity used</p>
                  </div>

                  {inventory ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {(inventory.inventoryStatus || []).map(item => (
                        <div key={item._id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                          <div className="text-xs font-bold text-slate-500 uppercase mb-1">{item._id}</div>
                          <div className="text-2xl font-black text-slate-900">{item.count}</div>
                          <div className="text-xs text-slate-400 mt-0.5">parcels</div>
                        </div>
                      ))}
                      {(inventory.inventoryStatus || []).length === 0 && (
                        <div className="col-span-3 text-center text-slate-400 py-8">No parcels in hub inventory</div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
                      <button onClick={() => fetchInventory(selectedHub._id)} className="flex items-center gap-2 mx-auto text-[#006D77] font-bold text-sm hover:underline">
                        <RefreshCcw size={16} /> Load Inventory Data
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
                  No hub selected. Please select a hub from the header.
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Create Manifest Modal */}
      {showCreateManifest && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-xl w-full md:max-w-lg overflow-hidden animate-in slide-in-from-bottom-4 md:zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Create Manifest</h2>
              <button onClick={() => setShowCreateManifest(false)} className="text-slate-400 hover:text-slate-700"><X size={22} /></button>
            </div>
            <form onSubmit={handleCreateManifest} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Type</label>
                  <select value={newManifest.manifestType} onChange={e => setNewManifest({ ...newManifest, manifestType: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium">
                    {MANIFEST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Container</label>
                  <select value={newManifest.type} onChange={e => setNewManifest({ ...newManifest, type: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium">
                    <option>Bag</option><option>Bundle</option><option>Consignment</option><option>Partner Manifest</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Route (optional)</label>
                <input type="text" value={newManifest.route} onChange={e => setNewManifest({ ...newManifest, route: e.target.value })} placeholder="e.g. RT-HYD-04" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Booking IDs (comma separated)</label>
                <textarea required rows="3" value={newManifest.parcels} onChange={e => setNewManifest({ ...newManifest, parcels: e.target.value })} placeholder="Scan or paste booking IDs..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-mono" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Notes</label>
                <input type="text" value={newManifest.notes} onChange={e => setNewManifest({ ...newManifest, notes: e.target.value })} placeholder="Optional..." className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm" />
              </div>
              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <button type="button" onClick={() => setShowCreateManifest(false)} className="flex-1 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 text-sm font-bold text-white bg-[#006D77] hover:bg-[#005f6a] rounded-lg transition shadow-md">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
