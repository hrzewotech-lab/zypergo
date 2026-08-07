import React, { useState, useEffect } from 'react';
import { Package, Truck, AlertCircle, IndianRupee, TrendingUp, TrendingDown, ArrowRight, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    inTransit: 0,
    pendingPickups: 0,
    exceptions: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard-stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // In a real app, use WebSockets. For now, poll every 30s.
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const kpis = [
    { title: 'Total Bookings', value: stats.totalBookings, trend: '+12%', trendUp: true, icon: <Package size={24}/>, color: 'bg-blue-100 text-blue-700' },
    { title: 'In Transit (Live)', value: stats.inTransit, trend: '+5%', trendUp: true, icon: <Truck size={24}/>, color: 'bg-indigo-100 text-indigo-700' },
    { title: 'Pending Pickups', value: stats.pendingPickups, trend: '-2%', trendUp: false, icon: <RefreshCcw size={24}/>, color: 'bg-yellow-100 text-yellow-700' },
    { title: 'Exceptions / Delayed', value: stats.exceptions, trend: '+1%', trendUp: false, icon: <AlertCircle size={24}/>, color: 'bg-red-100 text-red-700' },
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${kpi.color}`}>
                {kpi.icon}
              </div>
              <span className={`flex items-center text-xs font-bold ${kpi.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.trendUp ? <TrendingUp size={14} className="mr-1"/> : <TrendingDown size={14} className="mr-1"/>}
                {kpi.trend}
              </span>
            </div>
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">{kpi.title}</h3>
            <p className="text-3xl font-black text-slate-900 mt-2">{kpi.value}</p>
          </div>
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 text-lg mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="bg-[#006D77] hover:bg-[#00585f] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition">Manual Booking</button>
          <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition border border-slate-200">Assign Rider</button>
          <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition border border-slate-200">Assign Partner</button>
          <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition border border-slate-200">Create Manifest</button>
          <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition border border-slate-200">Process Refund</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900 text-lg">High-Risk & Exceptions</h3>
            <Link to="/bookings" className="text-sm font-bold text-[#006D77] flex items-center gap-1 hover:underline">
              View All <ArrowRight size={16}/>
            </Link>
          </div>
          
          <div className="space-y-4">
            {stats.exceptions > 0 && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-900">You have {stats.exceptions} delayed routes/shipments.</p>
                  <p className="text-sm text-red-700 mt-1">Manual intervention via the Bookings tab is required to re-assign or refund.</p>
                </div>
              </div>
            )}
            
            {/* Mocking additional alerts per user spec */}
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">3 Unscanned Shipments Detected</p>
                <p className="text-sm text-amber-700 mt-1">Expected checkpoints missed at Hub #4 (Destination Receiving).</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#006D77] to-[#004a51] rounded-xl shadow-sm border border-slate-200 p-6 text-white flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white/80 text-sm uppercase tracking-wider mb-6">Financial Overview</h3>
            <div className="space-y-6">
              <div>
                <p className="text-xs text-white/70 mb-1">Total Revenue (Today)</p>
                <p className="text-3xl font-black flex items-center"><IndianRupee size={24} className="mr-1"/> 12,450</p>
              </div>
              <div>
                <p className="text-xs text-white/70 mb-1">Partner Payables (Pending)</p>
                <p className="text-xl font-bold flex items-center text-[#FFB703]"><IndianRupee size={18} className="mr-1"/> 4,120</p>
              </div>
              <div>
                <p className="text-xs text-white/70 mb-1">Cash Collection (COD)</p>
                <p className="text-xl font-bold flex items-center"><IndianRupee size={18} className="mr-1"/> 8,300</p>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <hr className="border-white/20 mb-4" />
            <Link to="/finance" className="block text-center bg-white/10 hover:bg-white/20 font-bold py-2 rounded transition text-sm">
              View Financials
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
