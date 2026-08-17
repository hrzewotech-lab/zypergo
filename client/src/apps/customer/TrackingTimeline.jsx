import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, FileText, HeadphonesIcon, Info, Package, MapPin, Share2 } from 'lucide-react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../api';

// Fix for default leaflet icons not showing correctly in React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function TrackingTimeline() {
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const trackingId = paramId || searchParams.get('id');
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (trackingId) {
      api.get(`/bookings/${trackingId}`)
        .then(res => {
          setBooking(res.data.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      // If no specific tracking ID is given, find the user's latest active shipment
      api.get('/bookings/my-shipments')
        .then(res => {
          const shipments = res.data?.data || [];
          if (shipments.length > 0) {
            // Find first active, otherwise first overall
            const target = shipments.find(s => !['Delivered', 'Cancelled', 'Failed'].includes(s.status)) || shipments[0];
            // Redirect to it
            navigate(`/track/${target.trackingId}`, { replace: true });
          } else {
            setLoading(false);
          }
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [trackingId, navigate]);

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold">Loading tracking information...</div>;
  
  if (!booking) return <div className="p-12 text-center text-slate-500 font-bold">No tracking information found for this ID.</div>;

  // Mock map position based on drop location (if lat/lng exists) or just generic
  const position = booking.dropLocation?.lat ? [booking.dropLocation.lat, booking.dropLocation.lng] : [20.5937, 78.9629]; 
  
  const handleShare = () => {
    const url = window.location.href;
    const text = `Track my ZyperGo parcel! Tracking ID: ${booking.trackingId}. View here: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Delayed': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Failed': case 'Returned': case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-[#006D77]/10 text-[#006D77] border-[#006D77]/20';
    }
  };

  return (
    <div className="bg-slate-50 min-h-full flex flex-col font-sans pb-24 animate-in slide-in-from-right-4 duration-300">
      {/* Header Map */}
      <div className="relative h-[250px] w-full shrink-0">
          <MapContainer center={position} zoom={13} scrollWheelZoom={false} className="w-full h-full z-0">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup>
                {booking.dropLocation?.address || 'Destination'}
              </Popup>
            </Marker>
          </MapContainer>
          
          {/* Floating Back/Share buttons */}
          <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
            <button onClick={() => navigate(-1)} className="pointer-events-auto w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-md text-slate-700 hover:scale-105 transition-transform active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button onClick={handleShare} className="pointer-events-auto w-10 h-10 bg-[#006D77]/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-md text-white hover:scale-105 transition-transform active:scale-95">
              <Share2 size={18} />
            </button>
          </div>
      </div>

      <div className="px-4 -mt-10 relative z-20 space-y-4">
        {/* Status Card */}
        <div className="bg-white rounded-3xl p-5 shadow-lg shadow-black/5 border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Tracking ID</p>
              <h2 className="text-lg font-black text-slate-900">{booking.trackingId}</h2>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Estimated Delivery</p>
              <p className="text-sm font-black text-[#006D77]">{booking.eta || 'Calculating...'}</p>
            </div>
            <div className="w-10 h-10 bg-[#FFB703]/20 rounded-full flex items-center justify-center shrink-0">
              <Truck size={18} className="text-[#b58200]" />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-black text-slate-900 mb-6">Tracking History</h3>
          <div className="relative border-l-2 border-slate-100 ml-4 space-y-6 pb-2">
            {booking.trackingHistory && booking.trackingHistory.length > 0 ? (
              booking.trackingHistory.slice().reverse().map((history, idx) => {
                const isLatest = idx === 0;
                return (
                  <div key={idx} className="relative pl-6">
                    <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white ${isLatest ? 'bg-[#FFB703] text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                      {isLatest ? <Truck size={14} /> : <CheckCircle2 size={14} />}
                    </div>
                    <div className={isLatest ? "" : "opacity-60"}>
                      <h4 className={`text-sm font-bold ${isLatest ? 'text-slate-900' : 'text-slate-600'}`}>{history.status}</h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                        {new Date(history.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 font-medium">{history.location || 'System'}</p>
                      
                      {history.description && isLatest && (
                        <div className="mt-3 bg-teal-50 border border-teal-100 rounded-xl p-3 flex items-start gap-2 text-[#006D77]">
                          <Info size={16} className="shrink-0 mt-0.5" />
                          <p className="text-xs font-medium leading-relaxed">{history.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-slate-500 font-medium pl-6">No tracking history available yet.</div>
            )}
          </div>
        </div>
        
        {/* Package & Routing Summary */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-6">
          <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
            <Package size={18} className="text-[#006D77]" /> Details
          </h3>
          <div className="space-y-3">
             <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
               <span className="text-xs font-bold text-slate-500">Weight</span>
               <span className="text-sm font-black text-slate-900">{booking.packageDetails?.weight || 'N/A'} kg</span>
             </div>
             <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
               <span className="text-xs font-bold text-slate-500">Service</span>
               <span className="text-sm font-black text-slate-900">{booking.preferences?.speed || 'Standard'}</span>
             </div>
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5"><div className="w-2 h-2 bg-slate-500 rounded-full"></div></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Origin</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5 line-clamp-1">{booking.pickupLocation?.address || booking.pickupLocation?.pincode}</p>
                  </div>
                </div>
                <div className="ml-3 w-px h-6 bg-slate-300 border-dashed border-l-2 -my-2"></div>
                <div className="flex items-start gap-3 mt-3">
                  <div className="w-6 h-6 rounded-full bg-[#006D77]/20 flex items-center justify-center shrink-0 mt-0.5"><div className="w-2 h-2 bg-[#006D77] rounded-full"></div></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destination</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5 line-clamp-1">{booking.dropLocation?.address || booking.dropLocation?.pincode}</p>
                  </div>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
