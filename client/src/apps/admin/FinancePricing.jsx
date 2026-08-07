import React, { useState, useEffect } from 'react';
import {
  Calculator, DollarSign, Settings, Plus, Edit2, Trash2,
  CheckCircle, AlertTriangle, RefreshCcw, Loader2, ArrowRight, X,
  TrendingUp, Map, MapPin, Truck, ShieldAlert, Package, Percent
} from 'lucide-react';
import api from '../../api';

const TABS = [
  { id: 'rules', label: 'Pricing Rules', icon: Settings },
  { id: 'simulator', label: 'Price Simulator', icon: Calculator },
  { id: 'partner-costs', label: 'Partner Costs', icon: DollarSign }
];

export default function FinancePricing() {
  const [activeTab, setActiveTab] = useState('rules');

  // Rules Tab State
  const [rules, setRules] = useState([]);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    ruleName: '', ruleType: 'Base', movementType: 'Any', speed: 'Any', isSurcharge: false,
    conditions: { originCity: '', destCity: '', originPincode: '', destPincode: '', category: '', minWeight: 0, maxWeight: '' },
    rates: { basePrice: 0, perKgRate: 0, perKmRate: 0, handlingFee: 0, gstPercentage: 18, insurancePercentage: 0 },
    isActive: true
  });

  // Simulator Tab State
  const [simParams, setSimParams] = useState({
    originCity: 'Hyderabad', destCity: 'Hyderabad', originPincode: '500001', destPincode: '500081',
    distanceKm: 15, actualWeight: 2, length: 20, width: 20, height: 20,
    category: 'General Parcel', speed: 'Standard', parcelValue: 5000
  });
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'rules') fetchRules();
    if (activeTab === 'simulator') handleSimulate();
  }, [activeTab]);

  const fetchRules = async () => {
    setRulesLoading(true);
    try {
      const r = await api.get('/pricing/rules');
      setRules(r.data.data || []);
    } catch {} finally { setRulesLoading(false); }
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    try {
      // Clean up empty strings to undefined
      const payload = { ...formData };
      ['originCity', 'destCity', 'originPincode', 'destPincode', 'category', 'maxWeight'].forEach(k => {
        if (payload.conditions[k] === '') delete payload.conditions[k];
      });

      if (editingRule) {
        await api.put(`/pricing/rules/${editingRule._id}`, payload);
      } else {
        await api.post('/pricing/rules', payload);
      }
      setShowRuleModal(false);
      fetchRules();
    } catch (err) { alert(err.response?.data?.error || 'Failed to save rule'); }
  };

  const handleDeleteRule = async (id) => {
    if (!window.confirm('Delete this rule permanently?')) return;
    try {
      await api.delete(`/pricing/rules/${id}`);
      fetchRules();
    } catch (err) { alert('Delete failed'); }
  };

  const handleSimulate = async () => {
    setSimLoading(true);
    setSimResult(null);
    try {
      const r = await api.post('/pricing/preview', simParams);
      setSimResult(r.data.data);
    } catch (err) { alert('Simulation failed'); }
    finally { setSimLoading(false); }
  };

  const openModal = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        ruleName: rule.ruleName, ruleType: rule.ruleType, movementType: rule.movementType, speed: rule.speed, isSurcharge: rule.isSurcharge,
        conditions: { ...rule.conditions, minWeight: rule.conditions.minWeight || 0, maxWeight: rule.conditions.maxWeight || '' },
        rates: { ...rule.rates },
        isActive: rule.isActive
      });
    } else {
      setEditingRule(null);
      setFormData({
        ruleName: '', ruleType: 'Base', movementType: 'Any', speed: 'Any', isSurcharge: false,
        conditions: { originCity: '', destCity: '', originPincode: '', destPincode: '', category: '', minWeight: 0, maxWeight: '' },
        rates: { basePrice: 0, perKgRate: 0, perKmRate: 0, handlingFee: 0, gstPercentage: 18, insurancePercentage: 0 },
        isActive: true
      });
    }
    setShowRuleModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Finance & Pricing Engine</h1>
          <p className="text-slate-500 text-sm mt-1">Manage dynamic rates, slab pricing, and calculate margins.</p>
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

      {/* ═══ TAB: RULES ═══ */}
      {activeTab === 'rules' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Settings size={18} className="text-[#006D77]" /> Active Pricing Rules
            </h2>
            <button onClick={() => openModal()} className="px-4 py-2 bg-[#006D77] hover:bg-[#005f6a] text-white font-bold text-sm rounded-lg flex items-center gap-2">
              <Plus size={16} /> New Rule
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {rulesLoading ? (
              <div className="col-span-full py-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" size={24} /></div>
            ) : rules.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200 border-dashed">
                No rules found. Create a base rule to get started.
              </div>
            ) : (
              rules.map(rule => (
                <div key={rule._id} className={`bg-white rounded-xl shadow-sm border-2 ${rule.isSurcharge ? 'border-amber-200' : 'border-slate-200'} overflow-hidden flex flex-col`}>
                  <div className={`px-4 py-3 border-b flex justify-between items-start ${rule.isSurcharge ? 'bg-amber-50/50 border-amber-100' : 'bg-slate-50/50 border-slate-100'}`}>
                    <div>
                      <div className="font-bold text-slate-900">{rule.ruleName}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-1 flex gap-2">
                        <span>{rule.ruleType}</span>
                        {rule.isSurcharge && <span className="text-amber-600">(Surcharge)</span>}
                        {!rule.isActive && <span className="text-red-500">(Inactive)</span>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openModal(rule)} className="p-1.5 text-slate-400 hover:text-[#006D77] rounded bg-white border border-slate-200"><Edit2 size={14} /></button>
                      <button onClick={() => handleDeleteRule(rule._id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded bg-white border border-slate-200"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="p-4 flex-1 space-y-3">
                    <div className="grid grid-cols-3 gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Base Price</div>
                        <div className="font-black text-slate-700">₹{rule.rates.basePrice}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Per Kg</div>
                        <div className="font-black text-slate-700">₹{rule.rates.perKgRate}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Per Km</div>
                        <div className="font-black text-slate-700">₹{rule.rates.perKmRate}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Applies When:</div>
                      {rule.movementType !== 'Any' && <div className="text-xs text-slate-600 flex items-center gap-1"><Map size={12} /> {rule.movementType}</div>}
                      {rule.speed !== 'Any' && <div className="text-xs text-slate-600 flex items-center gap-1"><TrendingUp size={12} /> {rule.speed}</div>}
                      {rule.conditions.minWeight > 0 && <div className="text-xs text-slate-600 flex items-center gap-1"><Package size={12} /> Min Wt: {rule.conditions.minWeight}kg</div>}
                      {rule.conditions.maxWeight && <div className="text-xs text-slate-600 flex items-center gap-1"><Package size={12} /> Max Wt: {rule.conditions.maxWeight}kg</div>}
                      {rule.conditions.originCity && <div className="text-xs text-slate-600 flex items-center gap-1"><MapPin size={12} /> Orig: {rule.conditions.originCity}</div>}
                      {rule.conditions.category && <div className="text-xs text-slate-600 flex items-center gap-1"><ShieldAlert size={12} /> Cat: {rule.conditions.category}</div>}
                      {Object.keys(rule.conditions).length === 0 && rule.movementType === 'Any' && rule.speed === 'Any' && (
                        <div className="text-xs text-slate-400 italic">Applies to all bookings if no specific rule matched.</div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ═══ TAB: SIMULATOR ═══ */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
          
          {/* Inputs */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="font-bold text-slate-900 flex items-center gap-2"><Calculator size={18} className="text-[#006D77]" /> Cargo Details</h2>
              <button onClick={handleSimulate} className="px-3 py-1.5 bg-[#006D77] text-white text-xs font-bold rounded flex items-center gap-1">
                {simLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />} Recalculate
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Origin City</label>
                  <input type="text" value={simParams.originCity} onChange={e => setSimParams({...simParams, originCity: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Dest City</label>
                  <input type="text" value={simParams.destCity} onChange={e => setSimParams({...simParams, destCity: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Distance (km)</label>
                  <input type="number" value={simParams.distanceKm} onChange={e => setSimParams({...simParams, distanceKm: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Act. Weight (kg)</label>
                  <input type="number" value={simParams.actualWeight} onChange={e => setSimParams({...simParams, actualWeight: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Value (₹)</label>
                  <input type="number" value={simParams.parcelValue} onChange={e => setSimParams({...simParams, parcelValue: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Length (cm)</label>
                  <input type="number" value={simParams.length} onChange={e => setSimParams({...simParams, length: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Width (cm)</label>
                  <input type="number" value={simParams.width} onChange={e => setSimParams({...simParams, width: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Height (cm)</label>
                  <input type="number" value={simParams.height} onChange={e => setSimParams({...simParams, height: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Category</label>
                  <select value={simParams.category} onChange={e => setSimParams({...simParams, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option>General Parcel</option><option>Document</option><option>Fragile Item</option><option>Electronics</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Speed</label>
                  <select value={simParams.speed} onChange={e => setSimParams({...simParams, speed: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option>Standard</option><option>Express</option><option>Same-Day</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results Output */}
          <div className="bg-gradient-to-b from-[#0F172A] to-[#1e293b] text-white rounded-xl shadow-lg border border-slate-700 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <DollarSign size={120} />
            </div>
            
            <div className="p-5 border-b border-white/10 relative z-10">
              <h2 className="font-bold flex items-center gap-2"><DollarSign size={18} className="text-[#FFB703]" /> Price Breakdown (Simulation)</h2>
            </div>

            {simLoading || !simResult ? (
              <div className="p-12 flex justify-center"><Loader2 size={32} className="animate-spin text-white/30" /></div>
            ) : (
              <div className="p-5 relative z-10 space-y-6">
                
                <div className="flex gap-4 p-3 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <div className="text-[10px] text-white/50 uppercase font-bold">Chargeable Wt</div>
                    <div className="font-black text-lg text-white">{simResult.chargeableWeight} kg</div>
                  </div>
                  <div className="text-white/30">|</div>
                  <div>
                    <div className="text-[10px] text-white/50 uppercase font-bold">Movement</div>
                    <div className="font-black text-lg text-white">{simResult.movementType}</div>
                  </div>
                  <div className="text-white/30">|</div>
                  <div>
                    <div className="text-[10px] text-white/50 uppercase font-bold">Vol Wt.</div>
                    <div className="font-black text-lg text-white">{simResult.volumetricWeight} kg</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm font-medium font-mono text-white/80">
                  <div className="flex justify-between pb-1 border-b border-white/5"><span>Base Cost</span> <span>₹{simResult.breakdown.baseCost}</span></div>
                  <div className="flex justify-between pb-1 border-b border-white/5"><span>Weight Charge</span> <span>₹{simResult.breakdown.weightCost}</span></div>
                  <div className="flex justify-between pb-1 border-b border-white/5"><span>Distance Charge</span> <span>₹{simResult.breakdown.distanceCost}</span></div>
                  <div className="flex justify-between pb-1 border-b border-white/5"><span>Handling & Surcharges</span> <span className="text-[#FFB703]">+ ₹{simResult.breakdown.handlingFee + simResult.breakdown.surcharges}</span></div>
                  <div className="flex justify-between pb-1 border-b border-white/5"><span>Insurance</span> <span>₹{simResult.breakdown.insurance}</span></div>
                  
                  <div className="flex justify-between pt-2 pb-1 text-white font-bold"><span>Subtotal (Pre-tax)</span> <span>₹{simResult.breakdown.subtotal}</span></div>
                  <div className="flex justify-between pb-1 border-b border-white/10 text-xs text-white/50"><span>GST (Tax)</span> <span>₹{simResult.breakdown.gst}</span></div>
                  
                  <div className="flex justify-between pt-3 text-2xl font-black text-white">
                    <span>Final Price to Customer</span> 
                    <span className="text-green-400">₹{simResult.breakdown.totalCustomerPrice}</span>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                  <h3 className="text-xs font-bold text-white/50 uppercase tracking-wide mb-3">Profitability Analysis</h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-[10px] text-white/60 mb-0.5">Est. Internal Cost</div>
                      <div className="font-bold">₹{simResult.profitability.estimatedInternalCost}</div>
                    </div>
                    <div className="border-l border-r border-white/10">
                      <div className="text-[10px] text-white/60 mb-0.5">Gross Margin</div>
                      <div className="font-bold text-green-300">₹{simResult.profitability.grossMargin}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/60 mb-0.5">Margin %</div>
                      <div className="font-bold text-[#FFB703]">{simResult.profitability.marginPercentage}%</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold text-white/50 uppercase mb-1.5">Rules Applied</h3>
                  <div className="flex flex-wrap gap-1">
                    {simResult.appliedRules.map((r, i) => (
                      <span key={i} className="bg-[#006D77]/50 text-white text-[10px] px-2 py-0.5 rounded border border-[#006D77]">{r}</span>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ TAB: PARTNER COSTS (Future) ═══ */}
      {activeTab === 'partner-costs' && (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center animate-in fade-in">
          <DollarSign size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Partner Rate Sheets</h2>
          <p className="text-slate-500 max-w-md mx-auto">Future integration: Upload Excel sheets of 3PL partner rates here to automatically update internal cost bases.</p>
        </div>
      )}

      {/* Modal: Rule Editor */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold text-slate-900">{editingRule ? 'Edit Pricing Rule' : 'New Pricing Rule'}</h2>
              <button onClick={() => setShowRuleModal(false)} className="text-slate-400 hover:text-slate-700"><X size={22} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              <form id="ruleForm" onSubmit={handleSaveRule} className="space-y-6">
                
                {/* Basic Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Rule Name</label>
                    <input required type="text" value={formData.ruleName} onChange={e => setFormData({...formData, ruleName: e.target.value})} className="w-full px-3 py-2 border rounded-lg font-bold" placeholder="e.g. Standard Local Base" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Rule Type</label>
                    <select value={formData.ruleType} onChange={e => setFormData({...formData, ruleType: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                      <option>Base</option><option>Slab</option><option>Route</option><option>Pincode</option><option>Surcharge</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.isSurcharge} onChange={e => setFormData({...formData, isSurcharge: e.target.checked})} className="w-4 h-4 accent-[#006D77]" />
                      <span className="text-sm font-bold text-slate-700">Is this an additive Surcharge?</span>
                    </label>
                  </div>
                </div>

                {/* Rates */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 border-b pb-2">Rate Configuration (₹)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Base/Fixed Price</label>
                      <input type="number" value={formData.rates.basePrice} onChange={e => setFormData({...formData, rates: {...formData.rates, basePrice: Number(e.target.value)}})} className="w-full px-3 py-1.5 border rounded-lg font-mono text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Per Kg Charge</label>
                      <input type="number" value={formData.rates.perKgRate} onChange={e => setFormData({...formData, rates: {...formData.rates, perKgRate: Number(e.target.value)}})} className="w-full px-3 py-1.5 border rounded-lg font-mono text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Per Km Charge</label>
                      <input type="number" value={formData.rates.perKmRate} onChange={e => setFormData({...formData, rates: {...formData.rates, perKmRate: Number(e.target.value)}})} className="w-full px-3 py-1.5 border rounded-lg font-mono text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Handling Fee</label>
                      <input type="number" value={formData.rates.handlingFee} onChange={e => setFormData({...formData, rates: {...formData.rates, handlingFee: Number(e.target.value)}})} className="w-full px-3 py-1.5 border rounded-lg font-mono text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">GST %</label>
                      <input type="number" value={formData.rates.gstPercentage} onChange={e => setFormData({...formData, rates: {...formData.rates, gstPercentage: Number(e.target.value)}})} className="w-full px-3 py-1.5 border rounded-lg font-mono text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Insurance %</label>
                      <input type="number" step="0.1" value={formData.rates.insurancePercentage} onChange={e => setFormData({...formData, rates: {...formData.rates, insurancePercentage: Number(e.target.value)}})} className="w-full px-3 py-1.5 border rounded-lg font-mono text-sm" />
                    </div>
                  </div>
                </div>

                {/* Conditions */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 border-b pb-2">Application Conditions (Applies when)</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Movement Type</label>
                      <select value={formData.movementType} onChange={e => setFormData({...formData, movementType: e.target.value})} className="w-full px-3 py-1.5 border rounded-lg text-sm">
                        <option>Any</option><option>Intracity</option><option>Intercity</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Speed Type</label>
                      <select value={formData.speed} onChange={e => setFormData({...formData, speed: e.target.value})} className="w-full px-3 py-1.5 border rounded-lg text-sm">
                        <option>Any</option><option>Standard</option><option>Express</option><option>Same-Day</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Origin City (Optional)</label>
                      <input type="text" value={formData.conditions.originCity} onChange={e => setFormData({...formData, conditions: {...formData.conditions, originCity: e.target.value}})} className="w-full px-3 py-1.5 border rounded-lg text-sm" placeholder="e.g. Hyderabad" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Dest City (Optional)</label>
                      <input type="text" value={formData.conditions.destCity} onChange={e => setFormData({...formData, conditions: {...formData.conditions, destCity: e.target.value}})} className="w-full px-3 py-1.5 border rounded-lg text-sm" placeholder="e.g. Bangalore" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Category (Optional)</label>
                      <select value={formData.conditions.category} onChange={e => setFormData({...formData, conditions: {...formData.conditions, category: e.target.value}})} className="w-full px-3 py-1.5 border rounded-lg text-sm">
                        <option value="">Any</option><option>General Parcel</option><option>Fragile Item</option><option>Electronics</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Min Wt (kg)</label>
                      <input type="number" value={formData.conditions.minWeight} onChange={e => setFormData({...formData, conditions: {...formData.conditions, minWeight: Number(e.target.value)}})} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Max Wt (kg)</label>
                      <input type="number" value={formData.conditions.maxWeight} onChange={e => setFormData({...formData, conditions: {...formData.conditions, maxWeight: Number(e.target.value)}})} className="w-full px-3 py-1.5 border rounded-lg text-sm" placeholder="No Limit" />
                    </div>
                  </div>

                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 accent-[#006D77]" />
                  <span className="text-sm font-bold text-slate-700">Rule is Active</span>
                </div>

              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 flex gap-3 shrink-0 bg-white">
              <button type="button" onClick={() => setShowRuleModal(false)} className="flex-1 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
              <button type="submit" form="ruleForm" className="flex-1 py-2.5 text-sm font-bold text-white bg-[#006D77] hover:bg-[#005f6a] rounded-lg transition">Save Rule</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
