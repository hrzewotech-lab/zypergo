import React, { useState } from 'react';
import { Plus, Search, MapPin, Users, Package, AlertTriangle, MoreVertical, X } from 'lucide-react';

export default function HubManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [hubs, setHubs] = useState([
    { id: 'HUB-101', name: 'Central Sorting Hub', type: 'Source', city: 'Seattle', parcels: 4520, capacity: 5000, manager: 'Alex Johnson', status: 'Active' },
    { id: 'HUB-102', name: 'North City Distribution', type: 'City', city: 'Seattle', parcels: 1200, capacity: 1500, manager: 'Sarah Smith', status: 'Active' },
    { id: 'HUB-103', name: 'Bellevue Intercity', type: 'Destination', city: 'Bellevue', parcels: 3100, capacity: 3000, manager: 'Mike Chen', status: 'Overloaded' }
  ]);

  const [newHub, setNewHub] = useState({ name: '', type: 'Source', city: '', capacity: '', manager: '' });

  const handleAddHub = (e) => {
    e.preventDefault();
    const hub = {
      id: `HUB-${Math.floor(Math.random() * 900) + 100}`,
      ...newHub,
      parcels: 0,
      status: 'Active'
    };
    setHubs([...hubs, hub]);
    setShowAddModal(false);
    setNewHub({ name: '', type: 'Source', city: '', capacity: '', manager: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Hub Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage source, destination, and city hubs.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#006D77] hover:bg-[#00585f] text-white px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Add Hub Location
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search hubs..." 
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#006D77] outline-none w-64"
            />
          </div>
          <div className="flex gap-2">
            <select className="bg-white border border-slate-200 rounded-lg text-sm px-3 py-2 outline-none">
              <option>All Types</option>
              <option>Source</option>
              <option>Destination</option>
              <option>City</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-bold">Hub Name & ID</th>
                <th className="p-4 font-bold">Location</th>
                <th className="p-4 font-bold">Capacity Load</th>
                <th className="p-4 font-bold">Hub Manager</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hubs.map((hub) => (
                <tr key={hub.id} className="hover:bg-slate-50 transition">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{hub.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-bold uppercase">{hub.type}</span> {hub.id}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                      <MapPin size={16} className="text-slate-400" /> {hub.city}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="w-full max-w-[150px]">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-slate-700">{hub.parcels.toLocaleString()}</span>
                        <span className="text-slate-400">/ {hub.capacity.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${hub.parcels > hub.capacity ? 'bg-red-500' : (hub.parcels / hub.capacity > 0.8 ? 'bg-amber-500' : 'bg-[#006D77]')}`}
                          style={{ width: `${Math.min(100, (hub.parcels / hub.capacity) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#e0f2f1] text-[#006D77] flex items-center justify-center text-[10px] font-bold">
                        {hub.manager.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{hub.manager}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {hub.status === 'Active' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                        <AlertTriangle size={12} /> Overloaded
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-slate-400 hover:text-slate-700 transition">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Hub Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Add Hub Location</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddHub} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Hub Name</label>
                <input 
                  type="text" required
                  value={newHub.name} onChange={e => setNewHub({...newHub, name: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium" 
                  placeholder="e.g. Portland Sorting Center"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Hub Type</label>
                  <select 
                    value={newHub.type} onChange={e => setNewHub({...newHub, type: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium"
                  >
                    <option value="Source">Source Hub</option>
                    <option value="Destination">Destination Hub</option>
                    <option value="City">City Hub</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">City/Region</label>
                  <input 
                    type="text" required
                    value={newHub.city} onChange={e => setNewHub({...newHub, city: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium" 
                    placeholder="e.g. Portland"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Max Capacity (Parcels)</label>
                  <input 
                    type="number" required min="100"
                    value={newHub.capacity} onChange={e => setNewHub({...newHub, capacity: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium" 
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Assign Manager</label>
                  <input 
                    type="text" required
                    value={newHub.manager} onChange={e => setNewHub({...newHub, manager: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium" 
                    placeholder="Staff Name"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-[#006D77] hover:bg-[#00585f] rounded-lg transition shadow-md">Create Hub</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
