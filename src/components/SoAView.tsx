import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Edit3,
  CheckCircle2,
  Clock,
  Circle,
  XCircle,
  Sparkles,
  ChevronRight,
  X,
  FileCheck,
} from 'lucide-react';
import { ISMSControl, ImplementationStatus, MaturityLevel } from '../types/isms';
import { getStatusColorClass } from '../utils/ismsUtils';

interface SoAViewProps {
  controls: ISMSControl[];
  onUpdateControl: (id: string, updates: Partial<ISMSControl>) => void;
  onExportCsv: () => void;
}

export const SoAView: React.FC<SoAViewProps> = ({ controls, onUpdateControl, onExportCsv }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeControl, setActiveControl] = useState<ISMSControl | null>(null);

  // AI Justification State
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const filteredControls = useMemo(() => {
    return controls.filter((c) => {
      // Theme filter
      if (selectedTheme !== 'all') {
        if (!c.theme.startsWith(selectedTheme)) return false;
      }

      // Status filter
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'applicable' && !c.applicable) return false;
        if (selectedStatus === 'not_applicable' && c.applicable) return false;
        if (['implemented', 'in_progress', 'planned'].includes(selectedStatus)) {
          if (c.implementationStatus !== selectedStatus) return false;
        }
      }

      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchId = c.id.toLowerCase().includes(query);
        const matchTitle = c.title.toLowerCase().includes(query);
        const matchDesc = c.description.toLowerCase().includes(query);
        const matchOwner = (c.owner || '').toLowerCase().includes(query);
        const matchGuidance = (c.guidance || '').toLowerCase().includes(query);
        return matchId || matchTitle || matchDesc || matchOwner || matchGuidance;
      }

      return true;
    });
  }, [controls, selectedTheme, selectedStatus, searchQuery]);

  // Handler for AI generation of SoA justification
  const handleGenerateAIJustification = async (control: ISMSControl) => {
    setIsGeneratingAI(true);
    setAiError(null);
    try {
      const res = await fetch('/api/isms/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'soa_justification',
          prompt: `Maßnahme: ${control.id} - ${control.title} (${control.theme}). Beschreibung: ${control.description}. Aktueller Status: ${control.implementationStatus}, Anwendbar: ${control.applicable}.`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Fehler bei der KI-Generierung');
      }

      const generated = data.text;
      onUpdateControl(control.id, {
        justification: generated,
      });

      setActiveControl((prev) => (prev ? { ...prev, justification: generated } : null));
    } catch (e: any) {
      setAiError(e.message || 'Verbindung fehlgeschlagen');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>ISO/IEC 27001:2022</span>
            <span aria-hidden="true">·</span>
            <span>Anhang A Maßnahmen</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-slate-300">{controls.length} Maßnahmen erfasst</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Statement of Applicability (SoA)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Zentrales Verzeichnis der Anwendbarkeit, Begründung und Umsetzungsnachweise aller 93 Controls.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onExportCsv}
            className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-400" />
            SoA als CSV exportieren
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Suchen nach Control ID (z.B. A.8.13), Titel, Beschreibung oder Verantwortlichem..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Theme Filters (Segmented Controls) */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg overflow-x-auto">
            {[
              { id: 'all', label: 'Alle Themen' },
              { id: 'A.5', label: 'A.5 Org.' },
              { id: 'A.6', label: 'A.6 Personal' },
              { id: 'A.7', label: 'A.7 Physisch' },
              { id: 'A.8', label: 'A.8 Tech.' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTheme(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  selectedTheme === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status Select */}
          <div className="shrink-0">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter nach Umsetzungsstatus"
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Alle Status</option>
              <option value="implemented">Nur Umgesetzt</option>
              <option value="in_progress">Nur In Umsetzung</option>
              <option value="planned">Nur Geplant</option>
              <option value="not_applicable">Nur Nicht anwendbar</option>
            </select>
          </div>
        </div>

        {/* Quick Result Summary */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
          <span>
            Gefiltert: <strong className="text-slate-200 font-mono tabular-nums">{filteredControls.length}</strong> von{' '}
            <span className="font-mono tabular-nums">{controls.length}</span> Maßnahmen
          </span>
          <span className="text-[11px] text-slate-500">
            Klicken Sie auf eine Zeile für Bearbeitung & Nachweisdokumentation
          </span>
        </div>
      </div>

      {/* High Density Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4 w-20">ID</th>
                <th className="py-3 px-4">Maßnahme & Sicherheitsattribute</th>
                <th className="py-3 px-4 w-28">Anwendbar</th>
                <th className="py-3 px-4 w-36">Status</th>
                <th className="py-3 px-4 w-24 text-center">Reifegrad</th>
                <th className="py-3 px-4 w-32">Verantwortlich</th>
                <th className="py-3 px-4 w-16 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredControls.map((control) => {
                const statusMeta = getStatusColorClass(control.implementationStatus);
                return (
                  <tr
                    key={control.id}
                    onClick={() => setActiveControl(control)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    {/* Control ID */}
                    <td className="py-3 px-4 font-mono font-semibold text-blue-400 whitespace-nowrap">
                      {control.id}
                    </td>

                    {/* Title & Description */}
                    <td className="py-3 px-4 max-w-md">
                      <div className="font-medium text-slate-200 group-hover:text-white transition-colors">
                        {control.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {control.description}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500">
                        <span>{control.theme}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-slate-400">
                          {control.securityProperties.join('/')}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{control.controlType}</span>
                      </div>
                    </td>

                    {/* Applicable Switch */}
                    <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() =>
                          onUpdateControl(control.id, {
                            applicable: !control.applicable,
                            implementationStatus: !control.applicable ? 'in_progress' : 'not_applicable',
                          })
                        }
                        className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
                          control.applicable
                            ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-800/60'
                            : 'text-slate-400 bg-slate-800/60 border border-slate-700/60'
                        }`}
                      >
                        {control.applicable ? 'Ja' : 'Ausgeschlossen'}
                      </button>
                    </td>

                    {/* Implementation Status */}
                    <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={control.implementationStatus}
                        onChange={(e) =>
                          onUpdateControl(control.id, {
                            implementationStatus: e.target.value as ImplementationStatus,
                          })
                        }
                        aria-label={`Status für ${control.id}`}
                        className={`text-xs px-2 py-1 rounded border bg-slate-950 ${statusMeta.text} border-slate-700 focus:outline-none focus:border-blue-500`}
                      >
                        <option value="implemented">Umgesetzt</option>
                        <option value="in_progress">In Umsetzung</option>
                        <option value="planned">Geplant</option>
                        <option value="not_applicable">Nicht anwendbar</option>
                      </select>
                    </td>

                    {/* Maturity Level */}
                    <td className="py-3 px-4 text-center font-mono tabular-nums">
                      <span className="font-semibold text-slate-300">
                        {control.maturityLevel}
                      </span>
                      <span className="text-slate-500">/5</span>
                    </td>

                    {/* Owner */}
                    <td className="py-3 px-4 text-slate-400 text-xs truncate max-w-[140px]">
                      {control.owner || '-'}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 inline-block transition-colors" />
                    </td>
                  </tr>
                );
              })}

              {filteredControls.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="text-sm">Keine passenden Maßnahmen für diesen Filter gefunden.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedTheme('all');
                        setSelectedStatus('all');
                      }}
                      className="mt-2 text-xs text-blue-400 hover:underline"
                    >
                      Filter zurücksetzen
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over / Modal for Editing Control Detail & Evidence */}
      {activeControl && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end transition-opacity">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-xl h-full flex flex-col shadow-2xl overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/60 sticky top-0 z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-blue-400 text-sm">
                    {activeControl.id}
                  </span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-slate-400">{activeControl.theme}</span>
                </div>
                <h3 className="text-base font-bold text-white">{activeControl.title}</h3>
              </div>
              <button
                onClick={() => setActiveControl(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 flex-1 text-xs">
              {/* Official ISO Description & Guidance */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Normanforderung nach ISO/IEC 27001:2022
                </span>
                <p className="text-slate-300 leading-relaxed">{activeControl.description}</p>
                {activeControl.guidance && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400 font-medium">Praxisempfehlung: </span>
                    <span className="text-slate-300">{activeControl.guidance}</span>
                  </div>
                )}
              </div>

              {/* Status & Maturity Form */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-medium">Anwendbarkeit</label>
                  <select
                    value={activeControl.applicable ? 'yes' : 'no'}
                    onChange={(e) => {
                      const isApp = e.target.value === 'yes';
                      const updated = {
                        ...activeControl,
                        applicable: isApp,
                        implementationStatus: isApp ? activeControl.implementationStatus : 'not_applicable',
                      };
                      setActiveControl(updated);
                      onUpdateControl(activeControl.id, { applicable: isApp });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="yes">Anwendbar (Im Scope)</option>
                    <option value="no">Nicht anwendbar (Ausgeschlossen)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-medium">Umsetzungsstatus</label>
                  <select
                    value={activeControl.implementationStatus}
                    onChange={(e) => {
                      const status = e.target.value as ImplementationStatus;
                      setActiveControl({ ...activeControl, implementationStatus: status });
                      onUpdateControl(activeControl.id, { implementationStatus: status });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="implemented">Umgesetzt (Implemented)</option>
                    <option value="in_progress">In Umsetzung (In Progress)</option>
                    <option value="planned">Geplant (Planned)</option>
                    <option value="not_applicable">Nicht anwendbar</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-medium">Reifegrad (CMMI 0-5)</label>
                  <select
                    value={activeControl.maturityLevel}
                    onChange={(e) => {
                      const lvl = parseInt(e.target.value, 10) as MaturityLevel;
                      setActiveControl({ ...activeControl, maturityLevel: lvl });
                      onUpdateControl(activeControl.id, { maturityLevel: lvl });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value="0">0 - Nicht vorhanden</option>
                    <option value="1">1 - Initial / Ad-hoc</option>
                    <option value="2">2 - Wiederholbar</option>
                    <option value="3">3 - Definiert & Dokumentiert</option>
                    <option value="4">4 - Gesteuert & Gemessen</option>
                    <option value="5">5 - Kontinuierlich optimierend</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-medium">Verantwortlicher (Owner)</label>
                  <input
                    type="text"
                    value={activeControl.owner}
                    onChange={(e) => {
                      setActiveControl({ ...activeControl, owner: e.target.value });
                      onUpdateControl(activeControl.id, { owner: e.target.value });
                    }}
                    placeholder="z.B. CISO, IT-Leitung, HR"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                  </input>
                </div>
              </div>

              {/* Justification with AI Button */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-400 font-medium">
                    Begründung für Ein- oder Ausschluss (SoA Justification)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleGenerateAIJustification(activeControl)}
                    disabled={isGeneratingAI}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                    {isGeneratingAI ? 'Generiere...' : 'KI-Begründung vorschlagen'}
                  </button>
                </div>
                {aiError && <p className="text-[11px] text-rose-400">{aiError}</p>}
                <textarea
                  rows={3}
                  value={activeControl.justification}
                  onChange={(e) => {
                    setActiveControl({ ...activeControl, justification: e.target.value });
                    onUpdateControl(activeControl.id, { justification: e.target.value });
                  }}
                  placeholder="Begründen Sie, warum diese Maßnahme anwendbar oder ausgeschlossen ist (Auditanforderung!)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
                />
              </div>

              {/* Evidence & Audit Notes */}
              <div className="space-y-2">
                <label className="text-slate-400 font-medium flex items-center justify-between">
                  <span>Nachweise & Evidenzen für den Auditor (Evidences)</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Zuletzt geprüft: {activeControl.lastReviewedAt}
                  </span>
                </label>
                <textarea
                  rows={4}
                  value={activeControl.evidenceNotes}
                  onChange={(e) => {
                    setActiveControl({ ...activeControl, evidenceNotes: e.target.value });
                    onUpdateControl(activeControl.id, { evidenceNotes: e.target.value });
                  }}
                  placeholder="Verweise auf Richtlinien, Screenshots, Ticket-IDs, Konfigurationsberichte oder Prüfprotokolle..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed font-mono text-xs"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Änderungen werden sofort gespeichert.</span>
              <button
                onClick={() => setActiveControl(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
              >
                Fertigstellen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
