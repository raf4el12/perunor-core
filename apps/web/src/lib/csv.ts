function escapar(valor: unknown): string {
  if (valor == null) return "";
  const s = String(valor);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(rows: Record<string, unknown>[], headers: { key: string; label: string }[]): string {
  const head = headers.map((h) => escapar(h.label)).join(",");
  const body = rows.map((r) => headers.map((h) => escapar(r[h.key])).join(",")).join("\r\n");
  return `${head}\r\n${body}`;
}

export function descargarCsv(contenido: string, nombre: string) {
  const bom = "\uFEFF";
  const blob = new Blob([bom + contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre.endsWith(".csv") ? nombre : `${nombre}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
