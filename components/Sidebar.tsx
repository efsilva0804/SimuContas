
import React from 'react';
import { LayoutDashboard, BookOpen, Table, FileText, PieChart, ShieldCheck, RefreshCw, ChevronLeft, Calculator } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onARE: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onARE, isOpen, onClose }) => {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'journal', label: 'Diário (Lançamentos)', icon: BookOpen },
    { id: 'ledger', label: 'Razão (Razonetes)', icon: Table },
    { id: 'statements', label: 'Demonstrações', icon: FileText },
    { id: 'esg', label: 'Métricas ESG', icon: ShieldCheck },
    { id: 'calculators', label: 'Calculadoras', icon: Calculator },
  ];

  return (
    <aside className={`w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col p-4 z-50 transition-transform duration-300 ease-in-out shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="mb-8 px-2 flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <PieChart className="text-emerald-400" />
          SimuContas <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1 rounded">PRO</span>
        </h1>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 md:hidden"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => {
              onNavigate(item.id);
              if (window.innerWidth < 768) onClose();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              currentView === item.id ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-slate-800">
        <button
          onClick={() => {
            onARE();
            if (window.innerWidth < 768) onClose();
          }}
          className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg transition-colors font-bold shadow-lg shadow-amber-900/20"
        >
          <RefreshCw size={18} />
          Encerrar Exercício
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
