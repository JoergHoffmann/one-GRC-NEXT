import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ISMSStoreData,
  ISMSControl,
  ISMSAsset,
  ISMSRisk,
  ISMSPolicy,
  ISMSIncident,
  ISMSAudit,
  ISMSOrganizationContext,
} from '../types/isms';
import { initialISMSState } from '../data/initialISMSData';

const STORAGE_KEY = 'certsecure_isms_data_v1';

export function useISMSStore() {
  const [data, setData] = useState<ISMSStoreData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.controls && parsed.organization) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored ISMS data, falling back to initial', e);
    }
    return initialISMSState;
  });

  // Save to local storage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving ISMS data to local storage', e);
    }
  }, [data]);

  // Mutations
  const updateControl = useCallback((id: string, updates: Partial<ISMSControl>) => {
    setData((prev) => ({
      ...prev,
      controls: prev.controls.map((c) =>
        c.id === id ? { ...c, ...updates, lastReviewedAt: new Date().toISOString().slice(0, 10) } : c
      ),
      lastSavedAt: new Date().toISOString(),
    }));
  }, []);

  const batchUpdateControls = useCallback((controlIds: string[], updates: Partial<ISMSControl>) => {
    setData((prev) => ({
      ...prev,
      controls: prev.controls.map((c) =>
        controlIds.includes(c.id)
          ? { ...c, ...updates, lastReviewedAt: new Date().toISOString().slice(0, 10) }
          : c
      ),
      lastSavedAt: new Date().toISOString(),
    }));
  }, []);

  const updateOrganization = useCallback((updates: Partial<ISMSOrganizationContext>) => {
    setData((prev) => ({
      ...prev,
      organization: { ...prev.organization, ...updates },
      lastSavedAt: new Date().toISOString(),
    }));
  }, []);

  const addAsset = useCallback((asset: ISMSAsset) => {
    setData((prev) => ({
      ...prev,
      assets: [asset, ...prev.assets],
      lastSavedAt: new Date().toISOString(),
    }));
  }, []);

  const updateAsset = useCallback((id: string, updates: Partial<ISMSAsset>) => {
    setData((prev) => ({
      ...prev,
      assets: prev.assets.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      lastSavedAt: new Date().toISOString(),
    }));
  }, []);

  const deleteAsset = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      assets: prev.assets.filter((a) => a.id !== id),
      lastSavedAt: new Date().toISOString(),
    }));
  }, []);

  const addRisk = useCallback((risk: ISMSRisk) => {
    setData((prev) => ({
      ...prev,
      risks: [risk, ...prev.risks],
      lastSavedAt: new Date().toISOString(),
    }));
  }, []);

  const updateRisk = useCallback((id: string, updates: Partial<ISMSRisk>) => {
    setData((prev) => ({
      ...prev,
      risks: prev.risks.map((r) => (r.id === id ? { ...r, ...updates } : r)),
      lastSavedAt: new Date().toISOString(),
    }));
  }, []);

  const deleteRisk = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      risks: prev.risks.filter((r) => r.id !== id),
      lastSavedAt: new Date().toISOString(),
    }));
  }, []);

  const addPolicy = useCallback((policy: ISMSPolicy) => {
    setData((prev) => ({
      ...prev,
      policies: [policy, ...prev.policies],
      lastSavedAt: new Date().toISOString(),
    }));
  }, []);

  const updatePolicy = useCallback((id: string, updates: Partial<ISMSPolicy>) => {
    setData((prev) => ({
      ...prev,
      policies: prev.policies.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      lastSavedAt: new Date().toISOString(),
    }));
  }, []);

  const deletePolicy = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      policies: prev.policies.filter((p) => p.id !== id),
      lastSavedAt: new Date().toISOString(),
    }));
  }, []);

  const addIncident = useCallback((incident: ISMSIncident) => {
    setData((prev) => ({
      ...prev,
      incidents: [incident, ...prev.incidents],
      lastSavedAt: new Date().toISOString(),
    }));
  }, []);

  const updateIncident = useCallback((id: string, updates: Partial<ISMSIncident>) => {
    setData((prev) => ({
      ...prev,
      incidents: prev.incidents.map((i) => (i.id === id ? { ...i, ...updates } : i)),
      lastSavedAt: new Date().toISOString(),
    }));
  }, []);

  const deleteIncident = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      incidents: prev.incidents.filter((i) => i.id !== id),
      lastSavedAt: new Date().toISOString(),
    }));
  }, []);

  const addAudit = useCallback((audit: ISMSAudit) => {
    setData((prev) => ({
      ...prev,
      audits: [...prev.audits, audit],
      lastSavedAt: new Date().toISOString(),
    }));
  }, []);

  const updateAudit = useCallback((id: string, updates: Partial<ISMSAudit>) => {
    setData((prev) => ({
      ...prev,
      audits: prev.audits.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      lastSavedAt: new Date().toISOString(),
    }));
  }, []);

  const resetToDemo = useCallback(() => {
    setData(initialISMSState);
  }, []);

  const exportJSON = useCallback(() => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `one_GRC_NEXT_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const importJSON = useCallback((jsonContent: string) => {
    try {
      const parsed = JSON.parse(jsonContent);
      if (parsed && Array.isArray(parsed.controls) && parsed.organization) {
        setData(parsed);
        return { success: true, message: 'ISMS-Daten erfolgreich importiert' };
      }
      return { success: false, message: 'Ungültiges Dateiformat. controls oder organization fehlt.' };
    } catch (e: any) {
      return { success: false, message: `Fehler beim Parsen: ${e.message}` };
    }
  }, []);

  const exportSoACsv = useCallback(() => {
    const headers = [
      'Control ID',
      'Thema',
      'Titel',
      'Anwendbar',
      'Begründung',
      'Umsetzungsstatus',
      'Reifegrad (0-5)',
      'Verantwortlich',
      'Nachweise / Evidenz',
      'Zuletzt geprüft',
    ];

    const rows = data.controls.map((c) => [
      `"${c.id}"`,
      `"${c.theme}"`,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${c.applicable ? 'Ja' : 'Nein'}"`,
      `"${(c.justification || '').replace(/"/g, '""')}"`,
      `"${c.implementationStatus}"`,
      `"${c.maturityLevel}"`,
      `"${(c.owner || '').replace(/"/g, '""')}"`,
      `"${(c.evidenceNotes || '').replace(/"/g, '""')}"`,
      `"${c.lastReviewedAt || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SoA_Statement_of_Applicability_ISO27001_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data.controls]);

  // Calculated Metrics
  const metrics = useMemo(() => {
    const totalControls = data.controls.length;
    const implementedControls = data.controls.filter((c) => c.implementationStatus === 'implemented').length;
    const inProgressControls = data.controls.filter((c) => c.implementationStatus === 'in_progress').length;
    const plannedControls = data.controls.filter((c) => c.implementationStatus === 'planned').length;
    const excludedControls = data.controls.filter((c) => !c.applicable || c.implementationStatus === 'not_applicable').length;
    const applicableControls = data.controls.filter((c) => c.applicable);

    const implementationPercent = Math.round((implementedControls / (totalControls - excludedControls || 1)) * 100);

    const totalMaturity = data.controls.reduce((sum, c) => sum + c.maturityLevel, 0);
    const avgMaturity = (totalMaturity / (totalControls || 1)).toFixed(1);

    const highCriticalPreRisks = data.risks.filter(
      (r) => r.preTreatment.level === 'Kritisch' || r.preTreatment.level === 'Hoch'
    ).length;
    const highCriticalPostRisks = data.risks.filter(
      (r) => r.postTreatment.level === 'Kritisch' || r.postTreatment.level === 'Hoch'
    ).length;

    const criticalAssets = data.assets.filter(
      (a) => a.confidentialityReq === 'Sehr Hoch' || a.availabilityReq === 'Sehr Hoch'
    ).length;

    const openIncidents = data.incidents.filter(
      (i) => i.status === 'Offen' || i.status === 'In Untersuchung' || i.status === 'Eingedämmt'
    ).length;

    const activePolicies = data.policies.filter((p) => p.status === 'Gültig' || p.status === 'Freigegeben').length;

    // Upcoming audits
    const upcomingAudits = data.audits.filter((a) => a.status === 'Geplant');

    return {
      totalControls,
      implementedControls,
      inProgressControls,
      plannedControls,
      excludedControls,
      applicableControlsCount: applicableControls.length,
      implementationPercent,
      avgMaturity,
      totalRisks: data.risks.length,
      highCriticalPreRisks,
      highCriticalPostRisks,
      totalAssets: data.assets.length,
      criticalAssets,
      openIncidents,
      totalIncidents: data.incidents.length,
      activePolicies,
      totalPolicies: data.policies.length,
      upcomingAuditsCount: upcomingAudits.length,
      nextAudit: upcomingAudits[0] || null,
    };
  }, [data]);

  return {
    data,
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
  };
}
