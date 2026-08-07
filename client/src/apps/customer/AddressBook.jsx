import React, { useState, useEffect } from 'react';
import { Plus, Search, Building2, Truck, MoreVertical, MapPin, User, Phone } from 'lucide-react';
import axios from 'axios';

export default function AddressBook() {
  const [addresses, setAddresses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd get the actual user ID from context/auth
    const fetchAddresses = async () => {
      try {
        const res = await axios.get('/api/addresses/mock_user_123');
        setAddresses(res.data);
      } catch (err) {
        console.error('Failed to fetch addresses', err);
        // Fallback to static mock data if API fails
        setAddresses([
          { _id: '1', title: 'Main Warehouse', type: 'Default Pickup', street: '1234 Logistics Blvd, Suite 100', building: 'Industrial Park', city: 'Chicago', state: 'IL', zipCode: '60601', country: 'USA', contactName: 'Sarah Jenkins', contactPhone: '+1 (555) 019-2834', icon: Building2 },
          { _id: '2', title: 'Downtown Office', type: 'Default', street: '880 Tech Square, Floor 4', building: 'Downtown District', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA', contactName: 'Marcus Vance', contactPhone: '+1 (555) 332-9901', icon: Building2 },
          { _id: '3', title: 'Supplier Alpha', type: 'Vendor', street: '4500 Manufacturing Way', building: 'Building B', city: 'Detroit', state: 'MI', zipCode: '48201', country: 'USA', contactName: 'Elara Chen', contactPhone: '+1 (555) 765-4321', icon: Truck },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  const getIcon = (type, title) => {
    if (type === 'Vendor' || title.toLowerCase().includes('supplier')) return Truck;
    return Building2;
  };

  return (
    <div className="max-w-7xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Address Book</h1>
          <p className="text-slate-600">Manage your saved pickup and delivery locations for faster booking.</p>
        </div>
        <button className="bg-[#00767C] text-white px-5 py-2.5 rounded flex items-center gap-2 font-medium text-sm hover:bg-[#005a5e] transition-colors shadow-sm">
          <Plus size={18} /> Add New Address
        </button>
      </div>

      {/* Search */}
      <div className="mb-8 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search addresses..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-sm w-full outline-none focus:border-[#00767C] focus:ring-1 focus:ring-[#00767C] shadow-sm bg-white"
        />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addresses.map((address) => {
          const IconComponent = address.icon || getIcon(address.type, address.title);
          
          return (
            <div key={address._id} className={`bg-white border ${address.type === 'Default Pickup' ? 'border-[#00767C] border-t-4' : 'border-slate-200'} rounded-lg shadow-sm flex flex-col`}>
              
              <div className="p-6 pb-0">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 shrink-0">
                      <IconComponent size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        {address.title}
                      </h3>
                      {address.type !== 'Default' && (
                        <span className="inline-block mt-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          {address.type}
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Address</div>
                      <p className="text-slate-700">{address.street}</p>
                      {address.building && <p className="text-slate-700">{address.building}</p>}
                      <p className="text-slate-700">{address.city}, {address.state} {address.zipCode}, {address.country}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4 pb-4">
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-1"><User size={10} /> Contact</div>
                    <div className="text-sm text-slate-700">{address.contactName}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-1"><Phone size={10} /> Phone</div>
                    <div className="text-sm text-slate-700">{address.contactPhone}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-lg flex gap-3 mt-auto">
                <button className="flex-1 bg-white border border-slate-300 text-slate-700 py-2 rounded text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
                  Edit
                </button>
                <button className="flex-1 bg-white border border-slate-300 text-slate-700 py-2 rounded text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
                  Book from here
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
