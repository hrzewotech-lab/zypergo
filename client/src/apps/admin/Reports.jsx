import React, { useState, useEffect } from 'react';
import { Download, Calendar, Filter, FileText, ArrowRight, TrendingUp, AlertTriangle, Package, Loader2, DollarSign } from 'lucide-react';
import api from '../../api';

export default function Reports() {
  const [dateRange, setDateRange] = useState('Today');
  const [kpis, setKpis] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kpiRes, chartRes] = await Promise.all([
        api.get('/analytics/kpis'),
        api.get('/analytics/charts/weekly')
      ]);
      setKpis(kpiRes.data.data);
      setChartData(chartRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    setExporting(type);
    try {
      const response = await api.get(`/analytics/export/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export report.');
    } finally {
      setExporting('');
    }
  };

  if (loading && !kpis) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#006D77] w-8 h-8" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Business intelligence, operational KPIs, and data exports.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm font-bold text-slate-700 shadow-sm">
            <Calendar size={16} className="text-[#006D77]"/> 
            <select className="bg-transparent outline-none cursor-pointer" value={dateRange} onChange={e => setDateRange(e.target.value)}>
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* ALERT STRIP */}
      {kpis?.slaBreaches > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500" />
            <div>
              <h3 className="text-red-800 font-bold">SLA Breach Alert</h3>
              <p className="text-sm text-red-600 font-medium">There are {kpis.slaBreaches} unresolved exceptions that have breached the 48-hour SLA.</p>
            </div>
          </div>
          <button className="text-sm font-bold text-red-700 hover:text-red-900 underline">View NDR Queue</button>
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Bookings</div>
          <div className="text-3xl font-black text-slate-800">{kpis?.totalBookings}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">In Transit</div>
          <div className="text-3xl font-black text-[#006D77]">{kpis?.inTransit}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-2">Failed / Delayed</div>
          <div className="text-3xl font-black text-red-600">{kpis?.failed}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-2">Open Exceptions</div>
          <div className="text-3xl font-black text-amber-600">{kpis?.openExceptions}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-[10px] font-bold text-green-500 uppercase tracking-wider mb-2">Revenue Generated</div>
          <div className="text-3xl font-black text-green-600 flex items-center gap-1">
            <span className="text-lg">₹</span>{kpis?.revenue.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-slate-900 text-lg">Weekly Volume & Success Rate</h2>
            </div>
            
            {/* CSS Bar Chart Simulation using fetched data */}
            <div className="h-64 flex items-end justify-between gap-4 px-4 pb-4 border-b border-slate-100">
              {chartData.map((data, i) => (
                <div key={i} className="w-full flex flex-col justify-end gap-1 group relative">
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold py-1.5 px-2.5 rounded whitespace-nowrap transition pointer-events-none z-10 flex flex-col items-center">
                    <span>{data.successful + data.failed} Total</span>
                    <span className="text-[10px] text-slate-300">({data.failed} Failed)</span>
                  </div>
                  {/* Successful Bar */}
                  <div className="w-full bg-[#006D77] rounded-t-sm transition-all duration-500" style={{ height: `${data.successful}%` }}></div>
                  {/* Failed Bar */}
                  <div className="w-full bg-[#FFB703] rounded-sm transition-all duration-500" style={{ height: `${data.failed}%` }}></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between px-4 pt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {chartData.map(d => <span key={d.day}>{d.day}</span>)}
            </div>
            
            <div className="flex gap-6 mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#006D77]"></div>
                <span className="text-sm font-medium text-slate-600">Successful Deliveries</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#FFB703]"></div>
                <span className="text-sm font-medium text-slate-600">Failed / Delayed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Exports Side Panel */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
          <h2 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><FileText size={20} className="text-[#006D77]"/> Report Generation</h2>
          <p className="text-xs text-slate-500 mb-6">Download raw data as CSV for accounting, forecasting, and ML analysis.</p>
          
          <div className="space-y-3">
            {[
              { id: 'daily-bookings', title: 'Daily Bookings Report', desc: 'All bookings, status, and revenue' },
              { id: 'exceptions', title: 'NDR & Exception Log', desc: 'All failed deliveries and reasons' },
            ].map((report) => (
              <div key={report.id} className="p-4 border border-slate-100 rounded-xl hover:border-[#006D77] hover:shadow-md transition flex flex-col gap-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{report.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{report.desc}</p>
                </div>
                <button 
                  onClick={() => handleExport(report.id)}
                  disabled={exporting === report.id}
                  className="w-full py-2 bg-slate-50 text-slate-700 hover:bg-[#006D77] hover:text-white border border-slate-200 hover:border-[#006D77] text-xs font-bold rounded-lg transition flex justify-center items-center gap-2"
                >
                  {exporting === report.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
                  {exporting === report.id ? 'Generating...' : 'Export CSV'}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">Coming Soon</h3>
            <ul className="text-xs text-slate-500 space-y-2">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div> Partner Margin Reports</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div> Route Profitability AI Forecast</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
