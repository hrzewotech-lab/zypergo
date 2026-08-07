import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Edit2, UserPlus, FileText, X } from 'lucide-react';
import api from '../../api';

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  
  // Override Modal State
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOverrideStatus = async (e) => {
    e.preventDefault();
    if (!newStatus || !selectedBooking) return;
    
    try {
      const res = await api.put(`/admin/bookings/${selectedBooking._id}`, { status: newStatus });
      if (res.status === 200) {
        fetchBookings();
        setSelectedBooking(null);
      }
    } catch (err) {
      alert('Failed to override status');
    }
  };

  const filteredBookings = filter === 'All' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Booking Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all active and past shipments.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-wrap gap-4 justify-between items-center">
          <div className="flex items-center gap-2 overflow-x-auto">
            {['All', 'Booking Confirmed', 'Rider Assigned', 'Picked Up', 'In Transit', 'Delivered', 'Delayed'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${filter === f ? 'bg-[#006D77] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 text-slate-600 font-bold text-sm bg-slate-100 px-4 py-2 rounded-lg hover:bg-slate-200">
            <Filter size={16}/> Advanced Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-200">
              <tr>
                <th className="p-4">Tracking ID</th>
                <th className="p-4">Route Info</th>
                <th className="p-4">Delivery Type</th>
                <th className="p-4">Current Status</th>
                <th className="p-4">Price</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-500">Loading bookings...</td></tr>
              ) : filteredBookings.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-500">No bookings found for this filter.</td></tr>
              ) : (
                filteredBookings.map(b => (
                  <tr key={b._id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono font-bold text-[#006D77]">{b.trackingId}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{b.pickupLocation.pincode} &rarr; {b.dropLocation.pincode}</p>
                      <p className="text-xs text-slate-500">S: {b.sender?.name || 'Customer'} | R: {b.receiver?.name}</p>
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">{b.metadata?.deliveryType}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                        b.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        b.status === 'Delayed' || b.status === 'Failed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">₹{b.pricing?.total}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => { setSelectedBooking(b); setNewStatus(b.status); }} className="p-1.5 text-blue-600 bg-blue-50 rounded hover:bg-blue-100" title="Override Status">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-1.5 text-[#006D77] bg-[#006D77]/10 rounded hover:bg-[#006D77]/20" title="Assign Partner/Rider">
                          <UserPlus size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Override Status Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Override Status</h2>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Manually overriding the status for <span className="font-mono font-bold text-[#006D77]">{selectedBooking.trackingId}</span>. This will be logged in the audit trail.
            </p>
            <form onSubmit={handleOverrideStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">New Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="Booking Confirmed">Booking Confirmed</option>
                  <option value="Rider Assigned">Rider Assigned</option>
                  <option value="Picked Up">Picked Up</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-red-600 text-white font-bold py-2 rounded shadow hover:bg-red-700">
                Force Update Status
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
