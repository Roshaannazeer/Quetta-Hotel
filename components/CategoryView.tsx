import React, { useState, useEffect } from 'react';
import { db } from '../storage'; 

// Define Category Interface locally
interface Category {
  id: string;
  name: string;
}

interface CategoryViewProps {
  onBack: () => void;
}

const CategoryView: React.FC<CategoryViewProps> = ({ onBack }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');

  // LOAD DATA
  useEffect(() => {
    const loadCategories = async () => {
      // FIX: Cast the result to 'Category[]' so TypeScript knows what it is
      const stored = (await db.get("categories")) as Category[];
      if (stored) setCategories(stored);
    };
    loadCategories();
  }, []);

  // ADD CATEGORY
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: Category = { 
      id: 'cat-' + Date.now(), 
      name: newCatName.trim()
    };

    const updatedList = [...categories, newCat];
    
    setCategories(updatedList);
    // FIX: Changed 'save' to 'set'
    await db.set("categories", updatedList);
    
    setNewCatName('');
  };

  // REMOVE CATEGORY
  const handleRemoveCategory = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this category?")) {
      const updatedList = categories.filter(c => c.id !== id);
      
      setCategories(updatedList);
      // FIX: Changed 'save' to 'set'
      await db.set("categories", updatedList);
    }
  };

  return (
    <div className="h-full bg-slate-50 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
           <button 
             onClick={onBack}
             className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-400 hover:text-blue-600 hover:shadow-md transition-all border border-slate-100"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
             </svg>
           </button>

           <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
             </svg>
           </div>
           <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Category Management</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organize Your Master Directory</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Create Form */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-2">Create Master</h3>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Category Name</label>
                  <input 
                    type="text" 
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-4 text-sm font-bold text-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                    placeholder="e.g. Beverages"
                    required
                  />
                </div>
                <button className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all uppercase text-xs tracking-widest shadow-lg active:scale-95">
                  Save Category
                </button>
              </form>
            </div>
            
            <div className="mt-8 bg-slate-900 p-6 rounded-[32px] shadow-2xl">
               <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Database Summary</div>
               <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                      <span className="text-slate-400 text-xs font-bold">Active Categories</span>
                      <span className="text-white text-2xl font-black">{categories.length}</span>
                  </div>
               </div>
            </div>
          </div>
          
          {/* List */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-[40px] shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
              <div className="bg-slate-900 p-6 flex justify-between items-center border-b border-slate-800">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Existing Master Records</span>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">{categories.length} Entries</span>
              </div>
              
              <div className="flex-1 overflow-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map(c => (
                  <div key={c.id} className="bg-white border border-slate-100 p-5 rounded-[24px] shadow-sm flex items-center justify-between hover:border-blue-400 hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 uppercase group-hover:bg-blue-600 group-hover:text-white transition-colors">
                           {c.name.charAt(0)}
                        </div>
                        <span className="text-lg font-black text-slate-800 tracking-tight">{c.name}</span>
                    </div>
                    <button onClick={() => handleRemoveCategory(c.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="col-span-full h-full flex flex-col items-center justify-center py-20 opacity-30">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Directory Empty</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryView;