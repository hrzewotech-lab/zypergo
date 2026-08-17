import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Home, Building2, MapPin, ChevronRight, ArrowLeft, Loader2, X } from 'lucide-react';
import api from '../../api';

export default function AddressBook() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: 'Home',
    street: '',
    city: '',
    state: '',
    pincode: '',
    type: 'Home'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem('zypergo_user') || '{}');

  const fetchAddresses = async () => {
    if (!user.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/addresses/${user.id}`);
      setAddresses(res.data);
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!user.id) return;
    try {
      setIsSubmitting(true);
      const payload = {
        userId: user.id,
        ...newAddress
      };
      await api.post('/addresses', payload);
      setShowAddModal(false);
      setNewAddress({ title: 'Home', street: '', city: '', state: '', pincode: '', type: 'Home' });
      fetchAddresses(); // Refresh list
    } catch (err) {
      console.error('Failed to add address', err);
      alert('Failed to add address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIconForType = (type) => {
    if (type?.toLowerCase().includes('office') || type?.toLowerCase().includes('work')) return Building2;
    if (type?.toLowerCase().includes('home')) return Home;
    return MapPin;
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-full animate-in fade-in zoom-in-95 duration-300 relative pb-24">
      
      {/* Header */}
      <div className="bg-white px-4 py-5 flex items-center gap-4 sticky top-0 z-20 shadow-sm border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="text-slate-700 hover:scale-110 transition-transform active:scale-95">
           <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-black text-slate-900 mx-auto pr-8">Addresses</h1>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="font-bold text-sm">Loading addresses...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <MapPin className="mb-4 opacity-50" size={48} />
            <p className="font-bold text-sm">No saved addresses</p>
          </div>
        ) : (
          addresses.map((address) => {
            const IconComponent = getIconForType(address.type || address.title);
            return (
              <div key={address._id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center shrink-0">
                    <IconComponent size={24} className="text-[#006D77]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-slate-900">{address.title || address.type || 'Saved Address'}</h3>
                      {address.isDefault && (
                        <span className="bg-teal-50 text-[#006D77] px-2 py-0.5 rounded-full text-[10px] font-bold">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-500">{address.street}, {address.city}</p>
                    <p className="text-sm font-medium text-slate-500">{address.state}, {address.pincode}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-400 shrink-0" />
              </div>
            );
          })
        )}
      </div>

      {/* Add Address Button (Sticky Bottom) */}
      <div className="fixed bottom-[80px] left-0 right-0 p-4 max-w-md mx-auto z-10 pointer-events-none">
        <button 
          onClick={() => setShowAddModal(true)}
          className="pointer-events-auto w-full bg-[#FFB703] text-[#5A4100] py-4 rounded-full font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FFB703]/30 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus size={20} strokeWidth={3} /> Add Address
        </button>
      </div>

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/40 backdrop-blur-sm animate-in fade-in justify-end">
          <div className="bg-white rounded-t-3xl p-6 shadow-2xl flex flex-col gap-6 animate-in slide-in-from-bottom max-h-[90vh] overflow-y-auto w-full max-w-md mx-auto">
            <div className="flex justify-between items-center">
              <h2 className="font-black text-xl text-slate-900">Add New Address</h2>
              <button onClick={() => !isSubmitting && setShowAddModal(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X size={20}/></button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Save As</label>
                <div className="flex gap-2">
                  {['Home', 'Office', 'Other'].map(type => (
                    <button 
                      key={type}
                      type="button"
                      onClick={() => setNewAddress({...newAddress, title: type, type: type})}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-sm border transition-colors ${newAddress.title === type ? 'bg-teal-50 border-[#006D77] text-[#006D77]' : 'bg-white border-slate-200 text-slate-600'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Street Address</label>
                <input 
                  type="text" 
                  required
                  value={newAddress.street}
                  onChange={e => setNewAddress({...newAddress, street: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#006D77]" 
                  placeholder="e.g. 123 Main St, Apt 4B" 
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">City</label>
                  <input 
                    type="text" 
                    required
                    value={newAddress.city}
                    onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#006D77]" 
                    placeholder="City" 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Pincode</label>
                  <input 
                    type="text" 
                    required
                    value={newAddress.pincode}
                    onChange={e => setNewAddress({...newAddress, pincode: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#006D77]" 
                    placeholder="e.g. 560001" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">State</label>
                <input 
                  type="text" 
                  required
                  value={newAddress.state}
                  onChange={e => setNewAddress({...newAddress, state: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#006D77]" 
                  placeholder="State" 
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#006D77] text-white font-black py-4 rounded-xl shadow-[0_8px_20px_-6px_rgba(0,109,119,0.5)] flex justify-center items-center gap-2 mt-4 transition-all active:scale-95 disabled:opacity-75"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Save Address'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
