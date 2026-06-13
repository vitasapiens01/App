import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Pencil, Trash2, FileDown, CheckCircle2, Circle, Pause, Play } from 'lucide-react';
import { monthKey } from '../utils/calculations';
import { exportRecurringPDF } from '../utils/pdf';
import RecurringForm from './RecurringForm';
import DeleteConfirm from './DeleteConfirm';
import type { Store } from '../store/useStore';
import type { RecurringTransaction } from '../types';

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

const freqLabel: Record<string, string> = {
  daily: 'Diario', weekly: 'Semanal', monthly: 'Mensual', yearly: 'Anual',
};

interface Props { store: Store }

export default function Recurring({ store }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RecurringTransaction | null>(null);
  const [deleting, setDeleting] = useState<RecurringTransaction | null>(null);

  const currentKey = monthKey();
  const currentMonthLabel = format(new Date(), 'MMMM yyyy', { locale: es });

  const expenses = store.recurringTransactions.filter(r => r.type === 'expense');
  const incomes = store.recurringTransactions.filter(r => r.type === 'income');

  function RecurringItem({ r }: { r: RecurringTransaction }) {
    const cat = store.categories.find(c => c.id === r.categoryId);
    const isPaid = r.paidMonths.includes(currentKey);
    return (
      <div className={`flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0 ${!r.active ? 'opacity-50' : ''}`}>
        <button
          onClick={() => store.toggleRecurringPaid(r.id, currentKey)}
          className={`flex-shrink-0 ${isPaid ? 'text-emerald-500' : 'text-slate-300 hover:text-emerald-400'} transition-colors`}
          title={isPaid ? 'Marcar pendiente' : 'Marcar pagado'}
        >
          {isPaid ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </button>
        <span className="text-base flex-shrink-0">{cat?.icon ?? '📌'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-700 truncate">{r.description}</p>
          <p className="text-xs text-slate-400">
            {freqLabel[r.frequency]}
            {r.frequency === 'monthly' && r.dayOfMonth ? ` · Día ${r.dayOfMonth}` : ''}
            {' · '}{cat?.name}
          </p>
        </div>
        <span className={`text-sm font-semibold flex-shrink-0 ${r.type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>
          {fmt(r.amount)}
        </span>
        <div className="flex gap-0.5 ml-1">
          <button
            onClick={() => store.updateRecurring({ ...r, active: !r.active })}
            className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
            title={r.active ? 'Pausar' : 'Activar'}
          >
            {r.active ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <button onClick={() => { setEditing(r); setShowForm(true); }}
            className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={() => setDeleting(r)}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Recurrentes</h1>
        <div className="flex gap-2">
          <button
            onClick={() => exportRecurringPDF(store.recurringTransactions, store.categories)}
            className="p-2 rounded-xl bg-white shadow-sm text-slate-500 hover:text-indigo-500 transition-colors"
            title="Exportar PDF"
          >
            <FileDown size={18} />
          </button>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors shadow"
          >
            <Plus size={16} /> Nuevo
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400 px-1">
        Los checkboxes muestran si está pagado en <span className="capitalize font-medium">{currentMonthLabel}</span>.
        Toca el círculo para marcar como pagado/pendiente.
      </p>

      {expenses.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-2 bg-red-50 border-b border-red-100">
            <p className="text-xs font-semibold text-red-500">Gastos fijos</p>
          </div>
          {expenses.map(r => <RecurringItem key={r.id} r={r} />)}
        </div>
      )}

      {incomes.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100">
            <p className="text-xs font-semibold text-emerald-500">Ingresos fijos</p>
          </div>
          {incomes.map(r => <RecurringItem key={r.id} r={r} />)}
        </div>
      )}

      {store.recurringTransactions.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <p className="text-slate-400 mb-3">Sin recurrentes configurados</p>
          <button onClick={() => setShowForm(true)}
            className="bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-600 transition-colors">
            Agregar primero
          </button>
        </div>
      )}

      {showForm && (
        <RecurringForm
          initial={editing ?? undefined}
          categories={store.categories}
          onSave={r => {
            if ('id' in r && (r as RecurringTransaction).id) {
              store.updateRecurring(r as RecurringTransaction);
            } else {
              store.addRecurring(r as Omit<RecurringTransaction, 'id' | 'paidMonths'>);
            }
          }}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {deleting && (
        <DeleteConfirm
          message={`¿Eliminar el recurrente "${deleting.description}"?`}
          onConfirm={() => { store.deleteRecurring(deleting.id); setDeleting(null); }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
