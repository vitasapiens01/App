import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO } from 'date-fns';
import type { Transaction, Category, RecurringTransaction } from '../types';

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);
}

function getCategoryName(categories: Category[], id: string) {
  return categories.find(c => c.id === id)?.name ?? 'Sin categoría';
}

export function exportMonthPDF(
  transactions: Transaction[],
  categories: Category[],
  monthLabel: string,
) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text(`Resumen mensual — ${monthLabel}`, pageW / 2, 18, { align: 'center' });

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text(`Ingresos: ${fmt(income)}   Gastos: ${fmt(expense)}   Balance: ${fmt(income - expense)}`, pageW / 2, 28, { align: 'center' });

  if (transactions.length === 0) {
    doc.setFontSize(12);
    doc.text('Sin transacciones este mes.', pageW / 2, 50, { align: 'center' });
    doc.save(`resumen-${monthLabel}.pdf`);
    return;
  }

  const rows = [...transactions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(t => [
      format(parseISO(t.date), 'dd/MM/yyyy'),
      t.description || '—',
      getCategoryName(categories, t.categoryId),
      t.type === 'income' ? 'Ingreso' : 'Gasto',
      fmt(t.amount),
    ]);

  autoTable(doc, {
    startY: 36,
    head: [['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Monto']],
    body: rows,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [99, 102, 241] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  doc.save(`resumen-${monthLabel}.pdf`);
}

export function exportRecurringPDF(
  recurring: RecurringTransaction[],
  categories: Category[],
) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text('Gastos / Ingresos Recurrentes', pageW / 2, 18, { align: 'center' });

  if (recurring.length === 0) {
    doc.setFontSize(12);
    doc.text('Sin recurrentes configurados.', pageW / 2, 40, { align: 'center' });
    doc.save('recurrentes.pdf');
    return;
  }

  const freqLabel: Record<string, string> = {
    daily: 'Diario', weekly: 'Semanal', monthly: 'Mensual', yearly: 'Anual',
  };

  const rows = recurring.map(r => [
    r.description || '—',
    getCategoryName(categories, r.categoryId),
    r.type === 'income' ? 'Ingreso' : 'Gasto',
    freqLabel[r.frequency] ?? r.frequency,
    r.dayOfMonth ? `Día ${r.dayOfMonth}` : '—',
    fmt(r.amount),
    r.active ? 'Activo' : 'Pausado',
  ]);

  autoTable(doc, {
    startY: 28,
    head: [['Descripción', 'Categoría', 'Tipo', 'Frecuencia', 'Vence', 'Monto', 'Estado']],
    body: rows,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [16, 185, 129] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  doc.save('recurrentes.pdf');
}

export function exportCategoriesPDF(categories: Category[]) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text('Categorías', pageW / 2, 18, { align: 'center' });

  if (categories.length === 0) {
    doc.setFontSize(12);
    doc.text('Sin categorías configuradas.', pageW / 2, 40, { align: 'center' });
    doc.save('categorias.pdf');
    return;
  }

  const typeLabel: Record<string, string> = {
    income: 'Ingreso', expense: 'Gasto', both: 'Ambos',
  };

  const rows = categories.map(c => [c.icon, c.name, typeLabel[c.type] ?? c.type]);

  autoTable(doc, {
    startY: 28,
    head: [['Icono', 'Nombre', 'Tipo']],
    body: rows,
    styles: { fontSize: 12 },
    headStyles: { fillColor: [139, 92, 246] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  doc.save('categorias.pdf');
}
