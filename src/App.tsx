import React, { useState } from 'react';
import {
  LayoutDashboard,
  Shield,
  AlertTriangle,
  Server,
  FileText,
  AlertCircle,
  Award,
  Building2,
  Sparkles,
  Download,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useISMSStore } from './hooks/useISMSStore';
import { useAuth } from './context/AuthContext';
import { DashboardView } from './components/DashboardView';
import { SoAView } from './components/SoAView';
import { RiskView } from './components/RiskView';
import { AssetView } from './components/AssetView';
import { PolicyView } from './components/PolicyView';
import { IncidentView } from './components/IncidentView';
import { AuditView } from './components/AuditView';
import { ScopeView } from './components/ScopeView';
import { AIConsultantModal } from './components/AIConsultantModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'soa' | 'risks' | 'assets' | 'policies' | 'incidents' | 'audits' | 'scope'
  >('dashboard');
  const [isAIConsultantOpen, setIsAIConsultantOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, loginWithGoogle, logout, isLoading: authLoading } = useAuth();

  const {
    data,
    isCloudSynced,
    metrics,
    updateControl,
    batchUpdateControls,
    updateOrganization,
    addAsset,
    updateAsset,
    deleteAsset,
    addRisk,
    updateRisk,
    deleteRisk,
    addPolicy,
    updatePolicy,
    deletePolicy,
    addIncident,
    updateIncident,
    deleteIncident,
    addAudit,
    updateAudit,
    resetToDemo,
    exportJSON,
    importJSON,
    exportSoACsv,
  } = useISMSStore();

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Übersicht (Cockpit)',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'soa',
      label: 'Statement of Applicability',
      icon: Shield,
      badge: `${metrics.implementationPercent}%`,
    },
    {
      id: 'risks',
      label: 'Risikomanagement & Matrix',
      icon: AlertTriangle,
      badge: `${metrics.highCriticalPostRisks} Kritisch`,
    },
    {
      id: 'assets',
      label: 'Asset-Inventar (CIA)',
      icon: Server,
      badge: `${metrics.totalAssets}`,
    },
    {
      id: 'policies',
      label: 'Sicherheitsrichtlinien',
      icon: FileText,
      badge: `${metrics.totalPolicies}`,
    },
    {
      id: 'incidents',
      label: 'Sicherheitsvorfälle',
      icon: AlertCircle,
      badge: metrics.openIncidents > 0 ? `${metrics.openIncidents} Offen` : null,
      badgeClass: metrics.openIncidents > 0 ? 'text-rose-400 bg-rose-950/60 border-rose-800' : '',
    },
    {
      id: 'audits',
      label: 'Audit & Zertifizierung',
      icon: Award,
      badge: 'ISO 27001',
    },
    {
      id: 'scope',
      label: 'Geltungsbereich & Backup',
      icon: Building2,
      badge: null,
    },
  ];

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Executive ISMS Cockpit';
      case 'soa':
        return 'Statement of Applicability (SoA)';
      case 'risks':
        return 'Risikoanalyse & 5x5 Heatmap';
      case 'assets':
        return 'Asset-Inventar & Schutzbedarfsanalyse';
      case 'policies':
        return 'Sicherheitsrichtlinien & Leitlinie';
      case 'incidents':
        return 'Sicherheitsvorfälle & 72h-Meldewesen';
      case 'audits':
        return 'Auditprogramm & Lead-Auditor-Simulator';
      case 'scope':
        return 'Geltungsbereich & Datensicherung';
      default:
        return 'ISMS';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white antialiased">
      {/* 3-Zone Top Bar Contract */}
      <header className="h-14 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-8 sticky top-0 z-40">
        {/* Zone 1: Brand wordmark & Breadcrumbs */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white"
            aria-label="Menü öffnen"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <a
            href="/"
            className="flex items-center gap-2 text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-blue-400 transition-colors"
          >
            <Shield className="w-5 h-5 text-blue-500 shrink-0" />
            <span>one-GRC NEXT</span>
          </a>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span aria-hidden="true">/</span>
            <span className="text-slate-300 font-medium whitespace-nowrap">{getBreadcrumbTitle()}</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Desktop 4-5 concise links) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'dashboard' ? 'text-blue-400 font-semibold' : ''
            }`}
          >
            Cockpit
          </button>
          <button
            onClick={() => setActiveTab('soa')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'soa' ? 'text-blue-400 font-semibold' : ''
            }`}
          >
            SoA Controls
          </button>
          <button
            onClick={() => setActiveTab('risks')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'risks' ? 'text-blue-400 font-semibold' : ''
            }`}
          >
            Risikomatrix
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'policies' ? 'text-blue-400 font-semibold' : ''
            }`}
          >
            Richtlinien
          </button>
          <button
            onClick={() => setActiveTab('audits')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'audits' ? 'text-blue-400 font-semibold' : ''
            }`}
          >
            Audits
          </button>
        </nav>

        {/* Zone 3: Actions & Auth */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsAIConsultantOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span className="hidden sm:inline">KI-Sicherheitsberater</span>
            <span className="sm:hidden">KI</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2 border-l border-slate-800 pl-2.5">
              <span className="text-xs text-slate-300 font-mono hidden xl:inline truncate max-w-[140px]">
                {user.displayName || user.email}
              </span>
              <button
                onClick={logout}
                className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap"
              >
                Abmelden
              </button>
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              disabled={authLoading}
              className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Anmelden</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Canvas with Sidebar + Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (260px) */}
        <aside
          className={`fixed inset-y-14 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Navigation Items */}
          <div className="p-3 space-y-1 overflow-y-auto">
            <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-slate-500">
              ISMS Managementsystem
            </div>

            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-blue-700/60 text-blue-100'
                          : item.badgeClass || 'bg-slate-800 text-slate-400 border border-slate-700/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer with Norm Reference */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Norm:</span>
              <span className="font-mono text-slate-200">ISO/IEC 27001:2022</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Speicher:</span>
              <span className="font-mono text-emerald-400">Cloud SQL (PG)</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>CISO:</span>
              <span className="truncate max-w-[120px] text-slate-300 font-mono">
                {data.organization.cisoName.split(' ')[0]}...
              </span>
            </div>
            <button
              onClick={exportJSON}
              className="w-full mt-1 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              Backup exportieren
            </button>
          </div>
        </aside>

        {/* Backdrop for mobile drawer */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-20 bg-black/60 md:hidden"
          />
        )}

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              data={data}
              metrics={metrics}
              onNavigate={(tab) => setActiveTab(tab as any)}
              onOpenAIConsultant={() => setIsAIConsultantOpen(true)}
            />
          )}

          {activeTab === 'soa' && (
            <SoAView
              controls={data.controls}
              onUpdateControl={updateControl}
              onExportCsv={exportSoACsv}
            />
          )}

          {activeTab === 'risks' && (
            <RiskView
              risks={data.risks}
              assets={data.assets}
              controls={data.controls}
              onAddRisk={addRisk}
              onUpdateRisk={updateRisk}
              onDeleteRisk={deleteRisk}
            />
          )}

          {activeTab === 'assets' && (
            <AssetView
              assets={data.assets}
              onAddAsset={addAsset}
              onUpdateAsset={updateAsset}
              onDeleteAsset={deleteAsset}
            />
          )}

          {activeTab === 'policies' && (
            <PolicyView
              policies={data.policies}
              onAddPolicy={addPolicy}
              onUpdatePolicy={updatePolicy}
              onDeletePolicy={deletePolicy}
            />
          )}

          {activeTab === 'incidents' && (
            <IncidentView
              incidents={data.incidents}
              onAddIncident={addIncident}
              onUpdateIncident={updateIncident}
              onDeleteIncident={deleteIncident}
            />
          )}

          {activeTab === 'audits' && (
            <AuditView
              audits={data.audits}
              onAddAudit={addAudit}
              onUpdateAudit={updateAudit}
            />
          )}

          {activeTab === 'scope' && (
            <ScopeView
              organization={data.organization}
              onUpdateOrganization={updateOrganization}
              onExportJSON={exportJSON}
              onImportJSON={importJSON}
              onResetToDemo={resetToDemo}
            />
          )}
        </main>
      </div>

      {/* Global AI Consultant Modal */}
      <AIConsultantModal
        isOpen={isAIConsultantOpen}
        onClose={() => setIsAIConsultantOpen(false)}
        data={data}
      />
    </div>
  );
}
