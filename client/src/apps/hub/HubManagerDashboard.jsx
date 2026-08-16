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
  { id: 'scan', label: 'Scan', icon: Scan },
  { id: 'manifests', label: 'Manifests', icon: FileText },
  { id: 'inventory', label: 'Inventory', icon: Warehouse },
  { id: 'account', label: 'Account', icon: User },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 font-sans flex flex-col relative overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#006D77]/30 to-[#83C5BE]/40 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/4 mix-blend-multiply"></div>
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#006D77]/20 to-[#006D77]/10 rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/4 mix-blend-multiply"></div>

      {/* TOP HEADER */}
      <header className="bg-white/70 backdrop-blur-md text-slate-900 px-4 md:px-6 h-16 flex items-center justify-between shrink-0 shadow-sm border-b border-white/50 z-40 sticky top-0">
        
        {/* Left Spacer / Alerts for Mobile */}
        <div className="flex-1 flex items-center justify-start">
          {unscannedAlerts.length > 0 && (
            <button onClick={() => setActivePage('scan')} className="relative md:hidden">
              <Bell size={20} className="text-[#006D77]" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">{unscannedAlerts.length}</span>
            </button>
          )}
        </div>

        {/* Center: Logo */}
        <div className="flex items-center justify-center">
          <img src="/images/logo.png" alt="ZyperGo Logo" className="h-8 md:h-10 object-contain" />
        </div>

        {/* Hub Selector (desktop center) */}
        {hubs.length > 0 && (
          <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 gap-2">
            <MapPin size={14} className="text-[#006D77]" />
            <select
              value={selectedHub?._id || ''}
              onChange={e => setSelectedHub(hubs.find(h => h._id === e.target.value))}
              className="bg-white/60 backdrop-blur-md text-slate-800 text-sm font-bold px-3 py-1.5 rounded-xl border border-white/80 outline-none focus:border-[#006D77] shadow-sm hover:bg-white transition-colors"
            >
              {hubs.map(h => <option key={h._id} value={h._id}>{h.name} ({h.hubType})</option>)}
            </select>
          </div>
        )}

        {/* Right: Account & Logout (Desktop Only) / Right Spacer (Mobile) */}
        <div className="flex-1 flex items-center justify-end gap-3">
          <div className="hidden md:flex items-center gap-3">
            {unscannedAlerts.length > 0 && (
              <button onClick={() => setActivePage('scan')} className="relative mr-2">
                <Bell size={20} className="text-slate-500 hover:text-slate-900" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">{unscannedAlerts.length}</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#006D77] to-[#83C5BE] flex items-center justify-center text-xs font-black text-white shadow-md border-2 border-white">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900">{user.name}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{user.role}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-600 transition p-2 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-white/80">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR (Desktop Only) */}
        <aside className="hidden md:flex flex-col w-64 bg-white/50 backdrop-blur-xl border-r border-white/60 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="p-3 flex-1 overflow-y-auto">
            {/* Hub info card */}
            {selectedHub && (
              <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Active Hub</div>
                <div className="text-slate-900 font-bold text-sm truncate">{selectedHub.name}</div>
                <div className="text-xs text-[#006D77] font-bold">{selectedHub.hubType} Hub</div>
              </div>
            )}

            <nav className="space-y-1">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activePage === item.id
                      ? 'bg-[#006D77]/10 text-[#006D77]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-3 border-t border-slate-200">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 transition">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-32 md:pb-6 relative z-10">

          {/* ===== DASHBOARD PAGE ===== */}
          {activePage === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white/50 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user.name.split(' ')[0]}! 👋</h1>
                <p className="text-slate-500 text-sm mt-1 font-bold">Hub operations overview for today.</p>
              </div>

              {/* Hub Selector (mobile) */}
              {hubs.length > 0 && (
                <div className="md:hidden bg-white/40 backdrop-blur-md p-4 rounded-3xl border border-white/80 shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)]">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Active Hub</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MapPin size={16} className="text-[#006D77]" />
                    </div>
                    <select value={selectedHub?._id || ''} onChange={e => setSelectedHub(hubs.find(h => h._id === e.target.value))} className="w-full bg-white/60 backdrop-blur-md text-slate-800 font-bold pl-12 pr-4 py-3 rounded-2xl border border-white/80 outline-none focus:border-[#006D77] shadow-sm appearance-none">
                      {hubs.map(h => <option key={h._id} value={h._id}>{h.name} ({h.hubType})</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <ChevronRight size={16} className="text-slate-400 rotate-90" />
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              {selectedHub && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Current Load', value: selectedHub.capacity?.currentParcels || 0, max: selectedHub.capacity?.maxCapacity, color: '#006D77', icon: Package },
                    { label: 'Max Capacity', value: selectedHub.capacity?.maxCapacity || 0, color: '#3B82F6', icon: Archive },
                    { label: 'Manifests Today', value: manifests.filter(m => new Date(m.createdAt).toDateString() === new Date().toDateString()).length, color: '#8B5CF6', icon: FileText },
                    { label: 'Unscanned Alerts', value: unscannedAlerts.length, color: unscannedAlerts.length > 0 ? '#EF4444' : '#22C55E', icon: AlertTriangle }
                  ].map(stat => (
                    <div key={stat.label} className="bg-white/50 backdrop-blur-md rounded-3xl p-5 border border-white/80 shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] hover:bg-white/60 transition-colors group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 rounded-2xl shadow-sm transition-transform group-hover:scale-110 group-hover:shadow-md" style={{ background: stat.color + '15' }}>
                          <stat.icon size={20} style={{ color: stat.color }} />
                        </div>
                      </div>
                      <div className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value.toLocaleString()}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{stat.label}</div>
                      {stat.max && (
                        <div className="mt-3 h-1.5 bg-white/80 rounded-full overflow-hidden shadow-inner p-0.5">
                          <div className="h-full rounded-full shadow-sm" style={{ width: `${Math.min(100, (stat.value / stat.max) * 100)}%`, background: stat.color }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-[#006D77] to-[#004d55] rounded-[2rem] p-6 text-white shadow-[0_8px_30px_-6px_rgba(0,109,119,0.5)] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                  <Scan size={32} className="mb-4 opacity-90 relative z-10 drop-shadow-md" />
                  <h3 className="font-black text-xl relative z-10 tracking-tight">Scan Desk</h3>
                  <p className="text-xs font-bold opacity-80 mt-1 mb-6 relative z-10">Process parcel scans at any checkpoint</p>
                  <button onClick={() => setActivePage('scan')} className="w-full sm:w-auto bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-black px-5 py-3 rounded-2xl text-sm transition-all flex items-center justify-center sm:justify-start gap-2 relative z-10 group-hover:shadow-lg">
                    Open Scan Desk <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="bg-gradient-to-br from-[#6366F1] to-[#4338ca] rounded-[2rem] p-6 text-white shadow-[0_8px_30px_-6px_rgba(99,102,241,0.5)] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                  <FileText size={32} className="mb-4 opacity-90 relative z-10 drop-shadow-md" />
                  <h3 className="font-black text-xl relative z-10 tracking-tight">Create Manifest</h3>
                  <p className="text-xs font-bold opacity-80 mt-1 mb-6 relative z-10">Group parcels into bags & consignments</p>
                  <button onClick={() => { setActivePage('manifests'); setShowCreateManifest(true); }} className="w-full sm:w-auto bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-black px-5 py-3 rounded-2xl text-sm transition-all flex items-center justify-center sm:justify-start gap-2 relative z-10 group-hover:shadow-lg">
                    Create Now <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Recent Manifests */}
              <div className="bg-white/50 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="p-5 border-b border-white/60 flex justify-between items-center bg-white/30">
                  <h3 className="font-black text-slate-800 tracking-tight">Recent Manifests</h3>
                  <button onClick={() => setActivePage('manifests')} className="text-xs font-black text-[#006D77] bg-white/60 px-3 py-1.5 rounded-full hover:bg-white shadow-sm transition-all">View All</button>
                </div>
                <div className="divide-y divide-white/60">
                  {manifests.slice(0, 5).map(m => (
                    <div key={m._id} onClick={() => { setActivePage('manifests'); fetchManifestDetail(m._id); }}
                      className="flex items-center justify-between px-5 py-4 hover:bg-white/60 cursor-pointer transition-all">
                      <div>
                        <div className="font-black text-sm text-[#006D77]">{m.manifestId}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{m.manifestType} • {m.parcelCount} parcels</div>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm ${statusBadge(m.status)}`}>{m.status}</span>
                    </div>
                  ))}
                  {manifests.length === 0 && <p className="text-slate-400 font-bold text-center py-8 text-sm">No manifests yet</p>}
                </div>
              </div>

              {/* Unscanned Alerts */}
              {unscannedAlerts.length > 0 && (
                <div className="bg-red-50/80 backdrop-blur-xl border border-red-200/60 rounded-[2rem] shadow-[0_8px_30px_-6px_rgba(239,68,68,0.15)] overflow-hidden p-5">
                  <h3 className="font-black text-red-700 flex items-center gap-2 mb-4 tracking-tight"><AlertTriangle size={20} /> {unscannedAlerts.length} Unscanned Parcel Alert{unscannedAlerts.length > 1 ? 's' : ''}</h3>
                  <div className="space-y-3">
                    {unscannedAlerts.slice(0, 3).map(b => (
                      <div key={b._id} className="flex items-center justify-between bg-white/80 rounded-2xl p-4 border border-red-100 shadow-sm">
                        <div>
                          <div className="font-black text-sm text-red-700">{b.trackingId}</div>
                          <div className="text-[10px] font-bold text-red-500/80 uppercase tracking-widest mt-1">Stuck at: {b.status}</div>
                        </div>
                        <button onClick={() => { setScanInput(b.trackingId); setActivePage('scan'); }} className="text-[10px] font-black uppercase tracking-widest text-red-700 bg-red-100 border border-red-200 px-3 py-2 rounded-xl hover:bg-red-200 transition-all shadow-sm">Scan Now</button>
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
              <div className="flex items-center justify-between bg-white/50 backdrop-blur-xl p-5 rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Hub Inventory</h2>
                  <p className="text-sm font-bold text-slate-500">Live parcel status</p>
                </div>
                <button onClick={() => selectedHub && fetchInventory(selectedHub._id)} className="w-10 h-10 bg-white/60 hover:bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm border border-white/80 transition-all hover:shadow-md">
                  <RefreshCcw size={18} />
                </button>
              </div>

              {selectedHub ? (
                <>
                  <div className="bg-white/50 backdrop-blur-xl rounded-3xl border border-white/60 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-black text-slate-900">{selectedHub.name}</h2>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{selectedHub.hubType} Hub • {selectedHub.address?.city}</p>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${selectedHub.isActive ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-300 text-slate-600'}`}>
                        {selectedHub.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                      <span>{selectedHub.capacity?.currentParcels || 0} parcels</span>
                      <span>/ {selectedHub.capacity?.maxCapacity || 0} max</span>
                    </div>
                    <div className="h-4 bg-white/80 rounded-full overflow-hidden shadow-inner p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-500 shadow-sm"
                        style={{
                          width: `${Math.min(100, ((selectedHub.capacity?.currentParcels || 0) / (selectedHub.capacity?.maxCapacity || 1)) * 100)}%`,
                          background: '#006D77'
                        }}
                      />
                    </div>
                  </div>

                  {inventory ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {(inventory.inventoryStatus || []).map(item => (
                        <div key={item._id} className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/80 p-5 shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] hover:bg-white/60 transition-colors flex flex-col items-center justify-center">
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 text-center">{item._id}</div>
                          <div className="text-4xl font-black text-[#006D77] tracking-tighter">{item.count}</div>
                        </div>
                      ))}
                      {(inventory.inventoryStatus || []).length === 0 && (
                        <div className="col-span-2 md:col-span-3 text-center text-slate-400 font-bold py-8 bg-white/40 backdrop-blur-md rounded-3xl border border-white/80">No parcels in hub inventory</div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/80 p-8 text-center text-slate-400">
                      <button onClick={() => fetchInventory(selectedHub._id)} className="flex items-center gap-2 mx-auto text-[#006D77] font-black text-sm bg-white/60 px-5 py-2.5 rounded-xl hover:bg-white transition-all shadow-sm">
                        <RefreshCcw size={16} /> Load Inventory Data
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/80 p-8 text-center text-slate-400 font-bold">
                  No hub selected. Please select a hub from the header.
                </div>
              )}
            </div>
          )}

          {/* ===== ACCOUNT PAGE (Mobile Only) ===== */}
          {activePage === 'account' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 md:hidden">
              <div className="bg-white/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-50 pointer-events-none -z-10"></div>
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#006D77] to-[#83C5BE] flex items-center justify-center text-3xl font-black text-white shadow-[0_8px_20px_-6px_rgba(0,109,119,0.5)] border-4 border-white mb-4 transition-transform group-hover:scale-105">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user.name}</h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white/60 px-4 py-1.5 rounded-full mt-2 inline-block border border-white shadow-sm">{user.role}</p>
                
                {hubs.length > 0 && (
                  <div className="mt-8 w-full">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block text-left">Active Hub</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin size={16} className="text-[#006D77]" />
                      </div>
                      <select
                        value={selectedHub?._id || ''}
                        onChange={e => setSelectedHub(hubs.find(h => h._id === e.target.value))}
                        className="w-full bg-white/60 backdrop-blur-md text-slate-800 font-bold pl-12 pr-4 py-4 rounded-2xl border border-white/80 outline-none focus:border-[#006D77] shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] appearance-none hover:bg-white/70 transition-all"
                      >
                        {hubs.map(h => <option key={h._id} value={h._id}>{h.name} ({h.hubType})</option>)}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <ChevronRight size={16} className="text-slate-400 rotate-90" />
                      </div>
                    </div>
                  </div>
                )}

                <button onClick={handleLogout} className="mt-8 w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_20px_-6px_rgba(239,68,68,0.5)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_25px_-6px_rgba(239,68,68,0.6)]">
                  <LogOut size={20} /> Sign Out of Hub
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-3xl border-t border-white/60 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-40 px-6 py-4 pb-6 flex justify-between items-center">
        {NAV_ITEMS.map((item) => (
          <button 
            key={item.id} 
            onClick={() => setActivePage(item.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${activePage === item.id ? 'text-[#006D77]' : 'text-slate-400 hover:text-slate-800'}`}
          >
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${activePage === item.id ? 'bg-[#006D77]/10' : ''}`}>
              <item.icon size={20} />
            </div>
            <span className="text-[10px] font-black">{item.label.split(' ')[0]}</span>
          </button>
        ))}
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
