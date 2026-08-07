import React from 'react';
import { MapPin, AlertTriangle, Truck, Users, MoreVertical } from 'lucide-react';

export default function LiveMapPage() {
  return (
    <div className="p-6 h-full flex flex-col font-sans">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Live Map & Overview</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 shrink-0">
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
           <div className="flex justify-between items-start mb-2">
             <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Bookings</span>
             <Truck size={16} className="text-slate-400" />
           </div>
           <div className="flex items-end gap-2">
             <span className="text-3xl font-bold text-slate-900">1,248</span>
             <span className="text-xs font-medium text-emerald-600 mb-1 flex items-center">↑ 12%</span>
           </div>
        </div>
        
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
           <div className="flex justify-between items-start mb-2">
             <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In-Transit</span>
             <Truck size={16} className="text-accent" />
           </div>
           <div className="flex items-end gap-2">
             <span className="text-3xl font-bold text-slate-900">432</span>
             <span className="text-xs font-medium text-slate-500 mb-1">Active</span>
           </div>
        </div>

        <div className="bg-white p-4 border border-red-200 rounded-lg shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -z-10"></div>
           <div className="flex justify-between items-start mb-2">
             <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Delayed</span>
             <AlertTriangle size={16} className="text-red-500" />
           </div>
           <div className="flex items-end gap-2">
             <span className="text-3xl font-bold text-red-600">18</span>
             <span className="text-xs font-medium text-red-500 mb-1">Requires Action</span>
           </div>
        </div>

        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
           <div className="flex justify-between items-start mb-2">
             <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Riders Online</span>
             <Users size={16} className="text-primary" />
           </div>
           <div className="flex items-end gap-1">
             <span className="text-3xl font-bold text-slate-900">315</span>
             <span className="text-xs font-medium text-slate-500 mb-1">/ 450 Total</span>
           </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Map Area */}
        <div className="flex-1 bg-slate-100 rounded-lg border border-slate-200 relative overflow-hidden flex items-center justify-center">
            {/* Fake map background using pattern */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#006D77 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <div className="absolute top-4 left-4 bg-white px-3 py-1.5 rounded-full shadow border border-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-700">LIVE TRACKING ACTIVE</span>
            </div>

            <div className="absolute right-4 top-4 flex flex-col gap-2">
              <button className="bg-white p-2 rounded shadow border border-slate-200 hover:bg-slate-50"><span className="font-bold">+</span></button>
              <button className="bg-white p-2 rounded shadow border border-slate-200 hover:bg-slate-50"><span className="font-bold">-</span></button>
            </div>

            <div className="z-10 text-center">
              <MapPin size={48} className="text-primary mx-auto mb-2 opacity-50" />
              <p className="text-slate-500 font-medium uppercase tracking-widest text-sm">Interactive Map Integration</p>
            </div>
        </div>

        {/* Priority Action Queue */}
        <div className="w-96 flex flex-col bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="font-bold text-slate-900">Priority Action Queue</h2>
            <a href="#" className="text-xs font-bold text-primary hover:underline">VIEW ALL</a>
          </div>
          
          <div className="p-3 border-b border-slate-100 flex gap-2">
            <button className="px-3 py-1 text-xs font-bold bg-slate-200 text-slate-700 rounded">ALL</button>
            <button className="px-3 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded">UNASSIGNED</button>
            <button className="px-3 py-1 text-xs font-bold bg-red-100 text-red-700 rounded">EXCEPTIONS</button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {/* Item 1 */}
            <div className="p-3 border border-slate-200 rounded-md hover:border-slate-300 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-mono text-slate-500">SHP-9924A</span>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">PENDING</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">Medical Supplies - Urgent</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin size={12}/> Hub Delta → City Hospital
              </p>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-xs font-bold text-red-500">Due in 45m</span>
                <button className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded hover:bg-primary-dark">ASSIGN RIDER</button>
              </div>
            </div>

            {/* Item 2 */}
            <div className="p-3 border border-red-200 bg-red-50/50 rounded-md">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-mono text-slate-500">SHP-9918B</span>
                <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded">DELAYED</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">Tech Components</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <Users size={12}/> Rider #082 - Flat Tire
              </p>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">+15m ETA</span>
                <button className="bg-white border border-slate-300 text-slate-700 text-[10px] font-bold px-3 py-1 rounded hover:bg-slate-50">RE-ROUTE</button>
              </div>
            </div>

            {/* Item 3 */}
            <div className="p-3 border border-slate-200 rounded-md">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-mono text-slate-500">SHP-9945C</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">IN-TRANSIT</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">Office Docs</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin size={12}/> Financial Dist. → Midtown
              </p>
              <div className="mt-3 flex items-center gap-2">
                 <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                   <div className="h-full bg-primary w-2/3"></div>
                 </div>
                 <MoreVertical size={14} className="text-slate-400" />
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
