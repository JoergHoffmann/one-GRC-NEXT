export type ImplementationStatus = 'implemented' | 'in_progress' | 'planned' | 'not_applicable';

export type MaturityLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface ISMSControl {
  id: string; // e.g. A.5.1
  title: string;
  theme: 'A.5 Organisatorisch' | 'A.6 Personal' | 'A.7 Physisch' | 'A.8 Technologisch';
  description: string;
  guidance: string;
  controlType: 'Präventiv' | 'Detektiv' | 'Korrektiv';
  securityProperties: ('C' | 'I' | 'A')[];
  cybersecurityConcepts: ('Identifizieren' | 'Schützen' | 'Erkennen' | 'Reagieren' | 'Wiederherstellen')[];
  operationalCapabilities: string;
  applicable: boolean;
  justification: string;
  implementationStatus: ImplementationStatus;
  maturityLevel: MaturityLevel;
  owner: string;
  evidenceNotes: string;
  lastReviewedAt: string;
}

export type AssetCategory = 'Hardware' | 'Software' | 'Cloud' | 'Data' | 'Personnel' | 'Premises';
export type ProtectionLevel = 'Normal' | 'Hoch' | 'Sehr Hoch';

export interface ISMSAsset {
  id: string;
  name: string;
  category: AssetCategory;
  owner: string;
  confidentialityReq: ProtectionLevel;
  integrityReq: ProtectionLevel;
  availabilityReq: ProtectionLevel;
  location: string;
  description: string;
}

export type RiskLevel = 'Niedrig' | 'Mittel' | 'Hoch' | 'Kritisch';
export type TreatmentStrategy = 'Mitigate' | 'Accept' | 'Avoid' | 'Transfer';

export interface ISMSRisk {
  id: string;
  title: string;
  assetRef: string;
  threat: string;
  vulnerability: string;
  impactDescription: string;
  ciaImpact: {
    c: 'Low' | 'Medium' | 'High';
    i: 'Low' | 'Medium' | 'High';
    a: 'Low' | 'Medium' | 'High';
  };
  preTreatment: {
    likelihood: number; // 1-5
    impact: number; // 1-5
    score: number; // likelihood * impact
    level: RiskLevel;
  };
  treatmentStrategy: TreatmentStrategy;
  treatmentPlan: string;
  linkedControls: string[];
  postTreatment: {
    likelihood: number; // 1-5
    impact: number; // 1-5
    score: number; // likelihood * impact
    level: RiskLevel;
  };
  riskOwner: string;
  status: 'Identifiziert' | 'In Behandlung' | 'Akzeptiert' | 'Überwacht';
  reviewDate: string;
}

export interface ISMSPolicy {
  id: string;
  identifier: string; // e.g. POL-01
  title: string;
  category: string;
  status: 'Entwurf' | 'In Prüfung' | 'Freigegeben' | 'Gültig';
  version: string;
  owner: string;
  approvedBy: string;
  effectiveDate: string;
  reviewCycleMonths: number;
  content: string;
}

export interface ISMSIncident {
  id: string;
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
}

export interface ISMSAudit {
  id: string;
  title: string;
  type: 'Internes Audit' | 'Stage 1 Audit' | 'Stage 2 Zertifizierung' | 'Überwachungsaudit' | 'Lieferantenaudit';
  scope: string;
  auditor: string;
  plannedDate: string;
  status: 'Geplant' | 'In Durchführung' | 'Abgeschlossen';
  findingsCount: {
    conformities: number;
    minorNC: number;
    majorNC: number;
    ofi: number; // Opportunities for Improvement
  };
  reportNotes: string;
}

export interface ISMSOrganizationContext {
  companyName: string;
  scopeStatement: string;
  cisoName: string;
  cisoEmail: string;
  targetCertificationDate: string;
  applicableStandards: string[];
  stakeholders: {
    id: string;
    name: string;
    requirement: string;
    fulfillment: string;
  }[];
}

export interface ISMSStoreData {
  version: string;
  organization: ISMSOrganizationContext;
  controls: ISMSControl[];
  assets: ISMSAsset[];
  risks: ISMSRisk[];
  policies: ISMSPolicy[];
  incidents: ISMSIncident[];
  audits: ISMSAudit[];
  lastSavedAt: string;
}
