import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, MessageCircle, Phone, MessageSquare } from 'lucide-react';

export default function SupportCenter() {
  const navigate = useNavigate();

  const faqs = [
    "How to book a parcel?",
    "How to track my order?",
    "What is cash on delivery?",
    "How are delivery charges calculated?"
  ];

  return (
    <div className="flex flex-col bg-slate-50 min-h-full animate-in fade-in zoom-in-95 duration-300 relative pb-24">
      
      {/* Header */}
      <div className="bg-white px-4 py-5 flex items-center gap-4 sticky top-0 z-20 shadow-sm border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="text-slate-700 hover:scale-110 transition-transform active:scale-95">
           <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-black text-slate-900 mx-auto pr-8">Help & Support</h1>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Popular Queries */}
        <div>
          <h2 className="text-sm font-black text-slate-900 mb-4 ml-2">Popular Queries</h2>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {faqs.map((faq, index) => (
              <button 
                key={index} 
                className="w-full p-4 flex items-center justify-between border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors active:scale-[0.99]"
              >
                <span className="text-sm font-bold text-slate-700 text-left pr-4">{faq}</span>
                <ChevronRight size={18} className="text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Contact Options */}
        <div className="space-y-3">
          
          <button className="w-full bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:bg-slate-50 active:scale-[0.98] transition-all">
            <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center shrink-0">
              <MessageCircle size={20} className="text-[#006D77]" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-900 text-sm">Chat with Support</h3>
              <p className="text-xs font-medium text-slate-500">We are online</p>
            </div>
          </button>

          <a href="tel:+918012345678" className="w-full bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:bg-slate-50 active:scale-[0.98] transition-all">
            <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center shrink-0">
              <Phone size={20} className="text-[#006D77]" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-900 text-sm">Call Us</h3>
              <p className="text-xs font-medium text-slate-500">+91 80 1234 5678</p>
            </div>
          </a>

          <a href="https://wa.me/918012345678" target="_blank" rel="noopener noreferrer" className="w-full bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:bg-slate-50 active:scale-[0.98] transition-all">
            <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center shrink-0">
              <MessageSquare size={20} className="text-[#006D77]" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-900 text-sm">WhatsApp Support</h3>
              <p className="text-xs font-medium text-slate-500">Chat on WhatsApp</p>
            </div>
          </a>

        </div>

      </div>
    </div>
  );
}
