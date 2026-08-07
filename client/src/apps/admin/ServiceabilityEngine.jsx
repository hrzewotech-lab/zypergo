import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, MapPin, Search, Trash2, Plus, 
  CheckCircle, AlertTriangle, X, ShieldBan, Truck, Loader2
} from 'lucide-react';
import api from '../../api';

const TABS = [
  { id: 'blocks', label: 'Temporary Blocks & Routes', icon: MapPin },
  { id: 'constraints', label: 'Global & Item Constraints', icon: ShieldBan },
  { id: 'simulator', label: 'Serviceability Simulator', icon: Search }
];

export default function ServiceabilityEngine() {
  const [activeTab, setActiveTab] = useState('blocks');
  
  // Data
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    ruleType: 'PincodeBlock',
    originPincode: '', destPincode: '', city: '', category: '', keyword: '',
    maxWeight: '', maxVolume: '', reason: '', isActive: true
  });

  // Simulator State
  const [simParams, setSimParams] = useState({
    originPincode: '500081', destPincode: '560001', originCity: 'Hyderabad', destCity: 'Bangalore',
    weight: 2, length: 10, width: 10, height: 10, category: 'General Parcel', itemDescription: 'Books and clothes'
  });
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    if (activeTab !== 'simulator') fetchRules();
    else if (activeTab === 'simulator' && !simResult) handleSimulate(); // run initial sim
  }, [activeTab]);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const r = await api.get('/serviceability/rules');
      setRules(r.data.data || []);
    } catch {} finally { setLoading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      // Clean up empty strings
      Object.keys(payload).forEach(k => { if (payload[k] === '') delete payload[k]; });
      
      await api.post('/serviceability/rules', payload);
      setShowModal(false);
      fetchRules();
    } catch (err) { alert(err.response?.data?.error || 'Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this rule/block?')) return;
    try {
      await api.delete(`/serviceability/rules/${id}`);
      fetchRules();
    } catch (err) { alert('Delete failed'); }
  };

  const handleSimulate = async () => {
    setSimLoading(true);
    setSimResult(null);
    try {
      const r = await api.post('/serviceability/check', simParams);
      setSimResult(r.data);
    } catch (err) { alert('Simulation failed'); }
    finally { setSimLoading(false); }
  };

  const openModalFor = (type) => {
    setFormData({
      ruleType: type,
      originPincode: '', destPincode: '', city: '', category: '', keyword: '',
      maxWeight: '', maxVolume: '', reason: '', isActive: true
    });
    setShowModal(true);
  };

  const locationBlocks = rules.filter(r => ['PincodeBlock', 'CityBlock', 'RouteBlock'].includes(r.ruleType));
  const constraintBlocks = rules.filter(r => ['GlobalConstraint', 'ProhibitedItem', 'CategoryBlock'].includes(r.ruleType));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Serviceability Engine</h1>
          <p className="text-slate-500 text-sm mt-1">Configure delivery constraints, prohibited items, and route blocks.</p>
        </div>
        <div className="flex bg-slate-200/60 p-1 rounded-xl flex-wrap gap-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-lg transition ${activeTab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ TAB: TEMPORARY BLOCKS & ROUTES ═══ */}
      {activeTab === 'blocks' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-wrap gap-3 mb-6">
            <button onClick={() => openModalFor('PincodeBlock')} className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-slate-700 transition shadow-sm"><Plus size={16} /> Block Pincode</button>
            <button onClick={() => openModalFor('CityBlock')} className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-slate-700 transition shadow-sm"><Plus size={16} /> Block City</button>
            <button onClick={() => openModalFor('RouteBlock')} className="px-4 py-2 bg-[#006D77] text-white text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-[#005f6a] transition shadow-sm"><Plus size={16} /> Block Specific Route</button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Active Location Blocks ({locationBlocks.length})</h2>
            </div>
            {loading ? <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div> : locationBlocks.length === 0 ? <p className="text-slate-400 text-center py-8 text-sm">No location blocks active.</p> : (
              <div className="divide-y divide-slate-100">
                {locationBlocks.map(rule => (
                  <div key={rule._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0"><ShieldAlert size={20} /></div>
                      <div>
                        <div className="flex gap-2 items-center">
                          <span className="font-bold text-slate-900">{rule.ruleType}</span>
                          {!rule.isActive && <span className="text-[10px] bg-slate-200 text-slate-600 px-2 rounded-full font-bold">Inactive</span>}
                        </div>
                        <div className="text-sm font-mono text-[#006D77] font-bold mt-1">
                          {rule.ruleType === 'PincodeBlock' && `PIN: ${rule.originPincode}`}
                          {rule.ruleType === 'CityBlock' && `CITY: ${rule.city}`}
                          {rule.ruleType === 'RouteBlock' && `${rule.originPincode} ➝ ${rule.destPincode}`}
                        </div>
                        <div className="text-xs text-red-600 font-medium mt-1 bg-red-50 px-2 py-1 rounded inline-block">Message: "{rule.reason}"</div>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(rule._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ TAB: GLOBAL CONSTRAINTS ═══ */}
      {activeTab === 'constraints' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-wrap gap-3 mb-6">
            <button onClick={() => openModalFor('ProhibitedItem')} className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-red-700 transition shadow-sm"><Plus size={16} /> Block Keyword (Regex)</button>
            <button onClick={() => openModalFor('GlobalConstraint')} className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-slate-700 transition shadow-sm"><Plus size={16} /> Weight/Volume Limit</button>
            <button onClick={() => openModalFor('CategoryBlock')} className="px-4 py-2 bg-[#006D77] text-white text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-[#005f6a] transition shadow-sm"><Plus size={16} /> Block Category</button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Active Constraints ({constraintBlocks.length})</h2>
            </div>
            {loading ? <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div> : constraintBlocks.length === 0 ? <p className="text-slate-400 text-center py-8 text-sm">No constraints active.</p> : (
              <div className="divide-y divide-slate-100">
                {constraintBlocks.map(rule => (
                  <div key={rule._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0"><ShieldBan size={20} /></div>
                      <div>
                        <div className="flex gap-2 items-center">
                          <span className="font-bold text-slate-900">{rule.ruleType}</span>
                        </div>
                        <div className="text-sm font-mono text-slate-700 font-bold mt-1">
                          {rule.ruleType === 'ProhibitedItem' && `Keyword Match: "${rule.keyword}"`}
                          {rule.ruleType === 'CategoryBlock' && `Category: ${rule.category}`}
                          {rule.ruleType === 'GlobalConstraint' && (
                            <span className="flex gap-3">
                              {rule.maxWeight && <span>Max Wt: {rule.maxWeight}kg</span>}
                              {rule.maxVolume && <span>Max Vol: {rule.maxVolume}cm³</span>}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-red-600 font-medium mt-1 bg-red-50 px-2 py-1 rounded inline-block">Message: "{rule.reason}"</div>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(rule._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ TAB: SIMULATOR ═══ */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="font-bold text-slate-900 flex items-center gap-2"><Search size={18} className="text-[#006D77]" /> Booking Inputs</h2>
              <button onClick={handleSimulate} className="px-4 py-2 bg-[#006D77] hover:bg-[#005f6a] text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm transition">
                {simLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Validate
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Origin PIN</label>
                  <input type="text" value={simParams.originPincode} onChange={e => setSimParams({...simParams, originPincode: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono font-bold focus:border-[#006D77] outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Dest PIN</label>
                  <input type="text" value={simParams.destPincode} onChange={e => setSimParams({...simParams, destPincode: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono font-bold focus:border-[#006D77] outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Origin City</label>
                  <input type="text" value={simParams.originCity} onChange={e => setSimParams({...simParams, originCity: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-[#006D77] outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Dest City</label>
                  <input type="text" value={simParams.destCity} onChange={e => setSimParams({...simParams, destCity: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-[#006D77] outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Weight (kg)</label>
                  <input type="number" value={simParams.weight} onChange={e => setSimParams({...simParams, weight: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-[#006D77] outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Category</label>
                  <select value={simParams.category} onChange={e => setSimParams({...simParams, category: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-[#006D77] outline-none">
                    <option>General Parcel</option><option>Document</option><option>Fragile Item</option><option>Electronics</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">L (cm)</label>
                  <input type="number" value={simParams.length} onChange={e => setSimParams({...simParams, length: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-[#006D77] outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">W (cm)</label>
                  <input type="number" value={simParams.width} onChange={e => setSimParams({...simParams, width: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-[#006D77] outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">H (cm)</label>
                  <input type="number" value={simParams.height} onChange={e => setSimParams({...simParams, height: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-[#006D77] outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Item Description (User input)</label>
                <textarea rows={2} value={simParams.itemDescription} onChange={e => setSimParams({...simParams, itemDescription: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-[#006D77] outline-none resize-none" placeholder="e.g., clothes and lithium batteries..." />
              </div>
            </div>
          </div>

          <div>
            {simLoading ? (
              <div className="bg-slate-100 rounded-xl h-48 flex items-center justify-center border border-slate-200">
                <Loader2 size={32} className="animate-spin text-slate-400" />
              </div>
            ) : simResult ? (
              <div className={`rounded-xl shadow-lg border-2 overflow-hidden ${simResult.isServiceable ? 'bg-gradient-to-br from-green-500 to-emerald-700 border-green-400 text-white' : 'bg-gradient-to-br from-red-500 to-rose-700 border-red-400 text-white'}`}>
                <div className="p-6 flex flex-col items-center text-center space-y-4">
                  {simResult.isServiceable ? (
                    <>
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center"><CheckCircle size={48} /></div>
                      <div>
                        <h2 className="text-3xl font-black mb-2">Serviceable!</h2>
                        <p className="text-green-50 text-sm font-medium">All checks passed. Ready to book.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center"><ShieldAlert size={48} /></div>
                      <div>
                        <h2 className="text-3xl font-black mb-2">Blocked</h2>
                        <p className="text-red-50 text-sm font-medium">Serviceability engine rejected this request.</p>
                      </div>
                    </>
                  )}
                </div>
                {!simResult.isServiceable && (
                  <div className="bg-black/20 p-5">
                    <p className="text-xs font-bold text-red-200 uppercase tracking-wide mb-1.5">Customer Facing Message:</p>
                    <p className="text-lg font-medium">"{simResult.reason}"</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldBan size={18} className="text-[#006D77]" />
                Create {formData.ruleType.replace(/([A-Z])/g, ' $1').trim()}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700"><X size={22} /></button>
            </div>
            
            <form id="serviceabilityForm" onSubmit={handleSave} className="p-6 space-y-5">
              
              {/* Dynamic Inputs based on ruleType */}
              {formData.ruleType === 'PincodeBlock' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Target Pincode (Blocks origin OR dest)</label>
                  <input required type="text" value={formData.originPincode} onChange={e => setFormData({...formData, originPincode: e.target.value})} className="w-full px-3 py-2.5 border rounded-lg font-mono font-bold" placeholder="e.g. 500081" />
                </div>
              )}
              
              {formData.ruleType === 'CityBlock' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Target City (Blocks origin OR dest)</label>
                  <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-3 py-2.5 border rounded-lg font-bold" placeholder="e.g. Chennai" />
                </div>
              )}

              {formData.ruleType === 'RouteBlock' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Origin Pincode</label>
                    <input required type="text" value={formData.originPincode} onChange={e => setFormData({...formData, originPincode: e.target.value})} className="w-full px-3 py-2.5 border rounded-lg font-mono font-bold" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Dest Pincode</label>
                    <input required type="text" value={formData.destPincode} onChange={e => setFormData({...formData, destPincode: e.target.value})} className="w-full px-3 py-2.5 border rounded-lg font-mono font-bold" />
                  </div>
                </div>
              )}

              {formData.ruleType === 'ProhibitedItem' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Keyword / Regex Match (in item description)</label>
                  <input required type="text" value={formData.keyword} onChange={e => setFormData({...formData, keyword: e.target.value})} className="w-full px-3 py-2.5 border rounded-lg font-mono font-bold" placeholder="e.g. battery|acid|flammable" />
                </div>
              )}

              {formData.ruleType === 'CategoryBlock' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Parcel Category</label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2.5 border rounded-lg">
                    <option value="">Select Category</option><option>Fragile Item</option><option>Electronics</option><option>General Parcel</option>
                  </select>
                </div>
              )}

              {formData.ruleType === 'GlobalConstraint' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Max Weight (kg)</label>
                    <input type="number" value={formData.maxWeight} onChange={e => setFormData({...formData, maxWeight: e.target.value})} className="w-full px-3 py-2.5 border rounded-lg" placeholder="e.g. 500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Max Volume (cm³)</label>
                    <input type="number" value={formData.maxVolume} onChange={e => setFormData({...formData, maxVolume: e.target.value})} className="w-full px-3 py-2.5 border rounded-lg" placeholder="L * W * H" />
                  </div>
                </div>
              )}

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <label className="text-xs font-bold text-amber-800 uppercase block mb-1.5 flex items-center gap-1"><AlertTriangle size={14} /> Customer-Facing Reason</label>
                <textarea required rows={2} value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm bg-white focus:outline-none focus:border-amber-500 resize-none" placeholder="e.g. Service temporarily suspended to this area due to severe flooding." />
              </div>

            </form>
            
            <div className="p-4 border-t border-slate-100 flex gap-3 bg-white">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
              <button type="submit" form="serviceabilityForm" className="flex-1 py-2.5 text-sm font-bold text-white bg-[#006D77] hover:bg-[#005f6a] rounded-lg transition">Enforce Rule</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
