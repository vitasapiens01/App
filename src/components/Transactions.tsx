import { useState } from 'react';
import { format, parseISO, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, ChevronLeft, ChevronRight, Pencil, Trash2, FileDown } from 'lucide-react';
import { transactionsForMonth, monthKey, sumByType } from '../utils/calculations';
import { exportMonthPDF } from '../utils/pdf';
import TransactionForm from './TransactionForm';
import DeleteConfirm from './DeleteConfirm';
import type { Store } from '../store/useStore';
import type { Transaction } from '../types';

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

interface Props { store: Store }

export default function Transactions({ store }: Props) {
  const [viewDate, setViewDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  const key = monthKey(viewDate);
  const monthTxs = transactionsForMonth(store.transactions, key)
    .sort((a, b) => b.date.localeCompare(a.date));
  const monthLabel = format(viewDate, 'MMMM yyyy', { locale: es });

  const income = sumByType(monthTxs, 'income');
  const expense = sumByType(monthTxs, 'expense');

  // Group by date
  const groups = monthTxs.reduce<Record<string, Transaction[]>>((acc, t) => {
    (acc[t.date] = acc[t.date] ?? []).push(t);
    return acc;
  }, {});

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Transacciones</h1>
        <div className="flex gap-2">
          <button
            onClick={() => exportMonthPDF(monthTxs, store.categories, monthLabel)}
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

      {/* Month nav */}
      <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-sm">
        <button onClick={() => setViewDate(d => subMonths(d, 1))}
          className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
          <ChevronLeft size={20} className="text-slate-500" />
        </button>
        <div className="text-center">
          <p className="font-semibold text-slate-700 capitalize">{monthLabel}</p>
          <p className="text-xs text-slate-400">{monthTxs.length} movimientos</p>
        </div>
        <button onClick={() => setViewDate(d => addMonths(d, 1))}
          className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
          <ChevronRight size={20} className="text-slate-500" />
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex gap-3">
        <div className="flex-1 bg-emerald-50 rounded-xl p-3 text-center">
          <p className="text-xs text-emerald-500 mb-0.5">Ingresos</p>
          <p className="font-bold text-emerald-600">{fmt(income)}</p>
        </div>
        <div className="flex-1 bg-red-50 rounded-xl p-3 text-center">
          <p className="text-xs text-red-400 mb-0.5">Gastos</p>
          <p className="font-bold text-red-500">{fmt(expense)}</p>
        </div>
        <div className="flex-1 bg-indigo-50 rounded-xl p-3 text-center">
          <p className="text-xs text-indigo-400 mb-0.5">Balance</p>
          <p className={`font-bold ${income - expense >= 0 ? 'text-indigo-600' : 'text-red-500'}`}>{fmt(income - expense)}</p>
        </div>
      </div>

      {/* Grouped list */}
      {Object.keys(groups).length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <p className="text-slate-400 mb-3">Sin transacciones este mes</p>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-600 transition-colors"
          >
            Agregar la primera
          </button>
        </div>
      ) : (
        Object.entries(groups).map(([date, txs]) => (
          <div key={date} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-500 capitalize">
                {format(parseISO(date), "EEEE d 'de' MMMM", { locale: es })}
              </p>
            </div>
            {txs.map(t => {
              const cat = store.categories.find(c => c.id === t.categoryId);
              return (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: cat?.color + '20' }}
                  >
                    {cat?.icon ?? '💳'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">{t.description || cat?.name || '—'}</p>
                    <p className="text-xs text-slate-400">{cat?.name}</p>
                  </div>
                  <span className={`text-sm font-semibold ${t.type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>
                    {t.type === 'expense' ? '-' : '+'}{fmt(t.amount)}
                  </span>
                  <div className="flex gap-1 ml-1">
                    <button onClick={() => { setEditing(t); setShowForm(true); }}
                      className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleting(t)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))
      )}

      {showForm && (
        <TransactionForm
          initial={editing ?? undefined}
          categories={store.categories}
          onSave={t => 'id' in t ? store.updateTransaction(t as Transaction) : store.addTransaction(t)}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {deleting && (
        <DeleteConfirm
          message={`¿Eliminar la transacción "${deleting.description || fmt(deleting.amount)}" del ${format(parseISO(deleting.date), 'dd/MM/yyyy')}?`}
          onConfirm={() => { store.deleteTransaction(deleting.id); setDeleting(null); }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
