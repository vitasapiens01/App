import { useState } from 'react';
import { X } from 'lucide-react';
import type { RecurringTransaction, Category } from '../types';

interface Props {
  initial?: Partial<RecurringTransaction>;
  categories: Category[];
  onSave: (r: Omit<RecurringTransaction, 'id' | 'paidMonths'> | RecurringTransaction) => void;
  onClose: () => void;
}

export default function RecurringForm({ initial, categories, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    description: initial?.description ?? '',
    amount: initial?.amount?.toString() ?? '',
    type: initial?.type ?? 'expense' as 'income' | 'expense',
    categoryId: initial?.categoryId ?? '',
    frequency: initial?.frequency ?? 'monthly' as RecurringTransaction['frequency'],
    dayOfMonth: initial?.dayOfMonth?.toString() ?? '1',
    active: initial?.active ?? true,
  });

  const filtered = categories.filter(c => c.type === form.type || c.type === 'both');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return;
    const data = {
      description: form.description,
      amount,
      type: form.type,
      categoryId: form.categoryId,
      frequency: form.frequency,
      dayOfMonth: parseInt(form.dayOfMonth) || 1,
      active: form.active,
    };
    if ((initial as RecurringTransaction)?.id) {
      onSave({ ...data, id: (initial as RecurringTransaction).id, paidMonths: (initial as RecurringTransaction).paidMonths } as RecurringTransaction);
    } else {
      onSave(data);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-slate-800">
            {(initial as RecurringTransaction)?.id ? 'Editar recurrente' : 'Nuevo recurrente'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex rounded-xl overflow-hidden border border-slate-200">
            {(['expense', 'income'] as const).map(t => (
              <button key={t} type="button"
                onClick={() => setForm(f => ({ ...f, type: t }))}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  form.type === t
                    ? t === 'expense' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {t === 'expense' ? 'Gasto fijo' : 'Ingreso fijo'}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Descripción</label>
            <input type="text" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Ej: Alquiler, Netflix..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              required />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Monto</label>
            <input type="number" min="0.01" step="0.01" value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="0.00"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              required />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Categoría</label>
            <select value={form.categoryId}
              onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              required>
              <option value="">Seleccionar...</option>
              {filtered.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Frecuencia</label>
              <select value={form.frequency}
                onChange={e => setForm(f => ({ ...f, frequency: e.target.value as RecurringTransaction['frequency'] }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="monthly">Mensual</option>
                <option value="weekly">Semanal</option>
                <option value="yearly">Anual</option>
                <option value="daily">Diario</option>
              </select>
            </div>
            {form.frequency === 'monthly' && (
              <div>
                <label className="block text-sm text-slate-600 mb-1">Día del mes</label>
                <input type="number" min="1" max="31" value={form.dayOfMonth}
                  onChange={e => setForm(f => ({ ...f, dayOfMonth: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active}
              onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
              className="w-4 h-4 accent-indigo-500" />
            <span className="text-sm text-slate-600">Activo</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors text-sm">
              {(initial as RecurringTransaction)?.id ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
