import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Package, CheckCircle2, Navigation, ArrowLeft, Phone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function TrackShipment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState(id || '');
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLiveMap, setShowLiveMap] = useState(false);

  useEffect(() => {
    if (id) {
      handleSearch(null, id);
    }
  }, [id]);

  const handleSearch = async (e, forceId = null) => {
    if (e) e.preventDefault();
    const searchId = forceId || trackingId;
    if (!searchId) return;

    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`/api/bookings/${searchId}`);
      const data = await res.json();
      if (res.ok && data.data) {
        setShipment(data.data);
        if (!forceId) navigate(`/track/${searchId}`);
      } else {
        setError('Tracking ID not found. Please check and try again.');
        setShipment(null);
      }
    } catch (err) {
      setError('Network error. Could not connect to tracking server.');
    } finally {
      setLoading(false);
    }
  };

  const allStatuses = [
    'Booking Confirmed',
    'In Transit',
    'Out for Delivery',
    'Delivered'
  ];

  const getStatusIndex = (status) => {
    if (status === 'Delivered') return 3;
    if (status === 'Out for Delivery' || status === 'Rider On the Way') return 2;
    if (status === 'In Transit' || status === 'Picked Up' || status === 'Partner Handover') return 1;
    return 0; // Booking Confirmed or Pending
  };

  if (!shipment && !loading) {
    return (
      <div className="flex-1 bg-slate-50 min-h-screen py-12 px-4 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Track Your Package</h1>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 w-full max-w-md">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                placeholder="Tracking number"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 outline-none font-bold text-lg uppercase"
              />
            </div>
            <button type="submit" disabled={loading || !trackingId} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50">
              Track Order
            </button>
          </form>
          {error && <p className="text-red-500 font-bold mt-4 text-center text-sm">{error}</p>}
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="flex-1 bg-slate-50 min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>;
  }

  const currentStep = getStatusIndex(shipment.status);
  const position = [38.889248, -77.0253];

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen relative overflow-hidden">
      
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Tracking Details</h1>
        <div className="w-10"></div> {/* spacer */}
      </div>

      <div className="p-4 pb-32 space-y-4">
        
        {/* Package Card */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-start gap-4 mb-5 border-b border-slate-50 pb-5">
            <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shrink-0">
              <Package size={28} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">{shipment.packageDetails?.category || 'General Parcel'}</h2>
              <p className="text-slate-500 text-sm font-medium">#Tracking ID: <span className="font-bold text-slate-700">{shipment.trackingId}</span></p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm mb-4">
            <div>
              <p className="text-slate-400 font-medium text-xs mb-1">From</p>
              <p className="font-bold text-slate-800 truncate">{shipment.pickupLocation?.address?.split(',')[0] || 'Origin'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium text-xs mb-1">Destination</p>
              <p className="font-bold text-slate-800 truncate">{shipment.dropLocation?.address?.split(',')[0] || 'Destination'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium text-xs mb-1">Customer</p>
              <p className="font-bold text-slate-800 truncate">{shipment.senderDetails?.name || 'Customer'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium text-xs mb-1">Weight</p>
              <p className="font-bold text-slate-800">{shipment.packageDetails?.weight || '0'} KG</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
            <span className="text-slate-500 font-medium text-sm">Status:</span>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full inline-flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
              {shipment.status}
            </span>
          </div>
        </div>

        {/* Rider & OTP Card if assigned */}
        {(shipment.currentRider || shipment.proofOfDelivery?.otp) && (
          <div className="bg-indigo-600 p-5 rounded-3xl shadow-md text-white flex justify-between items-center animate-in fade-in slide-in-from-bottom-2">
            <div>
              <p className="text-indigo-200 text-xs font-medium mb-1">Delivery Partner</p>
              <p className="font-bold text-lg">{shipment.currentRider?.name || 'Assigned Rider'}</p>
              <p className="text-indigo-200 text-sm flex items-center gap-1 mt-1">
                <Phone size={14}/> {shipment.currentRider?.phone || '+91 9876543210'}
              </p>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-2xl text-center backdrop-blur-sm border border-white/10">
              <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-wider mb-0.5">Delivery OTP</p>
              <p className="font-black text-xl tracking-widest">{shipment.proofOfDelivery?.otp || '1234'}</p>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mt-2">
          <div className="relative pl-4 space-y-6">
            <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-slate-100"></div>
            
            {allStatuses.map((statusName, index) => {
              const isCompleted = index <= currentStep;
              const isCurrent = index === currentStep;
              
              return (
                <div key={statusName} className={`relative flex gap-4 ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center shrink-0 z-10 ${isCompleted ? 'border-indigo-600' : 'border-slate-300'}`}>
                    {isCompleted && <div className="w-2 h-2 rounded-full bg-indigo-600"></div>}
                  </div>
                  <div className="-mt-1">
                    <h4 className={`font-bold text-sm ${isCurrent ? 'text-indigo-600 text-base' : 'text-slate-800'}`}>{statusName}</h4>
                    {isCurrent && shipment.trackingHistory?.length > 0 && (
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        {shipment.trackingHistory[shipment.trackingHistory.length - 1].description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pt-10 z-30 max-w-md mx-auto">
        <button 
          onClick={() => setShowLiveMap(true)} 
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-[0_8px_30px_rgb(79,70,229,0.3)] flex justify-center"
        >
          Live Tracking
        </button>
      </div>

      {/* Live Map Overlay */}
      <AnimatePresence>
        {showLiveMap && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-white max-w-md mx-auto flex flex-col"
          >
            <div className="absolute top-4 left-4 z-[400]">
               <button onClick={() => setShowLiveMap(false)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg text-slate-800">
                 <X size={20} />
               </button>
            </div>
            
            <div className="flex-1 bg-slate-200 relative">
              <MapContainer center={position} zoom={13} scrollWheelZoom={false} className="h-full w-full" zoomControl={false}>
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <Marker position={position}>
                  <Popup>Current Location</Popup>
                </Marker>
              </MapContainer>
            </div>

            <div className="bg-white p-6 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative -mt-6 z-[400]">
               <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
               <h3 className="font-bold text-xl text-slate-900 mb-2">Rider is on the way</h3>
               <p className="text-slate-500 font-medium mb-6">Arriving in <span className="text-indigo-600 font-bold">10 mins</span></p>
               
               <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                 <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl">
                   {shipment.currentRider?.name?.charAt(0) || 'R'}
                 </div>
                 <div className="flex-1">
                   <p className="font-bold text-slate-800">{shipment.currentRider?.name || 'Assigned Rider'}</p>
                   <p className="text-sm text-slate-500">Delivery Partner</p>
                 </div>
                 <a href={`tel:${shipment.currentRider?.phone}`} className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shadow-md">
                   <Phone size={18} fill="currentColor" />
                 </a>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}


