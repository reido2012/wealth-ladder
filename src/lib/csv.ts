export function toCSV(headers: string[], rows: (string | number | undefined | null)[][]) {
  const esc = (v: any) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [headers.map(esc).join(',')];
  for (const row of rows) lines.push(row.map(esc).join(','));
  return lines.join('\n');
}

export function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const rows: string[][] = [];
  let i = 0;
  const out: string[] = [];
  let line: string[] = [];
  let inQuotes = false;
  const pushCell = () => { line.push(out.join('')); out.length = 0; };
  const pushLine = () => { rows.push([...line]); line = []; };
  while (i < text.length) {
    const c = text[i++];
    if (inQuotes) {
      if (c === '"') {
        if (text[i] === '"') { out.push('"'); i++; } else inQuotes = false;
      } else out.push(c);
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') pushCell();
      else if (c === '\n') { pushCell(); pushLine(); }
      else if (c === '\r') { /* ignore CR */ }
      else out.push(c);
    }
  }
  pushCell();
  if (line.length) pushLine();
  const headers = rows.shift() || [];
  return { headers, rows };
}
