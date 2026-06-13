import { useState } from 'react';
import { Plus, Pencil, Trash2, FileDown } from 'lucide-react';
import { exportCategoriesPDF } from '../utils/pdf';
import CategoryForm from './CategoryForm';
import DeleteConfirm from './DeleteConfirm';
import type { Store } from '../store/useStore';
import type { Category } from '../types';

interface Props { store: Store }

export default function Categories({ store }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const typeLabel = { income: 'Ingreso', expense: 'Gasto', both: 'Ambos' };

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Categorías</h1>
        <div className="flex gap-2">
          <button
            onClick={() => exportCategoriesPDF(store.categories)}
            className="p-2 rounded-xl bg-white shadow-sm text-slate-500 hover:text-indigo-500 transition-colors"
            title="Exportar PDF"
          >
            <FileDown size={18} />
          </button>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors shadow"
          >
            <Plus size={16} /> Nueva
          </button>
        </div>
      </div>

      {store.categories.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <p className="text-slate-400 mb-3">Sin categorías</p>
          <button onClick={() => setShowForm(true)}
            className="bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-600 transition-colors">
            Crear primera categoría
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {store.categories.map((cat, i) => (
            <div key={cat.id}
              className={`flex items-center gap-3 px-4 py-3 ${i < store.categories.length - 1 ? 'border-b border-slate-50' : ''}`}>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-base"
                style={{ background: cat.color + '25' }}
              >
                {cat.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700">{cat.name}</p>
                <p className="text-xs text-slate-400">{typeLabel[cat.type]}</p>
              </div>
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: cat.color }}
              />
              <button onClick={() => { setEditing(cat); setShowForm(true); }}
                className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors">
                <Pencil size={14} />
              </button>
              <button onClick={() => setDeleting(cat)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <CategoryForm
          initial={editing ?? undefined}
          onSave={c => 'id' in c ? store.updateCategory(c as Category) : store.addCategory(c)}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {deleting && (
        <DeleteConfirm
          message={`¿Eliminar la categoría "${deleting.name}"? Las transacciones asociadas quedarán sin categoría.`}
          onConfirm={() => { store.deleteCategory(deleting.id); setDeleting(null); }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
