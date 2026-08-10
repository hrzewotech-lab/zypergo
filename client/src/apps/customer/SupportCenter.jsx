import React, { useState, useEffect } from 'react';
import { LifeBuoy, MessageSquare, ChevronDown, Phone, Mail, Send, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import api from '../../api';

export default function SupportCenter() {
  const [activeTab, setActiveTab] = useState('faq'); // 'faq' or 'tickets'
  const [expandedFaq, setExpandedFaq] = useState(null);
  
  // Ticketing state
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // New ticket state
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', category: 'General Query', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === 'tickets') {
      fetchTickets();
    }
  }, [activeTab]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/support/tickets');
      setTickets(res.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.description) return;
    
    setSubmitting(true);
    try {
      await api.post('/support/tickets', newTicket);
      setShowNewTicket(false);
      setNewTicket({ subject: '', category: 'General Query', description: '' });
      fetchTickets(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      q: "How do I track my shipment?",
      a: "You can track your shipment by navigating to the 'Track' section in the bottom menu and entering your Tracking ID (e.g. ZYP...). You can also track from 'My Shipments'."
    },
    {
      q: "What items are prohibited?",
      a: "We do not accept hazardous materials, flammable liquids, illegal substances, live animals, or perishables without special prior approval."
    },
    {
      q: "How is pricing calculated?",
      a: "Pricing depends on the actual weight or volumetric weight (whichever is higher), the distance between pickup and drop, and the chosen delivery speed."
    },
    {
      q: "Can I cancel a booking?",
      a: "Bookings can be cancelled before a Raider is assigned. Once a Raider is on the way for pickup, cancellation charges may apply."
    }
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      <div className="text-center mb-10 pt-4">
        <div className="w-16 h-16 bg-gradient-to-br from-[#003B46] to-[#fb5c00] rounded-3xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-[#fb5c00]/20">
          <LifeBuoy size={32} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">How can we help?</h2>
        <p className="text-slate-500 mt-2">Find answers or reach out to our team.</p>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <a href="tel:18001234567" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 group hover:border-[#fb5c00]/30">
          <div className="w-12 h-12 bg-[#fb5c00]/10 rounded-full flex items-center justify-center text-[#fb5c00] group-hover:scale-110 transition-transform">
            <Phone size={24} />
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-slate-400 uppercase">Call Us</p>
            <p className="font-bold text-slate-800">1800-ZYPERGO</p>
          </div>
        </a>
        
        <a href="https://wa.me/18001234567" target="_blank" rel="noopener noreferrer" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 group hover:border-green-500/30">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
            <MessageSquare size={24} />
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-slate-400 uppercase">WhatsApp</p>
            <p className="font-bold text-slate-800">Chat Now</p>
          </div>
        </a>

        <a href="mailto:support@zypergo.com" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 group hover:border-[#E29578]/30">
          <div className="w-12 h-12 bg-[#E29578]/10 rounded-full flex items-center justify-center text-[#E29578] group-hover:scale-110 transition-transform">
            <Mail size={24} />
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-slate-400 uppercase">Email</p>
            <p className="font-bold text-slate-800">support@zypergo.com</p>
          </div>
        </a>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
        <button 
          onClick={() => setActiveTab('faq')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'faq' ? 'bg-white text-[#fb5c00] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          FAQs
        </button>
        <button 
          onClick={() => setActiveTab('tickets')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'tickets' ? 'bg-white text-[#fb5c00] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          My Tickets
        </button>
      </div>

      {/* FAQs */}
      {activeTab === 'faq' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${expandedFaq === index ? 'border-[#fb5c00] shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <button 
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full p-5 flex justify-between items-center text-left"
              >
                <span className={`font-bold pr-8 ${expandedFaq === index ? 'text-[#fb5c00]' : 'text-slate-800'}`}>{faq.q}</span>
                <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ${expandedFaq === index ? 'rotate-180 text-[#fb5c00]' : ''}`} />
              </button>
              
              <div 
                className={`px-5 transition-all duration-300 ease-in-out ${expandedFaq === index ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tickets */}
      {activeTab === 'tickets' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* New Ticket Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Support Tickets</h3>
            <button 
              onClick={() => setShowNewTicket(!showNewTicket)}
              className="text-sm font-bold bg-[#fb5c00]/10 text-[#fb5c00] px-4 py-2 rounded-lg hover:bg-[#fb5c00]/20 transition-colors"
            >
              {showNewTicket ? 'Cancel' : 'New Ticket'}
            </button>
          </div>

          {/* New Ticket Form */}
          {showNewTicket && (
            <form onSubmit={handleSubmitTicket} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8 space-y-4 animate-in fade-in zoom-in-95">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                <select 
                  value={newTicket.category} 
                  onChange={e => setNewTicket({...newTicket, category: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#fb5c00] outline-none text-sm font-bold text-slate-700"
                >
                  <option>General Query</option>
                  <option>Pickup Issue</option>
                  <option>Delivery Delay</option>
                  <option>Damaged Parcel</option>
                  <option>Lost Parcel</option>
                  <option>Payment Issue</option>
                  <option>Refund Request</option>
                  <option>Wrong Address</option>
                  <option>Return Request</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
                <input 
                  type="text" 
                  value={newTicket.subject} 
                  onChange={e => setNewTicket({...newTicket, subject: e.target.value})}
                  required
                  placeholder="e.g. Booking not picked up"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#fb5c00] outline-none text-sm font-bold text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  value={newTicket.description} 
                  onChange={e => setNewTicket({...newTicket, description: e.target.value})}
                  required
                  rows="4"
                  placeholder="Provide details here..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#fb5c00] outline-none text-sm text-slate-700"
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-[#fb5c00] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#00585f] disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
              >
                {submitting ? 'Submitting...' : 'Submit Ticket'} <Send size={16} />
              </button>
            </form>
          )}

          {/* Ticket List */}
          {loading ? (
            <div className="text-center py-10 text-slate-400">Loading tickets...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500 font-bold">{error}</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
              <MessageSquare size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-bold mb-2">No tickets found</p>
              <p className="text-sm text-slate-400">You haven't raised any support requests yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map(ticket => (
                <div key={ticket._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-[#fb5c00]/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800">{ticket.subject}</h4>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                      ticket.status === 'Open' ? 'bg-amber-100 text-amber-700' :
                      ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{ticket.category}</p>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1"><span className="text-[#fb5c00]">#</span>{ticket.ticketId}</span>
                    <span className="flex items-center gap-1"><Clock size={12}/>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
