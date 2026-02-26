import React from 'react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  onLogout: () => void;
  // Removed POS specific props (categories, etc.) as they are now handled inside POSView
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setView, 
  onLogout
}) => {

  // --- ADMIN NAVIGATION MENU ---
  const menuItems = [
    { label: 'Home', view: 'HOME' as ViewState, icon: '🏠' },
    { label: 'Start Selling', view: 'POS' as ViewState, icon: '⚡' }, // Button to enter POS
    { label: 'Menu Items', view: 'MENU' as ViewState, icon: '🍔' },
    { label: 'Categories', view: 'CATEGORY' as ViewState, icon: '📁' },
    { label: 'Suppliers', view: 'SUPPLIER' as ViewState, icon: '🚚' },
    { label: 'Purchase', view: 'PURCHASE' as ViewState, icon: '📦' },
    { label: 'Dashboard', view: 'DASHBOARD' as ViewState, icon: '📊' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shadow-2xl z-50">
      
      {/* Header */}
      <div className="p-8 border-b border-slate-800 flex flex-col items-center">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center font-black text-slate-900 text-2xl italic mb-4 shadow-lg shadow-emerald-500/20">
          AT
        </div>
        <div className="text-center">
          <h2 className="text-white font-black text-xs uppercase tracking-[0.3em]">ADMIN PANEL</h2>
          <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1 italic">Enterprise v2.5</p>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-4 mb-4">Main Navigation</div>
        
        {menuItems.map((item, idx) => {
          const isActive = currentView === item.view;
          
          return (
            <button
              key={idx}
              onClick={() => setView(item.view)}
              className={`w-full group flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 relative overflow-hidden
                ${isActive 
                  ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/40' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <span className={`text-xl transition-transform group-hover:scale-110 ${isActive ? 'grayscale-0' : 'grayscale opacity-50'}`}>
                {item.icon}
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
              
              {/* Active Indicator Strip */}
              {isActive && (
                <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white/20"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-6 space-y-3 bg-slate-950/50 mt-auto border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 bg-rose-600/10 text-rose-500 border border-rose-500/20 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-lg active:scale-95"
        >
          <span>🔐</span> Logout Session
        </button>
        <div className="text-center opacity-30 text-[8px] font-black text-slate-500 uppercase tracking-widest">
          Secured by Adil Tech
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;