export function exportToCSV(data, filename, columns) {
  if (!data || data.length === 0) return;
  const headers = columns.map(c => c.label).join(',');
  const rows = data.map(row => columns.map(c => { const v = String(c.accessor(row) ?? ''); return v.includes(',') ? `"${v.replace(/"/g, '""')}"` : v; }).join(','));
  const csv = '\uFEFF' + [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}
