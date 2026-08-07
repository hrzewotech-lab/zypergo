import React, { useState, useEffect } from 'react';
import {
  Truck, Map, Filter, Clock, Navigation, Zap, User, Package,
  RefreshCcw, CheckCircle, AlertTriangle, ChevronDown, ChevronRight,
  Users, Loader2, Star, DollarSign, Rocket, Award, Settings,
  MapPin, ArrowRight, X, ToggleLeft, ToggleRight, Info
} from 'lucide-react';
import api from '../../api';

const TABS = [
  { id: 'pickup', label: 'Pickup Dispatch', icon: Package },
  { id: 'lastmile', label: 'Last-Mile', icon: Truck },
  { id: 'partners', label: 'Partner Routing', icon: Navigation },
  { id: 'rules', label: 'Dispatch Rules', icon: Settings }
];

export default function DispatchRouting() {
  const [activeTab, setActiveTab] = useState('pickup');

  // Pickup tab state
  const [pendingPickups, setPendingPickups] = useState([]);
  const [availableRiders, setAvailableRiders] = useState([]);
  const [pickupLoading, setPickupLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);
  const [assignResult, setAssignResult] = useState(null);
  const [showManualModal, setShowManualModal] = useState(null); // bookingId
  const [manualRiderId, setManualRiderId] = useState('');

  // Last-mile tab state
  const [routeClusters, setRouteClusters] = useState([]);
  const [deliveryRiders, setDeliveryRiders] = useState([]);
  const [clustersLoading, setClustersLoading] = useState(true);
  const [selectedClusters, setSelectedClusters] = useState([]);
  const [lastMileResult, setLastMileResult] = useState(null);
  const [lastMileLoading, setLastMileLoading] = useState(false);

  // Partner tab state
  const [partnerBookingId, setPartnerBookingId] = useState('');
  const [partnerRecs, setPartnerRecs] = useState(null);
  const [partnerLoading, setPartnerLoading] = useState(false);
  const [assigningPartner, setAssigningPartner] = useState(null);
  const [partnerAssignResult, setPartnerAssignResult] = useState(null);

  // Rules tab state
  const [rules, setRules] = useState(null);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [rulesSaving, setRulesSaving] = useState(false);

  useEffect(() => {
    if (activeTab === 'pickup') { fetchPendingPickups(); fetchRiders('pickup'); }
    if (activeTab === 'lastmile') { fetchGroupedRoutes(); fetchRiders('delivery'); }
    if (activeTab === 'rules') fetchRules();
  }, [activeTab]);

  // ── Data Fetchers ──────────────────────────────────────────────────────────
  const fetchPendingPickups = async () => {
    setPickupLoading(true);
    try {
      const r = await api.get('/dispatch/pending/pickups');
      setPendingPickups(r.data.data || []);
    } catch {} finally { setPickupLoading(false); }
  };

  const fetchRiders = async (mode) => {
    try {
      const r = await api.get(`/dispatch/riders/available?mode=${mode}`);
      if (mode === 'pickup') setAvailableRiders(r.data.data || []);
      else setDeliveryRiders(r.data.data || []);
    } catch {}
  };

  const fetchGroupedRoutes = async () => {
    setClustersLoading(true);
    try {
      const r = await api.get('/dispatch/group-routes');
      setRouteClusters(r.data.data || []);
    } catch {} finally { setClustersLoading(false); }
  };

  const fetchRules = async () => {
    setRulesLoading(true);
    try {
      const r = await api.get('/dispatch/rules');
      setRules(r.data.data);
    } catch {} finally { setRulesLoading(false); }
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleAutoAssignPickup = async (bookingId) => {
    setAssigningId(bookingId);
    setAssignResult(null);
    try {
      const r = await api.post('/dispatch/auto-assign/pickup', { bookingId });
      setAssignResult({ type: r.data.success ? 'success' : 'warn', data: r.data, bookingId });
      if (r.data.success) fetchPendingPickups();
    } catch (err) {
      setAssignResult({ type: 'error', message: err.response?.data?.error || 'Auto-assign failed', bookingId });
    } finally { setAssigningId(null); }
  };

  const handleManualAssign = async () => {
    if (!manualRiderId || !showManualModal) return;
    try {
      await api.post('/dispatch/manual-assign', { bookingId: showManualModal, riderId: manualRiderId, notes: 'Manual override via Dispatch UI' });
      setShowManualModal(null);
      setManualRiderId('');
      setAssignResult({ type: 'success', data: { assigned: availableRiders.find(r => r._id === manualRiderId) }, bookingId: showManualModal });
      fetchPendingPickups();
    } catch (err) { alert(err.response?.data?.error || 'Manual assign failed'); }
  };

  const handleAutoLastMile = async () => {
    const bookingIds = selectedClusters.flatMap(cluster => routeClusters.find(c => c.cluster === cluster)?.bookings.map(b => b.id) || []);
    if (!bookingIds.length) { alert('Select at least one cluster'); return; }
    setLastMileLoading(true);
    try {
      const r = await api.post('/dispatch/auto-assign/lastmile', { bookingIds });
      setLastMileResult(r.data);
      setSelectedClusters([]);
      fetchGroupedRoutes();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
    finally { setLastMileLoading(false); }
  };

  const handleRecommendPartners = async (e) => {
    e.preventDefault();
    if (!partnerBookingId.trim()) return;
    setPartnerLoading(true);
    setPartnerRecs(null);
    setPartnerAssignResult(null);
    try {
      const r = await api.post('/dispatch/recommend-partners', { bookingId: partnerBookingId.trim() });
      setPartnerRecs(r.data);
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
    finally { setPartnerLoading(false); }
  };

  const handleAssignPartner = async (partnerId) => {
    setAssigningPartner(partnerId);
    try {
      await api.post('/dispatch/assign-partner', { bookingId: partnerBookingId, partnerId });
      setPartnerAssignResult('Partner assigned successfully!');
      setPartnerRecs(null);
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
    finally { setAssigningPartner(null); }
  };

  const handleSaveRules = async () => {
    setRulesSaving(true);
    try {
      await api.put('/dispatch/rules', rules);
      alert('Dispatch rules updated successfully!');
    } catch { alert('Failed to save rules.'); }
    finally { setRulesSaving(false); }
  };

  // ── Sub-components ─────────────────────────────────────────────────────────
  const StatusBadge = ({ status }) => {
    const m = {
      'Booking Confirmed': 'bg-blue-50 text-blue-700',
      'Pending': 'bg-slate-100 text-slate-600',
      'Rider Assigned': 'bg-green-50 text-green-700'
    };
    return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${m[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
  };

  const RiderCard = ({ rider }) => (
    <div className="bg-white/10 hover:bg-white/20 p-3 rounded-xl border border-white/10 transition cursor-default">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-bold text-sm">{rider.name}</div>
          <div className="text-xs text-white/60">{rider.vehicleType}</div>
        </div>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${rider.isOnBreak ? 'bg-amber-500/20 text-amber-300' : 'bg-green-500/20 text-green-300'}`}>
          {rider.isOnBreak ? 'On Break' : 'Available'}
        </span>
      </div>
      <div className="text-xs text-white/60">Active Tasks: <strong className="text-white">{rider.activeTasks}</strong></div>
      <div className="text-xs text-white/60">Score: <strong className="text-white">{rider.performance?.punctualityScore || 80}%</strong></div>
    </div>
  );

  const PartnerCard = ({ rec, tier, color, icon: Icon, onAssign }) => (
    <div className={`bg-white rounded-xl border-2 ${color.border} shadow-sm overflow-hidden`}>
      <div className={`px-4 py-2.5 flex items-center gap-2 ${color.header}`}>
        <Icon size={16} className={color.icon} />
        <span className={`text-xs font-black uppercase tracking-wider ${color.icon}`}>{tier}</span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-900 mb-1">{rec.partner.companyName}</h3>
        <div className="text-xs text-slate-500 mb-3">{rec.partner.partnerType} • {rec.partner.speed}</div>
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Est. Cost</span>
            <span className="font-black text-slate-900">₹{rec.estimatedCost}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Delivery</span>
            <span className="font-bold text-slate-700">{rec.partner.avgDeliveryDays}d avg</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">SLA Score</span>
            <span className="font-bold text-slate-700">{rec.partner.slaScore}/100</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Cutoff</span>
            <span className="font-bold text-slate-700">{rec.partner.cutoffTime}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Composite</span>
            <span className="font-bold" style={{ color: color.scoreColor }}>{rec.compositeScore}</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 bg-slate-50 p-2 rounded-lg mb-3 font-mono">
          Base ₹{rec.costBreakdown.base} + Wt ₹{rec.costBreakdown.weight} + Dist ₹{rec.costBreakdown.distance}
        </div>
        <button
          onClick={() => onAssign(rec.partner._id)}
          disabled={assigningPartner === rec.partner._id}
          className={`w-full py-2.5 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2 transition ${color.button}`}
        >
          {assigningPartner === rec.partner._id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
          Assign Partner
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header + Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Dispatch & Routing</h1>
          <p className="text-slate-500 text-sm mt-1">Auto-assign riders, route clusters, and select partners.</p>
        </div>
        <div className="flex bg-slate-200/60 p-1 rounded-xl flex-wrap gap-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-lg transition ${activeTab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ TAB: PICKUP DISPATCH ═══ */}
      {activeTab === 'pickup' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">

          {/* Pending Pickups */}
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 flex justify-between items-center">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Clock size={18} className="text-amber-500" />
                Pending Pickups
                <span className="bg-amber-100 text-amber-700 text-xs font-black px-2 py-0.5 rounded-full">{pendingPickups.length}</span>
              </h2>
              <button onClick={fetchPendingPickups} className="text-slate-400 hover:text-[#006D77]"><RefreshCcw size={16} className={pickupLoading ? 'animate-spin' : ''} /></button>
            </div>

            {/* Auto-assign result banner */}
            {assignResult && (
              <div className={`rounded-xl p-4 flex items-start gap-3 border animate-in slide-in-from-top-2 ${
                assignResult.type === 'success' ? 'bg-green-50 border-green-200' :
                assignResult.type === 'warn' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
              }`}>
                {assignResult.type === 'success' ? <CheckCircle size={20} className="text-green-600 shrink-0" /> : <AlertTriangle size={20} className="text-amber-600 shrink-0" />}
                <div className="flex-1">
                  {assignResult.type === 'success' && (
                    <>
                      <p className="font-bold text-green-800">Rider Assigned Successfully!</p>
                      <p className="text-sm text-green-700 mt-0.5">
                        <strong>{assignResult.data.assigned?.name}</strong> ({assignResult.data.assigned?.vehicleType}) — {assignResult.data.assigned?.distKm} km away. Score: {assignResult.data.score}
                      </p>
                      {assignResult.data.allCandidates?.length > 1 && (
                        <p className="text-xs text-green-600 mt-1">{assignResult.data.allCandidates.length - 1} other candidates ranked below.</p>
                      )}
                    </>
                  )}
                  {assignResult.type === 'warn' && <p className="font-bold text-amber-800">{assignResult.data.error}</p>}
                  {assignResult.type === 'error' && <p className="font-bold text-red-800">{assignResult.message}</p>}
                </div>
                <button onClick={() => setAssignResult(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
              </div>
            )}

            {pickupLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
            ) : pendingPickups.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <CheckCircle size={40} className="mx-auto text-green-400 mb-3" />
                <h3 className="font-bold text-slate-700">All caught up!</h3>
                <p className="text-slate-400 text-sm mt-1">No pending pickups awaiting assignment.</p>
              </div>
            ) : (
              pendingPickups.map(booking => (
                <div key={booking._id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${booking.preferences?.speed === 'Express' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                        <Package size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold font-mono text-sm text-slate-900">{booking.trackingId}</span>
                          <StatusBadge status={booking.status} />
                          {booking.preferences?.speed === 'Express' && (
                            <span className="text-[10px] bg-red-100 text-red-700 font-black px-2 py-0.5 rounded uppercase">Express</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          {booking.pickupLocation?.address}
                        </p>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                          <span>{booking.packageDetails?.weight} kg • {booking.packageDetails?.category}</span>
                          {booking.scheduling?.timeSlot && <span className="flex items-center gap-1"><Clock size={11} /> {booking.scheduling.timeSlot}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => { setShowManualModal(booking._id); }}
                        className="px-3 py-2 text-xs font-bold border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
                      >
                        Manual
                      </button>
                      <button
                        onClick={() => handleAutoAssignPickup(booking._id)}
                        disabled={assigningId === booking._id}
                        className="px-4 py-2 text-xs font-bold bg-[#006D77] hover:bg-[#005f6a] text-white rounded-lg flex items-center gap-2 transition disabled:opacity-60"
                      >
                        {assigningId === booking._id ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                        Auto-Assign
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Rider Panel */}
          <div className="bg-gradient-to-b from-[#0F172A] to-[#1e293b] rounded-xl shadow-lg overflow-hidden text-white flex flex-col h-fit sticky top-6">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-bold flex items-center gap-2"><Navigation size={18} className="text-[#006D77]" /> Live Riders
                <span className="ml-auto text-xs bg-green-500/20 text-green-300 font-bold px-2 py-0.5 rounded-full">{availableRiders.length} online</span>
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[480px]">
              {availableRiders.length === 0 ? (
                <p className="text-white/40 text-center py-8 text-sm">No riders online</p>
              ) : (
                availableRiders.map(r => <RiderCard key={r._id} rider={r} />)
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB: LAST-MILE ═══ */}
      {activeTab === 'lastmile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 flex justify-between items-center">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Truck size={18} className="text-[#006D77]" /> Route Clusters
                <span className="bg-[#006D77]/10 text-[#006D77] text-xs font-black px-2 py-0.5 rounded-full">{routeClusters.length} zones</span>
              </h2>
              <div className="flex items-center gap-3">
                <button onClick={fetchGroupedRoutes} className="text-slate-400 hover:text-[#006D77]"><RefreshCcw size={16} className={clustersLoading ? 'animate-spin' : ''} /></button>
                <button
                  onClick={handleAutoLastMile}
                  disabled={!selectedClusters.length || lastMileLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-[#006D77] hover:bg-[#005f6a] text-white text-sm font-bold rounded-lg disabled:opacity-50 transition"
                >
                  {lastMileLoading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                  Auto-Assign {selectedClusters.length > 0 ? `(${selectedClusters.length})` : ''}
                </button>
              </div>
            </div>

            {lastMileResult && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-in slide-in-from-top-2">
                <p className="font-bold text-green-800 flex items-center gap-2"><CheckCircle size={18} /> Last-mile assignment complete!</p>
                <div className="mt-2 space-y-1">
                  {lastMileResult.assignments?.map((a, i) => (
                    <p key={i} className="text-sm text-green-700">Cluster {a.cluster}: {a.bookingCount} parcels → <strong>{a.assignedRider?.name}</strong></p>
                  ))}
                </div>
              </div>
            )}

            {clustersLoading ? (
              <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
            ) : routeClusters.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <Truck size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">No pending deliveries to cluster.</p>
              </div>
            ) : (
              routeClusters.map(cluster => (
                <div
                  key={cluster.cluster}
                  onClick={() => setSelectedClusters(prev => prev.includes(cluster.cluster) ? prev.filter(c => c !== cluster.cluster) : [...prev, cluster.cluster])}
                  className={`bg-white rounded-xl border-2 shadow-sm p-4 cursor-pointer transition ${selectedClusters.includes(cluster.cluster) ? 'border-[#006D77] bg-[#006D77]/5' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black ${selectedClusters.includes(cluster.cluster) ? 'bg-[#006D77] text-white' : 'bg-slate-100 text-slate-700'}`}>
                        {cluster.cluster}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">Pin Zone {cluster.cluster}xxx</div>
                        <div className="text-xs text-slate-500">{cluster.bookings.length} parcels • {cluster.totalWeight?.toFixed(1)} kg</div>
                      </div>
                    </div>
                    {cluster.expressCount > 0 && (
                      <span className="text-xs bg-red-100 text-red-700 font-black px-2 py-1 rounded-full">{cluster.expressCount} Express</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {cluster.bookings.slice(0, 3).map(b => (
                      <div key={b.id} className="bg-slate-50 rounded-lg p-2 text-xs">
                        <div className="font-mono font-bold text-slate-700 truncate">{b.trackingId}</div>
                        <div className="text-slate-400 truncate">{b.receiver}</div>
                      </div>
                    ))}
                    {cluster.bookings.length > 3 && (
                      <div className="bg-slate-50 rounded-lg p-2 text-xs flex items-center justify-center text-slate-400 font-bold">
                        +{cluster.bookings.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Delivery Riders Panel */}
          <div className="bg-gradient-to-b from-[#0F172A] to-[#1e293b] rounded-xl shadow-lg overflow-hidden text-white h-fit sticky top-6">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-bold flex items-center gap-2">
                <Users size={18} className="text-[#006D77]" /> Delivery Riders
                <span className="ml-auto text-xs bg-green-500/20 text-green-300 font-bold px-2 py-0.5 rounded-full">{deliveryRiders.length} available</span>
              </h2>
            </div>
            <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
              {deliveryRiders.length === 0 ? (
                <p className="text-white/40 text-center py-6 text-sm">No delivery riders online</p>
              ) : deliveryRiders.map(r => <RiderCard key={r._id} rider={r} />)}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB: PARTNER ROUTING ═══ */}
      {activeTab === 'partners' && (
        <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Navigation size={18} className="text-[#006D77]" /> Partner Recommendation Engine</h2>
            <form onSubmit={handleRecommendPartners} className="flex gap-3">
              <input
                type="text"
                value={partnerBookingId}
                onChange={e => setPartnerBookingId(e.target.value)}
                placeholder="Enter Booking ID to find best partners..."
                className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#006D77] outline-none font-mono font-bold text-sm"
              />
              <button type="submit" disabled={partnerLoading || !partnerBookingId.trim()} className="px-6 py-3 bg-[#006D77] hover:bg-[#005f6a] text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition shadow-md">
                {partnerLoading ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
                Analyse
              </button>
            </form>
            <p className="text-xs text-slate-400 mt-2">Engine checks serviceability, weight, parcel type, cutoff time, and remaining capacity.</p>
          </div>

          {partnerAssignResult && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
              <CheckCircle size={20} className="text-green-600" />
              <span className="font-bold text-green-800">{partnerAssignResult}</span>
            </div>
          )}

          {partnerRecs && !partnerRecs.success && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <p className="font-bold text-amber-800 flex items-center gap-2"><AlertTriangle size={18} /> No Eligible Partners</p>
              <p className="text-sm text-amber-700 mt-1">{partnerRecs.error}</p>
              <p className="text-xs text-amber-600 mt-1">{partnerRecs.reason}</p>
            </div>
          )}

          {partnerRecs?.recommendations && (
            <>
              <div className="flex items-center gap-3">
                <div className="text-xs bg-slate-100 rounded-lg px-3 py-1.5 font-medium text-slate-600">
                  Booking: <strong className="font-mono">{partnerRecs.bookingId?.slice(-8)}</strong>
                </div>
                <div className="text-xs bg-slate-100 rounded-lg px-3 py-1.5 font-medium text-slate-600">
                  {parcelWeight} kg • {partnerRecs.parcelType} • PIN: {partnerRecs.destPincode || 'N/A'}
                </div>
                <div className="text-xs bg-slate-100 rounded-lg px-3 py-1.5 font-medium text-slate-600">
                  {partnerRecs.allEligible?.length} partners eligible
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PartnerCard
                  rec={partnerRecs.recommendations.cheapest}
                  tier="Cheapest"
                  icon={DollarSign}
                  color={{ border: 'border-green-200', header: 'bg-green-50', icon: 'text-green-600', button: 'bg-green-600 hover:bg-green-700', scoreColor: '#16A34A' }}
                  onAssign={handleAssignPartner}
                />
                <PartnerCard
                  rec={partnerRecs.recommendations.fastest}
                  tier="Fastest"
                  icon={Rocket}
                  color={{ border: 'border-blue-200', header: 'bg-blue-50', icon: 'text-blue-600', button: 'bg-blue-600 hover:bg-blue-700', scoreColor: '#2563EB' }}
                  onAssign={handleAssignPartner}
                />
                <PartnerCard
                  rec={partnerRecs.recommendations.recommended}
                  tier="Recommended"
                  icon={Award}
                  color={{ border: 'border-[#006D77]', header: 'bg-[#006D77]/5', icon: 'text-[#006D77]', button: 'bg-[#006D77] hover:bg-[#005f6a]', scoreColor: '#006D77' }}
                  onAssign={handleAssignPartner}
                />
              </div>

              {partnerRecs.allEligible?.length > 3 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <p className="text-xs font-bold text-slate-600 uppercase">All Eligible Partners ({partnerRecs.allEligible.length})</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-slate-50 text-xs text-slate-500 uppercase font-bold">
                        <th className="p-3 text-left">Partner</th>
                        <th className="p-3 text-left">Speed</th>
                        <th className="p-3 text-left">Cost</th>
                        <th className="p-3 text-left">SLA</th>
                        <th className="p-3 text-left">Score</th>
                        <th className="p-3 text-left">Action</th>
                      </tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {partnerRecs.allEligible.map(r => (
                          <tr key={r.partner._id} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-900">{r.partner.companyName}</td>
                            <td className="p-3"><span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-bold">{r.partner.speed}</span></td>
                            <td className="p-3 font-bold">₹{r.estimatedCost}</td>
                            <td className="p-3">{r.partner.slaScore}/100</td>
                            <td className="p-3 font-bold text-[#006D77]">{r.compositeScore}</td>
                            <td className="p-3">
                              <button onClick={() => handleAssignPartner(r.partner._id)} disabled={!!assigningPartner} className="px-3 py-1 text-xs font-bold bg-[#006D77] text-white rounded-lg hover:bg-[#005f6a] disabled:opacity-50 flex items-center gap-1">
                                {assigningPartner === r.partner._id ? <Loader2 size={12} className="animate-spin" /> : null} Assign
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ═══ TAB: DISPATCH RULES ═══ */}
      {activeTab === 'rules' && (
        <div className="max-w-3xl space-y-5 animate-in fade-in duration-300">
          {rulesLoading ? (
            <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
          ) : rules ? (
            <>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-bold text-slate-900 mb-5 flex items-center gap-2"><Settings size={18} className="text-[#006D77]" /> Pickup Rider Scoring Weights</h2>
                <div className="space-y-4">
                  {Object.entries(rules.pickupWeights || {}).map(([key, val]) => (
                    <div key={key}>
                      <div className="flex justify-between mb-1">
                        <label className="text-sm font-bold text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                        <span className="text-sm font-black text-[#006D77]">{val}</span>
                      </div>
                      <input type="range" min={0} max={100} value={val}
                        onChange={e => setRules(r => ({ ...r, pickupWeights: { ...r.pickupWeights, [key]: Number(e.target.value) } }))}
                        className="w-full accent-[#006D77]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-bold text-slate-900 mb-5 flex items-center gap-2"><Truck size={18} className="text-[#006D77]" /> Last-Mile Scoring Weights</h2>
                <div className="space-y-4">
                  {Object.entries(rules.lastMileWeights || {}).map(([key, val]) => (
                    <div key={key}>
                      <div className="flex justify-between mb-1">
                        <label className="text-sm font-bold text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                        <span className="text-sm font-black text-[#006D77]">{val}</span>
                      </div>
                      <input type="range" min={0} max={100} value={val}
                        onChange={e => setRules(r => ({ ...r, lastMileWeights: { ...r.lastMileWeights, [key]: Number(e.target.value) } }))}
                        className="w-full accent-[#006D77]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-bold text-slate-900 mb-5 flex items-center gap-2"><Navigation size={18} className="text-[#006D77]" /> Guard Rails</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Max Tasks per Rider / Shift</label>
                    <input type="number" value={rules.maxTasksPerRider} onChange={e => setRules(r => ({ ...r, maxTasksPerRider: Number(e.target.value) }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-bold" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Max Km Radius from Pickup</label>
                    <input type="number" value={rules.maxKmFromPickup} onChange={e => setRules(r => ({ ...r, maxKmFromPickup: Number(e.target.value) }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-bold" />
                  </div>
                </div>
                <div className="flex gap-6 mt-5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={rules.enforceCutoffTime} onChange={e => setRules(r => ({ ...r, enforceCutoffTime: e.target.checked }))} className="w-4 h-4 accent-[#006D77]" />
                    <span className="text-sm font-bold text-slate-700">Enforce Partner Cutoff Time</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={rules.enforceCapacityLimit} onChange={e => setRules(r => ({ ...r, enforceCapacityLimit: e.target.checked }))} className="w-4 h-4 accent-[#006D77]" />
                    <span className="text-sm font-bold text-slate-700">Enforce Partner Capacity Limit</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={handleSaveRules} disabled={rulesSaving} className="px-6 py-3 bg-[#006D77] hover:bg-[#005f6a] text-white font-bold rounded-xl flex items-center gap-2 shadow-md disabled:opacity-60 transition">
                  {rulesSaving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                  Save Rules
                </button>
              </div>
            </>
          ) : <p className="text-slate-400 text-center py-8">Could not load rules. Check permissions.</p>}
        </div>
      )}

      {/* Manual Assign Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-900">Manual Rider Assignment</h2>
              <button onClick={() => setShowManualModal(null)} className="text-slate-400 hover:text-slate-700"><X size={22} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Select Rider</label>
                <select value={manualRiderId} onChange={e => setManualRiderId(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium">
                  <option value="">-- Choose a rider --</option>
                  {availableRiders.map(r => (
                    <option key={r._id} value={r._id}>{r.name} ({r.vehicleType}) — {r.activeTasks} active tasks</option>
                  ))}
                </select>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 flex items-start gap-2">
                <Info size={14} className="shrink-0 mt-0.5" />
                Manual override will be recorded in the audit log.
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowManualModal(null)} className="flex-1 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
                <button onClick={handleManualAssign} disabled={!manualRiderId} className="flex-1 py-2.5 text-sm font-bold text-white bg-[#006D77] hover:bg-[#005f6a] rounded-lg disabled:opacity-50 transition">Assign Rider</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
