import React, { useState } from 'react';
import { Purchase, Supplier, MenuItem } from '../types.ts';

interface PurchaseViewProps {
  purchases: Purchase[];
  suppliers: Supplier[];
  menuItems: MenuItem[];
  onAdd: (p: Purchase) => void;
}

const PurchaseView: React.FC<PurchaseViewProps> = ({ purchases, suppliers, menuItems, onAdd }) => {
  const [form, setForm] = useState({ supplierId: '', itemName: '', qty: 0, price: 0 });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemName || !form.supplierId) return;
    onAdd({
      id: 'PUR-' + Date.now(),
      supplierId: form.supplierId,
      itemName: form.itemName,
      quantity: form.quantity || 0,
      purchasePrice: form.price || 0,
      date: new Date()
    });
    setForm({ supplierId: '', itemName: '', qty: 0, price: 0 });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-full overflow-hidden flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase italic leading-none">Stock Purchase Entry</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Inventory Acquisition Terminal</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
        {/* Entry Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-slate-900 p-6 rounded-[32px] border-4 border-slate-800 shadow-2xl">
            <h3 className="text-xs font-black text-emerald-400 mb-6 uppercase tracking-[0.2em] border-b border-slate-800 pb-3">New Arrival</h3>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Supplier / Vendor</label>
                <select 
                  value={form.supplierId}
                  onChange={e => setForm({...form, supplierId: e.target.value})}
                  className="w-full bg-white border-2 border-slate-300 p-3.5 text-sm font-black text-slate-900 rounded-2xl focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all shadow-inner appearance-none"
                  required
                >
                  <option value="" className="text-slate-400 italic">Select Supplier</option>
                  {suppliers.map(s => <option key={s.id} value={s.id} className="text-slate-900">{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Menu Item</label>
                <select 
                  value={form.itemName}
                  onChange={e => setForm({...form, itemName: e.target.value})}
                  className="w-full bg-white border-2 border-slate-300 p-3.5 text-sm font-black text-slate-900 rounded-2xl focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all shadow-inner appearance-none"
                  required
                >
                  <option value="" className="text-slate-400 italic">Select Item</option>
                  {menuItems.map(m => <option key={m.id} value={m.name} className="text-slate-900">{m.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Quantity</label>
                  <input 
                    type="number" 
                    placeholder="Qty" 
                    value={form.qty || ''} 
                    onChange={e => setForm({...form, qty: Number(e.target.value)})} 
                    className="w-full bg-white border-2 border-slate-300 p-3.5 text-sm font-black text-slate-900 rounded-2xl focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all shadow-inner"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Cost Rate</label>
                  <input 
                    type="number" 
                    placeholder="Price" 
                    value={form.price || ''} 
                    onChange={e => setForm({...form, price: Number(e.target.value)})} 
                    className="w-full bg-white border-2 border-slate-300 p-3.5 text-sm font-black text-slate-900 rounded-2xl focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all shadow-inner"
                    required
                  />
                </div>
              </div>

              <button className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl border-b-8 border-emerald-800 hover:bg-emerald-500 active:translate-y-1 active:border-b-0 transition-all uppercase text-xs tracking-[0.2em] shadow-xl mt-4">
                Post Purchase Entry
              </button>
            </form>
          </div>
          
          <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-lg">
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Terminal Tip</div>
             <p className="text-[11px] text-slate-600 leading-relaxed">
               Ensure the <span className="font-black text-slate-900">Total Settlement</span> matches your physical invoice before posting the entry.
             </p>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
          <div className="bg-slate-900 p-5 flex justify-between items-center border-b border-slate-800">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Purchase Ledger History</span>
            <div className="flex gap-4">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">{purchases.length} Transactions</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                  <th className="p-6">Transaction ID</th>
                  <th className="p-6">Vendor Name</th>
                  <th className="p-6">Item Description</th>
                  <th className="p-6 text-center">Qty</th>
                  <th className="p-6 text-right">Purchase Rate</th>
                  <th className="p-6 text-right">Settlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {purchases.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-6 font-mono font-bold text-blue-600 text-xs">#{p.id.slice(-8)}</td>
                    <td className="p-6">
                      <div className="font-black text-slate-900 uppercase text-xs tracking-tight">
                        {suppliers.find(s => s.id === p.supplierId)?.name || 'Unknown Vendor'}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="font-black text-slate-900 uppercase text-xs italic tracking-tight">{p.itemName}</div>
                    </td>
                    <td className="p-6 text-center">
                      <span className="bg-slate-100 px-3 py-1.5 rounded-lg font-black text-slate-600 text-xs">x{p.quantity}</span>
                    </td>
                    <td className="p-6 text-right font-bold text-slate-500">Rs. {p.purchasePrice}</td>
                    <td className="p-6 text-right">
                      <span className="font-black text-slate-900 text-base">Rs. {p.quantity * p.purchasePrice}</span>
                    </td>
                  </tr>
                ))}
                {purchases.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-20 text-center">
                      <div className="opacity-20 flex flex-col items-center gap-4">
                        <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">Ledger Empty</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Inventory Records Certified</span>
            <div className="text-right">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">Total Inventory Value:</span>
              <span className="text-2xl font-black text-slate-900 italic">
                Rs. {purchases.reduce((acc, p) => acc + (p.quantity * p.purchasePrice), 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseView;