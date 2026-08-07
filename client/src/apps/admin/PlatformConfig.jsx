import React, { useState } from 'react';
import { Save, Settings, ShieldAlert, Truck, MapPin } from 'lucide-react';

export default function PlatformConfig() {
  const [config, setConfig] = useState({
    localRadius: 65,
    broadcastTimeout: 5,
    proximityRadius: 10,
    vehicleThresholds: {
      bike: { maxWeight: 20 },
      auto: { maxWeight: 500 },
      miniTruck: { maxWeight: 1000 }
    },
    intercityCarriers: ['VRL Logistics', 'SRMT', 'APSRTC Cargo', 'KSRTC']
  });

  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    // Mock save to backend
    setTimeout(() => {
      setSaving(false);
      alert('Platform configurations saved successfully.');
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Platform Configuration</h1>
          <p className="text-slate-500 text-sm mt-1">Super Admin controls for routing rules and thresholds.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="bg-[#006D77] text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-[#00585f] disabled:opacity-50 flex items-center gap-2">
          {saving ? 'Saving...' : 'Save Changes'} <Save size={18}/>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Routing & Dispatch Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 p-4 font-bold text-slate-700 flex items-center gap-2">
            <Settings size={18} className="text-[#006D77]"/> Routing & Dispatch
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Default Local Radius (km)</label>
              <div className="flex items-center gap-4">
                <input type="number" value={config.localRadius} onChange={e=>setConfig({...config, localRadius: e.target.value})} className="w-24 px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#006D77] outline-none"/>
                <p className="text-xs text-slate-400">Distances over this will auto-route to Intercity Hub-and-Spoke.</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Job Broadcast Timeout (mins)</label>
              <div className="flex items-center gap-4">
                <input type="number" value={config.broadcastTimeout} onChange={e=>setConfig({...config, broadcastTimeout: e.target.value})} className="w-24 px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#006D77] outline-none"/>
                <p className="text-xs text-slate-400">Time before unassigned broadcast jobs alert the Admin.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Raider Proximity Radius (km)</label>
              <div className="flex items-center gap-4">
                <input type="number" value={config.proximityRadius} onChange={e=>setConfig({...config, proximityRadius: e.target.value})} className="w-24 px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#006D77] outline-none"/>
                <p className="text-xs text-slate-400">Radius to search for online Raiders during broadcast.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Thresholds */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 p-4 font-bold text-slate-700 flex items-center gap-2">
            <Truck size={18} className="text-[#006D77]"/> Vehicle Thresholds (Max Weight)
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-100">
              <span className="font-bold text-slate-700">2-Wheeler (Bike)</span>
              <div className="flex items-center gap-2">
                <input type="number" value={config.vehicleThresholds.bike.maxWeight} onChange={e=>setConfig({...config, vehicleThresholds: {...config.vehicleThresholds, bike: {maxWeight: e.target.value}}})} className="w-20 px-2 py-1 text-right border border-slate-300 rounded"/>
                <span className="text-sm font-bold text-slate-400">KG</span>
              </div>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-100">
              <span className="font-bold text-slate-700">3-Wheeler (Auto)</span>
              <div className="flex items-center gap-2">
                <input type="number" value={config.vehicleThresholds.auto.maxWeight} onChange={e=>setConfig({...config, vehicleThresholds: {...config.vehicleThresholds, auto: {maxWeight: e.target.value}}})} className="w-20 px-2 py-1 text-right border border-slate-300 rounded"/>
                <span className="text-sm font-bold text-slate-400">KG</span>
              </div>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-100">
              <span className="font-bold text-slate-700">Mini Truck (Tata Ace)</span>
              <div className="flex items-center gap-2">
                <input type="number" value={config.vehicleThresholds.miniTruck.maxWeight} onChange={e=>setConfig({...config, vehicleThresholds: {...config.vehicleThresholds, miniTruck: {maxWeight: e.target.value}}})} className="w-20 px-2 py-1 text-right border border-slate-300 rounded"/>
                <span className="text-sm font-bold text-slate-400">KG</span>
              </div>
            </div>
          </div>
        </div>

        {/* Postcode Allowlists */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden md:col-span-2">
          <div className="bg-slate-50 border-b border-slate-200 p-4 font-bold text-slate-700 flex items-center gap-2">
            <MapPin size={18} className="text-[#006D77]"/> Postcode Serviceability Rules
          </div>
          <div className="p-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start gap-3 mb-6">
               <ShieldAlert className="text-blue-500 shrink-0 mt-0.5" size={20}/>
               <div>
                 <h4 className="font-bold text-blue-900">Super Admin Override Active</h4>
                 <p className="text-sm text-blue-800">Currently, all source postcodes are globally allowed. To restrict operations to specific cities, upload a CSV allowlist.</p>
               </div>
            </div>
            <button className="bg-white border border-slate-300 text-slate-700 font-bold px-4 py-2 rounded shadow-sm hover:bg-slate-50">
              Upload Postcode Allowlist (CSV)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
