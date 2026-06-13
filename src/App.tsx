import { useState } from 'react';
import { LayoutDashboard, ArrowLeftRight, Tag, RefreshCw } from 'lucide-react';
import { useStore } from './store/useStore';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Categories from './components/Categories';
import Recurring from './components/Recurring';
import UndoToast from './components/UndoToast';

type Tab = 'dashboard' | 'transactions' | 'categories' | 'recurring';

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
  { id: 'transactions', label: 'Movimientos', icon: ArrowLeftRight },
  { id: 'categories', label: 'Categorías', icon: Tag },
  { id: 'recurring', label: 'Fijos', icon: RefreshCw },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const store = useStore();
  const lastUndo = store.undoStack[0] ?? null;

  return (
    <div className="min-h-svh bg-slate-100 flex flex-col max-w-lg mx-auto relative">
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <h1 className="font-bold text-slate-800 text-base">FinanzasApp</h1>
        <span className="text-xs text-slate-400">
          {new Date().toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
        </span>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {tab === 'dashboard' && <Dashboard store={store} />}
        {tab === 'transactions' && <Transactions store={store} />}
        {tab === 'categories' && <Categories store={store} />}
        {tab === 'recurring' && <Recurring store={store} />}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-slate-200 flex z-30 shadow-lg">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors relative ${
              tab === id ? 'text-indigo-500' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon size={20} />
            <span className="text-xs">{label}</span>
            {tab === id && (
              <span className="w-1 h-1 rounded-full bg-indigo-500 absolute bottom-1" />
            )}
          </button>
        ))}
      </nav>

      <UndoToast action={lastUndo} onUndo={store.undo} />
    </div>
  );
}
