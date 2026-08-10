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
      default: return 'bg-[#e0f2f1] text-[#004d40] border-[#b2dfdb]'; // In Transit etc
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">TRACKING ID</span>
            <span className="bg-slate-100 text-[#00767C] px-2 py-0.5 rounded text-xs font-bold font-mono">{booking.trackingId}</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Shipment to {booking.dropLocation?.pincode}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleShare} className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition shadow-md shadow-green-500/20" title="Share on WhatsApp">
            <Share2 size={20} />
          </button>
          <div className={`border rounded-lg p-4 flex items-center gap-6 shadow-sm ${getStatusColor(booking.status)}`}>
            <div>
              <div className="text-[10px] font-bold opacity-75 uppercase tracking-widest mb-1">ETA</div>
              <div className="text-lg font-bold">{booking.eta || 'Calculating...'}</div>
            </div>
            <span className="bg-white/50 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
              <Truck size={14} /> {booking.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Map & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden h-[300px] md:h-[400px] z-10 relative">
            <MapContainer center={position} zoom={13} scrollWheelZoom={false} className="w-full h-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position}>
                <Popup>
                  Seattle Distribution Hub
                </Popup>
              </Marker>
            </MapContainer>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-8">Tracking Timeline</h2>
            
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
              
              {booking.trackingHistory && booking.trackingHistory.length > 0 ? (
                booking.trackingHistory.map((history, idx) => (
                  <div key={idx} className="relative pl-8">
                    <div className={`absolute -left-[17px] ${idx === booking.trackingHistory.length - 1 ? 'bg-[#00767C] text-white shadow-md shadow-[#00767C]/30' : 'bg-slate-100 border-2 border-slate-300 text-slate-400'} w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white`}>
                      {idx === booking.trackingHistory.length - 1 ? <Truck size={16} /> : <CheckCircle2 size={16} />}
                    </div>
                    <div className={idx === booking.trackingHistory.length - 1 ? "bg-slate-50 border border-slate-200 rounded-lg p-4 -mt-2" : ""}>
                      <h4 className={`text-sm font-bold ${idx === booking.trackingHistory.length - 1 ? 'text-slate-900' : 'text-slate-500'}`}>{history.status}</h4>
                      <p className={`text-xs mt-1 ${idx === booking.trackingHistory.length - 1 ? 'text-slate-600 mb-2' : 'text-slate-400'}`}>
                        {new Date(history.timestamp).toLocaleString()} &bull; {history.location || 'System'}
                      </p>
                      {history.description && idx === booking.trackingHistory.length - 1 && (
                        <div className="flex items-center gap-2 text-[10px] text-[#00767C] font-medium bg-[#e0f2f1] p-2 rounded">
                          <Info size={14} /> {history.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500">No tracking history available yet.</div>
              )}

            </div>
          </div>
        </div>

        {/* Right Column: Details & Actions */}
        <div className="space-y-6">
          {/* Parcel Details */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Package className="text-slate-500" /> Parcel Details
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Weight</span>
                <span className="font-medium text-slate-900">{booking.packageDetails?.weight || 'N/A'} kg</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Type</span>
                <span className="font-medium text-slate-900">{booking.packageDetails?.category || 'General'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service Level</span>
                <span className="font-medium text-slate-900">{booking.preferences?.speed || 'Standard'}</span>
              </div>
            </div>
          </div>

          {/* Routing Info */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
              <MapPin className="text-slate-500" /> Routing Info
            </h3>
            
            <div className="relative border-l-2 border-slate-200 ml-2 space-y-6">
              {/* Origin */}
              <div className="relative pl-6">
                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-slate-300 ring-4 ring-white"></div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">ORIGIN</div>
                <h4 className="font-medium text-slate-900 text-sm">Pincode: {booking.pickupLocation?.pincode}</h4>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{booking.pickupLocation?.address}</p>
              </div>
              
              {/* Destination */}
              <div className="relative pl-6">
                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[#00767C] ring-4 ring-white"></div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">DESTINATION</div>
                <h4 className="font-medium text-slate-900 text-sm">Pincode: {booking.dropLocation?.pincode}</h4>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{booking.dropLocation?.address}</p>
                <p className="text-xs text-[#00767C] mt-1 font-medium">Attn: {booking.receiver?.name}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button className="w-full bg-white border border-slate-300 text-slate-700 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
              <FileText size={18} /> Download Documents
            </button>
            <button className="w-full bg-white border border-slate-300 text-slate-700 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
              <HeadphonesIcon size={18} /> Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
