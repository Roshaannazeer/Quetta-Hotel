import React, { useState, useEffect } from 'react';
import { MenuItem, Category } from '../types';
import { db } from '../storage'; 

const MenuView: React.FC = () => {
  // --- STATE ---
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [nameUrdu, setNameUrdu] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');

  // --- 1. LOAD DATA FROM DB ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load Menu Items
        const storedItems = await db.get('menu_items');
        if (storedItems && Array.isArray(storedItems)) {
          setMenuItems(storedItems as MenuItem[]);
        }

        // Load Categories
        const storedCats = await db.get('categories');
        if (storedCats && Array.isArray(storedCats)) {
          const cats = storedCats as Category[];
          setCategories(cats);
          // Auto-select first category if available
          if (cats.length > 0) {
            setCategory(cats[0].name);
          }
        }
      } catch (error) {
        console.error("Failed to load menu data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- 2. HANDLE ADD ITEM ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || !category) {
      alert("Please enter Name, Price, and select a Category.");
      return;
    }

    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: name.toUpperCase(),
      nameUrdu: nameUrdu || name,
      price: parseFloat(price),
      category: category 
    };

    // --- FIX: READ, UPDATE, SAVE ---
    // 1. Get current list from DB to ensure sync
    const currentItems = (await db.get('menu_items') as MenuItem[]) || [];
    // 2. Add new item
    const updatedItems = [...currentItems, newItem];
    // 3. Save back to DB using 'set'
    await db.set('menu_items', updatedItems);

    // Update Local State
    setMenuItems(updatedItems);

    // Reset Form
    setName('');
    setNameUrdu('');
    setPrice('');
  };

  // --- 3. HANDLE DELETE ITEM ---
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
        // --- FIX: READ, FILTER, SAVE ---
        const currentItems = (await db.get('menu_items') as MenuItem[]) || [];
        const updatedItems = currentItems.filter(item => item.id !== id);
        
        await db.set('menu_items', updatedItems);
        
        // Update Local State
        setMenuItems(updatedItems);
    }
  };

  if (loading) {
      return <div className="h-full flex items-center justify-center text-slate-400 font-bold uppercase">Loading Menu Data...</div>;
  }

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 flex justify-between items-center shadow-sm z-10">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Menu Management</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Inventory & Pricing Control</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-100 font-mono text-sm font-bold">
          Total Items: {menuItems.length}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        
        {/* LEFT SIDE: INPUT FORM */}
        <div className="w-[400px] bg-white border-r border-slate-200 p-8 overflow-y-auto z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Add New Item</h3>
              
              <div className="space-y-4">
                {/* Name Input */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Item Name (English)</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-emerald-500 focus:outline-none transition-all uppercase"
                    placeholder="e.g. SIMPLE TEA"
                  />
                </div>

                {/* Urdu Name Input */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Item Name (Urdu)</label>
                  <input 
                    type="text" 
                    value={nameUrdu}
                    onChange={e => setNameUrdu(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-emerald-500 focus:outline-none transition-all text-right font-sans"
                    placeholder="e.g. سادی چائے"
                    dir="rtl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Price Input */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Price (Rs)</label>
                    <input 
                      type="number" 
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-emerald-600 focus:border-emerald-500 focus:outline-none transition-all"
                      placeholder="0"
                    />
                  </div>
                  
                  {/* Category Dropdown */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
                    <select 
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-emerald-500 focus:outline-none transition-all appearance-none"
                    >
                      {categories.length === 0 && <option value="" disabled>No Categories</option>}
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={categories.length === 0}
              className="w-full bg-emerald-600 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg hover:bg-emerald-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {categories.length === 0 ? "Create Category First" : "Save to Menu"}
            </button>
          </form>
        </div>

        {/* RIGHT SIDE: LIST PREVIEW */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="pl-4">Item Name</th>
                <th className="text-center">Category</th>
                <th className="text-right">Price</th>
                <th className="text-center pr-4">Action</th> 
              </tr>
            </thead>
            <tbody>
              {menuItems.map(item => (
                <tr key={item.id} className="bg-white shadow-sm hover:shadow-md transition-shadow group">
                  <td className="p-4 rounded-l-xl border-l-4 border-transparent group-hover:border-emerald-500 transition-all">
                    <div className="font-bold text-slate-700 uppercase">{item.name}</div>
                    <div className="text-xs text-slate-400" dir="rtl">{item.nameUrdu}</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-mono font-bold text-emerald-600">Rs. {item.price}</span>
                  </td>
                  <td className="p-4 text-center rounded-r-xl pr-4">
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white p-2 rounded-lg transition-all shadow-sm"
                      title="Delete Item"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              
              {menuItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-20 text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                       <span className="text-4xl">🍽️</span>
                       <span className="text-sm font-bold uppercase">No items found</span>
                       <span className="text-xs">Add your first item using the form on the left.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MenuView;