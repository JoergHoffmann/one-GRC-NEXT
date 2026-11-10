import React from 'react';
import {
  Shield,
  AlertTriangle,
  FileText,
  Server,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Building,
  Sparkles,
} from 'lucide-react';
import { ISMSStoreData } from '../types/isms';
import { formatDateGerman } from '../utils/ismsUtils';

interface DashboardViewProps {
  data: ISMSStoreData;
  metrics: any;
  onNavigate: (tab: string) => void;
  onOpenAIConsultant: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  metrics,
  onNavigate,
  onOpenAIConsultant,
}) => {
  // Theme stats
  const themes = [
    {
      code: 'A.5',
      name: 'Organisatorische Maßnahmen',
      total: data.controls.filter((c) => c.theme === 'A.5 Organisatorisch').length,
      done: data.controls.filter(
        (c) => c.theme === 'A.5 Organisatorisch' && c.implementationStatus === 'implemented'
      ).length,
    },
    {
      code: 'A.6',
      name: 'Personenbezogene Maßnahmen',
      total: data.controls.filter((c) => c.theme === 'A.6 Personal').length,
      done: data.controls.filter(
        (c) => c.theme === 'A.6 Personal' && c.implementationStatus === 'implemented'
      ).length,
    },
    {
      code: 'A.7',
      name: 'Physische Maßnahmen',
      total: data.controls.filter((c) => c.theme === 'A.7 Physisch').length,
      done: data.controls.filter(
        (c) => c.theme === 'A.7 Physisch' && c.implementationStatus === 'implemented'
      ).length,
    },
    {
      code: 'A.8',
      name: 'Technologische Maßnahmen',
      total: data.controls.filter((c) => c.theme === 'A.8 Technologisch').length,
      done: data.controls.filter(
        (c) => c.theme === 'A.8 Technologisch' && c.implementationStatus === 'implemented'
      ).length,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Executive Scope Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="font-semibold text-slate-200">{data.organization.companyName}</span>
              <span aria-hidden="true">·</span>
              <span>ISO/IEC 27001:2022 ISMS</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400">Audit-Vorbereitung aktiv</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
              ISMS Governance & Konformitäts-Cockpit
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {data.organization.scopeStatement}
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
            <button
              onClick={onOpenAIConsultant}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              KI-Lead-Auditor konsultieren
            </button>
            <button
              onClick={() => onNavigate('soa')}
              className="px-4 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Shield className="w-4 h-4 text-slate-400" />
              Statement of Applicability (SoA)
            </button>
          </div>
        </div>

        {/* PDCA Cycle Pill-less indicator */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-medium">1. Plan (Planen)</span>
            <p className="text-slate-200 font-semibold">Kontext & Risiken bestimmt</p>
            <span className="text-emerald-400 text-[11px]">100% Klausel 4 & 6 konform</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-medium">2. Do (Umsetzen)</span>
            <p className="text-slate-200 font-semibold">{metrics.implementationPercent}% Controls aktiv</p>
            <span className="text-blue-400 text-[11px]">{metrics.inProgressControls} Maßnahmen in Bearbeitung</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-medium">3. Check (Prüfen)</span>
            <p className="text-slate-200 font-semibold">Internes Audit & Monitoring</p>
            <span className="text-amber-400 text-[11px]">{metrics.upcomingAuditsCount} Audit(s) terminiert</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-medium">4. Act (Verbessern)</span>
            <p className="text-slate-200 font-semibold">KVP & Management Review</p>
            <span className="text-emerald-400 text-[11px]">Kontinuierlicher Reifegrad</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SoA Implementation */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">SoA Umsetzung</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono tabular-nums text-white">
                {metrics.implementationPercent}%
              </span>
              <span className="text-xs text-slate-400 font-mono tabular-nums">
                ({metrics.implementedControls}/{metrics.totalControls})
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.implementationPercent}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => onNavigate('soa')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 transition-colors self-start"
          >
            Alle 93 Controls öffnen <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Maturity Level */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">ISMS-Reifegrad (CMMI)</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono tabular-nums text-white">
                {metrics.avgMaturity}
              </span>
              <span className="text-xs text-slate-400">/ 5.0 (Definiert)</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Strukturierte Dokumentation und gelebte Nachweisführung.
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Zielwert für Stage 2: <span className="text-slate-300 font-mono tabular-nums">≥ 3.0</span>
          </div>
        </div>

        {/* Risk Treatment Delta */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Kritische Risiken</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono tabular-nums text-emerald-400">
                {metrics.highCriticalPostRisks}
              </span>
              <span className="text-xs text-slate-400">
                (vorher: <span className="text-rose-400 font-mono tabular-nums">{metrics.highCriticalPreRisks}</span>)
              </span>
            </div>
            <p className="text-xs text-emerald-400 mt-2">
              -{metrics.highCriticalPreRisks - metrics.highCriticalPostRisks} Hochrisiken durch ISO Controls mitigiert.
            </p>
          </div>
          <button
            onClick={() => onNavigate('risks')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 transition-colors self-start"
          >
            Risikomatrix prüfen <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Audit Target Countdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Nächstes Audit</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-3">
            <span className="text-xl font-bold text-white block">
              {metrics.nextAudit ? metrics.nextAudit.type : 'Kein Audit terminiert'}
            </span>
            <p className="text-xs text-slate-400 mt-1 font-mono tabular-nums">
              Datum: {metrics.nextAudit ? formatDateGerman(metrics.nextAudit.plannedDate) : '-'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('audits')}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1 transition-colors self-start"
          >
            Auditprogramm öffnen <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ISO 27001:2022 4-Themes Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-white">
              ISO/IEC 27001:2022 Maßnahmen-Themen (93 Controls)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Gliederung nach den 4 Hauptbereichen des Anhangs A
            </p>
          </div>
          <button
            onClick={() => onNavigate('soa')}
            className="text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            Details im SoA anzeigen →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {themes.map((theme) => {
            const pct = Math.round((theme.done / (theme.total || 1)) * 100);
            return (
              <div
                key={theme.code}
                onClick={() => onNavigate('soa')}
                className="bg-slate-950/60 border border-slate-800 hover:border-slate-700 p-4 rounded-lg cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-semibold text-blue-400">
                    {theme.code}
                  </span>
                  <span className="text-xs font-mono tabular-nums text-slate-400">
                    {theme.done}/{theme.total}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                  {theme.name}
                </h4>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-[11px] text-slate-500">
                  <span>Umsetzung</span>
                  <span className="font-mono tabular-nums text-slate-300">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Grid: Priority Risks & Live System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Risks */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">Top-Risiken im Register</h3>
                <p className="text-xs text-slate-400">Fokus der aktuellen Behandlungsmaßnahmen</p>
              </div>
              <button
                onClick={() => onNavigate('risks')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                Alle {data.risks.length} Risiken
              </button>
            </div>

            <div className="space-y-3">
              {data.risks.slice(0, 3).map((risk) => (
                <div
                  key={risk.id}
                  className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-slate-400">{risk.id}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-slate-300">{risk.assetRef}</span>
                    </div>
                    <p className="text-xs font-medium text-white">{risk.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{risk.treatmentPlan}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded border border-rose-900/60 text-rose-300 bg-rose-950/40">
                      Brutto {risk.preTreatment.score}
                    </span>
                    <span className="block text-[10px] text-emerald-400 mt-1 font-mono">
                      Netto {risk.postTreatment.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-400">
            <span>Behandlungsstrategie: 100% Mitigiert mit Controls</span>
            <span className="font-mono tabular-nums text-slate-300">ISO 27005 konform</span>
          </div>
        </div>

        {/* Security Policies & Quick Assets */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">Sicherheitsrichtlinien & Evidenzen</h3>
                <p className="text-xs text-slate-400">Verabschiedete Vorgaben nach Klausel 5.2</p>
              </div>
              <button
                onClick={() => onNavigate('policies')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                Alle Richtlinien ({data.policies.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {data.policies.slice(0, 4).map((policy) => (
                <div
                  key={policy.id}
                  onClick={() => onNavigate('policies')}
                  className="p-3 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-slate-200">{policy.title}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>v{policy.version}</span>
                        <span aria-hidden="true">·</span>
                        <span>{policy.category}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium font-mono tabular-nums shrink-0">
                    {policy.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Verantwortlicher CISO: {data.organization.cisoName}</span>
            <button
              onClick={() => onNavigate('policies')}
              className="text-xs text-blue-400 hover:underline"
            >
              Neue Richtlinie verfassen →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
