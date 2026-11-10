import React, { useState } from 'react';
import { Building2, Save, Download, Upload, RotateCcw, CheckCircle2, Shield, Users } from 'lucide-react';
import { ISMSOrganizationContext } from '../types/isms';

interface ScopeViewProps {
  organization: ISMSOrganizationContext;
  onUpdateOrganization: (updates: Partial<ISMSOrganizationContext>) => void;
  onExportJSON: () => void;
  onImportJSON: (jsonStr: string) => { success: boolean; message: string };
  onResetToDemo: () => void;
}

export const ScopeView: React.FC<ScopeViewProps> = ({
  organization,
  onUpdateOrganization,
  onExportJSON,
  onImportJSON,
  onResetToDemo,
}) => {
  const [form, setForm] = useState<ISMSOrganizationContext>(organization);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateOrganization(form);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = onImportJSON(content);
      setImportStatus(res.message);
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>ISO/IEC 27001 Klausel 4 (Kontext der Organisation) & Klausel 5 (Führung)</span>
          <span aria-hidden="true">·</span>
          <span>Stammdaten</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white mt-1">
          Geltungsbereich, Rollen & ISMS-Kontext
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Definition des Schutzbereichs, gesetzlicher Verpflichtungen, interessierter Parteien und Datensicherung.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Scope Form */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Stammdaten & Geltungsbereich (Scope)</h3>
              {saveSuccess && (
                <span className="text-emerald-400 font-medium inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Gespeichert
                </span>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Unternehmensname</label>
              <input
                required
                type="text"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">
                Geltungsbereich des ISMS (Scope Statement nach Klausel 4.3)
              </label>
              <textarea
                rows={3}
                required
                value={form.scopeStatement}
                onChange={(e) => setForm({ ...form, scopeStatement: e.target.value })}
                placeholder="Exakte Beschreibung der Standorte, Abteilungen, Kernprozesse und Cloud-Infrastrukturen..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">CISO / ISMS-Beauftragter</label>
                <input
                  required
                  type="text"
                  value={form.cisoName}
                  onChange={(e) => setForm({ ...form, cisoName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">CISO Kontakt-E-Mail</label>
                <input
                  required
                  type="email"
                  value={form.cisoEmail}
                  onChange={(e) => setForm({ ...form, cisoEmail: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Geplantes Zertifizierungsdatum</label>
                <input
                  type="date"
                  value={form.targetCertificationDate}
                  onChange={(e) => setForm({ ...form, targetCertificationDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Zertifizierungsstandard</label>
                <input
                  type="text"
                  readOnly
                  value="ISO/IEC 27001:2022 & NIS-2"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-slate-400"
                />
              </div>
            </div>

            {/* Stakeholder expectations table */}
            <div className="pt-3 space-y-2">
              <label className="text-slate-400 font-medium block">
                Interessierte Parteien & gesetzliche Anforderungen (Klausel 4.2)
              </label>
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg bg-slate-950/60 overflow-hidden">
                {form.stakeholders.map((s, idx) => (
                  <div key={s.id} className="p-3 space-y-1">
                    <span className="font-semibold text-slate-200">{s.name}</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      <strong className="text-slate-500">Erwartung:</strong> {s.requirement}
                    </p>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      <strong className="text-slate-500">Erfüllung im ISMS:</strong> {s.fulfillment}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg inline-flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-4 h-4" />
                Änderungen speichern
              </button>
            </div>
          </form>
        </div>

        {/* Right Pane: Backup, Restore & Export */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Datenverwaltung & Backup</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Vollständiger Export oder Wiederherstellung des gesamten ISMS.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-2 text-xs">
              <span className="font-semibold text-slate-200 block">Vollständiges Backup (JSON)</span>
              <p className="text-slate-400 leading-relaxed">
                Exportiert alle 93 Controls, Risiken, Assets, Richtlinien, Vorfälle und Audit-Roadmaps in eine sichere JSON-Datei.
              </p>
              <button
                type="button"
                onClick={onExportJSON}
                className="w-full mt-1 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                ISMS-Backup herunterladen
              </button>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-2 text-xs">
              <span className="font-semibold text-slate-200 block">Backup wiederherstellen</span>
              <p className="text-slate-400 leading-relaxed">
                Laden Sie ein zuvor erstelltes ISMS JSON-Backup hoch.
              </p>
              <label className="w-full mt-1 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors inline-flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                JSON-Datei importieren
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {importStatus && <p className="text-[11px] text-blue-400 mt-1">{importStatus}</p>}
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-2 text-xs">
              <span className="font-semibold text-slate-200 block">Auf Demodaten zurücksetzen</span>
              <p className="text-slate-400 leading-relaxed">
                Setzt alle Daten auf den normkonformen ISO 27001 Referenzzustand zurück.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Möchten Sie das ISMS wirklich auf die Standard-Demodaten zurücksetzen?')) {
                    onResetToDemo();
                  }
                }}
                className="w-full mt-1 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Referenzdaten laden
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
