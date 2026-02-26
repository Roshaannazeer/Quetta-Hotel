import React, { useState, useEffect, useMemo } from 'react';
import { ViewState, MenuItem, Order, User, Supplier, Category, Purchase } from './types'; 
import { db } from './storage'; // Import Database

import Sidebar from './components/Sidebar';
import HomeView from './components/HomeView';
import POSView from './components/POSView';
import DashboardView from './components/DashboardView';
import MenuView from './components/MenuView';
import CategoryView from './components/CategoryView';
import SupplierView from './components/SupplierView';
import PurchaseView from './components/PurchaseView';
import LoginView from './components/LoginView';

const STORAGE_KEYS = {
  USERS: 'adil_tech_pos_users',
  SUPPLIERS: 'adil_tech_pos_suppliers',
  PURCHASES: 'adil_tech_pos_purchases',
  AUTH_USER: 'adil_tech_pos_auth'
};

const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Adil Khan', role: 'ADMIN', username: 'adilkhan', password: '123' },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('LOGIN');
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Clock Logic
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- STATE INITIALIZATION ---
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // FIXED: Start with empty array, we will load from DB in useEffect
  const [orders, setOrders] = useState<Order[]>([]);

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    return saved ? JSON.parse(saved) : [];
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    return saved ? JSON.parse(saved).map((p: any) => ({ ...p, date: new Date(p.date) })) : [];
  });

  // --- CRITICAL: LOAD DATA FROM DB ---
  useEffect(() => {
    const loadData = async () => {
      // 1. Load Categories
      const cats = await db.get('categories');
      if (cats && Array.isArray(cats)) setCategories(cats);

      // 2. Load Menu Items
      const items = await db.get('menu_items');
      if (items && Array.isArray(items)) setMenuItems(items);

      // 3. Load Order History (FIXED)
      const history = await db.get('order_history');
      if (history && Array.isArray(history)) {
        // We must convert the string dates back to Date objects
        const fixedHistory = history.map((o: any) => ({
           ...o,
           timestamp: new Date(o.timestamp)
        }));
        setOrders(fixedHistory);
      }
    };

    loadData();
  }, [currentView]); // Re-runs every time you switch screens to keep data fresh

  // --- PERSISTENCE EFFECT (For Users/Suppliers only) ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  }, [users, suppliers, purchases]);

  // --- AUTH CHECK ---
  useEffect(() => {
    const savedAuth = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (savedAuth) {
      setAuthenticatedUser(JSON.parse(savedAuth));
      setCurrentView('HOME');
    }
  }, []);

  // --- LOGIC HANDLERS ---
  const handleLogin = (user: User) => {
    setAuthenticatedUser(user);
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    setCurrentView('HOME');
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    setCurrentView('LOGIN');
  };

  // --- NEW: Handle Order Completion ---
  const handleOrderComplete = async (newOrder: Order) => {
    // 1. Update State (Show immediately)
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);

    // 2. Save to Database (Persist permanently)
    await db.set('order_history', updatedOrders);
  };

  if (currentView === 'LOGIN' || !authenticatedUser) {
    return <LoginView users={users} onLoginSuccess={handleLogin} />;
  }

  const isHomeView = currentView === 'HOME';
  const isPosView = currentView === 'POS';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* SIDEBAR: Hidden on POS */}
      {!isPosView && (
        <Sidebar 
          currentView={currentView} 
          setView={setCurrentView} 
          onLogout={handleLogout}
        />
      )}
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* HEADER */}
        <header className={`${isHomeView ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'} px-8 py-4 flex justify-between items-center border-b z-50 transition-colors duration-500`}>
          <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className={`text-[10px] font-black uppercase tracking-widest ${isHomeView ? 'text-slate-500' : 'text-slate-400'}`}>Active Terminal</span>
                <span className={`text-sm font-black uppercase italic ${isHomeView ? 'text-white' : 'text-slate-900'}`}>QUETTA FOOD POINT <span className="text-emerald-500">POS</span></span>
              </div>
              <div className={`h-6 w-px ${isHomeView ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                 <span className={`text-[10px] font-black uppercase tracking-widest ${isHomeView ? 'text-emerald-400' : 'text-emerald-600'}`}>System Online</span>
              </div>
          </div>

          <div className="flex items-center gap-8 font-mono">
              <div className="flex flex-col items-end">
                 <span className={`text-[10px] font-black uppercase tracking-widest leading-none ${isHomeView ? 'text-slate-500' : 'text-slate-400'}`}>Sync Cycle</span>
                 <span className={`text-lg font-black ${isHomeView ? 'text-white' : 'text-slate-900'}`}>{currentTime.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-colors ${isHomeView ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                 <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-black uppercase text-xs shadow-lg">
                   {authenticatedUser.name.charAt(0)}
                 </div>
                 <div className="flex flex-col">
                   <span className={`text-[9px] font-black uppercase tracking-widest leading-none ${isHomeView ? 'text-slate-500' : 'text-slate-500'}`}>Operator</span>
                   <span className={`text-[11px] font-black uppercase truncate max-w-[120px] ${isHomeView ? 'text-slate-300' : 'text-slate-900'}`}>{authenticatedUser.name}</span>
                 </div>
              </div>
          </div>
        </header>

        {/* MAIN VIEWPORT */}
        <div className="flex-1 overflow-auto">
          {currentView === 'HOME' && <HomeView setView={setCurrentView} />}
          
          {currentView === 'POS' && (
            <POSView 
              items={menuItems}       // Passing items loaded from DB
              categories={categories} // Passing categories loaded from DB
              currentUser={authenticatedUser} 
              onComplete={handleOrderComplete} // FIXED: Uses new handler
              onCancel={() => setCurrentView('HOME')} 
            />
          )}

          {currentView === 'DASHBOARD' && (
            <DashboardView 
              orders={orders} 
              users={users} 
              onAddUser={u => setUsers([...users, u])} 
              onSetOrders={setOrders} 
              menuItems={menuItems} 
              categories={categories} 
              suppliers={suppliers} 
              purchases={purchases}
              onGlobalRestore={() => {}}
            />
          )}

          {currentView === 'MENU' && (
            <MenuView /> // MenuView now handles its own DB loading
          )}

          {currentView === 'CATEGORY' && (
            <CategoryView /> // CategoryView now handles its own DB loading
          )}

          {currentView === 'SUPPLIER' && <SupplierView suppliers={suppliers} onAdd={s => setSuppliers([...suppliers, s])} />}
          
          {currentView === 'PURCHASE' && <PurchaseView purchases={purchases} suppliers={suppliers} menuItems={menuItems} onAdd={p => setPurchases([...purchases, p])} />}
        </div>
      </main>
    </div>
  );
};

export default App;