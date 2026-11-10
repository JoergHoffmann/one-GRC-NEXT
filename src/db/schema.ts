import { pgTable, serial, text, integer, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (authenticated via Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').default('CISO / Security Lead').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Organization context & scope statement (Klausel 4 & 5)
export const ismsOrganization = pgTable('isms_organization', {
  id: serial('id').primaryKey(),
  companyName: text('company_name').notNull(),
  scopeStatement: text('scope_statement').notNull(),
  cisoName: text('ciso_name').notNull(),
  cisoEmail: text('ciso_email').notNull(),
  targetCertificationDate: text('target_certification_date'),
  applicableStandards: jsonb('applicable_standards').$type<string[]>().default(['ISO/IEC 27001:2022', 'BSI IT-Grundschutz', 'DSGVO', 'NIS-2']).notNull(),
  stakeholders: jsonb('stakeholders').$type<{ id: string; name: string; requirement: string; fulfillment: string }[]>().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Statement of Applicability (SoA) - 93 ISO/IEC 27001:2022 Controls
export const ismsControls = pgTable('isms_controls', {
  id: text('id').primaryKey(), // e.g. 'A.5.1'
  title: text('title').notNull(),
  theme: text('theme').notNull(),
  description: text('description').notNull(),
  guidance: text('guidance'),
  controlType: text('control_type').notNull(), // 'Präventiv' | 'Detektiv' | 'Korrektiv'
  securityProperties: jsonb('security_properties').$type<string[]>().notNull(), // ['C', 'I', 'A']
  cybersecurityConcepts: jsonb('cybersecurity_concepts').$type<string[]>().notNull(),
  operationalCapabilities: text('operational_capabilities').notNull(),
  applicable: boolean('applicable').default(true).notNull(),
  justification: text('justification'),
  implementationStatus: text('implementation_status').default('in_progress').notNull(),
  maturityLevel: integer('maturity_level').default(1).notNull(),
  owner: text('owner'),
  evidenceNotes: text('evidence_notes'),
  lastReviewedAt: text('last_reviewed_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Assets (Informationswerte & Schutzbedarfsanalyse nach BSI & A.5.9)
export const ismsAssets = pgTable('isms_assets', {
  id: text('id').primaryKey(), // e.g. 'AST-01'
  name: text('name').notNull(),
  category: text('category').notNull(),
  owner: text('owner').notNull(),
  confidentialityReq: text('confidentiality_req').notNull(),
  integrityReq: text('integrity_req').notNull(),
  availabilityReq: text('availability_req').notNull(),
  location: text('location'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Risks (Risikomanagement nach ISO 27005 & 5x5 Matrix)
export const ismsRisks = pgTable('isms_risks', {
  id: text('id').primaryKey(), // e.g. 'RSK-01'
  title: text('title').notNull(),
  assetRef: text('asset_ref').notNull(),
  threat: text('threat').notNull(),
  vulnerability: text('vulnerability').notNull(),
  impactDescription: text('impact_description'),
  ciaImpact: jsonb('cia_impact').$type<{ c: string; i: string; a: string }>().notNull(),
  preTreatment: jsonb('pre_treatment').$type<{ likelihood: number; impact: number; score: number; level: string }>().notNull(),
  treatmentStrategy: text('treatment_strategy').default('Mitigate').notNull(),
  treatmentPlan: text('treatment_plan'),
  linkedControls: jsonb('linked_controls').$type<string[]>().default([]).notNull(),
  postTreatment: jsonb('post_treatment').$type<{ likelihood: number; impact: number; score: number; level: string }>().notNull(),
  riskOwner: text('risk_owner').notNull(),
  status: text('status').default('In Behandlung').notNull(),
  reviewDate: text('review_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Policies (Sicherheitsrichtlinien nach Klausel 5.2)
export const ismsPolicies = pgTable('isms_policies', {
  id: text('id').primaryKey(), // e.g. 'POL-01'
  identifier: text('identifier').notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  status: text('status').default('Gültig').notNull(),
  version: text('version').default('1.0').notNull(),
  owner: text('owner').notNull(),
  approvedBy: text('approved_by'),
  effectiveDate: text('effective_date'),
  reviewCycleMonths: integer('review_cycle_months').default(12).notNull(),
  content: text('content').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Incidents (Sicherheitsvorfälle & DSGVO Art. 33)
export const ismsIncidents = pgTable('isms_incidents', {
  id: text('id').primaryKey(), // e.g. 'INC-2026-001'
  title: text('title').notNull(),
  detectedAt: text('detected_at').notNull(),
  reportedBy: text('reported_by').notNull(),
  severity: text('severity').notNull(),
  status: text('status').default('Offen').notNull(),
  gdprRelevant: boolean('gdpr_relevant').default(false).notNull(),
  affectedAssets: text('affected_assets'),
  description: text('description').notNull(),
  immediateAction: text('immediate_action'),
  rootCause: text('root_cause'),
  correctiveAction: text('corrective_action'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Audits (Auditprogramm nach Klausel 9 & 10)
export const ismsAudits = pgTable('isms_audits', {
  id: text('id').primaryKey(), // e.g. 'AUD-01'
  title: text('title').notNull(),
  type: text('type').notNull(),
  scope: text('scope').notNull(),
  auditor: text('auditor').notNull(),
  plannedDate: text('planned_date').notNull(),
  status: text('status').default('Geplant').notNull(),
  findingsCount: jsonb('findings_count').$type<{ conformities: number; minorNC: number; majorNC: number; ofi: number }>().notNull(),
  reportNotes: text('report_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
