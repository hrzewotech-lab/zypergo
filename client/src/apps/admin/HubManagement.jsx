import React, { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Users, Package, AlertTriangle, MoreVertical, X, Settings, RefreshCcw, CheckCircle, ListPlus, Send, Edit, Power, Trash2 } from 'lucide-react';
import api from '../../api';

export default function HubManagement() {
  const [activeTab, setActiveTab] = useState('setup'); // 'setup' or 'operations'
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ role: 'SuperAdmin' });

  // Setup State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newHub, setNewHub] = useState({ name: '', hubType: 'Source', city: '', maxCapacity: 5000, managerName: '', managerEmail: '', managerPhone: '' });
  const [editingHub, setEditingHub] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Operations State
  const [opAction, setOpAction] = useState('receive'); // receive, sort, manifest
  const [opData, setOpData] = useState({ bookingId: '', hubId: '', acknowledgementType: 'Digital', route: '', type: 'Bag', parcels: '' });
  const [opMessage, setOpMessage] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('zypergo_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      // If user is HubOperator, default to operations
      if (parsed.role === 'HubOperator') {
        setActiveTab('operations');
      }
    }
    fetchHubs();
  }, []);

  const fetchHubs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hub');
      if (res.data.success) {
        setHubs(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch hubs', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHub = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newHub.name,
        hubType: newHub.hubType,
        address: { city: newHub.city },
        capacity: { maxCapacity: Number(newHub.maxCapacity) },
        contactDetails: { 
          managerName: newHub.managerName,
          email: newHub.managerEmail,
          phone: newHub.managerPhone
        }
      };
      await api.post('/hub', payload);
      setShowAddModal(false);
      setNewHub({ name: '', hubType: 'Source', city: '', maxCapacity: 5000, managerName: '', managerEmail: '', managerPhone: '' });
      fetchHubs();
    } catch (error) {
      console.error('Failed to add hub', error);
      alert(error.response?.data?.error || 'Failed to create hub. Please try again.');
    }
  };

  const openEditModal = (hub) => {
    setEditingHub({
      _id: hub._id,
      name: hub.name,
      hubType: hub.hubType,
      city: hub.address?.city || '',
      maxCapacity: hub.capacity?.maxCapacity || 5000,
      managerName: hub.contactDetails?.managerName || ''
    });
    setOpenMenuId(null);
    setShowEditModal(true);
  };

  const handleEditHub = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: editingHub.name,
        hubType: editingHub.hubType,
        'address.city': editingHub.city,
        'capacity.maxCapacity': Number(editingHub.maxCapacity),
        'contactDetails.managerName': editingHub.managerName
      };
      await api.put(`/hub/${editingHub._id}`, payload);
      setShowEditModal(false);
      fetchHubs();
    } catch (error) {
      console.error('Failed to update hub', error);
      alert('Failed to update hub.');
    }
  };

  const handleToggleStatus = async (hub) => {
    setOpenMenuId(null);
    try {
      await api.put(`/hub/${hub._id}`, { isActive: !hub.isActive });
      fetchHubs();
    } catch (error) {
      console.error('Failed to toggle status', error);
    }
  };

  const handleDeleteHub = async (id) => {
    setOpenMenuId(null);
    if (window.confirm('Are you absolutely sure you want to delete this hub? This action cannot be undone.')) {
      try {
        await api.delete(`/hub/${id}`);
        fetchHubs();
      } catch (error) {
        console.error('Failed to delete hub', error);
        alert('Failed to delete hub.');
      }
    }
  };

  const handleOperation = async (e) => {
    e.preventDefault();
    setOpMessage(null);
    try {
      let endpoint = '';
      let payload = {};

      if (opAction === 'receive') {
        endpoint = '/hub/receive';
        payload = { bookingId: opData.bookingId, hubId: opData.hubId, acknowledgementType: opData.acknowledgementType };
      } else if (opAction === 'sort') {
        endpoint = '/hub/sort';
        payload = { bookingId: opData.bookingId, route: opData.route, sortType: 'Manual' };
      } else if (opAction === 'manifest') {
        endpoint = '/hub/manifest';
        payload = { type: opData.type, sourceHub: opData.hubId, parcels: opData.parcels.split(',').map(id => id.trim()) };
      }

      const res = await api.post(endpoint, payload);
      
      if (res.data.success) {
        let text = 'Operation successful.';
        if (opAction === 'receive') text = `Parcel ${opData.bookingId} received. ${res.data.warning || ''}`;
        if (opAction === 'sort') text = `Parcel ${opData.bookingId} sorted to ${opData.route}.`;
        if (opAction === 'manifest') text = `Manifest ${res.data.data.manifestId} created with ${payload.parcels.length} parcels.`;
        
        setOpMessage({ type: 'success', text });
        setOpData({ ...opData, bookingId: '', parcels: '' });
        fetchHubs();
      }
    } catch (error) {
      setOpMessage({ type: 'error', text: error.response?.data?.error || 'Operation failed' });
    }
  };

  const isSuperOrOps = ['SuperAdmin', 'OperationsAdmin'].includes(user.role);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Hub Management</h1>
          <p className="text-slate-500 text-sm mt-1">Setup hubs and manage daily operations.</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex bg-slate-200/50 p-1 rounded-lg">
          {isSuperOrOps && (
            <button 
              onClick={() => setActiveTab('setup')}
              className={`px-4 py-2 text-sm font-bold rounded-md transition ${activeTab === 'setup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Hub Setup
            </button>
          )}
          <button 
            onClick={() => setActiveTab('operations')}
            className={`px-4 py-2 text-sm font-bold rounded-md transition ${activeTab === 'operations' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Operations Desk
          </button>
        </div>
      </div>

      {activeTab === 'setup' && (
        <div className="animate-in fade-in duration-300">
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
              <div className="flex gap-3">
                <button onClick={fetchHubs} className="p-2 text-slate-400 hover:text-[#006D77] transition bg-white border border-slate-200 rounded-lg">
                  <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
                {isSuperOrOps && (
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-[#006D77] hover:bg-[#00585f] text-white px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 shadow-sm"
                  >
                    <Plus size={18} /> Add Hub
                  </button>
                )}
              </div>
            </div>
            
            <div className="overflow-x-auto min-h-[400px]">
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
                  {hubs.length === 0 && !loading && (
                    <tr><td colSpan="6" className="p-8 text-center text-slate-400 font-medium">No hubs found.</td></tr>
                  )}
                  {hubs.map((hub) => {
                    const loadPercentage = (hub.capacity.currentParcels / hub.capacity.maxCapacity) * 100;
                    const isOverloaded = loadPercentage > (hub.capacity.capacityThresholdAlert || 90);
                    
                    return (
                      <tr key={hub._id} className="hover:bg-slate-50 transition relative">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{hub.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-bold uppercase">{hub.hubType}</span> 
                            {hub._id.substring(hub._id.length - 6).toUpperCase()}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                            <MapPin size={16} className="text-slate-400" /> {hub.address?.city || 'N/A'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="w-full max-w-[150px]">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-bold text-slate-700">{hub.capacity.currentParcels.toLocaleString()}</span>
                              <span className="text-slate-400">/ {hub.capacity.maxCapacity.toLocaleString()}</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${isOverloaded ? 'bg-red-500' : (loadPercentage > 80 ? 'bg-amber-500' : 'bg-[#006D77]')}`}
                                style={{ width: `${Math.min(100, loadPercentage)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#e0f2f1] text-[#006D77] flex items-center justify-center text-[10px] font-bold">
                              {(hub.contactDetails?.managerName || 'NA').substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-slate-700">{hub.contactDetails?.managerName || 'Unassigned'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {hub.isActive ? (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${isOverloaded ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                              {isOverloaded ? <AlertTriangle size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>}
                              {isOverloaded ? 'High Load' : 'Active'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right relative">
                          <button 
                            onClick={() => setOpenMenuId(openMenuId === hub._id ? null : hub._id)}
                            className="text-slate-400 hover:text-slate-700 transition p-1 rounded-lg hover:bg-slate-200"
                          >
                            <MoreVertical size={18} />
                          </button>
                          
                          {/* Dropdown Menu */}
                          {openMenuId === hub._id && (
                            <div className="absolute right-8 top-12 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                              <button onClick={() => openEditModal(hub)} className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition">
                                <Edit size={16} className="text-slate-400" /> Edit Hub
                              </button>
                              <button onClick={() => handleToggleStatus(hub)} className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition">
                                <Power size={16} className={hub.isActive ? "text-amber-500" : "text-green-500"} /> {hub.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <div className="h-px bg-slate-100 w-full"></div>
                              <button onClick={() => handleDeleteHub(hub._id)} className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition">
                                <Trash2 size={16} /> Delete Hub
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Operations Desk Tab ... (omitted changing for brevity, just keeping it identical) */}
      {activeTab === 'operations' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Actions Panel */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Select Hub context</h3>
                <select 
                  value={opData.hubId} onChange={(e) => setOpData({...opData, hubId: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium bg-slate-50"
                >
                  <option value="">-- Select Active Hub --</option>
                  {hubs.map(h => <option key={h._id} value={h._id}>{h.name} ({h.hubType})</option>)}
                </select>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-2">
                <button onClick={() => setOpAction('receive')} className={`flex items-center gap-3 p-3 rounded-lg font-bold text-left transition ${opAction === 'receive' ? 'bg-[#006D77]/10 text-[#006D77] border border-[#006D77]/20' : 'hover:bg-slate-50 text-slate-600 border border-transparent'}`}>
                  <Package size={18} /> Receive Parcel
                </button>
                <button onClick={() => setOpAction('sort')} className={`flex items-center gap-3 p-3 rounded-lg font-bold text-left transition ${opAction === 'sort' ? 'bg-[#FFB703]/10 text-[#e6a500] border border-[#FFB703]/20' : 'hover:bg-slate-50 text-slate-600 border border-transparent'}`}>
                  <Settings size={18} /> Sort Parcel
                </button>
                <button onClick={() => setOpAction('manifest')} className={`flex items-center gap-3 p-3 rounded-lg font-bold text-left transition ${opAction === 'manifest' ? 'bg-[#8338EC]/10 text-[#8338EC] border border-[#8338EC]/20' : 'hover:bg-slate-50 text-slate-600 border border-transparent'}`}>
                  <ListPlus size={18} /> Create Manifest
                </button>
              </div>
            </div>

            {/* Workspace Panel */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  {opAction === 'receive' && <><Package className="text-[#006D77]" /> Scan & Receive Parcel</>}
                  {opAction === 'sort' && <><Settings className="text-[#e6a500]" /> Sort Parcel to Route</>}
                  {opAction === 'manifest' && <><ListPlus className="text-[#8338EC]" /> Group into Manifest</>}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  {opAction === 'receive' && 'Acknowledge receipt from a rider into this hub.'}
                  {opAction === 'sort' && 'Assign a received parcel to a specific dispatch route.'}
                  {opAction === 'manifest' && 'Group sorted parcels into a bag, bundle, or consignment.'}
                </p>
              </div>

              {opMessage && (
                <div className={`p-4 mb-6 rounded-lg text-sm font-bold flex items-start gap-3 ${opMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {opMessage.type === 'success' ? <CheckCircle size={18} className="mt-0.5 shrink-0" /> : <AlertTriangle size={18} className="mt-0.5 shrink-0" />}
                  {opMessage.text}
                </div>
              )}

              <form onSubmit={handleOperation} className="space-y-5">
                {!opData.hubId && (
                  <div className="p-3 bg-amber-50 text-amber-800 text-sm rounded-lg border border-amber-200 flex items-center gap-2">
                    <AlertTriangle size={16}/> Please select a Hub context from the left panel first.
                  </div>
                )}

                {/* Common Booking ID Input */}
                {opAction !== 'manifest' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Booking ID (AWB)</label>
                    <input 
                      type="text" required disabled={!opData.hubId}
                      value={opData.bookingId} onChange={e => setOpData({...opData, bookingId: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-base font-bold font-mono" 
                      placeholder="e.g. 64b9f2... (Scan Barcode)"
                    />
                  </div>
                )}

                {/* Receive Specific */}
                {opAction === 'receive' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Acknowledgement Type</label>
                    <select 
                      value={opData.acknowledgementType} onChange={e => setOpData({...opData, acknowledgementType: e.target.value})} disabled={!opData.hubId}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium"
                    >
                      <option value="Digital">Digital Signature</option>
                      <option value="Scan">Barcode Scan Only</option>
                      <option value="Manual">Manual Entry</option>
                    </select>
                  </div>
                )}

                {/* Sort Specific */}
                {opAction === 'sort' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Assign Route / Destination</label>
                    <input 
                      type="text" required disabled={!opData.hubId}
                      value={opData.route} onChange={e => setOpData({...opData, route: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-base font-medium" 
                      placeholder="e.g. RT-HYD-04"
                    />
                  </div>
                )}

                {/* Manifest Specific */}
                {opAction === 'manifest' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Manifest Type</label>
                        <select 
                          value={opData.type} onChange={e => setOpData({...opData, type: e.target.value})} disabled={!opData.hubId}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium"
                        >
                          <option value="Bag">Bag</option>
                          <option value="Bundle">Bundle</option>
                          <option value="Consignment">Consignment</option>
                          <option value="Partner Manifest">Partner Manifest</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Booking IDs (Comma Separated)</label>
                      <textarea 
                        required disabled={!opData.hubId} rows="4"
                        value={opData.parcels} onChange={e => setOpData({...opData, parcels: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-mono" 
                        placeholder="Scan multiple barcodes here..."
                      ></textarea>
                    </div>
                  </>
                )}

                <div className="pt-6">
                  <button 
                    type="submit" 
                    disabled={!opData.hubId}
                    className="w-full py-3.5 rounded-lg font-bold text-white transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: opAction === 'receive' ? '#006D77' : (opAction === 'sort' ? '#e6a500' : '#8338EC') }}
                  >
                    <Send size={18} /> Execute {opAction.charAt(0).toUpperCase() + opAction.slice(1)}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Hub Modal */}
      {showAddModal && isSuperOrOps && (
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
                    value={newHub.hubType} onChange={e => setNewHub({...newHub, hubType: e.target.value})}
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
                    value={newHub.maxCapacity} onChange={e => setNewHub({...newHub, maxCapacity: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium" 
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Assign Manager</label>
                  <input 
                    type="text" required
                    value={newHub.managerName} onChange={e => setNewHub({...newHub, managerName: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium" 
                    placeholder="Staff Name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Manager Email</label>
                  <input 
                    type="email" required
                    value={newHub.managerEmail} onChange={e => setNewHub({...newHub, managerEmail: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium" 
                    placeholder="manager@hub.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Manager Phone</label>
                  <input 
                    type="tel" required
                    value={newHub.managerPhone} onChange={e => setNewHub({...newHub, managerPhone: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium" 
                    placeholder="9999999999"
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

      {/* Edit Hub Modal */}
      {showEditModal && editingHub && isSuperOrOps && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Edit Hub Details</h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEditHub} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Hub Name</label>
                <input 
                  type="text" required
                  value={editingHub.name} onChange={e => setEditingHub({...editingHub, name: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Hub Type</label>
                  <select 
                    value={editingHub.hubType} onChange={e => setEditingHub({...editingHub, hubType: e.target.value})}
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
                    value={editingHub.city} onChange={e => setEditingHub({...editingHub, city: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Max Capacity</label>
                  <input 
                    type="number" required min="100"
                    value={editingHub.maxCapacity} onChange={e => setEditingHub({...editingHub, maxCapacity: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Manager Name</label>
                  <input 
                    type="text" required
                    value={editingHub.managerName} onChange={e => setEditingHub({...editingHub, managerName: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#006D77] outline-none text-sm font-medium" 
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-[#006D77] hover:bg-[#00585f] rounded-lg transition shadow-md">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
