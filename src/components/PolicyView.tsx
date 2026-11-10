import React, { useState } from 'react';
import { FileText, Plus, Sparkles, Download, Edit3, Check, Trash2, X, Eye, Shield } from 'lucide-react';
import { ISMSPolicy } from '../types/isms';

interface PolicyViewProps {
  policies: ISMSPolicy[];
  onAddPolicy: (policy: ISMSPolicy) => void;
  onUpdatePolicy: (id: string, updates: Partial<ISMSPolicy>) => void;
  onDeletePolicy: (id: string) => void;
}

export const PolicyView: React.FC<PolicyViewProps> = ({
  policies,
  onAddPolicy,
  onUpdatePolicy,
  onDeletePolicy,
}) => {
  const [selectedPolicy, setSelectedPolicy] = useState<ISMSPolicy>(policies[0] || null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);

  // Edit State
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editStatus, setEditStatus] = useState<any>('Gültig');
  const [editVersion, setEditVersion] = useState('1.0');

  // AI Generator State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleStartEdit = (policy: ISMSPolicy) => {
    setSelectedPolicy(policy);
    setEditTitle(policy.title);
    setEditContent(policy.content);
    setEditStatus(policy.status);
    setEditVersion(policy.version);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!selectedPolicy) return;
    onUpdatePolicy(selectedPolicy.id, {
      title: editTitle,
      content: editContent,
      status: editStatus,
      version: editVersion,
    });
    setSelectedPolicy({
      ...selectedPolicy,
      title: editTitle,
      content: editContent,
      status: editStatus,
      version: editVersion,
    });
    setIsEditing(false);
  };

  const handleDownloadMarkdown = (policy: ISMSPolicy) => {
    const blob = new Blob([policy.content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${policy.identifier}_${policy.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateAIPolicy = async () => {
    if (!aiPrompt.trim()) return;
    setIsAILoading(true);
    setAiError(null);

    try {
      const res = await fetch('/api/isms/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_policy',
          prompt: aiPrompt,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Fehler beim Generieren der Richtlinie');
      }

      const newPolicy: ISMSPolicy = {
        id: `POL-${String(policies.length + 1).padStart(2, '0')}`,
        identifier: `POL-${String(policies.length + 1).padStart(2, '0')}`,
        title: aiPrompt,
        category: 'Spezifische Richtlinie',
        status: 'Entwurf',
        version: '1.0',
        owner: 'CISO',
        approvedBy: 'Ausstehend',
        effectiveDate: new Date().toISOString().slice(0, 10),
        reviewCycleMonths: 12,
        content: data.text,
      };

      onAddPolicy(newPolicy);
      setSelectedPolicy(newPolicy);
      setIsAIGeneratorOpen(false);
      setAiPrompt('');
    } catch (e: any) {
      setAiError(e.message || 'Verbindung fehlgeschlagen');
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>ISO/IEC 27001 Klausel 5.2 & Anhang A.5.1</span>
            <span aria-hidden="true">·</span>
            <span>Dokumentierte Information</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Sicherheitsrichtlinien & Leitlinien (Policies)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Verbindliche Vorgaben, Rollenbeschreibungen und Verhaltensregeln für Geschäftsführung und Mitarbeiter.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAIGeneratorOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            Neue Richtlinie mit KI entwerfen
          </button>
        </div>
      </div>

      {/* Main Two-Pane Reader / Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Policies List */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800">
          <div className="p-4 bg-slate-950/60 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Verfügbare Richtlinien ({policies.length})
            </span>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-[600px] overflow-y-auto">
            {policies.map((policy) => {
              const isSelected = selectedPolicy?.id === policy.id;
              return (
                <div
                  key={policy.id}
                  onClick={() => {
                    setSelectedPolicy(policy);
                    setIsEditing(false);
                  }}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-950/40 border-l-2 border-blue-500' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-blue-400 font-semibold">
                      {policy.identifier}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                        policy.status === 'Gültig'
                          ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-800/60'
                          : 'text-amber-300 bg-amber-950/60 border border-amber-800/60'
                      }`}
                    >
                      {policy.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-medium text-slate-200 line-clamp-2">
                    {policy.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2">
                    <span>v{policy.version}</span>
                    <span aria-hidden="true">·</span>
                    <span>{policy.category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Policy Content View & Edit */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          {selectedPolicy ? (
            <div className="space-y-6">
              {/* Policy Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-mono font-bold text-blue-400">{selectedPolicy.identifier}</span>
                    <span aria-hidden="true">·</span>
                    <span>Version {selectedPolicy.version}</span>
                    <span aria-hidden="true">·</span>
                    <span>Freigegeben von: {selectedPolicy.approvedBy}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{selectedPolicy.title}</h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDownloadMarkdown(selectedPolicy)}
                    className="p-2 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
                    title="Als Markdown herunterladen"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {isEditing ? (
                    <button
                      onClick={handleSaveEdit}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Speichern
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(selectedPolicy)}
                      className="px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Bearbeiten
                    </button>
                  )}
                </div>
              </div>

              {/* Policy Body */}
              {isEditing ? (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-medium">Titel</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 font-medium">Version</label>
                      <input
                        type="text"
                        value={editVersion}
                        onChange={(e) => setEditVersion(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">Richtlinientext (Markdown)</label>
                    <textarea
                      rows={18}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-6 text-slate-300 text-xs leading-relaxed max-h-[550px] overflow-y-auto whitespace-pre-wrap font-sans">
                  {selectedPolicy.content}
                </div>
              )}

              {/* Meta details footer */}
              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Inkrafttreten: {selectedPolicy.effectiveDate}</span>
                <span>Überprüfungszyklus: alle {selectedPolicy.reviewCycleMonths} Monate</span>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              <p>Wählen Sie eine Richtlinie aus der linken Spalte aus.</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Policy Generator Modal */}
      {isAIGeneratorOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">KI-Richtlinien-Generator</h3>
              </div>
              <button
                onClick={() => setIsAIGeneratorOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Nennen Sie das gewünschte Thema oder den Anwendungsbereich. Die KI formuliert eine
              vollständige, prüfungskonforme ISO 27001 Richtlinie mit Geltungsbereich,
              Sicherheitsanforderungen und Sanktionen.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Thema der neuen Richtlinie</label>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="z.B. Richtlinie für Künstliche Intelligenz (AI / LLM Acceptable Use Policy)"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            {aiError && <p className="text-xs text-rose-400">{aiError}</p>}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAIGeneratorOpen(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleGenerateAIPolicy}
                disabled={isAILoading || !aiPrompt.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg inline-flex items-center gap-2"
              >
                {isAILoading ? <span>Formuliere Richtlinie...</span> : 'Richtlinie generieren'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
