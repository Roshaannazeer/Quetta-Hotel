import React from 'react';
import { ViewState } from '../types'; // Fixed: removed .ts extension

interface HomeViewProps {
  setView: (view: ViewState) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ setView }) => {
  return (
    <div className="h-full bg-[#0f172a] flex flex-col items-center justify-center p-8 overflow-hidden relative">
      {/* Dynamic Background Atmosphere */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/10 rounded-full blur-[180px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px]"></div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* Master Layout */}
      <div className="z-10 w-full max-w-6xl flex flex-col items-center gap-12">
        
        {/* Branding Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="px-6 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-full backdrop-blur-md shadow-xl">
               <span className="text-emerald-400 text-[9px] font-black uppercase tracking-[0.4em]">Enterprise System v2.5.0</span>
            </div>
          </div>
          <div className="relative inline-block">
             <h1 className="text-6xl font-black text-white italic tracking-tighter leading-none select-none drop-shadow-2xl">
               QUETTA <span className="text-emerald-500 bg-clip-text text-transparent bg-gradient-to-b from-emerald-400 to-emerald-600">FOOD POINT</span>
             </h1>
          </div>
          <p className="text-slate-500 text-[10px] font-black tracking-[0.5em] uppercase opacity-70 italic">
            Architecture by <span className="text-slate-300">ADIL TECH SOLUTIONS</span>
          </p>
        </div>

        {/* Primary Action Zone */}
        <div className="w-full max-w-lg">
          <button 
            onClick={() => setView('POS')}
            className="group relative w-full h-28 bg-emerald-600 hover:bg-emerald-500 rounded-[32px] transition-all duration-500 overflow-hidden shadow-[0_15px_45px_rgba(5,150,105,0.3)] hover:shadow-[0_20px_60px_rgba(5,150,105,0.5)] active:scale-[0.98]"
          >
            {/* Glossy Reflection */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 skew-y-[-2deg] origin-top-left"></div>
            
            <div className="relative flex flex-col items-center justify-center gap-1">
               <span className="text-3xl font-black text-white italic tracking-tight uppercase group-hover:scale-105 transition-transform">
                 Initialize POS
               </span>
               <div className="flex items-center gap-4 text-emerald-950/40 font-black uppercase text-[8px] tracking-[0.5em] mt-0.5">
                  <div className="h-px w-6 bg-emerald-950/10"></div>
                  BILLING SESSION READY
                  <div className="h-px w-6 bg-emerald-950/10"></div>
               </div>
            </div>

            {/* Particle Effect Simulation */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute top-0 left-[-100%] group-hover:left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-1000 ease-in-out"></div>
            </div>
          </button>
        </div>

        {/* Console Data Modules */}
        <div className="grid grid-cols-3 gap-6 w-full">
            
           {/* Hardware Status Module */}
           <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 p-8 rounded-[40px] shadow-2xl relative group hover:border-emerald-500/30 transition-all">
              <div className="absolute top-4 right-6 text-[8px] font-black text-slate-600 uppercase tracking-widest">Active Sync</div>
              <h3 className="text-emerald-400 font-black text-[10px] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,1)]"></span>
                 Hardware Status
              </h3>
              <ul className="space-y-3 font-bold text-slate-400">
                {['Thermal Printer Engine', 'Barcode Scanner Unit', 'Master Cash Drawer', 'Cloud Sync Protocol'].map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between group/li">
                     <span className="text-xs group-hover/li:text-white transition-colors">{item}</span>
                     <span className="text-[8px] font-black text-emerald-500/80 px-2 py-0.5 bg-emerald-500/5 rounded-md border border-emerald-500/10">CONNECTED</span>
                  </li>
                ))}
              </ul>
           </div>

           {/* Emergency Support Card */}
           <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 rounded-[40px] shadow-2xl flex flex-col justify-between relative overflow-hidden group">
              {/* Abstract Pattern */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="space-y-1">
                 <h3 className="text-emerald-950/60 font-black text-[9px] uppercase tracking-[0.3em]">Home Delivery Terminal</h3>
                 <div className="text-3xl font-black text-white tracking-tighter tabular-nums drop-shadow-md">0336-0007631</div>
              </div>
              
              <div className="pt-6 border-t border-emerald-500/20 mt-4 space-y-1">
                 <div className="text-[9px] font-black text-emerald-950/60 uppercase tracking-[0.3em]">System Technician</div>
                 <div className="text-xl font-black text-white tracking-tight tabular-nums">0348-2394044</div>
              </div>
           </div>

           {/* Network & Infrastructure Module */}
           <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 p-8 rounded-[40px] shadow-2xl relative hover:border-blue-500/30 transition-all">
              <h3 className="text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,1)]"></span>
                 Network Core
              </h3>
              <div className="space-y-5">
                 {[
                   { label: 'Database Node', val: 'SQL-CLUSTER-L1', color: 'text-slate-300' },
                   { label: 'Security Layer', val: 'SSL-AES-256', color: 'text-emerald-400' },
                   { label: 'Cloud Gateway', val: 'ADILTECH.NET.PK', color: 'text-blue-400 underline' }
                 ].map((row, idx) => (
                   <div key={idx} className="flex flex-col gap-0.5">
                      <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{row.label}</span>
                      <span className={`text-xs font-mono font-black tracking-tight ${row.color}`}>{row.val}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Footer Meta Overlay */}
      <div className="absolute bottom-8 left-10 flex items-center gap-6">
         <div className="flex flex-col gap-0.5 text-[8px] font-mono text-slate-600 font-black tracking-[0.3em]">
            <span>CONSOLE_ID: AT-091-SRV</span>
            <span className="opacity-40 uppercase">Session_Token: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
         </div>
         <div className="h-6 w-px bg-slate-800"></div>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-60"></div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Master Link Stable</span>
         </div>
      </div>

      <div className="absolute bottom-8 right-10">
         <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic opacity-60">== SYSTEM ARCHITECTURE CERTIFIED BY ADIL TECH ==</span>
         </div>
      </div>
    </div>
  );
};

export default HomeView;