import { useState } from 'react';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, Clock, CheckCircle2, AlertCircle, CalendarOff } from 'lucide-react';
import { getMonthlySummary, transactionsForMonth, monthKey } from '../utils/calculations';
import type { Store } from '../store/useStore';

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

interface Props { store: Store }

export default function Dashboard({ store }: Props) {
  const [viewDate, setViewDate] = useState(new Date());
  const today = format(new Date(), 'yyyy-MM-dd');
  const key = monthKey(viewDate);
  const isCurrentMonth = key === monthKey();

  const summary = getMonthlySummary(store.transactions, store.recurringTransactions, viewDate);
  const monthTxs = transactionsForMonth(store.transactions, key);
  const noMov = store.noMovementDays.some(d => d.date === today);

  const activeRecurring = store.recurringTransactions.filter(r => r.active);
  const paidRecurring = activeRecurring.filter(r => r.paidMonths.includes(key));
  const pendingRecurring = activeRecurring.filter(r => !r.paidMonths.includes(key));

  const monthLabel = format(viewDate, 'MMMM yyyy', { locale: es });

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      {/* Month navigator */}
      <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-sm">
        <button onClick={() => setViewDate(d => subMonths(d, 1))}
          className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
          <ChevronLeft size={20} className="text-slate-500" />
        </button>
        <h2 className="font-semibold text-slate-700 capitalize">{monthLabel}</h2>
        <button onClick={() => setViewDate(d => addMonths(d, 1))}
          className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
          <ChevronRight size={20} className="text-slate-500" />
        </button>
      </div>

      {/* Balance card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow">
        <p className="text-indigo-100 text-sm mb-1">Balance del mes</p>
        <p className="text-4xl font-bold mb-4">{fmt(summary.balance)}</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/20 rounded-xl p-3">
            <div className="flex items-center gap-1 text-emerald-200 text-xs mb-1">
              <TrendingUp size={12} /> Ingresos
            </div>
            <p className="text-lg font-semibold">{fmt(summary.totalIncome)}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3">
            <div className="flex items-center gap-1 text-red-200 text-xs mb-1">
              <TrendingDown size={12} /> Gastos
            </div>
            <p className="text-lg font-semibold">{fmt(summary.totalExpenses)}</p>
          </div>
        </div>
      </div>

      {/* Projected balance */}
      {activeRecurring.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Wallet size={16} className="text-indigo-500" />
            <h3 className="font-semibold text-slate-700 text-sm">Proyección de gastos fijos</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total recurrentes</span>
              <span className="font-medium text-slate-700">{fmt(summary.recurringTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1 text-emerald-600">
                <CheckCircle2 size={13} />
                <span>Ya pagados ({paidRecurring.length})</span>
              </div>
              <span className="font-medium text-emerald-600">{fmt(summary.recurringPaid)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1 text-amber-600">
                <AlertCircle size={13} />
                <span>Pendientes ({pendingRecurring.length})</span>
              </div>
              <span className="font-medium text-amber-600">{fmt(summary.recurringPending)}</span>
            </div>
            <div className="border-t border-slate-100 pt-2 flex justify-between text-sm">
              <span className="font-semibold text-slate-700">Balance proyectado</span>
              <span className={`font-bold ${summary.projectedBalance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {fmt(summary.projectedBalance)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Pending recurring list */}
      {pendingRecurring.length > 0 && isCurrentMonth && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
            <Clock size={15} className="text-amber-500" /> Por pagar este mes
          </h3>
          <div className="space-y-2">
            {pendingRecurring.map(r => {
              const cat = store.categories.find(c => c.id === r.categoryId);
              return (
                <div key={r.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cat?.icon ?? '📌'}</span>
                    <div>
                      <p className="text-sm text-slate-700">{r.description}</p>
                      {r.dayOfMonth && (
                        <p className="text-xs text-slate-400">Vence día {r.dayOfMonth}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${r.type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>
                      {fmt(r.amount)}
                    </span>
                    <button
                      onClick={() => store.toggleRecurringPaid(r.id, key)}
                      className="text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-2 py-1 rounded-lg transition-colors"
                    >
                      Marcar pagado
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-semibold text-slate-700 text-sm mb-3">
          Transacciones del mes ({monthTxs.length})
        </h3>
        {monthTxs.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">Sin transacciones este mes</p>
        ) : (
          <div className="space-y-2">
            {[...monthTxs]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 5)
              .map(t => {
                const cat = store.categories.find(c => c.id === t.categoryId);
                return (
                  <div key={t.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cat?.icon ?? '💳'}</span>
                      <div>
                        <p className="text-sm text-slate-700">{t.description || cat?.name || '—'}</p>
                        <p className="text-xs text-slate-400">{format(parseISO(t.date), 'dd/MM')}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${t.type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>
                      {t.type === 'expense' ? '-' : '+'}{fmt(t.amount)}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* No movement today */}
      {isCurrentMonth && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-slate-700 text-sm mb-2 flex items-center gap-2">
            <CalendarOff size={15} className="text-slate-400" /> Hoy sin movimientos
          </h3>
          {noMov ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Registrado para hoy ({format(new Date(), 'dd/MM')})</p>
              <button
                onClick={() => store.removeNoMovementDay(today)}
                className="text-xs text-red-500 hover:underline"
              >
                Deshacer
              </button>
            </div>
          ) : (
            <button
              onClick={() => store.addNoMovementDay(today)}
              className="w-full py-2 text-sm text-slate-500 border border-dashed border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Registrar — hoy no hubo movimientos
            </button>
          )}
        </div>
      )}
    </div>
  );
}
