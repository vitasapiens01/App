import { useState } from 'react';
import { X } from 'lucide-react';
import type { Category } from '../types';

const COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#10b981','#06b6d4','#3b82f6','#8b5cf6','#ec4899','#64748b'];
const ICONS = ['🍽️','🚗','💡','🏥','🎬','💼','💰','🏠','✈️','📱','🛒','🎓','💊','🏋️','🎮','📚','👗','🏦','🎁','🐾'];

interface Props {
  initial?: Partial<Category>;
  onSave: (c: Omit<Category, 'id'> | Category) => void;
  onClose: () => void;
}

export default function CategoryForm({ initial, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    type: initial?.type ?? 'expense' as Category['type'],
    color: initial?.color ?? COLORS[0],
    icon: initial?.icon ?? ICONS[0],
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (initial?.id) {
      onSave({ ...form, id: initial.id } as Category);
    } else {
      onSave(form);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-slate-800">
            {initial?.id ? 'Editar categoría' : 'Nueva categoría'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ej: Supermercado"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Tipo</label>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value as Category['type'] }))}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="expense">Gasto</option>
              <option value="income">Ingreso</option>
              <option value="both">Ambos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-2">Ícono</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, icon }))}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border-2 transition-colors ${
                    form.icon === icon ? 'border-indigo-500 bg-indigo-50' : 'border-transparent hover:border-slate-200'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color }))}
                  style={{ background: color }}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    form.color === color ? 'border-slate-800 scale-110' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors text-sm">
              {initial?.id ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
