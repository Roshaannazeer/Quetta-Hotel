
import React from 'react';
import { MenuItem } from '../types.ts';

interface BarcodeViewProps {
  menuItems: MenuItem[];
}

/**
 * A simple functional component that renders a set of bars based on a string.
 * This simulates a 1D barcode visual in a deterministic way.
 */
const BarcodeRenderer: React.FC<{ code: string }> = ({ code }) => {
  // Simple deterministic pattern generator
  // In a production app, you might use JsBarcode or similar
  const getBars = (str: string) => {
    const bars: boolean[] = [true, false, true]; // Start quiet zone
    for (let i = 0; i < str.length; i++) {
      const num = parseInt(str[i]) || 0;
      // Map digits to a simple binary pattern
      const patterns = [
        [true, false, true, true, false],
        [true, true, false, true, false],
        [true, false, true, false, true],
        [true, true, true, false, false],
        [true, false, false, true, true],
        [true, true, false, false, true],
        [false, true, true, false, true],
        [false, true, false, true, true],
        [false, false, true, true, true],
        [true, true, true, true, false]
      ];
      bars.push(...patterns[num % 10]);
      bars.push(false); // spacer
    }
    bars.push(true, false, true); // End quiet zone
    return bars;
  };

  const barPattern = getBars(code);

  return (
    <div className="flex items-stretch h-8 w-full bg-white">
      {barPattern.map((isBlack, idx) => (
        <div 
          key={idx} 
          className={`flex-1 ${isBlack ? 'bg-black' : 'bg-transparent'}`}
        />
      ))}
    </div>
  );
};

const BarcodeView: React.FC<BarcodeViewProps> = ({ menuItems }) => {
  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Print Specific Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 10px !important;
          }
          .no-print { display: none !important; }
          .label-card {
            border: 1px solid #000 !important;
            break-inside: avoid;
            padding: 5px !important;
            width: 50mm;
            height: 30mm;
            overflow: hidden;
          }
        }
      `}</style>

      <div className="flex justify-between items-center mb-6 no-print">
        <h2 className="text-xl font-black text-blue-900 uppercase italic">Barcode & Label Management</h2>
        <div className="flex gap-2">
           <button 
            onClick={handlePrintAll}
            className="bg-blue-600 text-white px-6 py-2 text-xs font-bold uppercase rounded shadow hover:bg-blue-700 transition-all"
           >
            Print All Labels
           </button>
        </div>
      </div>
      
      <div id="printable-area" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {menuItems.map(item => (
          <div 
            key={item.id} 
            className="label-card bg-white p-3 border-2 border-gray-300 rounded flex flex-col items-center group hover:border-blue-500 transition-all relative overflow-hidden"
          >
            {/* Store Header for Labels */}
            <div className="text-[7px] font-bold text-gray-400 uppercase tracking-tighter mb-1 border-b w-full text-center">
              QUETTA FOOD POINT
            </div>
            
            {/* Item Name */}
            <div className="w-full text-center mb-1">
              <div className="text-[9px] font-black uppercase text-blue-900 leading-none truncate">{item.name}</div>
              <div className="text-[12px] font-bold text-green-700" dir="rtl">{item.nameUrdu}</div>
            </div>

            {/* Visual Barcode */}
            <div className="w-full flex flex-col items-center justify-center border border-gray-100 p-1 bg-white mb-1">
               <BarcodeRenderer code={item.barcode || '000000'} />
               <span className="text-[9px] font-mono tracking-widest mt-0.5 font-bold">
                 {item.barcode || 'NO-CODE'}
               </span>
            </div>

            {/* Price Tag */}
            <div className="text-xs font-black text-black mt-auto flex justify-between w-full items-center px-1">
              <span className="text-[8px] text-gray-400 uppercase">Price:</span>
              <span>Rs. {item.price}</span>
            </div>

            {/* Individual Print Button Overlay */}
            <button 
              onClick={() => {
                const card = document.getElementById(`label-${item.id}`);
                // In a real scenario, we'd isolate this card for printing
                window.print();
              }}
              className="no-print absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer"
            >
              <span className="bg-blue-600 text-white px-2 py-1 text-[8px] font-bold uppercase rounded shadow">Print Single</span>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 p-4 border border-blue-200 rounded no-print">
        <h4 className="text-[10px] font-black uppercase text-blue-800 mb-2">Instructions:</h4>
        <ul className="text-[10px] text-blue-600 space-y-1 list-disc ml-4">
          <li>Every item is automatically assigned a unique 6-digit code.</li>
          <li>Click "Print All Labels" to prepare a sheet for your thermal or laser printer.</li>
          <li>Standard label size is 50mm x 30mm for best results.</li>
        </ul>
      </div>
    </div>
  );
};

export default BarcodeView;
