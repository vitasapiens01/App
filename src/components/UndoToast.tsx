import { useEffect, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import type { UndoableAction } from '../types';

const LABELS: Record<UndoableAction['type'], string> = {
  DELETE_TRANSACTION: 'Transacción eliminada',
  DELETE_CATEGORY: 'Categoría eliminada',
  DELETE_RECURRING: 'Recurrente eliminado',
  ADD_NO_MOVEMENT: 'Día sin movimiento registrado',
  MARK_RECURRING_PAID: 'Marcado como pagado',
  MARK_RECURRING_UNPAID: 'Marcado como pendiente',
};

interface Props {
  action: UndoableAction | null;
  onUndo: () => void;
}

export default function UndoToast({ action, onUndo }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!action) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(t);
  }, [action]);

  if (!visible || !action) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg text-sm">
      <span>{LABELS[action.type]}</span>
      <button
        onClick={() => { onUndo(); setVisible(false); }}
        className="flex items-center gap-1 bg-indigo-500 hover:bg-indigo-400 px-3 py-1 rounded-lg font-medium transition-colors"
      >
        <RotateCcw size={14} /> Deshacer
      </button>
      <button onClick={() => setVisible(false)} className="opacity-60 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  );
}
