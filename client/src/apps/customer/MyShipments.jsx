import React, { useState } from 'react';
import { Truck, CheckCircle2, XCircle, Package, Search, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function MyShipments() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const shipments = [
    { id: 'ZYP-8924-A', date: 'Oct 24, 2023', origin: 'Shanghai, CN', destination: 'Los Angeles, US', status: 'In Transit', icon: Truck, statusColor: 'bg-[#a7f3d0] text-[#047857]' },
    { id: 'ZYP-7102-C', date: 'Oct 15, 2023', origin: 'Rotterdam, NL', destination: 'New York, US', status: 'Completed', icon: CheckCircle2, statusColor: 'bg-slate-200 text-slate-700' },
    { id: 'ZYP-9912-X', date: 'Oct 02, 2023', origin: 'Berlin, DE', destination: 'London, UK', status: 'Cancelled', icon: XCircle, statusColor: 'bg-red-100 text-red-700' },
    { id: 'ZYP-8933-B', date: 'Oct 26, 2023', origin: 'Tokyo, JP', destination: 'Seattle, US', status: 'Processing', icon: Package, statusColor: 'bg-sky-100 text-sky-700' }
  ];

  return (
    <div className="max-w-7xl mx-auto py-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Shipments</h1>
        <p className="text-slate-600">Manage and track your full booking history.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select className="border border-slate-300 rounded-md text-sm px-3 py-2 text-slate-700 bg-white outline-none focus:border-[#00767C]">
              <option>All Statuses</option>
              <option>In Transit</option>
              <option>Completed</option>
              <option>Cancelled</option>
              <option>Processing</option>
            </select>
            <input type="date" className="border border-slate-300 rounded-md text-sm px-3 py-2 text-slate-700 outline-none focus:border-[#00767C]" />
            <span className="text-slate-400">-</span>
            <input type="date" className="border border-slate-300 rounded-md text-sm px-3 py-2 text-slate-700 outline-none focus:border-[#00767C]" />
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search Tracking ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm w-full outline-none focus:border-[#00767C]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Tracking ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Route</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shipments.map((shipment, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 font-medium text-slate-900">
                      <shipment.icon size={18} className="text-[#00767C]" />
                      {shipment.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{shipment.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      <span>{shipment.origin}</span>
                      <ChevronRight size={14} className="text-slate-300" />
                      <span className="font-medium text-slate-900">{shipment.destination}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${shipment.statusColor}`}>
                      {shipment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => navigate(`/track/${shipment.id}`)} className="border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 px-4 py-1.5 rounded text-xs font-bold transition-colors">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <div>Showing 1 to 4 of 24 entries</div>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-medium">Prev</button>
            <button className="px-3 py-1 border border-slate-300 rounded bg-slate-50 text-slate-700 font-medium">1</button>
            <button className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 text-slate-700 font-medium">2</button>
            <button className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 text-slate-700 font-medium">3</button>
            <button className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 text-slate-700 font-medium">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
