import React, { useState, useEffect } from 'react';
import { Warehouse, RefreshCcw } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api';

export default function HubInventory() {
  const { selectedHub } = useOutletContext();
  const [inventory, setInventory] = useState(null);

  useEffect(() => {
    if (selectedHub) {
      fetchInventory(selectedHub._id);
    }
  }, [selectedHub]);

  const fetchInventory = async (hubId) => {
    try {
      const r = await api.get(`/hub/${hubId}/inventory`);
      setInventory(r.data.data);
    } catch {}
  };

  if (!selectedHub) {
    return (
      <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/80 p-8 text-center text-slate-400 font-bold mt-4">
        No hub selected. Please select a hub from the header.
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300 max-w-7xl mx-auto">
      <div className="flex items-center justify-between bg-white/50 backdrop-blur-xl p-5 rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Hub Inventory</h2>
          <p className="text-sm font-bold text-slate-500">Live parcel status</p>
        </div>
        <button onClick={() => fetchInventory(selectedHub._id)} className="w-10 h-10 bg-white/60 hover:bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm border border-white/80 transition-all hover:shadow-md">
          <RefreshCcw size={18} />
        </button>
      </div>

      <div className="bg-white/50 backdrop-blur-xl rounded-3xl border border-white/60 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">{selectedHub.name}</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hub • {selectedHub.address?.city}</p>
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
    </div>
  );
}
