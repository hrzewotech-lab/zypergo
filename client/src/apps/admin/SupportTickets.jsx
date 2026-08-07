import React, { useState } from 'react';
import { LifeBuoy, AlertCircle, MessageSquare, PhoneCall, CheckCircle, PackageX, UserX, Clock } from 'lucide-react';

export default function SupportTickets() {
  const [activeQueue, setActiveQueue] = useState('open'); // open, resolved, ndr

  const tickets = [
    { id: 'TKT-001', type: 'Customer Complaint', subject: 'Delayed Pickup at South Zone', status: 'Open', priority: 'High', time: '10 mins ago', customer: 'Sarah Jenkins', icon: <Clock size={16} /> },
    { id: 'TKT-002', type: 'NDR Exception', subject: 'Customer Unavailable for Delivery', status: 'Open', priority: 'Medium', time: '2 hrs ago', customer: 'Acme Corp', icon: <UserX size={16} /> },
    { id: 'TKT-003', type: 'Damage Report', subject: 'Fragile Box Damaged in Transit', status: 'In Progress', priority: 'High', time: '5 hrs ago', customer: 'Global Electronics', icon: <PackageX size={16} /> },
  ];

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-100px)]">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Support & Escalations</h1>
          <p className="text-slate-500 text-sm mt-1">Manage NDRs, exceptions, and customer tickets.</p>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button 
            onClick={() => setActiveQueue('open')}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition flex items-center gap-2 ${activeQueue === 'open' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <AlertCircle size={16} /> Open (3)
          </button>
          <button 
            onClick={() => setActiveQueue('resolved')}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition flex items-center gap-2 ${activeQueue === 'resolved' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <CheckCircle size={16} /> Resolved
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Ticket List */}
        <div className="w-1/3 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-900 flex justify-between items-center">
            Queue 
            <span className="text-xs font-bold bg-[#FFB703] text-slate-900 px-2 py-0.5 rounded-full">Newest First</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {tickets.map((tkt, idx) => (
              <div key={idx} className={`p-4 rounded-xl border cursor-pointer transition ${idx === 0 ? 'bg-slate-50 border-[#006D77]' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-slate-500">{tkt.id}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{tkt.time}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">{tkt.subject}</h3>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                    {tkt.icon} <span className="line-clamp-1 max-w-[100px]">{tkt.type}</span>
                  </div>
                  {tkt.priority === 'High' && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Detail */}
        <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-[#006D77] text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded">High Priority</span>
                <span className="text-sm font-bold text-slate-400">TKT-001 • AWB: ZYP-84920</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Delayed Pickup at South Zone</h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">Customer: <span className="text-[#006D77]">Sarah Jenkins</span> (+91 9876543210)</p>
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition">
                <PhoneCall size={18} />
              </button>
              <button className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-200 transition">
                Escalate
              </button>
            </div>
          </div>
          
          {/* Conversation/Timeline */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">SJ</div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm">
                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                  Hi, I scheduled a pickup for 14:00 today but the rider hasn't arrived yet. My office closes at 17:00. Can you please check?
                </p>
                <p className="text-xs text-slate-400 mt-2">Today, 15:45 PM</p>
              </div>
            </div>
            
            <div className="flex gap-4 flex-row-reverse">
              <div className="w-10 h-10 rounded-full bg-[#FFB703] text-slate-900 flex items-center justify-center font-bold shrink-0">Z</div>
              <div className="bg-[#006D77] p-4 rounded-2xl rounded-tr-none shadow-sm text-white max-w-[80%]">
                <p className="text-sm font-medium leading-relaxed text-white/90">
                  Hello Sarah, apologies for the delay. There is a temporary roadblock in the South Zone causing routing delays. I am reassigning your pickup to our Express partner nearby. They will arrive in 20 minutes.
                </p>
                <p className="text-xs text-white/50 mt-2">Today, 15:52 PM • System Admin</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <span className="bg-slate-200 text-slate-500 text-[10px] font-bold uppercase px-3 py-1 rounded-full">System Event: Rider Reassigned</span>
            </div>
          </div>
          
          {/* Resolution Actions */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Quick Actions:</h4>
              <button className="text-xs font-bold px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition">Reassign Rider</button>
              <button className="text-xs font-bold px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition">Process Refund</button>
              <button className="text-xs font-bold px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition text-red-600 border-red-200 bg-red-50 hover:bg-red-100">Cancel Shipment</button>
            </div>
            <div className="relative">
              <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Type your response to the customer..." 
                className="w-full pl-12 pr-24 py-3 border border-slate-200 rounded-xl focus:border-[#006D77] outline-none text-sm font-medium bg-slate-50 focus:bg-white transition-colors"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#006D77] text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-[#00585f] transition">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
