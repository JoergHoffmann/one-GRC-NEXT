import { RiskLevel, ImplementationStatus, ProtectionLevel } from '../types/isms';

export function getRiskColorClass(level: RiskLevel): string {
  switch (level) {
    case 'Kritisch':
      return 'text-rose-400 bg-rose-950/40 border-rose-800/60';
    case 'Hoch':
      return 'text-amber-400 bg-amber-950/40 border-amber-800/60';
    case 'Mittel':
      return 'text-yellow-400 bg-yellow-950/40 border-yellow-800/60';
    case 'Niedrig':
    default:
      return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
  }
}

export function getStatusColorClass(status: ImplementationStatus): { text: string; bg: string; label: string } {
  switch (status) {
    case 'implemented':
      return { text: 'text-emerald-400', bg: 'bg-emerald-950/50 border-emerald-800/50', label: 'Umgesetzt' };
    case 'in_progress':
      return { text: 'text-amber-400', bg: 'bg-amber-950/50 border-amber-800/50', label: 'In Umsetzung' };
    case 'planned':
      return { text: 'text-blue-400', bg: 'bg-blue-950/50 border-blue-800/50', label: 'Geplant' };
    case 'not_applicable':
      return { text: 'text-slate-400', bg: 'bg-slate-800/50 border-slate-700/50', label: 'Nicht anwendbar' };
    default:
      return { text: 'text-slate-400', bg: 'bg-slate-800/50 border-slate-700/50', label: status };
  }
}

export function getProtectionLevelColor(level: ProtectionLevel): string {
  switch (level) {
    case 'Sehr Hoch':
      return 'text-rose-400';
    case 'Hoch':
      return 'text-amber-400';
    case 'Normal':
    default:
      return 'text-slate-300';
  }
}

export function calculateRiskScore(likelihood: number, impact: number): { score: number; level: RiskLevel } {
  const score = likelihood * impact;
  let level: RiskLevel = 'Niedrig';
  if (score >= 15) level = 'Kritisch';
  else if (score >= 10) level = 'Hoch';
  else if (score >= 5) level = 'Mittel';
  else level = 'Niedrig';

  return { score, level };
}

export function formatDateGerman(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * Erzeugt die nächste freie, eindeutige ID für ein Präfix (z. B. "RSK-").
 * Basiert auf der höchsten vorhandenen laufenden Nummer statt auf der
 * Array-Länge, damit nach Löschungen keine doppelten IDs entstehen.
 */
export function nextSequentialId(existingIds: string[], prefix: string, pad = 2): string {
  const max = existingIds.reduce((acc, id) => {
    if (!id.startsWith(prefix)) return acc;
    const n = parseInt(id.slice(prefix.length), 10);
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return `${prefix}${String(max + 1).padStart(pad, '0')}`;
}

/**
 * Maskiert einen Wert für den CSV-Export (RFC 4180) und verhindert
 * CSV-/Formel-Injection in Tabellenkalkulationen (=, +, -, @, Tab, CR).
 */
export function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}
