import React, { useState } from 'react';
import { IndianRupee, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight, FileText, Download } from 'lucide-react';

export default function FinancePricing() {
  const [activeTab, setActiveTab] = useState('revenue');

  const settlements = [
    { id: 'SET-991', to: 'Alex (Rider)', amount: 1250, type: 'Payout', status: 'Pending', date: 'Today, 10:00 AM' },
    { id: 'SET-992', to: 'BlueDart (Partner)', amount: 8400, type: 'Invoice', status: 'Pending', date: 'Today, 09:15 AM' },
    { id: 'SET-993', to: 'Sarah (Rider)', amount: 450, type: 'COD Deposit', status: 'Completed', date: 'Yesterday' }
  ];

  const rateSlabs = [
    { id: 1, name: 'Standard Intracity', base: 50, perKm: 12, perKg: 5, active: true },
    { id: 2, name: 'Express Delivery (2hr)', base: 120, perKm: 18, perKg: 8, active: true },
    { id: 3, name: 'Intercity Linehaul', base: 400, perKm: 5, perKg: 2, active: false }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Finance & Pricing</h1>
          <p className="text-slate-500 text-sm mt-1">Manage revenue, partner payouts, and dynamic pricing rules.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 shadow-sm">
            <Download size={16} /> Export Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('revenue')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'revenue' ? 'border-[#006D77] text-[#006D77]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Revenue & Settlements
        </button>
        <button 
          onClick={() => setActiveTab('pricing')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'pricing' ? 'border-[#006D77] text-[#006D77]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Dynamic Pricing Engine
        </button>
      </div>

      {activeTab === 'revenue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-[#006D77] to-[#004a51] p-6 rounded-xl text-white shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-white/10 rounded-lg"><IndianRupee size={20} /></div>
                  <span className="flex items-center text-xs font-bold text-green-300"><TrendingUp size={14} className="mr-1"/> +14.5%</span>
                </div>
                <h3 className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Total Revenue (Month)</h3>
                <p className="text-3xl font-black">₹ 8,45,200</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><CreditCard size={20} /></div>
                  <span className="flex items-center text-xs font-bold text-red-500"><TrendingUp size={14} className="mr-1"/> +5.2%</span>
                </div>
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Partner & Rider Payouts</h3>
                <p className="text-3xl font-black text-slate-900">₹ 3,12,050</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="font-bold text-slate-900 text-lg">Pending Settlements</h2>
                <button className="text-sm font-bold text-[#006D77] hover:underline">Process All</button>
              </div>
              <div className="divide-y divide-slate-100">
                {settlements.map((item, idx) => (
                  <div key={idx} className="p-5 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type.includes('Payout') || item.type.includes('Invoice') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {item.type.includes('Payout') || item.type.includes('Invoice') ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{item.to}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{item.type} • {item.date}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <span className="font-black text-lg text-slate-900">₹ {item.amount}</span>
                      {item.status === 'Pending' ? (
                        <button className="bg-[#FFB703] text-slate-900 px-3 py-1.5 rounded text-xs font-bold uppercase">Pay Now</button>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded text-xs font-bold uppercase">Paid</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center h-[500px]">
             <FileText size={48} className="text-slate-300 mb-4" />
             <h3 className="text-lg font-bold text-slate-900 mb-2">Automated Invoicing</h3>
             <p className="text-sm text-slate-500 max-w-[250px]">Generate GST compliant invoices for enterprise customers automatically at the end of each billing cycle.</p>
             <button className="mt-6 border-2 border-[#006D77] text-[#006D77] hover:bg-[#006D77] hover:text-white px-6 py-2 rounded-lg font-bold transition">Configure Invoicing</button>
          </div>
        </div>
      )}

      {activeTab === 'pricing' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
           <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <h2 className="font-bold text-slate-900 text-lg">Active Rate Slabs</h2>
             <button className="bg-[#006D77] hover:bg-[#00585f] text-white px-4 py-2 rounded-lg font-bold text-sm transition shadow-sm">
               + Create New Slab
             </button>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-white text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                   <th className="p-4 font-bold">Rule Name</th>
                   <th className="p-4 font-bold">Base Charge</th>
                   <th className="p-4 font-bold">Per Km Rate</th>
                   <th className="p-4 font-bold">Per Kg Rate</th>
                   <th className="p-4 font-bold">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {rateSlabs.map(slab => (
                   <tr key={slab.id} className="hover:bg-slate-50">
                     <td className="p-4 font-bold text-slate-900">{slab.name}</td>
                     <td className="p-4 text-slate-700 font-medium">₹ {slab.base}</td>
                     <td className="p-4 text-slate-700 font-medium">₹ {slab.perKm} / km</td>
                     <td className="p-4 text-slate-700 font-medium">₹ {slab.perKg} / kg</td>
                     <td className="p-4">
                       <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${slab.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                         {slab.active ? 'Active' : 'Draft'}
                       </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}
    </div>
  );
}
