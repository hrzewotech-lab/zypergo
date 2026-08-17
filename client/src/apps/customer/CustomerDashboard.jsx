import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Bell, Package, CalendarClock, Map, FileText, ChevronRight, CheckCircle2, Clock, Truck } from 'lucide-react';
import api from '../../api';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: 'Customer' });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState('Locating...');

  useEffect(() => {
    const userData = localStorage.getItem('zypergo_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Fetch Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || 'Unknown City';
          const state = data.address.state || 'Unknown State';
          setLocationName(`${city}, ${state}`);
        } catch (error) {
          console.error("Error reverse geocoding:", error);
          setLocationName("Location Unavailable");
        }
      }, (err) => {
        console.error("Geolocation error:", err);
        setLocationName("Location Access Denied");
      });
    } else {
      setLocationName("Location Not Supported");
    }

    // Fetch recent orders
    const fetchOrders = async () => {
      try {
        const res = await api.get('/bookings/my-bookings');
        if (res.data.success) {
          setRecentOrders(res.data.data.slice(0, 3)); // Just top 3 for dashboard
        }
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusIcon = (status) => {
    if (status === 'Delivered') return <CheckCircle2 size={14} className="text-emerald-500" />;
    if (status === 'In Transit' || status?.includes('Hub')) return <Truck size={14} className="text-[#006D77]" />;
    return <Clock size={14} className="text-[#FFB703]" />;
  };

  const getStatusColor = (status) => {
    if (status === 'Delivered') return 'text-emerald-600 bg-emerald-50';
    if (status === 'In Transit' || status?.includes('Hub')) return 'text-[#006D77] bg-teal-50';
    return 'text-[#FFB703] bg-amber-50';
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-full">
      {/* Top Header */}
      <div className="flex justify-between items-center px-4 py-4 md:px-8 md:pt-8 md:pb-4 bg-white md:bg-transparent sticky top-0 z-10 md:static shadow-sm md:shadow-none">
        <div className="flex items-center gap-2 text-slate-800">
          <MapPin size={20} className="text-[#006D77]" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Current Location</span>
            <span className="text-sm font-black flex items-center gap-1">{locationName} <ChevronDownIcon /></span>
          </div>
        </div>
        <button 
          onClick={() => navigate('/notifications')}
          className="p-2 relative text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#FFB703] rounded-full border-[1.5px] border-white"></span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto w-full md:grid md:grid-cols-3 md:gap-8 md:px-8 md:pb-8">
        <div className="md:col-span-2">
          {/* Main Banner */}
          <div className="px-4 py-2 mt-2 md:p-0 md:mt-0">
            <div className="bg-[#006D77] rounded-3xl p-6 relative overflow-hidden shadow-lg">
              {/* Decorative shapes */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-600 rounded-full opacity-50 blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-800 rounded-full opacity-50 blur-xl"></div>
              
              <div className="relative z-10 w-2/3">
                <h2 className="text-2xl font-black text-white leading-tight mb-2">Send Anything,<br/>Anywhere!</h2>
                <p className="text-teal-100 text-[10px] font-bold tracking-widest uppercase mb-4 flex items-center gap-1.5">
                  Fast <span className="w-1 h-1 bg-[#FFB703] rounded-full"></span> Safe <span className="w-1 h-1 bg-[#FFB703] rounded-full"></span> Affordable
                </p>
                <button 
                  onClick={() => navigate('/booking')}
                  className="bg-[#FFB703] text-slate-900 font-black px-6 py-2.5 rounded-xl text-sm shadow-md hover:bg-amber-400 active:scale-95 transition-all"
                >
                  Book Now
                </button>
              </div>
              
              {/* Mock Box Graphic */}
              <div className="absolute bottom-2 right-0 w-1/3 flex justify-end pr-2">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-200 to-amber-500 rounded-lg shadow-xl border border-amber-300 transform rotate-12 flex items-center justify-center relative overflow-hidden">
                   <div className="absolute w-full h-1 bg-amber-600/30 top-1/2 -translate-y-1/2 transform -rotate-45"></div>
                   <div className="absolute w-full h-1 bg-amber-600/30 top-1/2 -translate-y-1/2 transform rotate-45"></div>
                   <Package size={40} className="text-amber-800/40" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-4 mt-2 md:px-0 md:mt-6">
            <h3 className="text-sm md:text-base font-black text-slate-800 mb-4 tracking-tight">Quick Actions</h3>
            <div className="grid grid-cols-4 gap-3 md:flex md:flex-wrap md:gap-6">
              <ActionItem icon={<Package />} label="Send Parcel" onClick={() => navigate('/booking')} />
              <ActionItem icon={<CalendarClock />} label="Schedule Pickup" onClick={() => navigate('/booking')} />
              <ActionItem icon={<Map />} label="Track Order" onClick={() => navigate('/track')} />
              <ActionItem icon={<FileText />} label="Rate Card" onClick={() => navigate('/support')} />
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          {/* Recent Orders */}
          <div className="px-4 py-4 mt-2 md:px-0 md:mt-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-slate-800 tracking-tight">Recent Orders</h3>
              <button onClick={() => navigate('/shipments')} className="text-xs font-bold text-[#006D77] hover:underline">View All</button>
            </div>
            
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8 text-slate-400 text-sm font-bold animate-pulse">Loading orders...</div>
              ) : recentOrders.length > 0 ? (
                recentOrders.map(order => (
                  <div 
                    key={order._id} 
                    onClick={() => navigate(`/track/${order.trackingId}`)}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex gap-4 items-start hover:border-[#006D77]/30 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                      {getStatusIcon(order.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-xs font-black text-slate-800">Order #{order.trackingId}</p>
                        <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mb-1 line-clamp-1">
                        {order.pickupLocation?.address?.split(',')[0]} → {order.dropLocation?.address?.split(',')[0]}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                 <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100">
                   <Package className="mx-auto text-slate-300 mb-2" size={32} />
                   <p className="text-sm font-bold text-slate-600 mb-1">No recent orders</p>
                   <p className="text-xs text-slate-400">Book your first parcel delivery today.</p>
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}

function ActionItem({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group active:scale-95 transition-all md:w-28">
      <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-[#006D77] group-hover:bg-teal-50 group-hover:border-teal-200 transition-colors">
        {React.cloneElement(icon, { size: 24, strokeWidth: 1.5 })}
      </div>
      <span className="text-[10px] md:text-xs font-bold text-slate-600 text-center leading-tight group-hover:text-[#006D77]">{label}</span>
    </button>
  );
}

function ChevronDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="m6 9 6 6 6-6"/></svg>
  );
}
