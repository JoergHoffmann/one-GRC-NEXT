import { eq } from 'drizzle-orm';
import { db } from './index.ts';
import {
  ismsOrganization,
  ismsControls,
  ismsAssets,
  ismsRisks,
  ismsPolicies,
  ismsIncidents,
  ismsAudits,
} from './schema.ts';
import {
  ISMSStoreData,
  ISMSControl,
  ISMSAsset,
  ISMSRisk,
  ISMSPolicy,
  ISMSIncident,
  ISMSAudit,
  ISMSOrganizationContext,
} from '../types/isms.ts';
import { initialISMSState } from '../data/initialISMSData.ts';

/**
 * Lädt die gesamten ISMS-Daten aus PostgreSQL Cloud SQL.
 * Falls die Tabellen noch leer sind, wird automatisch initial aus den Referenzdaten gesamt.
 */
export async function getISMSData(): Promise<ISMSStoreData> {
  try {
    const [controlsList, orgList, assetsList, risksList, policiesList, incidentsList, auditsList] =
      await Promise.all([
        db.select().from(ismsControls),
        db.select().from(ismsOrganization).limit(1),
        db.select().from(ismsAssets),
        db.select().from(ismsRisks),
        db.select().from(ismsPolicies),
        db.select().from(ismsIncidents),
        db.select().from(ismsAudits),
      ]);

    // Wenn keine Controls in der Datenbank existieren, Initial-Seed durchführen
    if (controlsList.length === 0) {
      console.log('PostgreSQL ISMS-Tabellen sind leer. Initialisiere mit ISO 27001 Referenzdaten...');
      await seedInitialISMSData();
      return initialISMSState;
    }

    const org: ISMSOrganizationContext = orgList[0]
      ? {
          companyName: orgList[0].companyName,
          scopeStatement: orgList[0].scopeStatement,
          cisoName: orgList[0].cisoName,
          cisoEmail: orgList[0].cisoEmail,
          targetCertificationDate: orgList[0].targetCertificationDate || '2026-09-30',
          applicableStandards: (orgList[0].applicableStandards as string[]) || [
            'ISO/IEC 27001:2022',
            'BSI IT-Grundschutz',
            'EU-DSGVO (GDPR)',
            'NIS-2',
          ],
          stakeholders: (orgList[0].stakeholders as any) || initialISMSState.organization.stakeholders,
        }
      : initialISMSState.organization;

    const formattedControls: ISMSControl[] = controlsList.map((c) => ({
      id: c.id,
      title: c.title,
      theme: c.theme as any,
      description: c.description,
      guidance: c.guidance || '',
      controlType: c.controlType as any,
      securityProperties: (c.securityProperties as any) || ['C', 'I', 'A'],
      cybersecurityConcepts: (c.cybersecurityConcepts as any) || ['Schützen'],
      operationalCapabilities: c.operationalCapabilities,
      applicable: c.applicable,
      justification: c.justification || '',
      implementationStatus: c.implementationStatus as any,
      maturityLevel: (c.maturityLevel as any) || 1,
      owner: c.owner || '',
      evidenceNotes: c.evidenceNotes || '',
      lastReviewedAt: c.lastReviewedAt || '',
    }));

    const formattedAssets: ISMSAsset[] = assetsList.map((a) => ({
      id: a.id,
      name: a.name,
      category: a.category as any,
      owner: a.owner,
      confidentialityReq: a.confidentialityReq as any,
      integrityReq: a.integrityReq as any,
      availabilityReq: a.availabilityReq as any,
      location: a.location || '',
      description: a.description || '',
    }));

    const formattedRisks: ISMSRisk[] = risksList.map((r) => ({
      id: r.id,
      title: r.title,
      assetRef: r.assetRef,
      threat: r.threat,
      vulnerability: r.vulnerability,
      impactDescription: r.impactDescription || '',
      ciaImpact: r.ciaImpact as any,
      preTreatment: r.preTreatment as any,
      treatmentStrategy: r.treatmentStrategy as any,
      treatmentPlan: r.treatmentPlan || '',
      linkedControls: (r.linkedControls as string[]) || [],
      postTreatment: r.postTreatment as any,
      riskOwner: r.riskOwner,
      status: r.status as any,
      reviewDate: r.reviewDate || '',
    }));

    const formattedPolicies: ISMSPolicy[] = policiesList.map((p) => ({
      id: p.id,
      identifier: p.identifier,
      title: p.title,
      category: p.category,
      status: p.status as any,
      version: p.version,
      owner: p.owner,
      approvedBy: p.approvedBy || '',
      effectiveDate: p.effectiveDate || '',
      reviewCycleMonths: p.reviewCycleMonths || 12,
      content: p.content,
    }));

    const formattedIncidents: ISMSIncident[] = incidentsList.map((i) => ({
      id: i.id,
      title: i.title,
      detectedAt: i.detectedAt,
      reportedBy: i.reportedBy,
      severity: i.severity as any,
      status: i.status as any,
      gdprRelevant: i.gdprRelevant,
      affectedAssets: i.affectedAssets || '',
      description: i.description,
      immediateAction: i.immediateAction || '',
      rootCause: i.rootCause || '',
      correctiveAction: i.correctiveAction || '',
    }));

    const formattedAudits: ISMSAudit[] = auditsList.map((a) => ({
      id: a.id,
      title: a.title,
      type: a.type as any,
      scope: a.scope,
      auditor: a.auditor,
      plannedDate: a.plannedDate,
      status: a.status as any,
      findingsCount: a.findingsCount as any,
      reportNotes: a.reportNotes || '',
    }));

    return {
      version: '2026.1',
      organization: org,
      controls: formattedControls,
      assets: formattedAssets,
      risks: formattedRisks,
      policies: formattedPolicies,
      incidents: formattedIncidents,
      audits: formattedAudits,
      lastSavedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Fehler beim Abrufen der ISMS-Daten aus Cloud SQL:', error);
    throw new Error('Datenbankabruf fehlgeschlagen', { cause: error });
  }
}

/**
 * Initialisiert die Cloud SQL Datenbank mit den 93 Controls und Standard-Assets
 */
export async function seedInitialISMSData() {
  try {
    // 1. Organization
    await db
      .insert(ismsOrganization)
      .values({
        companyName: initialISMSState.organization.companyName,
        scopeStatement: initialISMSState.organization.scopeStatement,
        cisoName: initialISMSState.organization.cisoName,
        cisoEmail: initialISMSState.organization.cisoEmail,
        targetCertificationDate: initialISMSState.organization.targetCertificationDate,
        applicableStandards: initialISMSState.organization.applicableStandards,
        stakeholders: initialISMSState.organization.stakeholders,
      })
      .onConflictDoNothing();

    // 2. Controls (93 Controls)
    for (const c of initialISMSState.controls) {
      await db
        .insert(ismsControls)
        .values({
          id: c.id,
          title: c.title,
          theme: c.theme,
          description: c.description,
          guidance: c.guidance,
          controlType: c.controlType,
          securityProperties: c.securityProperties,
          cybersecurityConcepts: c.cybersecurityConcepts,
          operationalCapabilities: c.operationalCapabilities,
          applicable: c.applicable,
          justification: c.justification,
          implementationStatus: c.implementationStatus,
          maturityLevel: c.maturityLevel,
          owner: c.owner,
          evidenceNotes: c.evidenceNotes,
          lastReviewedAt: c.lastReviewedAt,
        })
        .onConflictDoNothing();
    }

    // 3. Assets
    for (const a of initialISMSState.assets) {
      await db
        .insert(ismsAssets)
        .values({
          id: a.id,
          name: a.name,
          category: a.category,
          owner: a.owner,
          confidentialityReq: a.confidentialityReq,
          integrityReq: a.integrityReq,
          availabilityReq: a.availabilityReq,
          location: a.location,
          description: a.description,
        })
        .onConflictDoNothing();
    }

    // 4. Risks
    for (const r of initialISMSState.risks) {
      await db
        .insert(ismsRisks)
        .values({
          id: r.id,
          title: r.title,
          assetRef: r.assetRef,
          threat: r.threat,
          vulnerability: r.vulnerability,
          impactDescription: r.impactDescription,
          ciaImpact: r.ciaImpact,
          preTreatment: r.preTreatment,
          treatmentStrategy: r.treatmentStrategy,
          treatmentPlan: r.treatmentPlan,
          linkedControls: r.linkedControls,
          postTreatment: r.postTreatment,
          riskOwner: r.riskOwner,
          status: r.status,
          reviewDate: r.reviewDate,
        })
        .onConflictDoNothing();
    }

    // 5. Policies
    for (const p of initialISMSState.policies) {
      await db
        .insert(ismsPolicies)
        .values({
          id: p.id,
          identifier: p.identifier,
          title: p.title,
          category: p.category,
          status: p.status,
          version: p.version,
          owner: p.owner,
          approvedBy: p.approvedBy,
          effectiveDate: p.effectiveDate,
          reviewCycleMonths: p.reviewCycleMonths,
          content: p.content,
        })
        .onConflictDoNothing();
    }

    // 6. Incidents
    for (const i of initialISMSState.incidents) {
      await db
        .insert(ismsIncidents)
        .values({
          id: i.id,
          title: i.title,
          detectedAt: i.detectedAt,
          reportedBy: i.reportedBy,
          severity: i.severity,
          status: i.status,
          gdprRelevant: i.gdprRelevant,
          affectedAssets: i.affectedAssets,
          description: i.description,
          immediateAction: i.immediateAction,
          rootCause: i.rootCause,
          correctiveAction: i.correctiveAction,
        })
        .onConflictDoNothing();
    }

    // 7. Audits
    for (const a of initialISMSState.audits) {
      await db
        .insert(ismsAudits)
        .values({
          id: a.id,
          title: a.title,
          type: a.type,
          scope: a.scope,
          auditor: a.auditor,
          plannedDate: a.plannedDate,
          status: a.status,
          findingsCount: a.findingsCount,
          reportNotes: a.reportNotes,
        })
        .onConflictDoNothing();
    }

    console.log('ISO 27001 Referenzdaten erfolgreich in Cloud SQL geladen.');
  } catch (error) {
    console.error('Fehler beim Seeden von Cloud SQL:', error);
  }
}

/**
 * Aktualisiert eine einzelne Maßnahme im SoA
 */
export async function updateControlInDB(id: string, updates: Partial<ISMSControl>) {
  try {
    await db
      .update(ismsControls)
      .set({
        ...(updates.title !== undefined ? { title: updates.title } : {}),
        ...(updates.applicable !== undefined ? { applicable: updates.applicable } : {}),
        ...(updates.justification !== undefined ? { justification: updates.justification } : {}),
        ...(updates.implementationStatus !== undefined
          ? { implementationStatus: updates.implementationStatus }
          : {}),
        ...(updates.maturityLevel !== undefined ? { maturityLevel: updates.maturityLevel } : {}),
        ...(updates.owner !== undefined ? { owner: updates.owner } : {}),
        ...(updates.evidenceNotes !== undefined ? { evidenceNotes: updates.evidenceNotes } : {}),
        lastReviewedAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date(),
      })
      .where(eq(ismsControls.id, id));
  } catch (error) {
    console.error(`Fehler beim Aktualisieren der Maßnahme ${id}:`, error);
    throw new Error(`Fehler bei Maßnahme ${id}`, { cause: error });
  }
}

/**
 * Speichert / Synchronisiert den gesamten ISMS-Zustand nach Cloud SQL
 */
export async function syncEntireISMSStateToDB(data: ISMSStoreData) {
  try {
    // Controls aktualisieren
    for (const c of data.controls) {
      await db
        .insert(ismsControls)
        .values({
          id: c.id,
          title: c.title,
          theme: c.theme,
          description: c.description,
          guidance: c.guidance,
          controlType: c.controlType,
          securityProperties: c.securityProperties,
          cybersecurityConcepts: c.cybersecurityConcepts,
          operationalCapabilities: c.operationalCapabilities,
          applicable: c.applicable,
          justification: c.justification,
          implementationStatus: c.implementationStatus,
          maturityLevel: c.maturityLevel,
          owner: c.owner,
          evidenceNotes: c.evidenceNotes,
          lastReviewedAt: c.lastReviewedAt,
        })
        .onConflictDoUpdate({
          target: ismsControls.id,
          set: {
            applicable: c.applicable,
            justification: c.justification,
            implementationStatus: c.implementationStatus,
            maturityLevel: c.maturityLevel,
            owner: c.owner,
            evidenceNotes: c.evidenceNotes,
            lastReviewedAt: c.lastReviewedAt,
            updatedAt: new Date(),
          },
        });
    }

    // Organisation
    await db
      .update(ismsOrganization)
      .set({
        companyName: data.organization.companyName,
        scopeStatement: data.organization.scopeStatement,
        cisoName: data.organization.cisoName,
        cisoEmail: data.organization.cisoEmail,
        targetCertificationDate: data.organization.targetCertificationDate,
        stakeholders: data.organization.stakeholders,
        updatedAt: new Date(),
      });
  } catch (error) {
    console.error('Fehler beim Synchronisieren des ISMS-Zustands:', error);
    throw new Error('Sync fehlgeschlagen', { cause: error });
  }
}
