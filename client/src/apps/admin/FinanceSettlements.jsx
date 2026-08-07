import React, { useState, useEffect } from 'react';
import {
  DollarSign, CreditCard, Banknote, Users, AlertTriangle, FileText,
  PieChart, RefreshCcw, Download, Loader2, ArrowRight, X, ArrowUpRight, ArrowDownRight,
  TrendingUp, CheckCircle
} from 'lucide-react';
import api from '../../api';

export default function FinanceSettlements() {
  const [activeTab, setActiveTab] = useState('cod');
  
  // Data
  const [transactions, setTransactions] = useState([]);
  const [codData, setCodData] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'deposit', 'payout', 'refund'
  const [selectedEntity, setSelectedEntity] = useState(null); // Used for rider deposits
  
  // Form State
  const [formData, setFormData] = useState({ amount: '', notes: '', reason: '' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'ledger') {
        const res = await api.get('/finance-settlements/transactions');
        setTransactions(res.data.data || []);
      } else if (activeTab === 'cod') {
        const res = await api.get('/finance-settlements/cod-tracking');
        setCodData(res.data.data || []);
      } else if (activeTab === 'payouts') {
        const res = await api.get('/finance-settlements/settlements');
        setSettlements(res.data.data || []);
      } else if (activeTab === 'reports') {
        const res = await api.get('/finance-settlements/reports');
        setReports(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'deposit') {
        await api.post('/finance-settlements/deposit', {
          riderId: selectedEntity.rider._id,
          expectedAmount: selectedEntity.expectedAmount,
          amount: Number(formData.amount),
          notes: formData.notes
        });
      } else if (modalType === 'payout') {
        // Just mock a payout for now
        await api.post('/finance-settlements/payout', {
          partnerId: '65a7e93f9c3a3b1a2c3b4c5d', // mock
          amount: Number(formData.amount),
          notes: formData.notes,
          type: 'Payout'
        });
      } else if (modalType === 'refund') {
        await api.post('/finance-settlements/refund', {
          bookingId: selectedEntity._id,
          amount: Number(formData.amount),
          reason: formData.reason
        });
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Action failed.');
    }
  };

  const openDepositModal = (codObj) => {
    setSelectedEntity(codObj);
    setFormData({ amount: codObj.expectedAmount, notes: '', reason: '' });
    setModalType('deposit');
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <DollarSign className="text-green-600" /> Payments & Settlements
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage COD collections, partner payouts, and revenue ledgers.</p>
        </div>
        <div className="flex bg-slate-200/60 p-1 rounded-xl flex-wrap gap-1">
          <button onClick={() => setActiveTab('cod')} className={`px-4 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'cod' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Rider COD</button>
          <button onClick={() => setActiveTab('payouts')} className={`px-4 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'payouts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Partner Payouts</button>
          <button onClick={() => setActiveTab('ledger')} className={`px-4 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'ledger' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Ledger</button>
          <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'reports' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Reports</button>
        </div>
      </div>

      {/* --- RIDER COD TRACKING --- */}
      {activeTab === 'cod' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2"><Banknote size={16}/> Total Pending COD</div>
              <div className="text-3xl font-black text-slate-900">
                ₹{codData.reduce((acc, curr) => acc + curr.expectedAmount, 0).toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-2 font-medium">Cash currently out with riders</div>
            </div>
            <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 shadow-sm col-span-2">
              <div className="text-sm font-bold text-amber-800 uppercase tracking-wide mb-2 flex items-center gap-2"><AlertTriangle size={16}/> Reconcile Instructions</div>
              <p className="text-sm text-amber-700 font-medium">When a rider returns to the hub, verify the physical cash matches the Expected Amount below. If they deposit less, the system will flag a <strong>Mismatch Alert</strong> for HR/Finance review.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="px-6 py-4">Rider</th>
                  <th className="px-6 py-4">Pending Bookings</th>
                  <th className="px-6 py-4 text-right">Expected COD</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-12"><Loader2 className="animate-spin mx-auto text-slate-400" /></td></tr>
                ) : codData.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-12 text-slate-500">No pending COD to collect.</td></tr>
                ) : (
                  codData.map(item => (
                    <tr key={item.rider._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <Users size={16} className="text-slate-400"/> {item.rider.name}
                        </div>
                        <div className="text-xs text-slate-500">{item.rider.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {item.bookings.map(b => (
                            <span key={b} className="text-[10px] bg-slate-100 border border-slate-200 px-1.5 rounded">{b}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-lg text-slate-800">
                        ₹{item.expectedAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => openDepositModal(item)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition shadow-sm">
                          Log Cash Deposit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- REPORTS --- */}
      {activeTab === 'reports' && reports && (
        <div className="space-y-6 animate-in fade-in">
          <h2 className="font-bold text-slate-800 uppercase tracking-wide text-sm flex items-center gap-2"><PieChart size={18}/> Daily Closing Report</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 flex justify-between">Online Revenue <CreditCard size={14}/></div>
              <div className="text-2xl font-black text-slate-800">₹{reports.dailyClosing?.onlineRevenue.toLocaleString()}</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 flex justify-between">Cash Revenue <Banknote size={14}/></div>
              <div className="text-2xl font-black text-slate-800">₹{reports.dailyClosing?.cashRevenue.toLocaleString()}</div>
            </div>
            <div className="bg-red-50 p-6 rounded-xl border border-red-200 shadow-sm">
              <div className="text-[10px] font-bold text-red-600 uppercase tracking-wide mb-1 flex justify-between">Refunds Processed <RefreshCcw size={14}/></div>
              <div className="text-2xl font-black text-red-700">₹{reports.dailyClosing?.refunds.toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-br from-[#006D77] to-[#004f56] p-6 rounded-xl border border-[#006D77] shadow-sm text-white">
              <div className="text-[10px] font-bold text-teal-100 uppercase tracking-wide mb-1 flex justify-between">Net Physical Cash in Hub <DollarSign size={14}/></div>
              <div className="text-3xl font-black">₹{reports.dailyClosing?.netCashInHand.toLocaleString()}</div>
              <div className="text-[10px] mt-2 font-medium text-teal-200">Deposits (₹{reports.dailyClosing?.riderDeposits}) - Payouts (₹{reports.dailyClosing?.partnerPayouts})</div>
            </div>
          </div>
          
          <div className="bg-slate-100 border border-slate-200 p-12 rounded-xl text-center text-slate-400">
            <FileText size={48} className="mx-auto mb-4 text-slate-300" />
            <h3 className="font-bold text-slate-600">Export Accounting Ledgers</h3>
            <p className="text-sm">Route-wise and City-wise comprehensive Excel exports will be available here.</p>
            <button className="mt-4 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg shadow-sm flex items-center gap-2 mx-auto hover:bg-slate-50">
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>
      )}

      {/* --- PARTNER PAYOUTS --- */}
      {activeTab === 'payouts' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex justify-end">
            <button onClick={() => { setModalType('payout'); setFormData({amount: '', notes: ''}); setShowModal(true); }} className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-slate-700">
              + Process Manual Payout
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Entity</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Notes</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-12"><Loader2 className="animate-spin mx-auto text-slate-400" /></td></tr>
                ) : settlements.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-12 text-slate-500">No settlement records found.</td></tr>
                ) : (
                  settlements.map(s => (
                    <tr key={s._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">{s.entityId?.name || s.entityId?.companyName || 'Unknown'} <span className="text-[10px] font-normal text-slate-400 border px-1 rounded ml-1">{s.entityType}</span></td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.type === 'Cash Deposit' ? 'bg-green-100 text-green-800' : s.type === 'Payout' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                          {s.type}
                        </span>
                        {s.mismatchAlert && <span className="ml-2 text-[10px] font-bold bg-red-500 text-white px-1.5 rounded uppercase">Mismatch Alert</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs max-w-[200px] truncate" title={s.notes}>{s.notes || '-'}</td>
                      <td className={`px-6 py-4 text-right font-black ${s.type === 'Cash Deposit' ? 'text-green-600' : 'text-slate-800'}`}>
                        {s.type === 'Cash Deposit' ? '+' : '-'}₹{s.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {modalType === 'deposit' ? <><Banknote className="text-green-600"/> Collect Rider COD</> : <><ArrowUpRight className="text-blue-600"/> Process Payout</>}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700"><X size={22} /></button>
            </div>
            <form onSubmit={handleActionSubmit} className="p-6 space-y-5">
              
              {modalType === 'deposit' && (
                <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">System Expected:</span>
                  <span className="text-xl font-black text-slate-900">₹{selectedEntity?.expectedAmount.toLocaleString()}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                  {modalType === 'deposit' ? 'Actual Cash Received (₹)' : 'Payout Amount (₹)'}
                </label>
                <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-4 py-3 border rounded-xl font-black text-lg bg-slate-50 focus:bg-white focus:border-[#006D77] outline-none" placeholder="0.00" />
              </div>

              {modalType === 'deposit' && Number(formData.amount) > 0 && Number(formData.amount) !== selectedEntity?.expectedAmount && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-sm text-red-700 font-bold flex items-center gap-2">
                  <AlertTriangle size={16} /> Mismatch Detected. An alert will be logged.
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Internal Notes</label>
                <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-[#006D77] outline-none resize-none" placeholder={modalType === 'deposit' ? "E.g. Rider short by 50rs, deducting from salary..." : "E.g. Settling outstanding partner invoice..."} />
              </div>

              <button type="submit" className={`w-full py-3 text-white text-sm font-black rounded-xl transition shadow-sm ${modalType === 'deposit' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                Confirm & Record
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
