import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin, ShieldAlert, ShieldBan, Search, Plus, Trash2, Edit2, 
  CheckCircle, AlertTriangle, X, Loader2, Sparkles, Building2, 
  Layers, Zap, Check, CheckCircle2, RefreshCw, UploadCloud,
  Package, ArrowRight, ToggleLeft, ToggleRight, Filter, Clock,
  Calendar, Truck, DollarSign, CloudRain, AlertOctagon, HelpCircle,
  Banknote, ChevronDown
} from 'lucide-react';
import api from '../../api';

const TABS = [
  { id: 'locations', label: 'Serviceable Cities & Pincodes', icon: MapPin },
  { id: 'blocks', label: 'Temporary Blocks & Routes', icon: ShieldAlert },
  { id: 'constraints', label: 'Global & Item Constraints', icon: ShieldBan }
];

// --- SEARCHABLE PINCODE / LOCATION SELECTOR ---
function SearchableLocationSelect({
  value,
  onChange,
  locations = [],
  placeholder = "Search or choose pincode...",
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selectedLoc = useMemo(() => {
    return locations.find(l => l.pincode === value);
  }, [locations, value]);

  const filtered = useMemo(() => {
    if (!search.trim()) return locations;
    const q = search.toLowerCase().trim();
    return locations.filter(l => 
      (l.pincode && l.pincode.toLowerCase().includes(q)) ||
      (l.city && l.city.toLowerCase().includes(q)) ||
      (l.areaName && l.areaName.toLowerCase().includes(q)) ||
      (l.state && l.state.toLowerCase().includes(q))
    );
  }, [locations, search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <input
        type="text"
        value={value || ''}
        required={required}
        onChange={() => {}}
        className="opacity-0 absolute pointer-events-none w-0 h-0"
        tabIndex={-1}
      />
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 bg-white border rounded-xl flex items-center justify-between text-left transition ${
          isOpen ? 'border-[#006D77] ring-2 ring-[#006D77]/10 shadow-sm' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedLoc ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-900 shrink-0">
                {selectedLoc.pincode}
              </span>
              <span className="font-bold text-slate-800 text-xs truncate">
                {selectedLoc.city}
              </span>
              {selectedLoc.areaName && (
                <span className="text-slate-400 text-xs truncate">
                  ({selectedLoc.areaName})
                </span>
              )}
              {selectedLoc.state && (
                <span className="text-[10px] text-slate-400 font-semibold uppercase shrink-0">
                  • {selectedLoc.state}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 text-xs font-medium flex items-center gap-2">
              <Search size={14} className="text-slate-400 shrink-0" />
              {placeholder}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {value && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                setSearch('');
              }}
              className="p-1 hover:text-slate-600 rounded-md hover:bg-slate-100"
              title="Clear selection"
            >
              <X size={13} />
            </span>
          )}
          <ChevronDown size={15} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#006D77]' : ''}`} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Live Search Input */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type pincode, city, or area to filter..."
                className="w-full pl-8 pr-7 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-[#006D77] focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Location Items List */}
          <div className="max-h-56 overflow-y-auto p-1 divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-medium">
                No matching locations found for "{search}"
              </div>
            ) : (
              filtered.map((loc) => {
                const isSelected = loc.pincode === value;
                return (
                  <button
                    key={loc._id || loc.pincode}
                    type="button"
                    onClick={() => {
                      onChange(loc.pincode);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left text-xs transition ${
                      isSelected
                        ? 'bg-[#006D77]/10 text-[#006D77] font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className={`font-mono font-bold px-2 py-0.5 rounded border text-xs shrink-0 ${
                        isSelected
                          ? 'bg-[#006D77] text-white border-[#006D77]'
                          : 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}>
                        {loc.pincode}
                      </span>
                      <span className="font-bold text-slate-900 truncate">
                        {loc.city}
                      </span>
                      {loc.areaName && (
                        <span className="text-slate-400 truncate">
                          ({loc.areaName})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {loc.state && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-1.5 py-0.5 rounded border border-slate-200">
                          {loc.state}
                        </span>
                      )}
                      {isSelected && <Check size={14} className="text-[#006D77]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- SEARCHABLE CITY SELECTOR ---
function SearchableCitySelect({
  value,
  onChange,
  cities = [],
  locations = [],
  placeholder = "Search or choose city...",
  allOptionLabel = null,
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return cities;
    const q = search.toLowerCase().trim();
    return cities.filter(c => c.toLowerCase().includes(q));
  }, [cities, search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <input
        type="text"
        value={value || ''}
        required={required}
        onChange={() => {}}
        className="opacity-0 absolute pointer-events-none w-0 h-0"
        tabIndex={-1}
      />
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 bg-white border rounded-xl flex items-center justify-between text-left transition ${
          isOpen ? 'border-[#006D77] ring-2 ring-[#006D77]/10 shadow-sm' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {value ? (
            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 truncate">
              <Building2 size={13} className="text-[#006D77] shrink-0" />
              {value}
            </span>
          ) : (
            <span className="text-slate-400 text-xs font-medium flex items-center gap-2">
              <Search size={14} className="text-slate-400 shrink-0" />
              {allOptionLabel || placeholder}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {value && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                setSearch('');
              }}
              className="p-1 hover:text-slate-600 rounded-md hover:bg-slate-100"
              title="Clear selection"
            >
              <X size={13} />
            </span>
          )}
          <ChevronDown size={15} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#006D77]' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2 border-b border-slate-100 bg-slate-50/70">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type to filter cities..."
                className="w-full pl-8 pr-7 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-[#006D77] focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto p-1 divide-y divide-slate-50">
            {allOptionLabel && !search && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                  setSearch('');
                }}
                className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left text-xs transition ${
                  !value ? 'bg-[#006D77]/10 text-[#006D77] font-bold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="font-bold text-slate-800">{allOptionLabel}</span>
                {!value && <Check size={14} className="text-[#006D77]" />}
              </button>
            )}

            {filtered.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-medium">
                No matching cities found for "{search}"
              </div>
            ) : (
              filtered.map((city) => {
                const count = locations.filter(l => l.city === city).length;
                const isSelected = city === value;
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      onChange(city);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left text-xs transition ${
                      isSelected
                        ? 'bg-[#006D77]/10 text-[#006D77] font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 size={13} className={isSelected ? 'text-[#006D77]' : 'text-slate-400'} />
                      <span className="font-bold text-slate-900">{city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {count > 0 && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-md border border-slate-200">
                          {count} PINs
                        </span>
                      )}
                      {isSelected && <Check size={14} className="text-[#006D77]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ServiceabilityEngine() {
  const [activeTab, setActiveTab] = useState('locations');
  
  // Locations State
  const [locations, setLocations] = useState([]);
  const [locLoading, setLocLoading] = useState(true);
  const [locSearch, setLocSearch] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Unified Add Pincodes Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState('single'); // 'single' | 'bulk'
  const [editingLocId, setEditingLocId] = useState(null);
  
  const [locFormData, setLocFormData] = useState({
    city: '',
    pincode: '',
    state: '',
    areaName: '',
    zone: 'South',
    isActive: true,
    pickupAvailable: true,
    deliveryAvailable: true,
    expressAvailable: true,
    codAvailable: true
  });

  const [bulkData, setBulkData] = useState({
    city: '',
    state: '',
    pincodesText: '',
    zone: 'South',
    pickupAvailable: true,
    deliveryAvailable: true,
    expressAvailable: true,
    codAvailable: true
  });
  const [bulkLoading, setBulkLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);

  // Rules State
  const [rules, setRules] = useState([]);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleFormData, setRuleFormData] = useState({
    ruleType: 'PincodeBlock',
    originPincode: '', destPincode: '', city: '', category: '', keyword: '',
    maxWeight: '', maxVolume: '', maxVolumetricWeight: '', maxFragileWeight: '',
    startDate: '', endDate: '', cutoffTime: '18:00', blockReason: 'Weather',
    paymentMode: 'Cash', maxCodValue: 50000, reason: '', isActive: true
  });

  // Simulator State
  const [simParams, setSimParams] = useState({
    originPincode: '500081', destPincode: '530016', originCity: 'Hyderabad', destCity: 'Visakhapatnam',
    weight: 2, length: 15, width: 10, height: 10, category: 'General Parcel', itemDescription: 'Documents and electronics',
    speed: 'Standard', paymentMode: 'UPI', fragile: false
  });
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    fetchLocations();
    if (activeTab === 'blocks' || activeTab === 'constraints') {
      fetchRules();
    } else if (activeTab === 'simulator' && !simResult) {
      handleSimulate();
    }
  }, [activeTab]);

  // --- LOCATION APIS ---
  const fetchLocations = async () => {
    setLocLoading(true);
    try {
      const res = await api.get('/serviceability/locations');
      setLocations(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch locations', err);
    } finally {
      setLocLoading(false);
    }
  };

  const handleSaveSingleLocation = async (e) => {
    e.preventDefault();
    try {
      if (editingLocId) {
        await api.put(`/serviceability/locations/${editingLocId}`, locFormData);
      } else {
        await api.post('/serviceability/locations', locFormData);
      }
      setShowAddModal(false);
      setEditingLocId(null);
      fetchLocations();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save location.');
    }
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!bulkData.city || !bulkData.pincodesText.trim()) {
      alert('Please provide a city name and at least one pincode.');
      return;
    }
    setBulkLoading(true);
    try {
      await api.post('/serviceability/locations/bulk', {
        city: bulkData.city,
        state: bulkData.state,
        zone: bulkData.zone,
        pincodes: bulkData.pincodesText,
        pickupAvailable: bulkData.pickupAvailable,
        deliveryAvailable: bulkData.deliveryAvailable,
        expressAvailable: bulkData.expressAvailable,
        codAvailable: bulkData.codAvailable
      });
      setShowAddModal(false);
      setBulkData({
        city: '',
        state: '',
        pincodesText: '',
        zone: 'South',
        pickupAvailable: true,
        deliveryAvailable: true,
        expressAvailable: true,
        codAvailable: true
      });
      fetchLocations();
    } catch (err) {
      alert(err.response?.data?.error || 'Bulk import failed.');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.patch(`/serviceability/locations/${id}/toggle`);
      setLocations(prev => prev.map(loc => loc._id === id ? res.data.data : loc));
    } catch (err) {
      alert('Failed to toggle status.');
    }
  };

  const handleDeleteLocation = async (id, pincode, city) => {
    if (!window.confirm(`Remove Pincode ${pincode} (${city}) from service availability?`)) return;
    try {
      await api.delete(`/serviceability/locations/${id}`);
      setLocations(prev => prev.filter(loc => loc._id !== id));
    } catch (err) {
      alert('Failed to delete location.');
    }
  };

  const handleSeedDefaults = async () => {
    if (!window.confirm('Populate major cities and hubs across Telangana & Andhra Pradesh (Hyderabad, Warangal, Visakhapatnam, Vijayawada, Guntur, Tirupati, Kurnool, etc.)?')) return;
    setSeedLoading(true);
    try {
      const res = await api.post('/serviceability/locations/seed-defaults?clean=true');
      alert(res.data?.message || 'Telangana & Andhra Pradesh locations seeded successfully!');
      fetchLocations();
    } catch (err) {
      alert('Failed to seed default locations.');
    } finally {
      setSeedLoading(false);
    }
  };

  const openAddModal = (mode = 'single') => {
    setAddMode(mode);
    setEditingLocId(null);
    setLocFormData({
      city: selectedCityFilter !== 'All' ? selectedCityFilter : '',
      pincode: '',
      state: '',
      areaName: '',
      zone: 'South',
      isActive: true,
      pickupAvailable: true,
      deliveryAvailable: true,
      expressAvailable: true,
      codAvailable: true
    });
    setShowAddModal(true);
  };

  const openEditLocation = (loc) => {
    setAddMode('single');
    setEditingLocId(loc._id);
    setLocFormData({
      city: loc.city || '',
      pincode: loc.pincode || '',
      state: loc.state || '',
      areaName: loc.areaName || '',
      zone: loc.zone || 'South',
      isActive: loc.isActive ?? true,
      pickupAvailable: loc.pickupAvailable ?? true,
      deliveryAvailable: loc.deliveryAvailable ?? true,
      expressAvailable: loc.expressAvailable ?? true,
      codAvailable: loc.codAvailable ?? true
    });
    setShowAddModal(true);
  };

  // --- RULES APIS ---
  const fetchRules = async () => {
    setRulesLoading(true);
    try {
      const r = await api.get('/serviceability/rules');
      setRules(r.data.data || []);
    } catch {} finally { setRulesLoading(false); }
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...ruleFormData };
      Object.keys(payload).forEach(k => { if (payload[k] === '') delete payload[k]; });
      await api.post('/serviceability/rules', payload);
      setShowRuleModal(false);
      fetchRules();
    } catch (err) { alert(err.response?.data?.error || 'Failed to save rule'); }
  };

  const handleDeleteRule = async (id) => {
    if (!window.confirm('Remove this rule/block?')) return;
    try {
      await api.delete(`/serviceability/rules/${id}`);
      fetchRules();
    } catch (err) { alert('Delete failed'); }
  };

  const openRuleModalFor = (type) => {
    setRuleFormData({
      ruleType: type,
      originPincode: '', destPincode: '', city: '', category: '', keyword: '',
      maxWeight: '', maxVolume: '', maxVolumetricWeight: '', maxFragileWeight: '',
      startDate: '', endDate: '', cutoffTime: '18:00', blockReason: 'Weather',
      paymentMode: 'Cash', maxCodValue: 50000, reason: '', isActive: true
    });
    setShowRuleModal(true);
  };

  // --- SIMULATOR API ---
  const handleSimulate = async () => {
    setSimLoading(true);
    setSimResult(null);
    try {
      const r = await api.post('/serviceability/check', simParams);
      setSimResult(r.data);
    } catch (err) { alert('Simulation failed'); }
    finally { setSimLoading(false); }
  };

  // Extract distinct cities for tabs & dropdowns
  const distinctCities = useMemo(() => {
    const set = new Set();
    locations.forEach(l => { if (l.city) set.add(l.city); });
    return Array.from(set).sort();
  }, [locations]);

  // Sorted list of existing serviceable locations for dropdowns
  const sortedLocations = useMemo(() => {
    return [...locations].sort((a, b) => {
      const cityCompare = (a.city || '').localeCompare(b.city || '');
      if (cityCompare !== 0) return cityCompare;
      return (a.pincode || '').localeCompare(b.pincode || '');
    });
  }, [locations]);

  // Filtered locations
  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const matchCity = selectedCityFilter === 'All' || loc.city?.toLowerCase() === selectedCityFilter.toLowerCase();
      const matchStatus = statusFilter === 'All' || (statusFilter === 'Active' ? loc.isActive : !loc.isActive);
      const q = locSearch.toLowerCase().trim();
      const matchSearch = !q || (
        loc.pincode?.toLowerCase().includes(q) ||
        loc.city?.toLowerCase().includes(q) ||
        loc.state?.toLowerCase().includes(q) ||
        loc.areaName?.toLowerCase().includes(q)
      );
      return matchCity && matchStatus && matchSearch;
    });
  }, [locations, selectedCityFilter, statusFilter, locSearch]);

  // Location Stats
  const totalPincodes = locations.length;
  const activePincodes = locations.filter(l => l.isActive).length;
  const totalCities = distinctCities.length;
  const expressCount = locations.filter(l => l.expressAvailable && l.isActive).length;

  const locationBlocks = rules.filter(r => ['PincodeBlock', 'CityBlock', 'RouteBlock', 'TemporaryBlock'].includes(r.ruleType));
  const constraintBlocks = rules.filter(r => ['GlobalConstraint', 'ProhibitedItem', 'CategoryBlock', 'FragileRule', 'CutoffTimeRule', 'PaymentModeBlock', 'Holiday'].includes(r.ruleType));

  // Count parsed pincodes for bulk preview
  const bulkPincodesParsed = useMemo(() => {
    if (!bulkData.pincodesText) return [];
    return [...new Set(bulkData.pincodesText.split(/[\s,\n\r]+/).map(p => p.trim()).filter(p => p.length > 0))];
  }, [bulkData.pincodesText]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#006D77] mb-1">
            <Sparkles size={15} /> Automated Serviceability & Acceptance Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Serviceability Engine</h1>
          <p className="text-slate-500 text-sm mt-1">
            Rules to decide whether a shipment can be accepted across pincodes, hubs, riders, SLAs, cutoff times, and parcel constraints.
          </p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl flex-wrap gap-1 border border-slate-200">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                activeTab === t.id
                  ? 'bg-white text-slate-900 shadow-md shadow-slate-200 scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              <t.icon size={16} className={activeTab === t.id ? 'text-[#006D77]' : ''} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ═══ TAB 1: SERVICEABLE CITIES & PINCODES (ALLOWLIST) ═════════════════ */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'locations' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Metric KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50/50 p-5 rounded-2xl border border-teal-200/70 shadow-sm">
              <div className="flex items-center justify-between text-teal-700 mb-2">
                <span className="text-xs font-black uppercase tracking-wider">Serviceable PINs</span>
                <MapPin size={20} />
              </div>
              <div className="text-3xl font-black text-slate-900">{totalPincodes}</div>
              <div className="text-xs font-semibold text-teal-700 mt-1 flex items-center gap-1">
                <CheckCircle2 size={12} /> {activePincodes} Active / {totalPincodes - activePincodes} Inactive
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 rounded-2xl border border-blue-200/70 shadow-sm">
              <div className="flex items-center justify-between text-blue-700 mb-2">
                <span className="text-xs font-black uppercase tracking-wider">Covered Cities</span>
                <Building2 size={20} />
              </div>
              <div className="text-3xl font-black text-slate-900">{totalCities}</div>
              <div className="text-xs font-semibold text-blue-700 mt-1">
                City-wise & Pincode-wise expansion
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-5 rounded-2xl border border-amber-200/70 shadow-sm">
              <div className="flex items-center justify-between text-amber-700 mb-2">
                <span className="text-xs font-black uppercase tracking-wider">Express Enabled</span>
                <Zap size={20} />
              </div>
              <div className="text-3xl font-black text-slate-900">{expressCount}</div>
              <div className="text-xs font-semibold text-amber-700 mt-1">
                Same-day SLA qualified routes
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50/50 p-5 rounded-2xl border border-purple-200/70 shadow-sm">
              <div className="flex items-center justify-between text-purple-700 mb-2">
                <span className="text-xs font-black uppercase tracking-wider">Quick Setup</span>
                <Sparkles size={20} />
              </div>
              <button
                onClick={handleSeedDefaults}
                disabled={seedLoading}
                className="w-full mt-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black py-2 px-3 rounded-xl shadow transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {seedLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Seed TS & AP Hubs
              </button>
              <div className="text-[10px] text-purple-600 font-medium mt-1 text-center">
                Adds 30+ major TS & AP cities
              </div>
            </div>
          </div>

          {/* Action Bar & Filter Controls */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={locSearch}
                  onChange={e => setLocSearch(e.target.value)}
                  placeholder="Search by Pincode, City, State, Area..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#006D77] focus:ring-2 focus:ring-[#006D77]/10 outline-none transition"
                />
                {locSearch && (
                  <button onClick={() => setLocSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Single Unified Add Button */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => openAddModal('single')}
                  className="px-5 py-2.5 bg-[#006D77] hover:bg-[#005a63] text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-md shadow-[#006D77]/20 transition active:scale-95"
                >
                  <Plus size={18} /> Add Pincodes
                </button>

                <button
                  onClick={fetchLocations}
                  title="Refresh list"
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                >
                  <RefreshCw size={16} className={locLoading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* City Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Filter size={12} /> City:
              </span>
              <button
                onClick={() => setSelectedCityFilter('All')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                  selectedCityFilter === 'All'
                    ? 'bg-[#006D77] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Cities ({totalPincodes})
              </button>
              {distinctCities.map(c => {
                const count = locations.filter(l => l.city === c).length;
                return (
                  <button
                    key={c}
                    onClick={() => setSelectedCityFilter(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                      selectedCityFilter === c
                        ? 'bg-[#006D77] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Locations Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
              <h2 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                <MapPin size={16} className="text-[#006D77]" />
                Active Service Availability Matrix ({filteredLocations.length})
              </h2>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span>Filter:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold outline-none focus:border-[#006D77]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            {locLoading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3">
                <Loader2 size={32} className="animate-spin text-[#006D77]" />
                <p className="text-xs font-bold text-slate-400">Loading serviceable locations...</p>
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="p-16 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <MapPin size={28} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">No Serviceable Pincodes Found</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {locSearch || selectedCityFilter !== 'All'
                      ? 'No locations match your filter. Try adjusting your search query.'
                      : 'No serviceable locations have been configured yet. Add individual pincodes or seed Telangana & Andhra Pradesh major hubs.'}
                  </p>
                </div>
                {!locSearch && selectedCityFilter === 'All' && (
                  <div className="flex gap-3 justify-center pt-2">
                    <button
                      onClick={handleSeedDefaults}
                      className="px-4 py-2 bg-[#006D77] text-white text-xs font-bold rounded-xl shadow hover:bg-[#005a63] transition"
                    >
                      🌱 Seed Telangana & Andhra Pradesh Hubs
                    </button>
                    <button
                      onClick={() => openAddModal('bulk')}
                      className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl shadow hover:bg-slate-900 transition"
                    >
                      + Add Pincodes
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-5">Pincode</th>
                      <th className="py-3.5 px-5">City & State</th>
                      <th className="py-3.5 px-5">Area / Landmark</th>
                      <th className="py-3.5 px-5">Zone</th>
                      <th className="py-3.5 px-5 text-center">Capabilities</th>
                      <th className="py-3.5 px-5 text-center">Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLocations.map(loc => (
                      <tr key={loc._id} className={`hover:bg-slate-50/80 transition-colors ${!loc.isActive ? 'bg-slate-50/40 opacity-70' : ''}`}>
                        
                        {/* Pincode */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-base text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                              {loc.pincode}
                            </span>
                          </div>
                        </td>

                        {/* City & State */}
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Building2 size={14} className="text-[#006D77]" />
                            {loc.city}
                          </div>
                          {loc.state && <div className="text-xs text-slate-400 font-medium">{loc.state}</div>}
                        </td>

                        {/* Area */}
                        <td className="py-3.5 px-5 text-slate-600 font-medium">
                          {loc.areaName || <span className="text-slate-300 italic">Entire Pincode Area</span>}
                        </td>

                        {/* Zone */}
                        <td className="py-3.5 px-5">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                            {loc.zone || 'General'}
                          </span>
                        </td>

                        {/* Capabilities */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <span
                              title={loc.pickupAvailable ? 'Pickup Available' : 'Pickup Disabled'}
                              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border transition ${
                                loc.pickupAvailable
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-2xs'
                                  : 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-60'
                              }`}
                            >
                              <Package size={12} className="shrink-0 text-emerald-600" />
                              Pickup
                            </span>
                            <span
                              title={loc.deliveryAvailable ? 'Delivery Available' : 'Delivery Disabled'}
                              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border transition ${
                                loc.deliveryAvailable
                                  ? 'bg-blue-50 text-blue-700 border-blue-200/80 shadow-2xs'
                                  : 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-60'
                              }`}
                            >
                              <Truck size={12} className="shrink-0 text-blue-600" />
                              Drop
                            </span>
                            <span
                              title={loc.expressAvailable ? 'Express Enabled' : 'Standard Only'}
                              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border transition ${
                                loc.expressAvailable
                                  ? 'bg-amber-50 text-amber-800 border-amber-200/80 shadow-2xs'
                                  : 'bg-slate-100 text-slate-400 border-slate-200 opacity-60'
                              }`}
                            >
                              <Zap size={12} className={loc.expressAvailable ? 'shrink-0 text-amber-500 fill-amber-500' : 'shrink-0'} />
                              Express
                            </span>
                            <span
                              title={loc.codAvailable ? 'COD Eligible' : 'Prepaid Only'}
                              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border transition ${
                                loc.codAvailable
                                  ? 'bg-green-50 text-green-800 border-green-200/80 shadow-2xs'
                                  : 'bg-slate-100 text-slate-400 border-slate-200 opacity-60'
                              }`}
                            >
                              <Banknote size={12} className="shrink-0 text-green-600" />
                              COD
                            </span>
                          </div>
                        </td>

                        {/* Status Toggle */}
                        <td className="py-3.5 px-5 text-center">
                          <button
                            onClick={() => handleToggleStatus(loc._id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black transition ${
                              loc.isActive
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${loc.isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></span>
                            {loc.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditLocation(loc)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                              title="Edit Location"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteLocation(loc._id, loc.pincode, loc.city)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete Pincode"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ═══ TAB 2: TEMPORARY BLOCKS & ROUTE OVERRIDES ═════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'blocks' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-wrap gap-3 mb-6">
            <button onClick={() => openRuleModalFor('TemporaryBlock')} className="px-4 py-2.5 bg-amber-600 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-amber-700 transition shadow-sm"><CloudRain size={16} /> Operational / Weather Block</button>
            <button onClick={() => openRuleModalFor('PincodeBlock')} className="px-4 py-2.5 bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-slate-700 transition shadow-sm"><Plus size={16} /> Block Pincode</button>
            <button onClick={() => openRuleModalFor('CityBlock')} className="px-4 py-2.5 bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-slate-700 transition shadow-sm"><Plus size={16} /> Block City</button>
            <button onClick={() => openRuleModalFor('RouteBlock')} className="px-4 py-2.5 bg-[#006D77] text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-[#005f6a] transition shadow-sm"><Plus size={16} /> Block Specific Route</button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                <ShieldAlert size={18} className="text-red-500" />
                Active Route & Operational Blocks ({locationBlocks.length})
              </h2>
            </div>
            {rulesLoading ? <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div> : locationBlocks.length === 0 ? <p className="text-slate-400 text-center py-12 text-sm">No temporary location or operational blocks are currently active.</p> : (
              <div className="divide-y divide-slate-100">
                {locationBlocks.map(rule => (
                  <div key={rule._id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                        {rule.ruleType === 'TemporaryBlock' ? <CloudRain size={24} /> : <ShieldAlert size={24} />}
                      </div>
                      <div>
                        <div className="flex gap-2 items-center">
                          <span className="font-bold text-slate-900">{rule.ruleType}</span>
                          {rule.blockReason && <span className="text-[11px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-md">{rule.blockReason}</span>}
                          {!rule.isActive && <span className="text-[10px] bg-slate-200 text-slate-600 px-2 rounded-full font-bold">Inactive</span>}
                        </div>
                        <div className="text-sm font-mono text-[#006D77] font-bold mt-1">
                          {rule.ruleType === 'PincodeBlock' && `Target Pincode: ${rule.originPincode}`}
                          {rule.ruleType === 'CityBlock' && `Target City: ${rule.city}`}
                          {rule.ruleType === 'RouteBlock' && `Route: ${rule.originPincode} ➝ ${rule.destPincode}`}
                          {rule.ruleType === 'TemporaryBlock' && (
                            <span>
                              {rule.city ? `City: ${rule.city}` : rule.originPincode ? `PIN: ${rule.originPincode}` : 'System-Wide Block'}
                              {rule.startDate && rule.endDate && ` (${new Date(rule.startDate).toLocaleDateString()} to ${new Date(rule.endDate).toLocaleDateString()})`}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-red-600 font-medium mt-1 bg-red-50 px-2.5 py-1 rounded-md inline-block">
                          Customer Message: "{rule.reason}"
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteRule(rule._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ═══ TAB 3: GLOBAL & ITEM CONSTRAINTS ══════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'constraints' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-wrap gap-3 mb-6">
            <button onClick={() => openRuleModalFor('ProhibitedItem')} className="px-4 py-2.5 bg-red-600 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-red-700 transition shadow-sm"><AlertOctagon size={16} /> Block Prohibited Item Keyword</button>
            <button onClick={() => openRuleModalFor('GlobalConstraint')} className="px-4 py-2.5 bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-slate-700 transition shadow-sm"><Plus size={16} /> Weight / Volumetric Limit</button>
            <button onClick={() => openRuleModalFor('FragileRule')} className="px-4 py-2.5 bg-amber-600 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-amber-700 transition shadow-sm"><ShieldAlert size={16} /> Fragile Parcel Rule</button>
            <button onClick={() => openRuleModalFor('CutoffTimeRule')} className="px-4 py-2.5 bg-blue-600 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-blue-700 transition shadow-sm"><Clock size={16} /> Daily Cutoff Time</button>
            <button onClick={() => openRuleModalFor('PaymentModeBlock')} className="px-4 py-2.5 bg-purple-600 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-purple-700 transition shadow-sm"><DollarSign size={16} /> Payment / COD Rule</button>
            <button onClick={() => openRuleModalFor('CategoryBlock')} className="px-4 py-2.5 bg-[#006D77] text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-[#005f6a] transition shadow-sm"><Plus size={16} /> Block Category</button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                <ShieldBan size={18} className="text-slate-700" />
                Active Parcel & Operational Constraints ({constraintBlocks.length})
              </h2>
            </div>
            {rulesLoading ? <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div> : constraintBlocks.length === 0 ? <p className="text-slate-400 text-center py-12 text-sm">No special constraints or prohibited item overrides configured.</p> : (
              <div className="divide-y divide-slate-100">
                {constraintBlocks.map(rule => (
                  <div key={rule._id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                        <ShieldBan size={24} />
                      </div>
                      <div>
                        <div className="flex gap-2 items-center">
                          <span className="font-bold text-slate-900">{rule.ruleType}</span>
                        </div>
                        <div className="text-sm font-mono text-slate-700 font-bold mt-1">
                          {rule.ruleType === 'ProhibitedItem' && `Keyword Regex: "${rule.keyword}"`}
                          {rule.ruleType === 'CategoryBlock' && `Blocked Category: ${rule.category}`}
                          {rule.ruleType === 'FragileRule' && `Max Fragile Weight: ${rule.maxFragileWeight || 25}kg`}
                          {rule.ruleType === 'CutoffTimeRule' && `Daily Cutoff Time: ${rule.cutoffTime || '18:00'}`}
                          {rule.ruleType === 'PaymentModeBlock' && `Restricted Mode: ${rule.paymentMode}`}
                          {rule.ruleType === 'GlobalConstraint' && (
                            <span className="flex gap-4">
                              {rule.maxWeight && <span>Max Wt: {rule.maxWeight}kg</span>}
                              {rule.maxVolumetricWeight && <span>Max Vol-Wt: {rule.maxVolumetricWeight}kg</span>}
                              {rule.maxVolume && <span>Max Vol: {rule.maxVolume}cm³</span>}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-red-600 font-medium mt-1 bg-red-50 px-2.5 py-1 rounded-md inline-block">
                          Message: "{rule.reason}"
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteRule(rule._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ═══ TAB 4: SIMULATOR ═════════════════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-fit">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="font-bold text-slate-900 flex items-center gap-2"><Search size={18} className="text-[#006D77]" /> Shipment Acceptance Inputs</h2>
              <button onClick={handleSimulate} className="px-4 py-2 bg-[#006D77] hover:bg-[#005f6a] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition">
                {simLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Validate Live
              </button>
            </div>
            <div className="p-6 space-y-4">
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
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Actual Weight (kg)</label>
                  <input type="number" value={simParams.weight} onChange={e => setSimParams({...simParams, weight: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-[#006D77] outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Category</label>
                  <select value={simParams.category} onChange={e => setSimParams({...simParams, category: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-[#006D77] outline-none">
                    <option>General Parcel</option><option>Document</option><option>Fragile Item</option><option>Electronics</option><option>Fertilizers</option><option>Commercial Package</option>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Speed</label>
                  <select value={simParams.speed} onChange={e => setSimParams({...simParams, speed: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-[#006D77] outline-none">
                    <option value="Standard">Standard</option>
                    <option value="Express">Express</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Payment Mode</label>
                  <select value={simParams.paymentMode} onChange={e => setSimParams({...simParams, paymentMode: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-[#006D77] outline-none">
                    <option value="UPI">UPI / Online</option>
                    <option value="Cash">Cash on Delivery (COD)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Item Description (User Text)</label>
                <textarea rows={2} value={simParams.itemDescription} onChange={e => setSimParams({...simParams, itemDescription: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-[#006D77] outline-none resize-none" placeholder="e.g. Books and clothes..." />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {simLoading ? (
              <div className="bg-slate-100 rounded-2xl h-64 flex items-center justify-center border border-slate-200">
                <Loader2 size={32} className="animate-spin text-slate-400" />
              </div>
            ) : simResult ? (
              <div className="space-y-4">
                <div className={`rounded-2xl shadow-lg border-2 overflow-hidden ${simResult.isServiceable ? 'bg-gradient-to-br from-green-600 to-emerald-800 border-green-400 text-white' : 'bg-gradient-to-br from-red-600 to-rose-800 border-red-400 text-white'}`}>
                  <div className="p-6 flex flex-col items-center text-center space-y-3">
                    {simResult.isServiceable ? (
                      <>
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center"><CheckCircle size={40} /></div>
                        <div>
                          <h2 className="text-2xl font-black mb-1">Shipment Can Be Accepted!</h2>
                          <p className="text-green-50 text-xs font-medium">All routing, capacity, SLA, and constraint gates passed.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center"><ShieldAlert size={40} /></div>
                        <div>
                          <h2 className="text-2xl font-black mb-1">Shipment Rejected</h2>
                          <p className="text-red-50 text-xs font-medium">Serviceability engine blocked this booking from being accepted.</p>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="bg-black/20 p-5 border-t border-white/10">
                    <p className="text-[11px] font-bold text-white/70 uppercase tracking-wide mb-1">Customer Facing Message:</p>
                    <p className="text-base font-semibold">"{simResult.reason}"</p>
                  </div>

                  {simResult.sla && (
                    <div className="bg-black/30 p-4 border-t border-white/10 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-white/60 block">Estimated SLA:</span>
                        <span className="font-bold text-white">{simResult.sla.estimatedDeliveryTime}</span>
                      </div>
                      <div>
                        <span className="text-white/60 block">Service Type:</span>
                        <span className="font-bold text-white">{simResult.sla.serviceType}</span>
                      </div>
                      {simResult.sla.cutoffNotice && (
                        <div className="col-span-2 text-amber-200 text-[11px] font-medium pt-1">
                          ⏰ {simResult.sla.cutoffNotice}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Detailed Checks Breakdown */}
                {simResult.checksBreakdown && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 size={16} className="text-[#006D77]" /> Acceptance Gate Checks Breakdown
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { key: 'pincodeAllowlist', label: 'Pincode & City Matrix' },
                        { key: 'sourceHub', label: 'Source Hub Availability' },
                        { key: 'destHub', label: 'Destination Hub Capacity' },
                        { key: 'riderAvailability', label: 'Pickup Rider Availability' },
                        { key: 'partnerRoute', label: 'Partner Linehaul Route' },
                        { key: 'weightAndVolume', label: 'Weight & Volumetric SLA' },
                        { key: 'categoryAndFragile', label: 'Category & Fragile Rules' },
                        { key: 'prohibitedItems', label: 'Prohibited Items Scan' },
                        { key: 'paymentMode', label: 'Payment Mode (COD / Online)' },
                        { key: 'temporalBlocks', label: 'Weather / Strike Overrides' },
                        { key: 'holidayAndCutoff', label: 'Cutoff Time & Holidays' }
                      ].map(check => (
                        <div key={check.key} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-slate-600 font-medium">{check.label}</span>
                          {simResult.checksBreakdown[check.key] ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1"><Check size={14} /> Passed</span>
                          ) : (
                            <span className="text-red-500 font-bold flex items-center gap-1"><X size={14} /> Failed</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ═══ UNIFIED MODAL: ADD PINCODES (SINGLE OR BULK TABS) ════════════════ */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header with Mode Switcher */}
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MapPin size={20} className="text-[#006D77]" />
                  {editingLocId ? 'Edit Serviceable Pincode' : 'Add Serviceable Pincodes'}
                </h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700"><X size={22} /></button>
            </div>

            {/* Mode Switcher Tabs */}
            {!editingLocId && (
              <div className="flex border-b border-slate-200 bg-slate-100/70 p-1.5 gap-1">
                <button
                  type="button"
                  onClick={() => setAddMode('single')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                    addMode === 'single'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📍 Single Pincode Entry
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode('bulk')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                    addMode === 'bulk'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ⚡ Bulk Add Multiple Pincodes
                </button>
              </div>
            )}
            
            {/* --- SINGLE PINCODE FORM --- */}
            {addMode === 'single' && (
              <form onSubmit={handleSaveSingleLocation} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase block mb-1">City Name *</label>
                    <input
                      required
                      type="text"
                      value={locFormData.city}
                      onChange={e => setLocFormData({...locFormData, city: e.target.value})}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl font-bold focus:border-[#006D77] outline-none"
                      placeholder="e.g. Hyderabad"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase block mb-1">Pincode (6 digits) *</label>
                    <input
                      required
                      type="text"
                      maxLength={6}
                      value={locFormData.pincode}
                      onChange={e => setLocFormData({...locFormData, pincode: e.target.value})}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl font-mono font-black focus:border-[#006D77] outline-none"
                      placeholder="e.g. 500081"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase block mb-1">State</label>
                    <input
                      type="text"
                      value={locFormData.state}
                      onChange={e => setLocFormData({...locFormData, state: e.target.value})}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl font-medium focus:border-[#006D77] outline-none"
                      placeholder="e.g. Telangana"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase block mb-1">Zone</label>
                    <select
                      value={locFormData.zone}
                      onChange={e => setLocFormData({...locFormData, zone: e.target.value})}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl font-medium focus:border-[#006D77] outline-none"
                    >
                      <option value="South">South Zone</option>
                      <option value="North">North Zone</option>
                      <option value="West">West Zone</option>
                      <option value="East">East Zone</option>
                      <option value="Central">Central Zone</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase block mb-1">Area / Landmark Name</label>
                  <input
                    type="text"
                    value={locFormData.areaName}
                    onChange={e => setLocFormData({...locFormData, areaName: e.target.value})}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl font-medium focus:border-[#006D77] outline-none"
                    placeholder="e.g. Madhapur / Hitec City"
                  />
                </div>

                {/* Service Capabilities Toggles */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Service Capabilities</span>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={locFormData.pickupAvailable}
                        onChange={e => setLocFormData({...locFormData, pickupAvailable: e.target.checked})}
                        className="rounded text-[#006D77] focus:ring-[#006D77] w-4 h-4"
                      />
                      <Package size={14} className="text-emerald-600 shrink-0" /> Pickup Available
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={locFormData.deliveryAvailable}
                        onChange={e => setLocFormData({...locFormData, deliveryAvailable: e.target.checked})}
                        className="rounded text-[#006D77] focus:ring-[#006D77] w-4 h-4"
                      />
                      <Truck size={14} className="text-blue-600 shrink-0" /> Delivery Available
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={locFormData.expressAvailable}
                        onChange={e => setLocFormData({...locFormData, expressAvailable: e.target.checked})}
                        className="rounded text-[#006D77] focus:ring-[#006D77] w-4 h-4"
                      />
                      <Zap size={14} className="text-amber-500 fill-amber-500 shrink-0" /> Express Delivery
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={locFormData.codAvailable}
                        onChange={e => setLocFormData({...locFormData, codAvailable: e.target.checked})}
                        className="rounded text-[#006D77] focus:ring-[#006D77] w-4 h-4"
                      />
                      <Banknote size={14} className="text-green-600 shrink-0" /> Cash on Delivery (COD)
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 text-sm font-bold text-white bg-[#006D77] hover:bg-[#005a63] rounded-xl shadow transition"
                  >
                    {editingLocId ? 'Update Pincode' : 'Save Pincode'}
                  </button>
                </div>
              </form>
            )}

            {/* --- BULK ADD FORM --- */}
            {addMode === 'bulk' && (
              <form onSubmit={handleBulkImport} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase block mb-1">City Name *</label>
                    <input
                      required
                      type="text"
                      value={bulkData.city}
                      onChange={e => setBulkData({...bulkData, city: e.target.value})}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl font-bold focus:border-[#006D77] outline-none"
                      placeholder="e.g. Hyderabad"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase block mb-1">State</label>
                    <input
                      type="text"
                      value={bulkData.state}
                      onChange={e => setBulkData({...bulkData, state: e.target.value})}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl font-medium focus:border-[#006D77] outline-none"
                      placeholder="e.g. Telangana"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-600 uppercase">Pincodes List * (Comma, space, or newline separated)</label>
                    <span className="text-xs font-mono font-bold text-[#006D77]">
                      {bulkPincodesParsed.length} detected
                    </span>
                  </div>
                  <textarea
                    required
                    rows={4}
                    value={bulkData.pincodesText}
                    onChange={e => setBulkData({...bulkData, pincodesText: e.target.value})}
                    className="w-full px-3.5 py-3 border border-slate-200 rounded-xl font-mono text-sm focus:border-[#006D77] outline-none resize-none"
                    placeholder="Paste pincodes here, e.g.:&#10;500001, 500002, 500032&#10;500081 500084 500089"
                  />
                </div>

                {bulkPincodesParsed.length > 0 && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-24 overflow-y-auto">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Parsed Preview ({bulkPincodesParsed.length} PINs):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {bulkPincodesParsed.slice(0, 15).map(p => (
                        <span key={p} className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                          {p}
                        </span>
                      ))}
                      {bulkPincodesParsed.length > 15 && (
                        <span className="text-xs font-bold text-[#006D77] px-2 py-0.5">
                          +{bulkPincodesParsed.length - 15} more...
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bulkLoading || bulkPincodesParsed.length === 0}
                    className="flex-1 py-2.5 text-sm font-bold text-white bg-[#006D77] hover:bg-[#005a63] rounded-xl shadow transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {bulkLoading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                    Save {bulkPincodesParsed.length > 0 ? `${bulkPincodesParsed.length} Pincodes` : 'Pincodes'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ═══ MODAL: RULE CREATION ═════════════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldBan size={18} className="text-[#006D77]" />
                Create {ruleFormData.ruleType.replace(/([A-Z])/g, ' $1').trim()}
              </h2>
              <button onClick={() => setShowRuleModal(false)} className="text-slate-400 hover:text-slate-700"><X size={22} /></button>
            </div>
            
            <form id="serviceabilityForm" onSubmit={handleSaveRule} className="p-6 space-y-4">
              
              {ruleFormData.ruleType === 'TemporaryBlock' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase block mb-1">Block Reason *</label>
                      <select value={ruleFormData.blockReason} onChange={e => setRuleFormData({...ruleFormData, blockReason: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl font-bold bg-white focus:border-[#006D77] outline-none">
                        <option value="Weather">Weather / Flood / Cyclone</option>
                        <option value="Strike">Strike / Agitation</option>
                        <option value="Hub Overload">Hub Overload / Capacity</option>
                        <option value="Partner Issue">Partner Linehaul Issue</option>
                        <option value="Festival Delay">Festival Congestion</option>
                        <option value="Maintenance">System Maintenance</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase block mb-1">Target City (Optional)</label>
                      <SearchableCitySelect
                        value={ruleFormData.city}
                        onChange={city => setRuleFormData({...ruleFormData, city, originPincode: ''})}
                        cities={distinctCities}
                        locations={locations}
                        allOptionLabel="All Cities (System-Wide Block)"
                        placeholder="Search city..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase block mb-1">Specific Pincode (Optional)</label>
                    <SearchableLocationSelect
                      value={ruleFormData.originPincode}
                      onChange={pin => setRuleFormData({...ruleFormData, originPincode: pin})}
                      locations={sortedLocations.filter(l => !ruleFormData.city || l.city?.toLowerCase() === ruleFormData.city.toLowerCase())}
                      placeholder={ruleFormData.city ? `Search PIN in ${ruleFormData.city}...` : "Search any serviceable pincode..."}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase block mb-1">Start Date *</label>
                      <input required type="date" value={ruleFormData.startDate} onChange={e => setRuleFormData({...ruleFormData, startDate: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl font-medium focus:border-[#006D77] outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase block mb-1">End Date *</label>
                      <input required type="date" value={ruleFormData.endDate} onChange={e => setRuleFormData({...ruleFormData, endDate: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl font-medium focus:border-[#006D77] outline-none" />
                    </div>
                  </div>
                </div>
              )}

              {ruleFormData.ruleType === 'PincodeBlock' && (
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase block mb-1">Select Serviceable Pincode to Block *</label>
                  <SearchableLocationSelect
                    value={ruleFormData.originPincode}
                    onChange={pin => setRuleFormData({...ruleFormData, originPincode: pin})}
                    locations={sortedLocations}
                    placeholder="Search by pincode, city, or area..."
                    required={true}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Blocks any shipment originating from or delivering to this pincode.</p>
                </div>
              )}
              
              {ruleFormData.ruleType === 'CityBlock' && (
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase block mb-1">Select Serviceable City to Block *</label>
                  <SearchableCitySelect
                    value={ruleFormData.city}
                    onChange={city => setRuleFormData({...ruleFormData, city})}
                    cities={distinctCities}
                    locations={locations}
                    placeholder="Search or select city..."
                    required={true}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Blocks all origin and destination shipments across this entire city.</p>
                </div>
              )}

              {ruleFormData.ruleType === 'RouteBlock' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase block mb-1">Origin Serviceable PIN *</label>
                      <SearchableLocationSelect
                        value={ruleFormData.originPincode}
                        onChange={pin => setRuleFormData({...ruleFormData, originPincode: pin})}
                        locations={sortedLocations}
                        placeholder="Search origin..."
                        required={true}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase block mb-1">Dest Serviceable PIN *</label>
                      <SearchableLocationSelect
                        value={ruleFormData.destPincode}
                        onChange={pin => setRuleFormData({...ruleFormData, destPincode: pin})}
                        locations={sortedLocations}
                        placeholder="Search destination..."
                        required={true}
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">Suspends bookings specific to this origin-to-destination corridor.</p>
                </div>
              )}

              {ruleFormData.ruleType === 'ProhibitedItem' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Keyword / Regex Match (in item description)</label>
                  <input required type="text" value={ruleFormData.keyword} onChange={e => setRuleFormData({...ruleFormData, keyword: e.target.value})} className="w-full px-3 py-2.5 border rounded-lg font-mono font-bold" placeholder="e.g. battery|acid|flammable" />
                </div>
              )}

              {ruleFormData.ruleType === 'CutoffTimeRule' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Daily Cutoff Time (HH:MM 24h)</label>
                  <input required type="time" value={ruleFormData.cutoffTime} onChange={e => setRuleFormData({...ruleFormData, cutoffTime: e.target.value})} className="w-full px-3 py-2.5 border rounded-lg font-mono font-bold" />
                </div>
              )}

              {ruleFormData.ruleType === 'FragileRule' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Max Weight for Fragile Parcels (kg)</label>
                  <input required type="number" value={ruleFormData.maxFragileWeight} onChange={e => setRuleFormData({...ruleFormData, maxFragileWeight: e.target.value})} className="w-full px-3 py-2.5 border rounded-lg font-bold" placeholder="e.g. 25" />
                </div>
              )}

              {ruleFormData.ruleType === 'PaymentModeBlock' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Payment Mode</label>
                    <select value={ruleFormData.paymentMode} onChange={e => setRuleFormData({...ruleFormData, paymentMode: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl font-bold bg-white">
                      <option value="Cash">Cash on Delivery (COD)</option>
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Target City (Optional)</label>
                    <SearchableCitySelect
                      value={ruleFormData.city}
                      onChange={city => setRuleFormData({...ruleFormData, city})}
                      cities={distinctCities}
                      locations={locations}
                      allOptionLabel="All Cities (Global Payment Rule)"
                      placeholder="Search city..."
                    />
                  </div>
                </div>
              )}

              {ruleFormData.ruleType === 'CategoryBlock' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Parcel Category</label>
                  <select required value={ruleFormData.category} onChange={e => setRuleFormData({...ruleFormData, category: e.target.value})} className="w-full px-3 py-2.5 border rounded-lg">
                    <option value="">Select Category</option><option>Fragile Item</option><option>Electronics</option><option>General Parcel</option><option>Fertilizers</option><option>Commercial Package</option>
                  </select>
                </div>
              )}

              {ruleFormData.ruleType === 'GlobalConstraint' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Max Weight (kg)</label>
                    <input type="number" value={ruleFormData.maxWeight} onChange={e => setRuleFormData({...ruleFormData, maxWeight: e.target.value})} className="w-full px-3 py-2.5 border rounded-lg" placeholder="e.g. 500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Max Volume (cm³)</label>
                    <input type="number" value={ruleFormData.maxVolume} onChange={e => setRuleFormData({...ruleFormData, maxVolume: e.target.value})} className="w-full px-3 py-2.5 border rounded-lg" placeholder="L * W * H" />
                  </div>
                </div>
              )}

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <label className="text-xs font-bold text-amber-800 uppercase block mb-1.5 flex items-center gap-1"><AlertTriangle size={14} /> Customer-Facing Message</label>
                <textarea required rows={2} value={ruleFormData.reason} onChange={e => setRuleFormData({...ruleFormData, reason: e.target.value})} className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm bg-white focus:outline-none focus:border-amber-500 resize-none" placeholder="e.g. Service temporarily suspended to this area due to severe flooding." />
              </div>
            </form>
            
            <div className="p-4 border-t border-slate-100 flex gap-3 bg-white">
              <button type="button" onClick={() => setShowRuleModal(false)} className="flex-1 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
              <button type="submit" form="serviceabilityForm" className="flex-1 py-2.5 text-sm font-bold text-white bg-[#006D77] hover:bg-[#005f6a] rounded-lg transition">Enforce Rule</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
