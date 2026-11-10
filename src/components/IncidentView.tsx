import React, { useState } from 'react';
import { AlertCircle, Plus, Search, ShieldAlert, CheckCircle2, Clock, X, AlertTriangle, FileWarning } from 'lucide-react';
import { ISMSIncident } from '../types/isms';
import { nextSequentialId } from '../utils/ismsUtils';

interface IncidentViewProps {
  incidents: ISMSIncident[];
  onAddIncident: (incident: ISMSIncident) => void;
  onUpdateIncident: (id: string, updates: Partial<ISMSIncident>) => void;
  onDeleteIncident: (id: string) => void;
}

export const IncidentView: React.FC<IncidentViewProps> = ({
  incidents,
  onAddIncident,
  onUpdateIncident,
  onDeleteIncident,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<ISMSIncident | null>(null);

  const [formState, setFormState] = useState<{
    title: string;
    detectedAt: string;
    reportedBy: string;
    severity: 'Niedrig' | 'Mittel' | 'Hoch' | 'Kritisch';
    status: 'Offen' | 'In Untersuchung' | 'Eingedämmt' | 'Behoben' | 'Geschlossen';
    gdprRelevant: boolean;
    affectedAssets: string;
    description: string;
    immediateAction: string;
    rootCause: string;
    correctiveAction: string;
  }>({
    title: '',
    detectedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    reportedBy: '',
    severity: 'Mittel',
    status: 'Offen',
    gdprRelevant: false,
    affectedAssets: '',
    description: '',
    immediateAction: '',
    rootCause: '',
    correctiveAction: '',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newInc: ISMSIncident = {
      id: nextSequentialId(incidents.map((i) => i.id), `INC-${new Date().getFullYear()}-`, 3),
      ...formState,
    };
    onAddIncident(newInc);
    setIsAdding(false);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'Kritisch':
        return 'text-rose-300 bg-rose-950/60 border border-rose-800/60';
      case 'Hoch':
        return 'text-amber-300 bg-amber-950/60 border border-amber-800/60';
      case 'Mittel':
        return 'text-yellow-300 bg-yellow-950/60 border border-yellow-800/60';
      default:
        return 'text-emerald-300 bg-emerald-950/60 border border-emerald-800/60';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>ISO/IEC 27001 Anhang A.5.24 - A.5.28 & DSGVO Art. 33</span>
            <span aria-hidden="true">·</span>
            <span>Incident Response</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Sicherheitsvorfälle & Incident Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Meldung, Triage, Sofortmaßnahmen, Ursachenanalyse und Einhaltung der gesetzlichen 72h-Meldepflicht.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shadow-sm self-start sm:self-auto"
        >
          <AlertCircle className="w-4 h-4" />
          Sicherheitsvorfall melden
        </button>
      </div>

      {/* 72h GDPR Notice Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
        <FileWarning className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-semibold text-slate-200">
            Gesetzliche Meldepflicht bei Datenschutzverletzungen (Art. 33 DSGVO / NIS-2)
          </span>
          <p className="text-slate-400 leading-relaxed">
            Führt ein Sicherheitsvorfall zur Verletzung des Schutzes personenbezogener Daten mit voraussichtlichem Risiko für Betroffene, muss die Meldung an die zuständige Aufsichtsbehörde <strong>binnen maximal 72 Stunden</strong> nach Bekanntwerden erfolgen.
          </p>
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-4">
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-blue-400">{incident.id}</span>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${getSeverityBadge(incident.severity)}`}>
                  {incident.severity}
                </span>
                <span className="text-xs font-medium text-slate-300">{incident.status}</span>
                {incident.gdprRelevant && (
                  <span className="text-[10px] text-rose-300 font-semibold px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800">
                    DSGVO Art. 33 Relevant (72h)
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 font-mono tabular-nums">
                Erkannt: {incident.detectedAt}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">{incident.title}</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{incident.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Sofortmaßnahme (Containment)
                </span>
                <p className="text-slate-300">{incident.immediateAction || '-'}</p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Ursachenanalyse (Root Cause)
                </span>
                <p className="text-slate-300">{incident.rootCause || '-'}</p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Korrekturmaßnahme (CAPA / Lessons Learned)
                </span>
                <p className="text-slate-300">{incident.correctiveAction || '-'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
              <span>Gemeldet von: <strong className="text-slate-400 font-normal">{incident.reportedBy}</strong></span>
              <span>Betroffene Systeme: <strong className="text-slate-400 font-normal">{incident.affectedAssets}</strong></span>
            </div>
          </div>
        ))}

        {incidents.length === 0 && (
          <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
            <p>Keine aktiven oder vergangenen Sicherheitsvorfälle verzeichnet.</p>
          </div>
        )}
      </div>

      {/* Add Incident Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Sicherheitsvorfall erfassen</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Titel des Vorfalls</label>
                <input
                  required
                  type="text"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  placeholder="z.B. Verdacht auf unberechtigten Datenzugriff über kompromittierten API-Key"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Schweregrad (Severity)</label>
                  <select
                    value={formState.severity}
                    onChange={(e) => setFormState({ ...formState, severity: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                  >
                    <option value="Niedrig">Niedrig (P4)</option>
                    <option value="Mittel">Mittel (P3)</option>
                    <option value="Hoch">Hoch (P2)</option>
                    <option value="Kritisch">Kritisch (P1 - Krisenstab)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Gemeldet von</label>
                  <input
                    required
                    type="text"
                    value={formState.reportedBy}
                    onChange={(e) => setFormState({ ...formState, reportedBy: e.target.value })}
                    placeholder="z.B. SOC / SecOps Lead"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <input
                  type="checkbox"
                  id="gdpr"
                  checked={formState.gdprRelevant}
                  onChange={(e) => setFormState({ ...formState, gdprRelevant: e.target.checked })}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <label htmlFor="gdpr" className="text-slate-300 font-medium cursor-pointer">
                  Potenzielle Datenschutzverletzung (DSGVO 72h-Prüfung erforderlich)
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Beschreibung des Vorfalls</label>
                <textarea
                  rows={2}
                  required
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder="Was ist genau passiert? Welche Indikatoren (IoCs) liegen vor?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Sofortmaßnahme (Containment)</label>
                <textarea
                  rows={2}
                  value={formState.immediateAction}
                  onChange={(e) => setFormState({ ...formState, immediateAction: e.target.value })}
                  placeholder="z.B. API-Key widerrufen, betroffenen Host isoliert..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg"
                >
                  Vorfall erfassen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
