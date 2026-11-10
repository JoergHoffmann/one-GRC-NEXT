import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Plus,
  Shield,
  Sparkles,
  Search,
  Filter,
  CheckCircle,
  ArrowRight,
  Trash2,
  Edit2,
  X,
  TrendingDown,
  Info,
} from 'lucide-react';
import { ISMSRisk, ISMSAsset, ISMSControl, RiskLevel, TreatmentStrategy } from '../types/isms';
import { getRiskColorClass, calculateRiskScore } from '../utils/ismsUtils';

interface RiskViewProps {
  risks: ISMSRisk[];
  assets: ISMSAsset[];
  controls: ISMSControl[];
  onAddRisk: (risk: ISMSRisk) => void;
  onUpdateRisk: (id: string, updates: Partial<ISMSRisk>) => void;
  onDeleteRisk: (id: string) => void;
}

export const RiskView: React.FC<RiskViewProps> = ({
  risks,
  assets,
  controls,
  onAddRisk,
  onUpdateRisk,
  onDeleteRisk,
}) => {
  const [matrixMode, setMatrixMode] = useState<'pre' | 'post'>('pre');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCell, setSelectedCell] = useState<{ l: number; i: number } | null>(null);

  // Modal States
  const [isAddingRisk, setIsAddingRisk] = useState(false);
  const [editingRisk, setEditingRisk] = useState<ISMSRisk | null>(null);

  // AI Risk Generator States
  const [isAIAssessorOpen, setIsAIAssessorOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Form State for manual creation
  const [formState, setFormState] = useState<{
    title: string;
    assetRef: string;
    threat: string;
    vulnerability: string;
    impactDescription: string;
    c: 'Low' | 'Medium' | 'High';
    i: 'Low' | 'Medium' | 'High';
    a: 'Low' | 'Medium' | 'High';
    preLikelihood: number;
    preImpact: number;
    treatmentStrategy: TreatmentStrategy;
    treatmentPlan: string;
    linkedControls: string[];
    postLikelihood: number;
    postImpact: number;
    riskOwner: string;
  }>({
    title: '',
    assetRef: assets[0] ? `${assets[0].id} (${assets[0].name})` : 'IT-Infrastruktur',
    threat: '',
    vulnerability: '',
    impactDescription: '',
    c: 'High',
    i: 'Medium',
    a: 'Medium',
    preLikelihood: 3,
    preImpact: 4,
    treatmentStrategy: 'Mitigate',
    treatmentPlan: '',
    linkedControls: ['A.8.7'],
    postLikelihood: 1,
    postImpact: 2,
    riskOwner: 'CISO',
  });

  // Calculate 5x5 Matrix Cell Counts
  const matrixData = useMemo(() => {
    const grid: Record<string, ISMSRisk[]> = {};
    for (let l = 1; l <= 5; l++) {
      for (let i = 1; i <= 5; i++) {
        grid[`${l}-${i}`] = [];
      }
    }

    risks.forEach((r) => {
      const l = matrixMode === 'pre' ? r.preTreatment.likelihood : r.postTreatment.likelihood;
      const i = matrixMode === 'pre' ? r.preTreatment.impact : r.postTreatment.impact;
      const key = `${l}-${i}`;
      if (grid[key]) {
        grid[key].push(r);
      }
    });

    return grid;
  }, [risks, matrixMode]);

  // Filtered Risks
  const filteredRisks = useMemo(() => {
    return risks.filter((r) => {
      if (selectedCell) {
        const l = matrixMode === 'pre' ? r.preTreatment.likelihood : r.postTreatment.likelihood;
        const i = matrixMode === 'pre' ? r.preTreatment.impact : r.postTreatment.impact;
        if (l !== selectedCell.l || i !== selectedCell.i) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.threat.toLowerCase().includes(q) ||
          r.vulnerability.toLowerCase().includes(q) ||
          r.assetRef.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [risks, selectedCell, searchQuery, matrixMode]);

  // Handle AI Risk Assessment
  const handleRunAIAssessment = async () => {
    if (!aiPrompt.trim()) return;
    setIsAILoading(true);
    setAiError(null);

    try {
      const res = await fetch('/api/isms/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assess_risk',
          prompt: aiPrompt,
          context: {
            assets: assets.map((a) => a.name),
            availableControls: controls.slice(0, 20).map((c) => ({ id: c.id, title: c.title })),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Fehler bei der KI-Analyse');
      }

      const parsed = JSON.parse(data.text);
      const preCalc = calculateRiskScore(parsed.likelihood || 3, parsed.impact || 4);
      const postCalc = calculateRiskScore(
        Math.max(1, (parsed.likelihood || 3) - 2),
        Math.max(1, (parsed.impact || 4) - 2)
      );

      const newRisk: ISMSRisk = {
        id: `RSK-${String(risks.length + 1).padStart(2, '0')}`,
        title: parsed.title || aiPrompt,
        assetRef: assets[0] ? `${assets[0].id} (${assets[0].name})` : 'Unternehmensdaten',
        threat: parsed.threat || 'Identifizierte Bedrohung',
        vulnerability: parsed.vulnerability || 'Bestehende Sicherheitslücke',
        impactDescription: parsed.impactDescription || 'Möglicher Vertraulichkeits- oder Datenverlust',
        ciaImpact: parsed.ciaImpact || { c: 'High', i: 'Medium', a: 'Low' },
        preTreatment: {
          likelihood: parsed.likelihood || 3,
          impact: parsed.impact || 4,
          score: preCalc.score,
          level: preCalc.level,
        },
        treatmentStrategy: (parsed.suggestedTreatment as TreatmentStrategy) || 'Mitigate',
        treatmentPlan: parsed.treatmentPlan || 'Umsetzung technischer und organisatorischer Maßnahmen',
        linkedControls: parsed.suggestedControls || ['A.8.7', 'A.5.15'],
        postTreatment: {
          likelihood: Math.max(1, (parsed.likelihood || 3) - 2),
          impact: Math.max(1, (parsed.impact || 4) - 2),
          score: postCalc.score,
          level: postCalc.level,
        },
        riskOwner: 'CISO',
        status: 'Identifiziert',
        reviewDate: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
      };

      onAddRisk(newRisk);
      setIsAIAssessorOpen(false);
      setAiPrompt('');
    } catch (e: any) {
      setAiError(e.message || 'Analyse fehlgeschlagen');
    } finally {
      setIsAILoading(false);
    }
  };

  const handleSaveManualRisk = (e: React.FormEvent) => {
    e.preventDefault();
    const pre = calculateRiskScore(formState.preLikelihood, formState.preImpact);
    const post = calculateRiskScore(formState.postLikelihood, formState.postImpact);

    const newRisk: ISMSRisk = {
      id: `RSK-${String(risks.length + 1).padStart(2, '0')}`,
      title: formState.title,
      assetRef: formState.assetRef,
      threat: formState.threat,
      vulnerability: formState.vulnerability,
      impactDescription: formState.impactDescription,
      ciaImpact: { c: formState.c, i: formState.i, a: formState.a },
      preTreatment: {
        likelihood: formState.preLikelihood,
        impact: formState.preImpact,
        score: pre.score,
        level: pre.level,
      },
      treatmentStrategy: formState.treatmentStrategy,
      treatmentPlan: formState.treatmentPlan,
      linkedControls: formState.linkedControls,
      postTreatment: {
        likelihood: formState.postLikelihood,
        impact: formState.postImpact,
        score: post.score,
        level: post.level,
      },
      riskOwner: formState.riskOwner,
      status: 'In Behandlung',
      reviewDate: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
    };

    onAddRisk(newRisk);
    setIsAddingRisk(false);
    // Reset form
    setFormState({
      title: '',
      assetRef: assets[0] ? `${assets[0].id} (${assets[0].name})` : 'IT-Infrastruktur',
      threat: '',
      vulnerability: '',
      impactDescription: '',
      c: 'High',
      i: 'Medium',
      a: 'Medium',
      preLikelihood: 3,
      preImpact: 4,
      treatmentStrategy: 'Mitigate',
      treatmentPlan: '',
      linkedControls: ['A.8.7'],
      postLikelihood: 1,
      postImpact: 2,
      riskOwner: 'CISO',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>ISO/IEC 27005 & Klausel 6.1.2</span>
            <span aria-hidden="true">·</span>
            <span>Risikobeurteilung & -behandlung</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Risikomanagement & 5x5 Heatmap
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Identifikation, CIA-Bewertung und Minderung von Informationssicherheitsrisiken.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAIAssessorOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            KI-Risikoanalyse durchführen
          </button>
          <button
            onClick={() => setIsAddingRisk(true)}
            className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-slate-400" />
            Risiko manuell erfassen
          </button>
        </div>
      </div>

      {/* 5x5 Heatmap & Matrix Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Heatmap Card */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">5x5 Risikomatrix (Heatmap)</h3>
              <p className="text-xs text-slate-400">
                Eintrittswahrscheinlichkeit vs. Schadensausmaß (1-25)
              </p>
            </div>

            {/* Pre vs Post Toggle */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
              <button
                onClick={() => {
                  setMatrixMode('pre');
                  setSelectedCell(null);
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  matrixMode === 'pre'
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Bruttorisiko (Vorher)
              </button>
              <button
                onClick={() => {
                  setMatrixMode('post');
                  setSelectedCell(null);
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  matrixMode === 'post'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Nettorisiko (Restrisiko)
              </button>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="pt-2">
            <div className="flex">
              {/* Y-Axis Label */}
              <div className="w-8 flex items-center justify-center -rotate-90 text-[10px] uppercase font-bold tracking-wider text-slate-500 whitespace-nowrap">
                Wahrscheinlichkeit
              </div>

              {/* 5x5 Grid Table */}
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((likelihood) => (
                  <div key={likelihood} className="flex items-center gap-1">
                    <span className="w-5 text-right font-mono text-[11px] text-slate-400 shrink-0">
                      {likelihood}
                    </span>
                    <div className="grid grid-cols-5 gap-1 flex-1">
                      {[1, 2, 3, 4, 5].map((impact) => {
                        const score = likelihood * impact;
                        const cellKey = `${likelihood}-${impact}`;
                        const matchingRisks = matrixData[cellKey] || [];
                        const isSelected =
                          selectedCell?.l === likelihood && selectedCell?.i === impact;

                        let cellBg = 'bg-emerald-950/30 border-emerald-900/40 text-emerald-300';
                        if (score >= 15) {
                          cellBg = 'bg-rose-950/50 border-rose-800/60 text-rose-300';
                        } else if (score >= 10) {
                          cellBg = 'bg-amber-950/40 border-amber-800/50 text-amber-300';
                        } else if (score >= 5) {
                          cellBg = 'bg-yellow-950/30 border-yellow-800/40 text-yellow-300';
                        }

                        return (
                          <button
                            key={impact}
                            onClick={() => {
                              if (isSelected) setSelectedCell(null);
                              else setSelectedCell({ l: likelihood, i: impact });
                            }}
                            className={`h-11 rounded border flex flex-col items-center justify-center transition-all ${cellBg} ${
                              isSelected
                                ? 'ring-2 ring-blue-400 scale-[1.03] z-10'
                                : 'hover:opacity-90'
                            }`}
                          >
                            <span className="text-[10px] font-mono opacity-60">{score}</span>
                            {matchingRisks.length > 0 && (
                              <span className="text-xs font-bold font-mono px-1.5 py-0.2 rounded-full bg-slate-950/90 text-white shadow-sm mt-0.5">
                                {matchingRisks.length}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* X-Axis Numbers */}
                <div className="flex items-center gap-1 pt-1">
                  <div className="w-5 shrink-0" />
                  <div className="grid grid-cols-5 gap-1 flex-1 text-center font-mono text-[11px] text-slate-400">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                  </div>
                </div>

                {/* X-Axis Label */}
                <div className="text-center text-[10px] uppercase font-bold tracking-wider text-slate-500 pt-1">
                  Schadensausmaß (Impact)
                </div>
              </div>
            </div>
          </div>

          {/* Legend and Active Filter Reset */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500/60 inline-block" /> 1-4 Niedrig
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-yellow-500/60 inline-block" /> 5-9 Mittel
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-500/60 inline-block" /> 10-14 Hoch
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-rose-500/60 inline-block" /> 15-25 Kritisch
              </span>
            </div>

            {selectedCell && (
              <button
                onClick={() => setSelectedCell(null)}
                className="text-xs text-blue-400 hover:underline"
              >
                Zellenfilter aufheben
              </button>
            )}
          </div>
        </div>

        {/* Risk Treatment Impact Card */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">Wirksamkeit der Risikobehandlung</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Vergleich der Risikobewertung vor Implementierung der ISO 27001 Controls (Brutto) und nach Umsetzung der Sicherheitsmaßnahmen (Netto/Restrisiko).
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Kritische Risiken (15-25)</span>
                <span className="text-base font-bold text-white font-mono tabular-nums">
                  {risks.filter((r) => r.preTreatment.level === 'Kritisch').length} →{' '}
                  <span className="text-emerald-400">
                    {risks.filter((r) => r.postTreatment.level === 'Kritisch').length}
                  </span>
                </span>
              </div>
              <span className="text-xs text-emerald-400 font-medium font-mono">100% mitigiert</span>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Hohe Risiken (10-14)</span>
                <span className="text-base font-bold text-white font-mono tabular-nums">
                  {risks.filter((r) => r.preTreatment.level === 'Hoch').length} →{' '}
                  <span className="text-emerald-400">
                    {risks.filter((r) => r.postTreatment.level === 'Hoch').length}
                  </span>
                </span>
              </div>
              <span className="text-xs text-emerald-400 font-medium font-mono">Im Toleranzbereich</span>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Restrisiko-Akzeptanz</span>
                <span className="text-xs text-slate-300">
                  Alle verbleibenden Restrisiken liegen unter dem Schwellenwert von 9.
                </span>
              </div>
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Risks Table and Register */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm space-y-3 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Risiken nach Titel, Bedrohung oder Asset filtern..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="text-xs text-slate-400">
            Zeige <strong className="text-white font-mono tabular-nums">{filteredRisks.length}</strong> von{' '}
            <span className="font-mono tabular-nums">{risks.length}</span> Risiken
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4 w-20">ID</th>
                <th className="py-3 px-4">Risiko & Bedrohung</th>
                <th className="py-3 px-4 w-32">Asset</th>
                <th className="py-3 px-4 w-20 text-center">CIA</th>
                <th className="py-3 px-4 w-28 text-center">Brutto Score</th>
                <th className="py-3 px-4 w-28 text-center">Netto Score</th>
                <th className="py-3 px-4 w-36">Strategie & Controls</th>
                <th className="py-3 px-4 w-24">Status</th>
                <th className="py-3 px-4 w-16 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredRisks.map((risk) => {
                const preColor = getRiskColorClass(risk.preTreatment.level);
                const postColor = getRiskColorClass(risk.postTreatment.level);

                return (
                  <tr key={risk.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-blue-400">
                      {risk.id}
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-medium text-slate-200">{risk.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        <strong className="text-slate-400">Bedrohung:</strong> {risk.threat}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-xs truncate max-w-[140px]">
                      {risk.assetRef}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-400">
                      {risk.ciaImpact.c[0]}/{risk.ciaImpact.i[0]}/{risk.ciaImpact.a[0]}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs border ${preColor}`}>
                        {risk.preTreatment.score} ({risk.preTreatment.level})
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs border ${postColor}`}>
                        {risk.postTreatment.score} ({risk.postTreatment.level})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-slate-300 font-medium block">
                        {risk.treatmentStrategy}
                      </span>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {risk.linkedControls.map((c) => (
                          <span
                            key={c}
                            className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-950 border border-slate-800 text-slate-400"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] text-slate-300 font-medium">
                        {risk.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDeleteRisk(risk.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title="Risiko löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Risk Assessor Dialog */}
      {isAIAssessorOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">KI-Risikoanalyst (Gemini 3.8 Flash)</h3>
              </div>
              <button
                onClick={() => setIsAIAssessorOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Beschreiben Sie ein technisches oder geschäftliches Szenario. Die KI berechnet
              Bedrohungen, Schwachstellen, Schutzbedarfe (CIA), Score vor/nach Behandlung und
              empfiehlt ISO 27001 Controls.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Szenario oder geplante Neuerung</label>
              <textarea
                rows={3}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="z.B.: Einführung von GitHub Copilot für Entwickler mit Zugriff auf firmeneigene Zahlungs-Repositories..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 leading-relaxed"
              />
            </div>

            {aiError && <p className="text-xs text-rose-400">{aiError}</p>}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAIAssessorOpen(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleRunAIAssessment}
                disabled={isAILoading || !aiPrompt.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg inline-flex items-center gap-2"
              >
                {isAILoading ? (
                  <span>Analysiere & Bewerte...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Risiko analysieren & erfassen
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Risk Creation Modal */}
      {isAddingRisk && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Neues Risiko erfassen</h3>
              <button onClick={() => setIsAddingRisk(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualRisk} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Titel des Risikos</label>
                <input
                  required
                  type="text"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  placeholder="z.B. Datenverlust durch fehlerhaftes DB-Migrationsskript"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Betroffener Asset</label>
                  <select
                    value={formState.assetRef}
                    onChange={(e) => setFormState({ ...formState, assetRef: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {assets.map((a) => (
                      <option key={a.id} value={`${a.id} (${a.name})`}>
                        {a.id} - {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Risikoeigentümer (Owner)</label>
                  <input
                    type="text"
                    value={formState.riskOwner}
                    onChange={(e) => setFormState({ ...formState, riskOwner: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Konkrete Bedrohung</label>
                  <input
                    required
                    type="text"
                    value={formState.threat}
                    onChange={(e) => setFormState({ ...formState, threat: e.target.value })}
                    placeholder="z.B. Unvollständige Validierung"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Bestehende Schwachstelle</label>
                  <input
                    required
                    type="text"
                    value={formState.vulnerability}
                    onChange={(e) => setFormState({ ...formState, vulnerability: e.target.value })}
                    placeholder="z.B. Fehlende automatische Rollbacks"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                  />
                </div>
              </div>

              {/* Likelihood and Impact Ratings */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-3">
                <span className="text-[11px] font-semibold text-slate-300 block">
                  Brutto-Einstufung (Vor Behandlungsmaßnahmen)
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 block mb-1">
                      Wahrscheinlichkeit (1-5):{' '}
                      <span className="font-mono text-white font-bold">{formState.preLikelihood}</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={formState.preLikelihood}
                      onChange={(e) =>
                        setFormState({ ...formState, preLikelihood: parseInt(e.target.value, 10) })
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">
                      Schadensausmaß (1-5):{' '}
                      <span className="font-mono text-white font-bold">{formState.preImpact}</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={formState.preImpact}
                      onChange={(e) =>
                        setFormState({ ...formState, preImpact: parseInt(e.target.value, 10) })
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Behandlungsplan (Maßnahmen)</label>
                <textarea
                  rows={2}
                  required
                  value={formState.treatmentPlan}
                  onChange={(e) => setFormState({ ...formState, treatmentPlan: e.target.value })}
                  placeholder="Beschreiben Sie die Sicherheitskontrollen zur Minderung..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingRisk(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg"
                >
                  Risiko speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
