import React, { useState } from 'react';
import { Award, Plus, Sparkles, CheckCircle2, AlertTriangle, HelpCircle, Send, Check } from 'lucide-react';
import { ISMSAudit } from '../types/isms';
import { formatDateGerman } from '../utils/ismsUtils';

interface AuditViewProps {
  audits: ISMSAudit[];
  onAddAudit: (audit: ISMSAudit) => void;
  onUpdateAudit: (id: string, updates: Partial<ISMSAudit>) => void;
}

export const AuditView: React.FC<AuditViewProps> = ({ audits, onAddAudit, onUpdateAudit }) => {
  // AI Audit Simulator State
  const [simulatorTopic, setSimulatorTopic] = useState('Anhang A.8.13 Datensicherung & Ransomware-Schutz');
  const [userAnswer, setUserAnswer] = useState('');
  const [auditConversation, setAuditConversation] = useState<
    { role: 'auditor' | 'user'; text: string }[]
  >([
    {
      role: 'auditor',
      text: 'Guten Tag. Ich bin Ihr Lead Auditor für ISO/IEC 27001:2022. Wir beginnen die Prüfung von Maßnahme A.8.13 (Datensicherung). Wie stellen Sie sicher, dass Ihre Backups im Ernstfall nicht durch Ransomware gelöscht oder verschlüsselt werden können, und wann wurde der letzte vollständige Restore-Test dokumentiert?',
    },
  ]);
  const [isAuditorThinking, setIsAuditorThinking] = useState(false);

  const handleSendToAuditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || isAuditorThinking) return;

    const newHistory = [...auditConversation, { role: 'user' as const, text: userAnswer }];
    setAuditConversation(newHistory);
    setUserAnswer('');
    setIsAuditorThinking(true);

    try {
      const res = await fetch('/api/isms/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'audit_challenge',
          prompt: `Thema: ${simulatorTopic}. Nutzerantwort: ${userAnswer}. Bisheriger Dialog: ${JSON.stringify(
            newHistory.slice(-4)
          )}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAuditConversation((prev) => [...prev, { role: 'auditor', text: data.text }]);
    } catch (e: any) {
      setAuditConversation((prev) => [
        ...prev,
        { role: 'auditor', text: `Fehler: ${e.message || 'Verbindung zum Auditor fehlgeschlagen'}` },
      ]);
    } finally {
      setIsAuditorThinking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>ISO/IEC 27001 Klausel 9.2 (Internes Audit) & 9.3 (Management-Bewertung)</span>
          <span aria-hidden="true">·</span>
          <span>Prüfprogramm</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white mt-1">
          Audit-Management & Zertifizierungs-Roadmap
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Planung interner und externer Audits sowie Vorbereitung auf das ISO 27001 Zertifizierungsaudit.
        </p>
      </div>

      {/* Audit Roadmap Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {audits.map((audit) => {
          const isDone = audit.status === 'Abgeschlossen';
          return (
            <div
              key={audit.id}
              className={`bg-slate-900 border rounded-xl p-5 flex flex-col justify-between transition-colors ${
                isDone ? 'border-emerald-800/60' : 'border-slate-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-400">{audit.id}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                      isDone
                        ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-800/60'
                        : 'text-amber-300 bg-amber-950/60 border border-amber-800/60'
                    }`}
                  >
                    {audit.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">{audit.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{audit.scope}</p>
                </div>

                <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Termin:</span>
                    <strong className="text-slate-200 font-mono tabular-nums">
                      {formatDateGerman(audit.plannedDate)}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Prüfer / Zertifizierer:</span>
                    <span className="text-slate-300 truncate max-w-[150px]">{audit.auditor}</span>
                  </div>
                </div>

                {/* Findings Badge Strip */}
                {isDone && (
                  <div className="flex gap-2 text-[11px] pt-1">
                    <span className="text-emerald-400">
                      ✓ {audit.findingsCount.conformities} Konform
                    </span>
                    <span className="text-amber-400">
                      ! {audit.findingsCount.minorNC} Minor NC
                    </span>
                    <span className="text-slate-400">
                      ℹ {audit.findingsCount.ofi} OFI
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
                {audit.reportNotes}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Lead Auditor Simulator */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-white">
                Interaktiver KI-Auditsimulator (Lead Auditor Interview)
              </h3>
              <p className="text-xs text-slate-400">
                Testen Sie Ihre Vorbereitung auf das Stage 2 Zertifizierungsaudit unter realen Prüfbedingungen.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium">Prüffokus:</label>
            <select
              value={simulatorTopic}
              onChange={(e) => {
                setSimulatorTopic(e.target.value);
                setAuditConversation([
                  {
                    role: 'auditor',
                    text: `Sehr gut, wir wechseln zum Thema: ${e.target.value}. Beschreiben Sie mir bitte die Prozesse und zeigen Sie mir, wie Sie die Einhaltung und Nachweise in der Praxis sicherstellen.`,
                  },
                ]);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="Anhang A.8.13 Datensicherung & Ransomware-Schutz">
                A.8.13 Datensicherung & Ransomware
              </option>
              <option value="Klausel 6.1.2 & 6.1.3 Risikobeurteilung und -behandlung">
                Klausel 6.1 Risikomanagement
              </option>
              <option value="Anhang A.5.15 Zugriffskontrolle & Privileged Access">
                A.5.15 Zugriffskontrolle & PIM
              </option>
              <option value="Anhang A.5.19 & A.5.23 Lieferantensicherheit & Cloud">
                A.5.19 Lieferanten & Cloud-Dienste
              </option>
              <option value="Anhang A.6.3 Sensibilisierung & Phishing-Schulungen">
                A.6.3 Awareness & Schulungsnachweise
              </option>
              <option value="Klausel 9.2 Internes Audit & Management Review">
                Klausel 9.2 Internes Audit & KVP
              </option>
            </select>
          </div>
        </div>

        {/* Chat / Transcript Box */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4 max-h-[420px] overflow-y-auto text-xs">
          {auditConversation.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 leading-relaxed ${
                msg.role === 'auditor' ? 'items-start' : 'items-start flex-row-reverse'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                  msg.role === 'auditor'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}
              >
                {msg.role === 'auditor' ? 'A' : 'Sie'}
              </div>
              <div
                className={`p-3.5 rounded-xl max-w-2xl whitespace-pre-wrap ${
                  msg.role === 'auditor'
                    ? 'bg-slate-900 border border-slate-800 text-slate-200'
                    : 'bg-blue-950/60 border border-blue-900/60 text-blue-100'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isAuditorThinking && (
            <div className="flex gap-3 items-center text-xs text-slate-400">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold">
                A
              </div>
              <span className="italic">Auditor bewertet Ihre Antwort & prüft Evidenzen...</span>
            </div>
          )}
        </div>

        {/* Input box */}
        <form onSubmit={handleSendToAuditor} className="flex gap-2">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Ihre Antwort an den Auditor (z.B.: Wir setzen die 3-2-1-1 Regel mit immutable S3-Backups ein...)"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={isAuditorThinking || !userAnswer.trim()}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-4 h-4" />
            Antworten
          </button>
        </form>
      </div>
    </div>
  );
};
