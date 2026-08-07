import React, { useState, useEffect } from 'react';
import { Package, Truck, AlertCircle, IndianRupee, TrendingUp, TrendingDown, ArrowRight, RefreshCcw, Map as MapIcon, Users, Network, XCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    todaysBookings: 0,
    inTransit: 0,
    pendingPickups: 0,
    delivered: 0,
    failed: 0,
    returns: 0,
    exceptions: 0,
    revenue: 0,
    cashCollection: 0,
    hubWiseParcels: [],
    alerts: {
      delayedRoutes: 0,
      highRisk: 0,
      unscanned: 0,
      partnerExceptions: 0,
      complaints: 0
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard-stats');
      if (res.data && res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const topKpis = [
    { title: 'Total Bookings', value: stats.totalBookings, subtitle: `${stats.todaysBookings} Today`, icon: <Package size={24}/>, color: 'bg-blue-100 text-blue-700' },
    { title: 'In Transit (Live)', value: stats.inTransit, subtitle: 'Currently on road', icon: <Truck size={24}/>, color: 'bg-indigo-100 text-indigo-700' },
    { title: 'Pending Pickups', value: stats.pendingPickups, subtitle: 'Waiting for assignment', icon: <RefreshCcw size={24}/>, color: 'bg-amber-100 text-amber-700' },
    { title: 'Delivered', value: stats.delivered, subtitle: 'Total successful', icon: <CheckCircle size={24}/>, color: 'bg-emerald-100 text-emerald-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Control Tower</h1>
          <p className="text-slate-500 text-sm mt-1">Live snapshot of the ZyperGo logistics network.</p>
        </div>
        <button onClick={fetchStats} className="flex items-center gap-2 text-[#006D77] font-bold text-sm bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50">
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {topKpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${kpi.color}`}>
                {kpi.icon}
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">{kpi.title}</h3>
            <div className="flex items-end gap-3 mt-2">
              <p className="text-3xl font-black text-slate-900">{kpi.value}</p>
              <p className="text-xs font-bold text-slate-400 mb-1">{kpi.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Middle Section: Financials & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Financial Overview */}
        <div className="bg-gradient-to-br from-[#006D77] to-[#004a51] rounded-xl shadow-sm border border-slate-200 p-6 text-white flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white/80 text-sm uppercase tracking-wider mb-6">Financial Overview</h3>
            <div className="space-y-6">
              <div>
                <p className="text-xs text-white/70 mb-1">Total Revenue</p>
                <p className="text-3xl font-black flex items-center"><IndianRupee size={24} className="mr-1"/> {stats.revenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-white/70 mb-1">Cash Collection (COD)</p>
                <p className="text-xl font-bold flex items-center text-[#FFB703]"><IndianRupee size={18} className="mr-1"/> {stats.cashCollection.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <Link to="/finance" className="block text-center bg-white/10 hover:bg-white/20 font-bold py-2 rounded transition text-sm">
              View Detailed Financials
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 text-lg mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <button className="bg-[#006D77] hover:bg-[#00585f] text-white p-4 rounded-xl text-sm font-bold shadow-sm transition flex flex-col items-center justify-center gap-2 text-center h-24">
              <Package size={20} /> Manual Booking
            </button>
            <button className="bg-slate-50 hover:bg-slate-100 text-slate-700 p-4 rounded-xl text-sm font-bold shadow-sm transition border border-slate-200 flex flex-col items-center justify-center gap-2 text-center h-24">
              <Users size={20} /> Assign Rider
            </button>
            <button className="bg-slate-50 hover:bg-slate-100 text-slate-700 p-4 rounded-xl text-sm font-bold shadow-sm transition border border-slate-200 flex flex-col items-center justify-center gap-2 text-center h-24">
              <Network size={20} /> Assign Partner
            </button>
            <button className="bg-slate-50 hover:bg-slate-100 text-slate-700 p-4 rounded-xl text-sm font-bold shadow-sm transition border border-slate-200 flex flex-col items-center justify-center gap-2 text-center h-24">
              <Truck size={20} /> Create Manifest
            </button>
            <button className="bg-slate-50 hover:bg-slate-100 text-slate-700 p-4 rounded-xl text-sm font-bold shadow-sm transition border border-slate-200 flex flex-col items-center justify-center gap-2 text-center h-24">
              <IndianRupee size={20} /> Process Refund
            </button>
            <button className="bg-red-50 hover:bg-red-100 text-red-700 p-4 rounded-xl text-sm font-bold shadow-sm transition border border-red-100 flex flex-col items-center justify-center gap-2 text-center h-24">
              <AlertCircle size={20} /> Raise Escalation
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Section: Map & Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Live Map Placeholder */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <MapIcon size={16} className="text-[#006D77]"/> Live Operations Map
            </h3>
            <span className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Live
            </span>
          </div>
          <div className="flex-1 min-h-[300px] bg-slate-100 relative">
            <div className="absolute inset-0 opacity-40 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=20.5937,78.9629&zoom=5&size=800x400&maptype=roadmap&style=feature:all|element:labels.text.fill|color:0x9ca3af&style=feature:all|element:labels.text.stroke|color:0xf3f4f6&style=feature:landscape|element:all|color:0xf3f4f6&style=feature:road|element:all|color:0xffffff&style=feature:water|element:all|color:0xe5e7eb')] bg-cover bg-center"></div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl text-center max-w-sm border border-slate-200">
                <MapIcon size={48} className="text-slate-300 mx-auto mb-4" />
                <h4 className="font-bold text-slate-800 text-lg mb-2">Live Map View</h4>
                <p className="text-slate-500 text-sm mb-4">Integrate with Google Maps API or Mapbox to track riders, partners, and active routes in real-time.</p>
                <Link to="/live-map" className="inline-block bg-[#006D77] text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-[#00585f]">
                  Open Full Map
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts & Exceptions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900 text-lg">Alerts & Exceptions</h3>
            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-black">{stats.exceptions} Total</span>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
              <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-900 text-sm">Delayed Routes</p>
                <p className="text-xs text-red-700 mt-1">{stats.alerts.delayedRoutes} routes are running behind ETA.</p>
              </div>
            </div>
            
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 text-sm">High-Risk Shipments</p>
                <p className="text-xs text-amber-700 mt-1">{stats.alerts.highRisk} high-value parcels flagged.</p>
              </div>
            </div>

            <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg flex items-start gap-3">
              <XCircle size={18} className="text-orange-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-orange-900 text-sm">Failed Deliveries</p>
                <p className="text-xs text-orange-700 mt-1">{stats.failed} attempts failed today. Action required.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
              <Package size={18} className="text-slate-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800 text-sm">Unscanned Shipments</p>
                <p className="text-xs text-slate-500 mt-1">{stats.alerts.unscanned} missed scans at sorting hubs.</p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Operational Views */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 text-lg mb-6">Operational Views</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Hub-wise */}
          <div className="border border-slate-100 p-4 rounded-xl">
            <h4 className="font-bold text-slate-700 text-sm mb-3 border-b border-slate-100 pb-2">Hub-wise Parcels</h4>
            {stats.hubWiseParcels.length > 0 ? (
              <div className="space-y-2">
                {stats.hubWiseParcels.map((hub, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-slate-500">{hub.hubName}</span>
                    <span className="font-bold text-slate-800">{hub.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No hub data available.</p>
            )}
            <Link to="/hubs" className="text-xs text-[#006D77] font-bold mt-4 inline-block hover:underline">View All Hubs &rarr;</Link>
          </div>

          {/* City-wise Placeholder */}
          <div className="border border-slate-100 p-4 rounded-xl">
            <h4 className="font-bold text-slate-700 text-sm mb-3 border-b border-slate-100 pb-2">City-wise Volume</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Mumbai</span><span className="font-bold text-slate-800">42%</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Delhi</span><span className="font-bold text-slate-800">28%</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Bangalore</span><span className="font-bold text-slate-800">15%</span></div>
            </div>
          </div>

          {/* Partner-wise Placeholder */}
          <div className="border border-slate-100 p-4 rounded-xl">
            <h4 className="font-bold text-slate-700 text-sm mb-3 border-b border-slate-100 pb-2">Top Partners</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Shadowfax</span><span className="font-bold text-slate-800 text-green-600">98% SLA</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Delhivery</span><span className="font-bold text-slate-800 text-green-600">95% SLA</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Local Fleet A</span><span className="font-bold text-slate-800 text-amber-500">82% SLA</span></div>
            </div>
          </div>

          {/* Returns & Failed */}
          <div className="border border-slate-100 p-4 rounded-xl bg-slate-50">
            <h4 className="font-bold text-slate-700 text-sm mb-3 border-b border-slate-200 pb-2">Fulfillment Health</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Returns</span><span className="font-bold text-red-600">{stats.returns}</span></div>
                <div className="w-full bg-slate-200 rounded-full h-1.5"><div className="bg-red-500 h-1.5 rounded-full" style={{width: '5%'}}></div></div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Failed</span><span className="font-bold text-orange-600">{stats.failed}</span></div>
                <div className="w-full bg-slate-200 rounded-full h-1.5"><div className="bg-orange-400 h-1.5 rounded-full" style={{width: '8%'}}></div></div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
