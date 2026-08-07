import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, XCircle, AlertCircle, FileText } from 'lucide-react';

export default function RaiderManagementPage() {
  const [raiders, setRaiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pending');

  // In a real app, this would fetch from a specific raider endpoint.
  // We'll mock it for now since we don't have the user schema exposed in the admin API yet.
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setRaiders([
        { id: '1', name: 'Ravi Kumar', phone: '9876543210', status: 'Pending', vehicle: '2-Wheeler (Bike)', date: '2024-02-14' },
        { id: '2', name: 'Suresh Das', phone: '8765432109', status: 'Approved', vehicle: 'Mini Truck', date: '2024-02-12' },
        { id: '3', name: 'Mahesh Babu', phone: '7654321098', status: 'Suspended', vehicle: 'Auto', date: '2024-01-20' },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const handleAction = (id, action) => {
    // Mock updating state locally
    setRaiders(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
    // Provide visual feedback (could hook into a toast library)
    alert(`Raider ${action} successfully!`);
  };

  const filtered = raiders.filter(r => r.status === filter || filter === 'All');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Raider Management</h1>
          <p className="text-slate-500 text-sm mt-1">Review onboarding applications and manage active riders.</p>
        </div>
        <div className="relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
           <input 
             type="text" 
             placeholder="Search by name or phone..." 
             className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#006D77] outline-none w-64"
           />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex gap-4">
           {['Pending', 'Approved', 'Suspended', 'All'].map(f => (
             <button 
               key={f}
               onClick={() => setFilter(f)}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition ${filter === f ? 'bg-[#006D77] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
             >
               {f}
             </button>
           ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-200">
              <tr>
                <th className="p-4">Name / Phone</th>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Documents</th>
                <th className="p-4">Applied Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-500">Loading raiders...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-500">No raiders found in this category.</td></tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{r.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{r.phone}</p>
                    </td>
                    <td className="p-4 font-bold text-slate-700">{r.vehicle}</td>
                    <td className="p-4">
                      <button className="flex items-center gap-1 text-[#006D77] text-xs font-bold hover:underline">
                        <FileText size={14}/> View RC
                      </button>
                    </td>
                    <td className="p-4 text-slate-600">{r.date}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                        r.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        r.status === 'Suspended' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {r.status === 'Pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleAction(r.id, 'Approved')} className="p-1.5 text-green-600 bg-green-50 rounded hover:bg-green-100" title="Approve">
                            <CheckCircle2 size={16} />
                          </button>
                          <button onClick={() => handleAction(r.id, 'Suspended')} className="p-1.5 text-red-600 bg-red-50 rounded hover:bg-red-100" title="Reject">
                            <XCircle size={16} />
                          </button>
                        </div>
                      )}
                      {r.status === 'Approved' && (
                         <button onClick={() => handleAction(r.id, 'Suspended')} className="text-xs font-bold text-red-600 hover:underline">
                           Suspend
                         </button>
                      )}
                      {r.status === 'Suspended' && (
                         <button onClick={() => handleAction(r.id, 'Approved')} className="text-xs font-bold text-green-600 hover:underline">
                           Re-activate
                         </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
