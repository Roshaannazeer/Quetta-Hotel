import React, { useState, useEffect, useMemo } from 'react';
import { MenuItem, OrderItem, Order, User, Category } from '../types';
import { db } from '../storage';
import { invoke } from '@tauri-apps/api/core'; // Using Tauri API to talk to Rust

interface POSViewProps {
  currentUser: User;
  onCancel: () => void;
}

const POSView: React.FC<POSViewProps> = ({ onCancel, currentUser }) => {
  
  // --- STATE ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [dbMenuItems, setDbMenuItems] = useState<MenuItem[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]); 
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [discountStr, setDiscountStr] = useState('0');
  const [isNewDiscountEntry, setIsNewDiscountEntry] = useState(true);
  const [customerName, setCustomerName] = useState('Walk-in');
  
  const [showHistory, setShowHistory] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Quick UI lock

  // --- LOAD DATA ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const cats = await db.get("categories") as Category[];
        if (cats && Array.isArray(cats)) setCategories(cats);
        const items = await db.get("menu_items") as MenuItem[];
        if (items && Array.isArray(items)) setDbMenuItems(items);
        const history = await db.get("order_history") as Order[];
        if (history && Array.isArray(history)) setOrderHistory(history);
      } catch (error) {
        console.error("Error loading POS data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const displayedItems = useMemo(() => {
    if (activeCategory === 'All') return dbMenuItems;
    return dbMenuItems.filter(item => item.category === activeCategory);
  }, [dbMenuItems, activeCategory]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal - discount;

  // --- CART HANDLERS ---
  const addItem = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (itemId: string) => setCart(prev => prev.filter(i => i.id !== itemId));

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setDiscountStr('0');
    setIsNewDiscountEntry(true);
    setCustomerName('Walk-in');
  };

  const handleNumpad = (val: string | number) => {
    let current = discountStr;
    if (val === 'C') {
      current = '0'; setIsNewDiscountEntry(true);
    } else if (val === '.') {
      if (!current.includes('.')) { current += '.'; setIsNewDiscountEntry(false); }
    } else {
      if (isNewDiscountEntry || current === '0') { current = val.toString(); setIsNewDiscountEntry(false); } 
      else { current += val.toString(); }
    }
    const numericValue = parseFloat(current) || 0;
    if (numericValue <= subtotal) { setDiscountStr(current); setDiscount(numericValue); } 
    else { setDiscountStr(subtotal.toString()); setDiscount(subtotal); }
  };

  // --- 🔥 TRUE NATIVE CHECKOUT & PRINTING ---
  const handleFinish = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true); // Lock UI for a split second

    // 1. Freeze Order
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      items: cart,
      total,
      discount,
      timestamp: new Date(),
      cashier: currentUser.name,
      customerName: customerName || 'Walk-in'
    };

    try {
        // 2. Save Order locally
        const currentHistory = (await db.get('order_history') as Order[]) || [];
        const updatedHistory = [newOrder, ...currentHistory];
        await db.set('order_history', updatedHistory);
        setOrderHistory(updatedHistory);

        // 3. Segment Categories natively
        const groupedItems = newOrder.items.reduce((acc, item) => {
            const cat = item.category || 'General';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(item);
            return acc;
        }, {} as Record<string, OrderItem[]>);

        // 4. FIRE AND FORGET TO RUST BACKEND (Silent Native Printing)
        // We do NOT await this. It fires instantly to the OS hardware layer.
        Object.entries(groupedItems).forEach(([category, items]) => {
            invoke('print_receipt', {
                category: category,
                items: items,
                orderId: newOrder.id,
                customerName: newOrder.customerName,
                timestamp: newOrder.timestamp.toISOString()
            }).catch(err => console.error("Rust Printer Error:", err));
        });

        // 5. Instantly clear cart for next customer
        clearCart();
    } catch (e) {
        alert("Error saving order!");
        console.error(e);
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-full bg-[#0f172a] overflow-hidden">
      
      {/* 1. INTERNAL CATEGORY SIDEBAR */}
      <div className="w-24 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-4 overflow-y-auto z-20 shadow-xl">
         <button onClick={() => setActiveCategory('All')} className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${activeCategory === 'All' ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
           <span className="text-[10px] font-black uppercase tracking-widest">All</span>
         </button>
         <div className="w-10 h-[1px] bg-slate-800"></div>
         {categories.map(cat => (
           <button key={cat.id} onClick={() => setActiveCategory(cat.name)} className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center p-1 transition-all duration-300 ${activeCategory === cat.name ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
             <span className="text-[9px] font-black uppercase text-center leading-tight break-words w-full">{cat.name}</span>
           </button>
         ))}
      </div>

      {/* 2. MENU GRID AREA */}
      <div className="flex-1 flex flex-col bg-slate-100 h-full relative">
         <div className="p-4 flex justify-between items-center bg-white shadow-sm z-10">
            <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">{activeCategory === 'All' ? 'Full Menu' : activeCategory}</h2>
            <div className="flex gap-2">
                <button onClick={() => setShowHistory(true)} className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg text-xs font-black uppercase hover:bg-slate-300">History</button>
                <button onClick={onCancel} className="px-4 py-2 bg-rose-100 text-rose-600 rounded-lg text-xs font-black uppercase hover:bg-rose-200">Exit POS</button>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 content-start pb-24">
            {loading ? <div className="col-span-full text-center text-slate-400 font-bold uppercase mt-20">Loading...</div> : 
             displayedItems.map(item => (
                <button key={item.id} onClick={() => addItem(item)} className="bg-white h-[130px] rounded-[24px] shadow-sm hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all border-b-4 border-slate-200 hover:border-emerald-500 flex flex-col justify-between p-3 group">
                    <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-emerald-600 tracking-widest text-left">{item.name}</span>
                    <span className="text-xl font-black text-slate-800 text-right py-1" dir="rtl">{item.nameUrdu}</span>
                    <div className="w-full flex justify-between items-end">
                        <span className="text-[10px] text-slate-300 font-mono">#{item.id.slice(0,3)}</span>
                        <span className="text-sm text-white font-bold bg-slate-900 px-3 py-1 rounded-full group-hover:bg-emerald-600 transition-colors">Rs. {item.price}</span>
                    </div>
                </button>
             ))}
         </div>
      </div>

      {/* 3. CART & CALCULATOR */}
      <div className="w-[420px] bg-white border-l border-slate-200 flex flex-col shadow-2xl z-30">
         <div className="flex-1 overflow-y-auto bg-slate-50">
            <table className="w-full text-left border-collapse">
               <thead className="sticky top-0 bg-slate-900 text-white z-10 shadow-md">
                   <tr>
                       <th className="p-3 text-[10px] font-black uppercase tracking-widest">Item</th>
                       <th className="p-3 text-[10px] font-black uppercase tracking-widest text-center">Qty</th>
                       <th className="p-3 text-[10px] font-black uppercase tracking-widest text-right">Price</th>
                       <th className="w-8"></th>
                   </tr>
               </thead>
               <tbody className="text-sm">
                   {cart.map((item, idx) => (
                       <tr key={`${item.id}-${idx}`} className="border-b border-slate-200 hover:bg-white transition-colors group">
                           <td className="p-3"><div className="font-bold text-slate-700">{item.name}</div></td>
                           <td className="p-3 text-center"><span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">x{item.quantity}</span></td>
                           <td className="p-3 text-right font-mono font-bold">{item.price * item.quantity}</td>
                           <td className="p-3 text-center"><button onClick={() => removeItem(item.id)} className="text-rose-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 font-bold">✕</button></td>
                       </tr>
                   ))}
               </tbody>
            </table>
         </div>

         <div className="bg-white p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20 flex flex-col gap-3">
            <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 border border-slate-200">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-2">Client:</span>
               <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="bg-transparent outline-none font-bold text-slate-800 text-sm w-full uppercase" />
            </div>
            <div className="flex justify-between items-center bg-slate-900 text-white p-3 rounded-xl mt-2">
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Net Payable</span>
                <span className="text-2xl font-black italic">Rs. {total}</span>
            </div>

            <div className="grid grid-cols-4 gap-2 h-48">
                {[7,8,9].map(n => <button key={n} onClick={() => handleNumpad(n)} className="bg-slate-50 text-slate-700 font-black text-lg rounded-lg hover:bg-slate-100">{n}</button>)}
                <button onClick={() => handleNumpad('C')} className="bg-rose-50 text-rose-500 font-black rounded-lg hover:bg-rose-100">CLR</button>

                {[4,5,6].map(n => <button key={n} onClick={() => handleNumpad(n)} className="bg-slate-50 text-slate-700 font-black text-lg rounded-lg hover:bg-slate-100">{n}</button>)}
                <button onClick={clearCart} className="bg-slate-200 text-slate-500 font-bold text-[10px] uppercase rounded-lg hover:bg-slate-300">Void</button>

                {[1,2,3].map(n => <button key={n} onClick={() => handleNumpad(n)} className="bg-slate-50 text-slate-700 font-black text-lg rounded-lg hover:bg-slate-100">{n}</button>)}
                <button onClick={() => handleNumpad(0)} className="bg-slate-50 text-slate-700 font-black text-lg rounded-lg hover:bg-slate-100">0</button>

                {/* TRUE 1-CLICK CHECKOUT */}
                <button onClick={handleFinish} disabled={cart.length === 0 || isProcessing} className="col-span-4 bg-emerald-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 disabled:bg-slate-300 py-3 mt-1">
                   Checkout
                </button>
            </div>
         </div>
      </div>

      {/* --- HISTORY MODAL --- */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
           <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
              <div className="p-4 bg-slate-100 border-b flex justify-between items-center">
                  <h3 className="font-black uppercase text-slate-700">Recent Orders</h3>
                  <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-700 font-bold">CLOSE</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                 {orderHistory.length === 0 ? (
                    <div className="text-center text-slate-400 py-10">No History Found</div>
                 ) : (
                     orderHistory.slice().reverse().map(o => (
                      <div key={o.id} className="flex justify-between items-center border p-3 rounded-xl hover:bg-slate-50">
                         <div>
                            <div className="font-bold text-slate-800">#{o.id}</div>
                            <div className="text-xs text-slate-400">{o.customerName}</div>
                         </div>
                         <div className="text-right">
                            <div className="font-black text-emerald-600">Rs. {o.total}</div>
                         </div>
                      </div>
                     ))
                 )}
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default POSView;