import React, { useState } from 'react';
import { Save, Settings, ShieldAlert, Truck, MapPin, UserPlus } from 'lucide-react';
import api from '../../api';

export default function PlatformConfig() {
  const [config, setConfig] = useState({
    localRadius: 65,
    broadcastTimeout: 5,
    proximityRadius: 10,
    vehicleThresholds: {
      scooter: { maxWeight: 20 },
      mini3W: { maxWeight: 90 },
      threeWheeler: { maxWeight: 500 },
      tataAce: { maxWeight: 750 },
      pickup8ft: { maxWeight: 1200 },
      pickup9ft: { maxWeight: 1700 },
      fourteenFt: { maxWeight: 3500 },
      seventeenFt: { maxWeight: 6000 }
    },
    intercityCarriers: ['VRL Logistics', 'SRMT', 'APSRTC Cargo', 'KSRTC']
  });

  const [saving, setSaving] = useState(false);
  
  // Staff Creation State
  const [staffForm, setStaffForm] = useState({ name: '', email: '', phone: '', password: '', role: 'OperationsStaff' });
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffMsg, setStaffMsg] = useState({ type: '', text: '' });

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    // Mock save to backend
    setTimeout(() => {
      setSaving(false);
      alert('Platform configurations saved successfully.');
    }, 800);
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setStaffLoading(true);
    setStaffMsg({ type: '', text: '' });
    try {
      const res = await api.post('/admin/users', staffForm);
      if (res.data && res.data.success) {
        setStaffMsg({ type: 'success', text: `Staff account created! They can now log in using the Admin App.` });
        setStaffForm({ name: '', email: '', phone: '', password: '', role: 'OperationsStaff' });
      }
    } catch (err) {
      setStaffMsg({ type: 'error', text: err.response?.data?.error || 'Failed to create staff' });
    } finally {
      setStaffLoading(false);
    }
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
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Rider Proximity Radius (km)</label>
              <div className="flex items-center gap-4">
                <input type="number" value={config.proximityRadius} onChange={e=>setConfig({...config, proximityRadius: e.target.value})} className="w-24 px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#006D77] outline-none"/>
                <p className="text-xs text-slate-400">Radius to search for online Riders during broadcast.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Thresholds */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 p-4 font-bold text-slate-700 flex items-center gap-2">
            <Truck size={18} className="text-[#006D77]"/> Vehicle Thresholds (Max Weight)
          </div>
          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {Object.entries({
              scooter: 'Scooter',
              mini3W: 'Mini 3W',
              threeWheeler: '3 Wheeler',
              tataAce: 'Tata Ace',
              pickup8ft: 'Pickup 8ft',
              pickup9ft: 'Pickup 9ft',
              fourteenFt: '14ft',
              seventeenFt: '17ft'
            }).map(([key, label]) => (
              <div key={key} className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-100">
                <span className="font-bold text-slate-700">{label}</span>
                <div className="flex items-center gap-2">
                  <input type="number" value={config.vehicleThresholds[key]?.maxWeight || ''} onChange={e=>setConfig({...config, vehicleThresholds: {...config.vehicleThresholds, [key]: {maxWeight: e.target.value}}})} className="w-20 px-2 py-1 text-right border border-slate-300 rounded"/>
                  <span className="text-sm font-bold text-slate-400">KG</span>
                </div>
              </div>
            ))}
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
        
        {/* Staff Creation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden md:col-span-2">
          <div className="bg-slate-50 border-b border-slate-200 p-4 font-bold text-slate-700 flex items-center gap-2">
            <UserPlus size={18} className="text-[#006D77]"/> Create Staff Account
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-500 mb-4">Create access accounts for your Operations Staff or other admins. They will use the Admin App login screen with these credentials.</p>
            
            {staffMsg.text && (
              <div className={`p-3 rounded mb-4 text-sm font-bold ${staffMsg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                {staffMsg.text}
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input required type="text" value={staffForm.name} onChange={e=>setStaffForm({...staffForm, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#006D77] outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                <select value={staffForm.role} onChange={e=>setStaffForm({...staffForm, role: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#006D77] outline-none">
                  <option value="OperationsStaff">Operations Staff</option>
                  <option value="OperationsAdmin">Operations Admin</option>
                  <option value="HubManager">Hub Manager</option>
                  <option value="DispatchManager">Dispatch Manager</option>
                  <option value="FinanceManager">Finance Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                <input required type="email" value={staffForm.email} onChange={e=>setStaffForm({...staffForm, email: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#006D77] outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number (For OTP)</label>
                <input required type="text" value={staffForm.phone} onChange={e=>setStaffForm({...staffForm, phone: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#006D77] outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Temporary Password</label>
                <input required type="password" value={staffForm.password} onChange={e=>setStaffForm({...staffForm, password: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#006D77] outline-none"/>
              </div>
              <div className="md:col-span-2 mt-2">
                <button type="submit" disabled={staffLoading} className="bg-[#0f172a] text-white px-6 py-2 rounded font-bold shadow hover:bg-slate-800 disabled:opacity-50">
                  {staffLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
