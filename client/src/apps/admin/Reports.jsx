import React, { useState } from 'react';
import { Download, Calendar, Filter, FileText, ArrowRight, TrendingUp } from 'lucide-react';

export default function Reports() {
  const [dateRange, setDateRange] = useState('This Week');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Business intelligence, performance metrics, and data exports.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm font-bold text-slate-700 shadow-sm cursor-pointer">
            <Calendar size={16} className="text-[#006D77]"/> 
            <select className="bg-transparent outline-none cursor-pointer" value={dateRange} onChange={e => setDateRange(e.target.value)}>
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <button className="bg-[#006D77] hover:bg-[#00585f] text-white px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 shadow-sm">
            <Download size={16} /> Export All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-slate-900 text-lg">Booking Volume vs Successful Deliveries</h2>
              <button className="text-slate-400 hover:text-slate-600 transition"><Filter size={18}/></button>
            </div>
            
            {/* CSS Bar Chart Simulation */}
            <div className="h-64 flex items-end justify-between gap-2 px-4 pb-4 border-b border-slate-100">
              {[40, 55, 30, 80, 65, 90, 75].map((val, i) => (
                <div key={i} className="w-full max-w-[40px] flex flex-col justify-end gap-1 group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold py-1 px-2 rounded whitespace-nowrap transition pointer-events-none z-10">
                    {val * 10} Bookings
                  </div>
                  {/* Successful Bar */}
                  <div className="w-full bg-[#006D77] rounded-t-sm transition-all duration-500 ease-out" style={{ height: `${val}%` }}></div>
                  {/* Failed/Pending Bar */}
                  <div className="w-full bg-[#FFB703] rounded-sm transition-all duration-500 ease-out" style={{ height: `${100 - val > 20 ? 100 - val - 20 : 10}%` }}></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between px-4 pt-4 text-xs font-bold text-slate-400 uppercase">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
            
            <div className="flex gap-6 mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#006D77]"></div>
                <span className="text-sm font-medium text-slate-600">Successful Deliveries</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#FFB703]"></div>
                <span className="text-sm font-medium text-slate-600">Failed / Pending</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="font-bold text-slate-900 mb-4">SLA Compliance Rate</h2>
              <div className="flex items-center justify-center py-6">
                <div className="relative w-32 h-32">
                   {/* CSS Donut Chart */}
                   <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      <path
                        className="text-slate-100"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#006D77]"
                        strokeDasharray="92, 100"
                        strokeWidth="4"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-slate-900">92%</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">On Time</span>
                    </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="font-bold text-slate-900 mb-4">Top Performing Hubs</h2>
              <div className="space-y-4">
                {[
                  { name: 'Seattle Central', score: 98 },
                  { name: 'Bellevue Intercity', score: 91 },
                  { name: 'Portland Regional', score: 87 }
                ].map((hub, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span className="text-slate-700">{hub.name}</span>
                      <span className="font-bold text-[#006D77]">{hub.score}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#006D77] rounded-full" style={{ width: `${hub.score}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Saved Reports Side Panel */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
          <h2 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><FileText size={20} className="text-[#FFB703]"/> Standard Reports</h2>
          
          <div className="space-y-3">
            {[
              { title: 'Daily Settlement Report', desc: 'Partner payouts & COD collection' },
              { title: 'Rider Performance Log', desc: 'Delivery times and rating averages' },
              { title: 'NDR & Exceptions', desc: 'List of all failed delivery attempts' },
              { title: 'Zone Pricing Analysis', desc: 'Profitability per delivery zone' },
            ].map((report, i) => (
              <div key={i} className="group p-4 border border-slate-100 rounded-xl hover:border-[#006D77] hover:shadow-md transition cursor-pointer flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#006D77] transition">{report.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{report.desc}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-[#006D77] group-hover:text-white transition shrink-0">
                  <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-3 border-2 border-dashed border-slate-300 rounded-xl text-sm font-bold text-slate-500 hover:border-[#006D77] hover:text-[#006D77] transition flex items-center justify-center gap-2">
            + Create Custom Report
          </button>
        </div>
      </div>
    </div>
  );
}
