import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, BellRing, Users, Star } from 'lucide-react';

export default function CustomerNotifications() {
  const navigate = useNavigate();

  const notifications = [
    { id: 1, title: 'Your order #ZP123456 is out for delivery.', time: '13 Jun, 09:30 AM', icon: BellRing },
    { id: 2, title: 'Your order #ZP123456 is in transit.', time: '12 Jun, 03:45 PM', icon: Bell },
    { id: 3, title: 'Pickup scheduled for order #ZP123457', time: '12 Jun, 11:00 AM', icon: Users },
    { id: 4, title: 'Offer: 20% OFF on next 3 orders!', time: '10 Jun, 09:15 AM', icon: Star },
  ];

  return (
    <div className="flex flex-col bg-white min-h-full animate-in fade-in zoom-in-95 duration-300 relative pb-24">
      
      {/* Header */}
      <div className="bg-white px-4 py-5 flex items-center gap-4 sticky top-0 z-20 shadow-sm border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="text-slate-700 hover:scale-110 transition-transform active:scale-95">
           <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-black text-slate-900 mx-auto pr-8">Notifications</h1>
      </div>

      <div className="p-4 space-y-4">
        {notifications.map((notif) => {
          const Icon = notif.icon;
          return (
            <div key={notif.id} className="flex gap-4 p-2 border-b border-slate-50 last:border-0">
              <div className="w-12 h-12 bg-white border-2 border-teal-100 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                <Icon size={20} className="text-[#006D77]" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm font-bold text-slate-800 leading-tight mb-1 pr-4">{notif.title}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{notif.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mark All As Read Button (Sticky Bottom) */}
      <div className="fixed bottom-[80px] left-0 right-0 p-4 max-w-md mx-auto z-10 pointer-events-none bg-gradient-to-t from-white via-white to-transparent pt-10">
        <button className="pointer-events-auto w-full bg-white border-2 border-[#006D77] text-[#006D77] py-4 rounded-full font-black text-sm hover:bg-teal-50 active:scale-95 transition-all shadow-sm">
          Mark all as read
        </button>
      </div>

    </div>
  );
}
