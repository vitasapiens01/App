import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import type { Transaction, Category } from '../types';

interface Props {
  initial?: Partial<Transaction>;
  categories: Category[];
  onSave: (t: Omit<Transaction, 'id'> | Transaction) => void;
  onClose: () => void;
}

export default function TransactionForm({ initial, categories, onSave, onClose }: Props) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [form, setForm] = useState({
    date: initial?.date ?? today,
    amount: initial?.amount?.toString() ?? '',
    type: initial?.type ?? 'expense' as 'income' | 'expense',
    categoryId: initial?.categoryId ?? '',
    description: initial?.description ?? '',
  });

  const filtered = categories.filter(c => c.type === form.type || c.type === 'both');

  useEffect(() => {
    if (!filtered.find(c => c.id === form.categoryId)) {
      setForm(f => ({ ...f, categoryId: filtered[0]?.id ?? '' }));
    }
  }, [form.type]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return;
    const data = {
      date: form.date,
      amount,
      type: form.type,
      categoryId: form.categoryId,
      description: form.description,
    };
    if (initial?.id) {
      onSave({ ...data, id: initial.id } as Transaction);
    } else {
      onSave(data);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-slate-800">
            {initial?.id ? 'Editar transacción' : 'Nueva transacción'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-xl overflow-hidden border border-slate-200">
            {(['expense', 'income'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setForm(f => ({ ...f, type: t }))}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  form.type === t
                    ? t === 'expense'
                      ? 'bg-red-500 text-white'
                      : 'bg-emerald-500 text-white'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {t === 'expense' ? 'Gasto' : 'Ingreso'}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Fecha</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Monto</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="0.00"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Categoría</label>
            <select
              value={form.categoryId}
              onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              required
            >
              <option value="">Seleccionar...</option>
              {filtered.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Descripción (opcional)</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="¿En qué fue?"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors text-sm">
              {initial?.id ? 'Guardar cambios' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
