import React from 'react';
import { Truck, CheckCircle2, FileText, HeadphonesIcon, Info, Package, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

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
  const position = [47.6062, -122.3321]; // Seattle Hub

  return (
    <div className="max-w-7xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">TRACKING ID</span>
            <span className="bg-slate-100 text-[#00767C] px-2 py-0.5 rounded text-xs font-bold font-mono">TRK-Zyp-99824X</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Shipment to Seattle Hub</h1>
        </div>
        <div className="bg-[#e0f2f1] border border-[#b2dfdb] rounded-lg p-4 flex items-center gap-6 shadow-sm">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">ESTIMATED ARRIVAL</div>
            <div className="text-xl font-bold text-[#00767C]">Oct 24, 14:00</div>
          </div>
          <span className="bg-[#b2dfdb] text-[#004d40] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
            <Truck size={14} /> In Transit
          </span>
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
              
              {/* Step 1: Booking Confirmed */}
              <div className="relative pl-8">
                <div className="absolute -left-[17px] bg-[#00767C] w-8 h-8 rounded-full flex items-center justify-center text-white ring-4 ring-white">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Booking Confirmed</h4>
                  <p className="text-xs text-slate-500 mt-1">Oct 20, 08:30 AM &bull; System Origin</p>
                </div>
              </div>

              {/* Step 2: Picked Up */}
              <div className="relative pl-8">
                <div className="absolute -left-[17px] bg-[#00767C] w-8 h-8 rounded-full flex items-center justify-center text-white ring-4 ring-white">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Picked Up</h4>
                  <p className="text-xs text-slate-500 mt-1">Oct 21, 14:15 PM &bull; Warehouse Alpha, NY</p>
                </div>
              </div>

              {/* Step 3: In Transit (Active) */}
              <div className="relative pl-8">
                <div className="absolute -left-[17px] bg-[#00767C] w-8 h-8 rounded-full flex items-center justify-center text-white ring-4 ring-white shadow-md shadow-[#00767C]/30">
                  <Truck size={16} />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 -mt-2">
                  <h4 className="text-sm font-bold text-slate-900">In Transit</h4>
                  <p className="text-xs text-slate-600 mt-1 mb-2">Oct 23, 09:45 AM &bull; Last scanned at Checkpoint Delta, IL</p>
                  <div className="flex items-center gap-2 text-[10px] text-[#00767C] font-medium bg-[#e0f2f1] p-2 rounded">
                    <Info size={14} /> On schedule. Weather conditions optimal.
                  </div>
                </div>
              </div>

              {/* Step 4: Out for Delivery */}
              <div className="relative pl-8">
                <div className="absolute -left-[17px] bg-slate-100 border-2 border-slate-300 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 ring-4 ring-white">
                  <Truck size={14} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-400">Out for Delivery</h4>
                  <p className="text-xs text-slate-400 mt-1">Expected: Oct 24, Morning</p>
                </div>
              </div>

              {/* Step 5: Delivered */}
              <div className="relative pl-8">
                <div className="absolute -left-[17px] bg-slate-100 border-2 border-slate-300 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 ring-4 ring-white">
                  <MapPin size={14} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-400">Delivered</h4>
                  <p className="text-xs text-slate-400 mt-1">Pending Sign-off</p>
                </div>
              </div>

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
                <span className="font-medium text-slate-900">1,250 kg</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Volume</span>
                <span className="font-medium text-slate-900">3.5 cbm</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Type</span>
                <span className="font-medium text-slate-900">Industrial Electronics</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service Level</span>
                <span className="font-medium text-slate-900">Express Freight</span>
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
                <h4 className="font-medium text-slate-900 text-sm">Global Tech Ind.</h4>
                <p className="text-xs text-slate-500 mt-0.5">123 Industrial Pkwy, New York, NY</p>
              </div>
              
              {/* Destination */}
              <div className="relative pl-6">
                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[#00767C] ring-4 ring-white"></div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">DESTINATION</div>
                <h4 className="font-medium text-slate-900 text-sm">Seattle Distribution Hub</h4>
                <p className="text-xs text-slate-500 mt-0.5">889 Pacific Hwy, Seattle, WA</p>
                <p className="text-xs text-[#00767C] mt-1 font-medium">Attn: Receiving Dept</p>
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
