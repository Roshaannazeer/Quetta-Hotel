
import React, { useState } from 'react';
import { Supplier } from '../types.ts';

interface SupplierViewProps {
  suppliers: Supplier[];
  onAdd: (sup: Supplier) => void;
}

const SupplierView: React.FC<SupplierViewProps> = ({ suppliers, onAdd }) => {
  const [form, setForm] = useState({ name: '', contact: '', address: '' });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    onAdd({ id: 'sup-' + Date.now(), ...form });
    setForm({ name: '', contact: '', address: '' });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-black text-blue-900 mb-6 uppercase italic">Supplier Directory</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 border-2 border-gray-300 rounded shadow col-span-1">
          <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase">Add Vendor</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <input 
              placeholder="Vendor Name"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="w-full border p-2 text-sm" 
              required 
            />
            <input 
              placeholder="Contact Number"
              value={form.contact}
              onChange={e => setForm({...form, contact: e.target.value})}
              className="w-full border p-2 text-sm" 
            />
            <textarea 
              placeholder="Address"
              value={form.address}
              onChange={e => setForm({...form, address: e.target.value})}
              className="w-full border p-2 text-sm" 
            />
            <button className="w-full bg-blue-800 text-white font-bold py-2 uppercase text-xs">Register Supplier</button>
          </form>
        </div>

        <div className="bg-white border-2 border-gray-300 rounded shadow overflow-hidden col-span-2">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 uppercase">Vendor</th>
                <th className="p-3 uppercase">Contact</th>
                <th className="p-3 uppercase">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {suppliers.map(s => (
                <tr key={s.id} className="hover:bg-blue-50">
                  <td className="p-3 font-bold">{s.name}</td>
                  <td className="p-3 font-mono">{s.contact}</td>
                  <td className="p-3 text-gray-500 italic">{s.address}</td>
                </tr>
              ))}
              {suppliers.length === 0 && <tr><td colSpan={3} className="p-10 text-center italic text-gray-400">No suppliers registered.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupplierView;
