import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Package, Phone, MessageCircle, Truck, Info, CreditCard } from 'lucide-react';
import api from '../../api';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.get(`/bookings/${id}`)
        .then(res => {
          setBooking(res.data.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold">Loading order details...</div>;
  if (!booking) return <div className="p-12 text-center text-slate-500 font-bold">No order information found.</div>;

  const isPending = !booking.status || booking.status === 'Pending' || booking.status === 'Booking Confirmed';
  const hasRaider = !['Delivered', 'Cancelled', 'Failed'].includes(booking.status) && !isPending;
  const otp = booking.trackingId.replace(/\D/g, '').slice(-4) || '5921';

  return (
    <div className="flex flex-col bg-slate-50 min-h-full animate-in fade-in zoom-in-95 duration-300 relative pb-24">
      
      {/* Header */}
      <div className="bg-white px-4 py-5 flex items-center gap-4 sticky top-0 z-20 shadow-sm border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="text-slate-700 hover:scale-110 transition-transform active:scale-95">
           <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-black text-slate-900 mx-auto pr-8">Order Details</h1>
      </div>

      <div className="p-4 space-y-4 mt-2">
        
        {/* Track Live Button */}
        <div className="flex justify-between items-center mb-2 px-1">
           <div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Order ID</p>
             <h2 className="text-lg font-black text-slate-900">{booking.trackingId}</h2>
           </div>
           <button 
             onClick={() => navigate(`/track/${booking.trackingId}`)} 
             className="bg-[#FFB703] text-slate-900 px-4 py-2 rounded-xl text-xs font-black shadow-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
           >
             <MapPin size={14} /> Track Live
           </button>
        </div>

        {/* Waiting for Raider */}
        {isPending && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden animate-in slide-in-from-bottom-4 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-[#FFB703] mb-3 border-[4px] border-white shadow-sm ring-1 ring-amber-100">
               <div className="relative">
                 <Truck size={28} className="animate-pulse" />
                 <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
               </div>
            </div>
            <h3 className="font-black text-slate-900 text-base mb-1">Looking for a Delivery Partner</h3>
            <p className="text-xs font-bold text-slate-500">Please wait while we assign the nearest available raider to your pickup location.</p>
          </div>
        )}

        {/* Raider Details (Rapido Style) */}
        {hasRaider && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 relative overflow-hidden animate-in slide-in-from-bottom-4">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006D77] to-[#FFB703]"></div>
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <div className="w-14 h-14 bg-slate-100 rounded-full border-2 border-white shadow-sm overflow-hidden shrink-0 mt-1">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.trackingId}`} alt="Raider" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 leading-tight text-base">Rajesh Kumar</h3>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 mt-0.5">
                    <span className="text-[#FFB703]">★</span> 4.8 (120+ deliveries)
                  </div>
                  <p className="text-[10px] font-black text-slate-600 mt-1.5 bg-slate-100 px-2.5 py-1 rounded-md inline-block uppercase tracking-wider">
                    KA 01 AB 1234 • Bajaj Pulsar
                  </p>
                </div>
              </div>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center shrink-0 min-w-[70px] shadow-inner shadow-slate-100/50">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Pickup OTP</p>
                <p className="text-xl font-black text-[#006D77] tracking-widest">{otp}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-slate-50">
               <a href="tel:9876543210" className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors active:scale-95 shadow-sm">
                 <Phone size={16} /> Call Raider
               </a>
               <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#006D77] text-white py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-[#005a62] transition-colors shadow-md shadow-[#006D77]/20 active:scale-95">
                 <MessageCircle size={16} /> Message
               </a>
            </div>
          </div>
        )}

        {/* Location Summary */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
           <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
             <MapPin size={18} className="text-[#006D77]" /> Route Details
           </h3>
           <div className="relative pl-8 pb-6 border-b border-slate-50">
             <div className="absolute left-0 top-1 w-6 h-6 flex items-center justify-center">
               <MapPin size={16} className="text-[#006D77]" />
             </div>
             <div className="absolute left-3 top-7 bottom-3 w-px bg-slate-200 border-dashed border-l-2"></div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Origin</p>
             <p className="text-sm font-bold text-slate-800 line-clamp-2">{booking.pickupLocation?.address || booking.pickupLocation?.pincode}</p>
           </div>
           <div className="relative pl-8 pt-4">
             <div className="absolute left-0 top-5 w-6 h-6 flex items-center justify-center">
                <div className="w-2 h-2 bg-[#FFB703] rounded-full"></div>
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Destination</p>
             <p className="text-sm font-bold text-slate-800 line-clamp-2">{booking.dropLocation?.address || booking.dropLocation?.pincode}</p>
           </div>
        </div>

        {/* Package & Payment Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
             <div className="w-8 h-8 bg-teal-50 rounded-xl flex items-center justify-center mb-3">
               <Package size={16} className="text-[#006D77]" />
             </div>
             <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Package</p>
               <p className="text-sm font-black text-slate-900">{booking.packageDetails?.category || 'General'}</p>
               <p className="text-xs font-bold text-slate-500 mt-0.5">{booking.packageDetails?.weight || 0} kg</p>
             </div>
          </div>
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
             <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
               <CreditCard size={16} className="text-[#FFB703]" />
             </div>
             <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Payment</p>
               <p className="text-sm font-black text-slate-900">₹{booking.pricing?.total || 0}</p>
               <p className="text-xs font-bold text-emerald-600 mt-0.5">{booking.payment?.mode === 'Cash' ? 'Cash on Delivery' : 'Paid Online'}</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
