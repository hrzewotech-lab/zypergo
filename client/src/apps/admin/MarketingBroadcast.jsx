import React, { useState } from 'react';
import { Megaphone, Send, Image as ImageIcon, Users, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../api';

export default function MarketingBroadcast() {
  const [campaign, setCampaign] = useState({
    title: '',
    body: '',
    target: 'all', // all, active, inactive
    type: 'offer' // offer, update, alert
  });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!campaign.title || !campaign.body) {
      alert('Please fill out the message title and body.');
      return;
    }

    setSending(true);
    try {
      await api.post('/admin/broadcast', campaign);
      setSuccess(true);
      setCampaign({ title: '', body: '', target: 'all', type: 'offer' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Failed to send broadcast.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Marketing & Broadcasts</h1>
        <p className="text-slate-500 text-sm mt-1">Send push notifications to customer devices (Firebase Cloud Messaging).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Composer Form */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 p-4 font-bold text-slate-700 flex items-center gap-2">
            <Megaphone size={18} className="text-[#006D77]"/> Compose Broadcast
          </div>
          
          <form onSubmit={handleBroadcast} className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Notification Title</label>
              <input 
                type="text" 
                maxLength="50"
                value={campaign.title}
                onChange={e => setCampaign({...campaign, title: e.target.value})}
                placeholder="e.g. 50% Off First Intercity Booking!" 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#006D77] outline-none font-bold text-slate-900"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Message Body</label>
              <textarea 
                rows="3"
                maxLength="150"
                value={campaign.body}
                onChange={e => setCampaign({...campaign, body: e.target.value})}
                placeholder="Book now and get a massive discount on routes from Hyderabad to Bangalore." 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#006D77] outline-none resize-none text-slate-700"
              ></textarea>
              <p className="text-right text-xs text-slate-400 mt-1">{campaign.body.length}/150 characters</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Audience</label>
                <select 
                  value={campaign.target}
                  onChange={e => setCampaign({...campaign, target: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none bg-white"
                >
                  <option value="all">All Registered Customers</option>
                  <option value="active">Active Customers (Last 30 days)</option>
                  <option value="inactive">Inactive Customers</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Message Type</label>
                <select 
                  value={campaign.type}
                  onChange={e => setCampaign({...campaign, type: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none bg-white"
                >
                  <option value="offer">Promotional Offer</option>
                  <option value="update">System Update</option>
                  <option value="alert">Service Alert</option>
                </select>
              </div>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 bg-slate-50 text-center cursor-pointer hover:bg-slate-100 transition">
              <ImageIcon size={24} className="mx-auto text-slate-400 mb-2"/>
              <p className="font-bold text-slate-600 text-sm">Upload Banner Image (Optional)</p>
              <p className="text-xs text-slate-400">Recommended size: 1024x512px</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
               <button 
                type="submit" 
                disabled={sending || !campaign.title || !campaign.body}
                className="bg-[#006D77] text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-[#00585f] disabled:opacity-50 flex items-center gap-2"
               >
                 {sending ? 'Sending...' : 'Blast Broadcast'} <Send size={18}/>
               </button>
            </div>
          </form>
        </div>

        {/* Live Preview Panel */}
        <div className="space-y-6">
          
          <div className="bg-slate-900 rounded-[2.5rem] p-4 shadow-2xl relative max-w-[300px] mx-auto border-[6px] border-slate-800">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl"></div>
             
             <div className="bg-slate-100 h-[500px] rounded-[2rem] overflow-hidden relative">
                {/* Status Bar */}
                <div className="h-12 bg-white flex items-end justify-between px-6 pb-2 text-[10px] font-bold text-slate-800">
                  <span>9:41</span>
                  <div className="flex gap-1 items-center">
                    <span className="w-4 h-3 bg-slate-800 rounded-sm"></span>
                    <span className="w-4 h-3 bg-slate-800 rounded-sm"></span>
                  </div>
                </div>

                {/* Push Notification Preview */}
                {(campaign.title || campaign.body) ? (
                  <div className="absolute top-16 left-3 right-3 bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg animate-in slide-in-from-top-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 bg-[#FFB703] rounded flex items-center justify-center">
                        <span className="text-[10px] font-black text-slate-900">Z</span>
                      </div>
                      <span className="text-xs font-bold text-slate-600">ZyperGo • now</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm leading-tight mb-1">{campaign.title || 'Notification Title'}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{campaign.body || 'Your message preview will appear here.'}</p>
                  </div>
                ) : (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-slate-400">
                    <AlertCircle size={24} className="mx-auto mb-2 opacity-50"/>
                    <p className="text-xs font-bold">Start typing to see preview</p>
                  </div>
                )}
             </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
            <p className="font-bold flex items-center gap-2 mb-1"><Users size={16}/> Target Reach</p>
            <p>This broadcast will reach approximately <strong>1,420</strong> opted-in devices across Android and iOS.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
