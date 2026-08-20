import React, { useState } from 'react';
import { PackageOpen, Clock, CheckCircle2, Box, ScanLine } from 'lucide-react';

export default function HamaliDashboard() {
  const [scanId, setScanId] = useState('');
  const [activeTask, setActiveTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // Mock timer

  const handleScan = (e) => {
    e.preventDefault();
    if (!scanId) return;
    
    // Start Loading Task
    setLoading(true);
    setTimeout(() => {
      setActiveTask({
        manifestId: scanId,
        vehicle: 'TS09 EA 1234 (Tata Ace)',
        items: 45,
        startTime: Date.now()
      });
      setScanId('');
      setLoading(false);
      // Mock timer increment
      setInterval(() => setElapsedTime(prev => prev + 1), 60000); // add 1 min every 60s
    }, 500);
  };

  const finishTask = () => {
    alert(`Loading complete! Total time: ${elapsedTime} minutes.`);
    setActiveTask(null);
    setElapsedTime(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white text-slate-900 p-4 shadow-sm border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/images/logo.png" alt="ZyperGo Logo" className="h-8" />
          <div>
            <h1 className="font-bold tracking-wide">ZyperGo <span className="text-[#006D77]">Hub</span></h1>
            <p className="text-[10px] text-slate-500 font-mono">Hamali Operations</p>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-lg mx-auto space-y-6">
        
        {!activeTask ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
            <div className="w-16 h-16 bg-[#006D77]/10 text-[#006D77] rounded-full flex items-center justify-center mx-auto mb-4">
              <ScanLine size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Scan Manifest to Start</h2>
            <p className="text-slate-500 text-sm mb-6">Scan the vehicle or manifest QR to begin timing your loading task.</p>
            
            <form onSubmit={handleScan}>
              <input 
                type="text" 
                value={scanId}
                onChange={e => setScanId(e.target.value.toUpperCase())}
                placeholder="MANIFEST ID" 
                className="w-full text-center text-xl font-bold py-4 px-4 border-2 border-slate-300 rounded-xl focus:border-[#006D77] outline-none mb-4"
              />
              <button 
                type="submit" 
                disabled={!scanId || loading}
                className="w-full bg-[#0F172A] text-white font-bold py-4 rounded-xl shadow hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? 'Scanning...' : 'Start Loading Task'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-[#006D77]/20 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
              <div>
                <span className="bg-[#FFB703] text-slate-900 text-xs font-black px-2 py-1 rounded tracking-widest uppercase mb-2 inline-block">
                  Active Task
                </span>
                <h3 className="font-bold text-slate-900 text-lg">{activeTask.manifestId}</h3>
                <p className="text-slate-500 text-sm flex items-center gap-1"><Box size={14}/> {activeTask.items} Parcels to Load</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase font-bold">Elapsed Time</p>
                <p className="text-3xl font-black text-[#006D77] font-mono">{elapsedTime}m</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200">
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Vehicle</p>
              <p className="font-bold text-slate-800 text-lg">{activeTask.vehicle}</p>
            </div>

            <button 
              onClick={finishTask}
              className="w-full bg-green-600 text-white font-bold py-5 rounded-xl shadow-lg hover:bg-green-700 flex justify-center items-center gap-2 text-xl"
            >
              Finish Loading <CheckCircle2 size={24}/>
            </button>
          </div>
        )}

        <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
           <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><Clock size={16}/> Today's Stats</h4>
           <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-3 rounded shadow-sm">
               <p className="text-xs text-slate-500 uppercase">Vehicles Loaded</p>
               <p className="text-xl font-black text-slate-900">4</p>
             </div>
             <div className="bg-white p-3 rounded shadow-sm">
               <p className="text-xs text-slate-500 uppercase">Avg Time</p>
               <p className="text-xl font-black text-slate-900">12m</p>
             </div>
           </div>
        </div>

      </main>
    </div>
  );
}
