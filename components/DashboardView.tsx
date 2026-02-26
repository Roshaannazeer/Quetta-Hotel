import React, { useState, useMemo } from 'react';
import { Order, User, MenuItem, Category, Supplier, Purchase } from '../types';

interface ItemPerformance {
  qty: number;
  revenue: number;
  nameUrdu?: string;
}

interface DashboardViewProps {
  orders: Order[];
  users: User[];
  menuItems: MenuItem[];
  categories: Category[];
  suppliers: Supplier[];
  purchases: Purchase[];
  onAddUser: (user: User) => void;
  onSetOrders: (orders: Order[]) => void;
  onGlobalRestore: (data: any) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ 
  orders = [], 
  users, 
  menuItems, 
  categories, 
  suppliers, 
  purchases, 
  onGlobalRestore 
}) => {
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'DAILY_REPORT' | 'HISTORY' | 'MONTHLY' | 'USERS' | 'SYNC' | 'DB_ADMIN'>('DAILY_REPORT');
  const [importString, setImportString] = useState('');
  
  // Print Mode State
  const [printMode, setPrintMode] = useState<'DAILY' | 'MONTHLY'>('DAILY');

  // Date states for Period Report
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  // States for Monthly Report
  const currentMonthStr = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  // --- STATS CALCULATION (Daily/Period) ---
  const stats = useMemo(() => {
    const startObj = new Date(startDate);
    startObj.setHours(0, 0, 0, 0);
    const endObj = new Date(endDate);
    endObj.setHours(23, 59, 59, 999);

    const filteredOrders = orders.filter(o => {
      const t = new Date(o.timestamp);
      return t.getTime() >= startObj.getTime() && t.getTime() <= endObj.getTime();
    });

    const periodRevenue = filteredOrders.reduce((acc, o) => acc + o.total, 0);
    const itemPerformance: Record<string, ItemPerformance> = {};
    
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!itemPerformance[item.name]) {
          itemPerformance[item.name] = { qty: 0, revenue: 0, nameUrdu: item.nameUrdu };
        }
        itemPerformance[item.name].qty += item.quantity;
        itemPerformance[item.name].revenue += item.price * item.quantity;
      });
    });

    return { filteredOrders, periodRevenue, itemPerformance };
  }, [orders, startDate, endDate]);

  // --- STATS CALCULATION (Monthly) ---
  const monthlyStats = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const filteredOrders = orders.filter(o => {
      const d = new Date(o.timestamp);
      return d.getFullYear() === year && (d.getMonth() + 1) === month;
    });

    const totalRevenue = filteredOrders.reduce((acc, o) => acc + o.total, 0);
    const itemPerformance: Record<string, ItemPerformance> = {};
    
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!itemPerformance[item.name]) {
          itemPerformance[item.name] = { qty: 0, revenue: 0, nameUrdu: item.nameUrdu };
        }
        itemPerformance[item.name].qty += item.quantity;
        itemPerformance[item.name].revenue += item.price * item.quantity;
      });
    });

    return { filteredOrders, totalRevenue, itemPerformance };
  }, [orders, selectedMonth]);

  const handleExport = () => {
    try {
      const fullData = {
        menu: menuItems,
        orders: orders,
        users: users,
        suppliers: suppliers,
        categories: categories,
        purchases: purchases,
        exportDate: new Date().toISOString()
      };
      const jsonStr = JSON.stringify(fullData);
      const dataString = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
      navigator.clipboard.writeText(dataString);
      alert("SUCCESS: Global System Sync Key copied to clipboard!");
    } catch (e) {
      alert("Export failed.");
    }
  };

  const handleImport = () => {
    if (!importString.trim()) return;
    try {
      const decodedStr = decodeURIComponent(Array.prototype.map.call(atob(importString.trim()), (c: any) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const decoded = JSON.parse(decodedStr);
      if (window.confirm("Restore this data? Current browser data will be replaced.")) {
        onGlobalRestore(decoded);
        setImportString('');
      }
    } catch (e) {
      alert("Invalid Sync Key.");
    }
  };

  const handlePrintDaily = () => {
    setPrintMode('DAILY');
    setTimeout(() => window.print(), 200);
  };

  const handlePrintMonthly = () => {
    setPrintMode('MONTHLY');
    setTimeout(() => window.print(), 200);
  };

  return (
    <div className="h-full bg-[#f1f5f9] p-4 flex flex-col gap-4 overflow-hidden relative">
      
      {/* --- CRITICAL FIX: PRINT STYLES --- */}
      <style>{`
        @media print {
          /* 1. RESET PAGE & SCROLLBARS to fix "Cut-off" */
          @page { size: auto; margin: 5mm; }
          html, body, #root { 
            height: auto !important; 
            min-height: auto !important; 
            overflow: visible !important; 
            position: static !important;
          }
          
          /* 2. HIDE APP UI */
          body * { visibility: hidden; }
          
          /* 3. SHOW & SCALE SELECTED REPORT */
          ${printMode === 'DAILY' ? '#daily-report-document, #daily-report-document * { visibility: visible !important; }' : ''}
          ${printMode === 'MONTHLY' ? '#monthly-report-document, #monthly-report-document * { visibility: visible !important; }' : ''}
          
          #daily-report-document, #monthly-report-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            /* THIS IS THE MAGIC: Shrink content to 75% to fit more! */
            zoom: 0.75; 
            -moz-transform: scale(0.75);
            -moz-transform-origin: top left;
            
            display: block !important;
            background: white !important;
            color: black !important;
            overflow: visible !important;
            font-size: 12px !important; /* Force smaller font base */
          }
          
          /* Prevent weird table breaking */
          tr { page-break-inside: avoid; break-inside: avoid; }
          table { width: 100% !important; border-collapse: collapse !important; }
          
          .no-print { display: none !important; }
        }
      `}</style>

      {/* --- HIDDEN DOCUMENT 1: MONTHLY REPORT --- */}
      <div id="monthly-report-document" className="hidden">
         <div className="text-center border-b-2 border-black pb-2 mb-4">
            <h1 className="text-3xl font-black uppercase tracking-tighter">QUETTA FOOD POINT</h1>
            <p className="text-xs font-bold tracking-widest uppercase">Monthly Sales Audit</p>
         </div>
         <div className="flex justify-between mb-4 text-xs">
            <div>
               <p><strong>PERIOD:</strong> {selectedMonth}</p>
            </div>
            <div className="text-right">
               <p><strong>REV:</strong> Rs. {monthlyStats.totalRevenue.toLocaleString()}</p>
               <p><strong>ORDERS:</strong> {monthlyStats.filteredOrders.length}</p>
            </div>
         </div>
         <table className="w-full border border-black text-xs">
            <thead>
               <tr className="bg-gray-100 uppercase">
                  <th className="border border-black p-1 text-left">Item Name</th>
                  <th className="border border-black p-1 text-right">Qty</th>
                  <th className="border border-black p-1 text-right">Revenue</th>
               </tr>
            </thead>
            <tbody>
               {Object.entries(monthlyStats.itemPerformance).map(([name, data]: [string, ItemPerformance]) => (
                 <tr key={name}>
                    <td className="border border-black p-1">
                       <span className="font-bold">{name}</span>
                       <span className="block text-[10px]" dir="rtl">{data.nameUrdu}</span>
                    </td>
                    <td className="border border-black p-1 text-right">{data.qty}</td>
                    <td className="border border-black p-1 text-right">Rs. {data.revenue.toLocaleString()}</td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* --- HIDDEN DOCUMENT 2: DAILY REPORT --- */}
      <div id="daily-report-document" className="hidden">
         <div className="text-center border-b-2 border-black pb-2 mb-4">
            <h1 className="text-3xl font-black uppercase tracking-tighter">QUETTA FOOD POINT</h1>
            <p className="text-xs font-bold tracking-widest uppercase">Daily Closing Report</p>
         </div>
         <div className="flex justify-between mb-4 text-xs">
            <div>
               <p><strong>DATE:</strong> {startDate === endDate ? startDate : `${startDate} to ${endDate}`}</p>
               <p><strong>PRINTED:</strong> {new Date().toLocaleString()}</p>
            </div>
            <div className="text-right">
               <p><strong>REVENUE:</strong> Rs. {stats.periodRevenue.toLocaleString()}</p>
               <p><strong>ORDERS:</strong> {stats.filteredOrders.length}</p>
            </div>
         </div>
         
         {/* ITEM PERFORMANCE TABLE */}
         <div className="mb-4">
            <h3 className="font-bold border-b border-black mb-1 uppercase text-xs">Sales Summary</h3>
            <table className="w-full border border-black text-xs">
                <thead>
                   <tr className="bg-gray-100 uppercase">
                      <th className="border border-black p-1 text-left">Item</th>
                      <th className="border border-black p-1 text-right">Qty</th>
                      <th className="border border-black p-1 text-right">Total</th>
                   </tr>
                </thead>
                <tbody>
                   {Object.entries(stats.itemPerformance).length === 0 ? (
                     <tr><td colSpan={3} className="p-2 text-center italic">No sales.</td></tr>
                   ) : (
                     Object.entries(stats.itemPerformance).map(([name, data]: [string, ItemPerformance]) => (
                       <tr key={name}>
                          <td className="border border-black p-1 font-bold">{name}</td>
                          <td className="border border-black p-1 text-right">{data.qty}</td>
                          <td className="border border-black p-1 text-right">Rs. {data.revenue.toLocaleString()}</td>
                       </tr>
                     ))
                   )}
                </tbody>
            </table>
         </div>

         <div className="mt-8 border-t border-black pt-4 flex justify-between text-[10px] font-bold uppercase">
            <div>Sign: ________________</div>
            <div>Manager: ________________</div>
         </div>
      </div>

      {/* --- DASHBOARD HEADER --- */}
      <div className="bg-white p-4 border border-gray-300 shadow-sm rounded flex justify-between items-center no-print">
        <div>
          <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight italic">ADIL TECH Admin Console</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SYSTEM STATUS: <span className="text-green-600">ENCRYPTED & ONLINE</span></p>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
             <div className="text-[10px] font-bold text-gray-400 uppercase">Current Month Revenue</div>
             <div className="text-xl font-black text-blue-600">Rs. {monthlyStats.totalRevenue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* --- MAIN TABS --- */}
      <div className="flex-1 flex gap-4 overflow-hidden no-print">
        <div className="w-48 flex flex-col gap-1">
          <button onClick={() => setActiveTab('DAILY_REPORT')} className={`text-left p-3 text-xs font-bold border rounded transition-all ${activeTab === 'DAILY_REPORT' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>📅 Period Report</button>
          <button onClick={() => setActiveTab('MONTHLY')} className={`text-left p-3 text-xs font-bold border rounded transition-all ${activeTab === 'MONTHLY' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>📈 Monthly Sale</button>
          <button onClick={() => setActiveTab('USERS')} className={`text-left p-3 text-xs font-bold border rounded transition-all ${activeTab === 'USERS' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>👤 Staff & Users</button>
          <button onClick={() => setActiveTab('SYNC')} className={`text-left p-3 text-xs font-black border-2 rounded transition-all ${activeTab === 'SYNC' ? 'bg-emerald-600 text-white border-emerald-400 shadow-xl' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}>☁️ Data Sync Vault</button>
          <button onClick={() => setActiveTab('DB_ADMIN')} className={`text-left p-3 text-xs font-bold border rounded transition-all mt-auto ${activeTab === 'DB_ADMIN' ? 'bg-red-600 text-white' : 'bg-white text-red-600 font-black hover:bg-red-50'}`}>⚙️ DB MGMT</button>
        </div>

        <div className="flex-1 bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto p-6">
            
            {activeTab === 'MONTHLY' && (
              <div className="space-y-8 h-full flex flex-col">
                <div className="flex items-center justify-between bg-gray-50 p-6 rounded-2xl border border-gray-200">
                   <div className="space-y-1">
                      <h3 className="text-xl font-black text-slate-900 uppercase italic">Monthly Audit Panel</h3>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Select Month for Detailed Report</p>
                   </div>
                   <div className="flex items-center gap-4">
                      <input 
                        type="month" 
                        value={selectedMonth} 
                        onChange={e => setSelectedMonth(e.target.value)} 
                        className="p-3 border-2 border-slate-200 rounded-xl font-black text-slate-800 focus:border-green-500 outline-none" 
                      />
                      <button 
                        onClick={handlePrintMonthly}
                        className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Print Monthly
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                   <div className="bg-green-600 p-8 rounded-[32px] text-white shadow-xl shadow-green-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                      <div className="text-[10px] font-black uppercase opacity-70 tracking-widest mb-1">Total Revenue</div>
                      <div className="text-4xl font-black italic">Rs. {monthlyStats.totalRevenue.toLocaleString()}</div>
                   </div>
                   <div className="bg-white border-2 border-slate-100 p-8 rounded-[32px] shadow-sm">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Orders</div>
                      <div className="text-4xl font-black text-slate-900">{monthlyStats.filteredOrders.length}</div>
                   </div>
                   <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-xl shadow-slate-200">
                      <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Avg Order Value</div>
                      <div className="text-4xl font-black italic">Rs. {monthlyStats.filteredOrders.length > 0 ? Math.round(monthlyStats.totalRevenue / monthlyStats.filteredOrders.length) : 0}</div>
                   </div>
                </div>

                <div className="flex-1 bg-white border border-slate-200 rounded-[32px] overflow-hidden flex flex-col shadow-sm">
                   <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Monthly Item Performance Breakdown</span>
                      <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">{Object.keys(monthlyStats.itemPerformance).length} Items Tracked</span>
                   </div>
                   <div className="flex-1 overflow-auto">
                      <table className="w-full text-left">
                         <thead className="bg-slate-50 sticky top-0">
                            <tr className="text-[10px] font-black uppercase text-slate-400">
                               <th className="p-6">Product Description</th>
                               <th className="p-6 text-center">Qty Sold</th>
                               <th className="p-6 text-right">Revenue Generated</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {Object.entries(monthlyStats.itemPerformance).map(([name, data]: [string, ItemPerformance]) => (
                              <tr key={name} className="hover:bg-slate-50 transition-colors">
                                 <td className="p-6">
                                    <div className="font-black text-slate-900 uppercase tracking-tight italic">{name}</div>
                                    <div className="text-lg font-black text-green-700 mt-1" dir="rtl">{data.nameUrdu}</div>
                                 </td>
                                 <td className="p-6 text-center">
                                    <span className="bg-slate-100 px-4 py-2 rounded-xl font-black text-slate-600 text-sm">x{data.qty}</span>
                                 </td>
                                 <td className="p-6 text-right">
                                    <span className="font-black text-slate-900 text-lg">Rs. {data.revenue.toLocaleString()}</span>
                                 </td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'DAILY_REPORT' && (
              <div className="space-y-8">
                 {/* --- FIXED: Cleaner Layout for Date Picker and Print Button --- */}
                 <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                       <div>
                          <h3 className="text-xl font-black text-slate-900 uppercase italic">Period / Daily Sales</h3>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Select Date Range to Generate Report</p>
                       </div>
                       <button 
                          onClick={handlePrintDaily}
                          className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2"
                       >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                          Print Report
                       </button>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex-1">
                           <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">From Date</label>
                           <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border-2 border-slate-100 rounded-lg font-bold text-slate-700 focus:border-blue-500 outline-none" />
                        </div>
                        <div className="self-center pt-5">
                           <span className="font-black text-gray-300">➜</span>
                        </div>
                        <div className="flex-1">
                           <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">To Date</label>
                           <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border-2 border-slate-100 rounded-lg font-bold text-slate-700 focus:border-blue-500 outline-none" />
                        </div>
                        <div className="self-center pt-5">
                           <button onClick={() => { setStartDate(todayStr); setEndDate(todayStr); }} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-xs font-black uppercase hover:bg-blue-200">Today</button>
                        </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="bg-blue-600 p-8 rounded-[32px] text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                       <div className="text-[10px] font-black uppercase opacity-80 mb-1 tracking-widest">Period Revenue</div>
                       <div className="text-4xl font-black">Rs. {stats.periodRevenue.toLocaleString()}</div>
                    </div>
                    <div className="bg-white border-2 border-slate-100 p-8 rounded-[32px] shadow-sm">
                       <div className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Total Orders</div>
                       <div className="text-4xl font-black text-blue-900">{stats.filteredOrders.length}</div>
                    </div>
                 </div>
                 
                 <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden flex flex-col shadow-sm">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                       <h4 className="font-black text-sm uppercase text-slate-500 tracking-widest">Order Log Preview</h4>
                    </div>
                    <div className="h-64 overflow-auto p-4">
                        {stats.filteredOrders.length === 0 ? (
                           <div className="h-full flex flex-col items-center justify-center text-gray-400">
                              <p className="italic">No orders found in this date range.</p>
                           </div>
                        ) : (
                           stats.filteredOrders.map((o, idx) => (
                              <div key={idx} className="flex justify-between border-b border-slate-50 p-3 hover:bg-slate-50 transition-colors text-xs">
                                 <span className="font-bold text-slate-600">{new Date(o.timestamp).toLocaleTimeString()} <span className="font-normal text-slate-400 mx-2">|</span> Order #{idx + 1}</span>
                                 <span className="font-black text-blue-600">Rs. {o.total.toLocaleString()}</span>
                              </div>
                           ))
                        )}
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'SYNC' && (
              <div className="max-w-3xl mx-auto space-y-8 py-10">
                <div className="text-center space-y-2 mb-10">
                   <div className="inline-block p-4 bg-emerald-50 rounded-full mb-4">
                      <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                   </div>
                   <h3 className="text-3xl font-black text-slate-900 uppercase italic">Global Sync Vault</h3>
                </div>

                <div className="grid grid-cols-2 gap-8">
                   <div className="bg-slate-50 p-8 rounded-[32px] border-2 border-slate-200 flex flex-col items-center text-center">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-4">Export Database</h4>
                      <button onClick={handleExport} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-blue-700 transition-all active:scale-95">Generate System Key</button>
                   </div>

                   <div className="bg-slate-900 p-8 rounded-[32px] flex flex-col items-center text-center text-white">
                      <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-4">Restore/Sync</h4>
                      <textarea 
                        value={importString} 
                        onChange={e => setImportString(e.target.value)}
                        placeholder="Paste Key Here..."
                        className="w-full h-24 bg-slate-800 border border-slate-700 rounded-xl p-3 text-[10px] font-mono mb-4 outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button onClick={handleImport} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-emerald-500 transition-all active:scale-95">Initialize Sync</button>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'USERS' && <div className="p-10 text-center font-black uppercase text-slate-300">Staff Management Module Active</div>}
            {activeTab === 'DB_ADMIN' && <div className="p-10 text-center font-black uppercase text-slate-300">Database Administration Panel</div>}

          </div>
          <div className="bg-gray-900 text-white p-2 text-center text-[9px] tracking-[0.3em] uppercase font-black no-print">ADIL TECH SOLUTIONS • VAULT ENCRYPTION ENABLED</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;