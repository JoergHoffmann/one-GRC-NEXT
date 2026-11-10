import {
  ISMSAsset,
  ISMSRisk,
  ISMSPolicy,
  ISMSIncident,
  ISMSAudit,
  ISMSOrganizationContext,
  ISMSStoreData,
} from '../types/isms';
import { initialISO27001Controls } from './iso27001Controls';

export const initialOrganizationContext: ISMSOrganizationContext = {
  companyName: 'Acme Cloud & Fintech Solutions GmbH',
  scopeStatement:
    'Geltungsbereich des ISMS umfasst die Bereitstellung, den Betrieb und die Softwareentwicklung der B2B-Fintech-Plattform sowie alle unterstützenden IT-Infrastrukturen und Cloud-Dienste am Standort Frankfurt am Main und in AWS eu-central-1.',
  cisoName: 'Dr. Florian Bergmann (CISO)',
  cisoEmail: 'security@acme-fintech.de',
  targetCertificationDate: '2026-09-30',
  applicableStandards: ['ISO/IEC 27001:2022', 'BSI IT-Grundschutz', 'EU-DSGVO (GDPR)', 'NIS-2'],
  stakeholders: [
    {
      id: 'stk-1',
      name: 'Banken- & Unternehmenskunden',
      requirement: 'Nachweisbare Einhaltung höchster Sicherheitsstandards, ISO 27001 Zertifikat, SOC 2 Typ II.',
      fulfillment: 'Jährliche externe Audits, Bereitstellung des aktuellen SoA und Zertifikats.',
    },
    {
      id: 'stk-2',
      name: 'Bundesanstalt für Finanzdienstleistungsaufsicht (BaFin) & BSI',
      requirement: 'Einhaltung BAIT / ZAIT und NIS-2 Meldepflichten für Sicherheitsvorfälle.',
      fulfillment: 'Etablierter Incident Response Prozess mit 24/7 Notfallbereitschaft und Behördenkontaktliste.',
    },
    {
      id: 'stk-3',
      name: 'Mitarbeiter & Betriebsrat',
      requirement: 'Klare Richtlinien, transparente Kontrollen, Schutz der Privatsphäre bei Logging.',
      fulfillment: 'Betriebsvereinbarung IT-Sicherheit und regelmäßige Sensibilisierungsschulungen.',
    },
  ],
};

export const initialAssets: ISMSAsset[] = [
  {
    id: 'AST-01',
    name: 'AWS Cloud Produktionsumgebung (Frankfurt)',
    category: 'Cloud',
    owner: 'Cloud Infrastructure Lead',
    confidentialityReq: 'Sehr Hoch',
    integrityReq: 'Sehr Hoch',
    availabilityReq: 'Sehr Hoch',
    location: 'AWS eu-central-1',
    description: 'Kubernetes Cluster (EKS), Aurora PostgreSQL Datenbanken, S3 Buckets für Kundenbelege.',
  },
  {
    id: 'AST-02',
    name: 'Kunden- & Zahlungsdatenbank (Aurora PG)',
    category: 'Data',
    owner: 'Head of Data & Database Administration',
    confidentialityReq: 'Sehr Hoch',
    integrityReq: 'Sehr Hoch',
    availabilityReq: 'Sehr Hoch',
    location: 'AWS RDS Cluster eu-central-1a/b',
    description: 'Enthält Stammdaten, IBANs, Transaktionshistorien und verschlüsselte PII.',
  },
  {
    id: 'AST-03',
    name: 'Mitarbeiter-Laptops (MacBook Pro & ThinkPad)',
    category: 'Hardware',
    owner: 'IT Workplace Engineering',
    confidentialityReq: 'Hoch',
    integrityReq: 'Hoch',
    availabilityReq: 'Normal',
    location: 'Mobil / Home Office & Büro Frankfurt',
    description: '140 Endgeräte, mit Microsoft Intune verwaltet, FileVault / BitLocker aktiviert.',
  },
  {
    id: 'AST-04',
    name: 'Quellcode-Repositories & CI/CD Pipelines',
    category: 'Software',
    owner: 'Head of Engineering',
    confidentialityReq: 'Sehr Hoch',
    integrityReq: 'Sehr Hoch',
    availabilityReq: 'Hoch',
    location: 'GitHub Enterprise Cloud (EU Data Boundary)',
    description: 'Kern-Codebasis der Zahlungsabwicklungs-Engines und Microservices.',
  },
  {
    id: 'AST-05',
    name: 'Unternehmenszentrale & Serverraum Frankfurt',
    category: 'Premises',
    owner: 'Facility Management Lead',
    confidentialityReq: 'Hoch',
    integrityReq: 'Hoch',
    availabilityReq: 'Hoch',
    location: 'Mainzer Landstraße 180, Frankfurt',
    description: 'Büroflächen 3. & 4. OG, klimatisierter Serverraum mit USV und Brandlöschanlage.',
  },
  {
    id: 'AST-06',
    name: 'Identitäts- & Zugriffsverwaltung (Entra ID)',
    category: 'Software',
    owner: 'IT Security Lead',
    confidentialityReq: 'Sehr Hoch',
    integrityReq: 'Sehr Hoch',
    availabilityReq: 'Sehr Hoch',
    location: 'Microsoft Cloud EU',
    description: 'Zentraler SSO IdP für alle Mitarbeiter, PIM für Admin-Rechte, Conditional Access.',
  },
];

export const initialRisks: ISMSRisk[] = [
  {
    id: 'RSK-01',
    title: 'Ransomware-Angriff über Phishing auf Mitarbeiter-Endgeräte',
    assetRef: 'AST-03 (Mitarbeiter-Laptops)',
    threat: 'Gezieltes Spear-Phishing mit Zero-Day Malware oder infiziertem Makro.',
    vulnerability: 'Menschliche Fehleinschätzung bei geschickter Täuschung (Social Engineering).',
    impactDescription: 'Verschlüsselung lokaler Daten, potenzieller Versuch der lateralen Bewegung ins Firmennetz.',
    ciaImpact: { c: 'High', i: 'High', a: 'High' },
    preTreatment: { likelihood: 4, impact: 4, score: 16, level: 'Kritisch' },
    treatmentStrategy: 'Mitigate',
    treatmentPlan: 'EDR-Verpflichtung, E-Mail Sandbox, monatliche Phishing-Simulationen, Immutable Cloud-Backups, Least Privilege ohne lokale Adminrechte.',
    linkedControls: ['A.6.3', 'A.8.7', 'A.8.1', 'A.8.13', 'A.8.19'],
    postTreatment: { likelihood: 2, impact: 2, score: 4, level: 'Niedrig' },
    riskOwner: 'CISO',
    status: 'In Behandlung',
    reviewDate: '2026-06-30',
  },
  {
    id: 'RSK-02',
    title: 'Fehlkonfiguration von Cloud-Storage (S3 Bucket Public Access)',
    assetRef: 'AST-01 (AWS Cloud Produktionsumgebung)',
    threat: 'Versehentliches Freigeben eines S3-Buckets mit vertraulichen Kundendaten.',
    vulnerability: 'Manuelle Änderungen in der AWS-Konsole ohne Infrastructure-as-Code Überprüfung.',
    impactDescription: 'Öffentlicher Datenabfluss von Kundendaten, DSGVO-Bußgelder, massiver Reputationsverlust.',
    ciaImpact: { c: 'High', i: 'Medium', a: 'Low' },
    preTreatment: { likelihood: 3, impact: 5, score: 15, level: 'Kritisch' },
    treatmentStrategy: 'Mitigate',
    treatmentPlan: 'Aktivierung von AWS S3 Block Public Access auf Organisationsebene, Drift Detection per Terraform, automatische Alerts via AWS Config.',
    linkedControls: ['A.5.23', 'A.8.9', 'A.8.15', 'A.8.20'],
    postTreatment: { likelihood: 1, impact: 4, score: 4, level: 'Niedrig' },
    riskOwner: 'Cloud Architect Lead',
    status: 'In Behandlung',
    reviewDate: '2026-05-15',
  },
  {
    id: 'RSK-03',
    title: 'Ausfall eines primären Rechenzentrums / Availability Zone bei AWS',
    assetRef: 'AST-01 (AWS Cloud Produktionsumgebung)',
    threat: 'Physischer Großbrand oder Stromausfall im Rechenzentrum eu-central-1a.',
    vulnerability: 'Abhängigkeit von einer einzelnen Verfügbarkeitszone ohne automatischen Failover.',
    impactDescription: 'Ausfall der Zahlungsplattform für Endkunden über mehrere Stunden.',
    ciaImpact: { c: 'Low', i: 'Low', a: 'High' },
    preTreatment: { likelihood: 2, impact: 5, score: 10, level: 'Hoch' },
    treatmentStrategy: 'Mitigate',
    treatmentPlan: 'Multi-AZ Deployment mit automatischer Umschaltung auf eu-central-1b und eu-central-1c; RTO < 15 Min.',
    linkedControls: ['A.8.14', 'A.5.30', 'A.8.13'],
    postTreatment: { likelihood: 1, impact: 2, score: 2, level: 'Niedrig' },
    riskOwner: 'Site Reliability Engineering Lead',
    status: 'Überwacht',
    reviewDate: '2026-08-01',
  },
  {
    id: 'RSK-04',
    title: 'Supply Chain Kompromittierung einer Open-Source-Bibliothek (NPM/PyPI)',
    assetRef: 'AST-04 (Quellcode-Repositories)',
    threat: 'Einschleusen bösartigen Codes in ein legitimes Third-Party-Paket.',
    vulnerability: 'Automatische Updates von Abhängigkeiten ohne automatische Schwachstellen- und Signaturprüfung.',
    impactDescription: 'Ausführung bösartiger Payloads auf Produktionsservern bei Deployment.',
    ciaImpact: { c: 'High', i: 'High', a: 'Medium' },
    preTreatment: { likelihood: 3, impact: 4, score: 12, level: 'Hoch' },
    treatmentStrategy: 'Mitigate',
    treatmentPlan: 'Snyk/Dependabot Scanning in CI/CD, Package Lockfiles, SBOM-Erstellung, Review von Dependency-Upgrades.',
    linkedControls: ['A.5.21', 'A.8.25', 'A.8.28'],
    postTreatment: { likelihood: 2, impact: 2, score: 4, level: 'Niedrig' },
    riskOwner: 'Head of Engineering',
    status: 'In Behandlung',
    reviewDate: '2026-07-15',
  },
  {
    id: 'RSK-05',
    title: 'Diebstahl oder Verlust eines unverschlüsselten Mitarbeiter-Laptops',
    assetRef: 'AST-03 (Mitarbeiter-Laptops)',
    threat: 'Verlust in Bahn, Taxi oder Einbruch in die Wohnung des Mitarbeiters.',
    vulnerability: 'Möglicher Zugriff auf lokale Dateien oder gespeicherte Tokens.',
    impactDescription: 'Verlust lokaler Dokumente, Risiko der Preisgabe von Zugangsdaten.',
    ciaImpact: { c: 'Medium', i: 'Low', a: 'Low' },
    preTreatment: { likelihood: 3, impact: 3, score: 9, level: 'Mittel' },
    treatmentStrategy: 'Mitigate',
    treatmentPlan: 'Erzwungene Festplattenverschlüsselung (XTS-AES 256), Remote-Wipe-Möglichkeit via MDM, Token-Revocation nach Meldung.',
    linkedControls: ['A.7.9', 'A.8.1', 'A.5.11'],
    postTreatment: { likelihood: 2, impact: 1, score: 2, level: 'Niedrig' },
    riskOwner: 'IT Operations',
    status: 'Überwacht',
    reviewDate: '2026-04-10',
  },
  {
    id: 'RSK-06',
    title: 'Insider-Bedrohung: Unberechtigter Export von Kundendaten durch ausscheidenden Mitarbeiter',
    assetRef: 'AST-02 (Kunden- & Zahlungsdatenbank)',
    threat: 'Mitarbeiter kopiert vor Kündigung Kundenlisten auf privaten Cloud-Speicher.',
    vulnerability: 'Zu weitreichende Leseberechtigungen und fehlendes DLP-Monitoring.',
    impactDescription: 'Verrat von Geschäftsgeheimnissen, Kundenverlust, Verstoß gegen DSGVO.',
    ciaImpact: { c: 'High', i: 'Low', a: 'Low' },
    preTreatment: { likelihood: 3, impact: 4, score: 12, level: 'Hoch' },
    treatmentStrategy: 'Mitigate',
    treatmentPlan: 'RBAC mit Least-Privilege, DLP-Überwachung auf Cloud-Uploads, Audit-Logging von Bulk-Exports, strikter Offboarding-Prozess.',
    linkedControls: ['A.5.15', 'A.5.18', 'A.6.5', 'A.8.12', 'A.8.16'],
    postTreatment: { likelihood: 1, impact: 3, score: 3, level: 'Niedrig' },
    riskOwner: 'CISO / Justiziar',
    status: 'In Behandlung',
    reviewDate: '2026-06-15',
  },
];

export const initialPolicies: ISMSPolicy[] = [
  {
    id: 'POL-01',
    identifier: 'POL-01',
    title: 'Übergeordnete Informationssicherheitsleitlinie (Security Policy)',
    category: 'Governance',
    status: 'Gültig',
    version: '2.1',
    owner: 'CISO',
    approvedBy: 'Geschäftsführung (Dr. M. Weber)',
    effectiveDate: '2026-01-15',
    reviewCycleMonths: 12,
    content: `# Informationssicherheits-Leitlinie (ISMS Policy)
**Version:** 2.1 | **Status:** Gültig | **Normbezug:** ISO/IEC 27001:2022 Klausel 5.2 & Anhang A.5.1

## 1. Präambel & Zweck
Informationen und IT-Systeme sind zentrale strategische Werte unseres Unternehmens. Die Sicherheit dieser Werte – Vertraulichkeit, Integrität und Verfügbarkeit – ist unerlässlich für das Vertrauen unserer Kunden und den wirtschaftlichen Erfolg.

## 2. Geltungsbereich
Diese Leitlinie gilt verbindlich für alle Mitarbeiter, Führungskräfte, Berater sowie externe Auftragnehmer an allen Standorten und in allen cloudbasierten Systemen.

## 3. Sicherheitsgrundsätze
1. **Management-Verpflichtung:** Die Geschäftsführung verpflichtet sich zur Bereitstellung aller erforderlichen personellen, finanziellen und technischen Ressourcen für den Betrieb des ISMS.
2. **Risikobasierter Ansatz:** Alle Sicherheitsmaßnahmen werden auf Basis systematischer Risikoanalysen nach ISO 27005 ermittelt und regelmäßig überprüft.
3. **Security by Design:** Sicherheit ist integraler Bestandteil aller Entwicklungsprozesse und IT-Beschaffungen.
4. **Schulung & Sensibilisierung:** Alle Mitarbeiter werden regelmäßig zu Informationssicherheit und Datenschutz geschult.
5. **Verpflichtung zur Meldung:** Sicherheitsrelevante Ereignisse sind unverzüglich über die definierten Kanäle an das CISO-Team zu melden.

## 4. Rollen und Verantwortlichkeiten
- **Geschäftsleitung:** Gesamtverantwortung für Informationssicherheit und Freigabe des Budgets.
- **CISO:** Koordination, Überwachung und Weiterentwicklung des ISMS sowie Berichterstattung an die Geschäftsleitung.
- **Führungskräfte:** Durchsetzung der Leitlinien in den jeweiligen Fachbereichen.
- **Alle Mitarbeiter:** Gewissenhafte Einhaltung der Sicherheitsrichtlinien und Meldung von Abweichungen.

## 5. Konsequenzen bei Verstößen
Vorsätzliche oder grob fahrlässige Verstöße gegen diese Leitlinie gefährden das Unternehmen und können arbeitsrechtliche sowie zivil- und strafrechtliche Konsequenzen nach sich ziehen.`,
  },
  {
    id: 'POL-02',
    identifier: 'POL-02',
    title: 'Passwort- & Authentifizierungsrichtlinie',
    category: 'Identitätsmanagement',
    status: 'Gültig',
    version: '1.4',
    owner: 'IT Security Lead',
    approvedBy: 'CISO',
    effectiveDate: '2026-01-10',
    reviewCycleMonths: 12,
    content: `# Passwort- und Authentifizierungsrichtlinie
**Version:** 1.4 | **Status:** Gültig | **Normbezug:** ISO/IEC 27001:2022 Anhang A.5.17 & A.8.5

## 1. Geltungsbereich
Gilt für alle Benutzerkonten, die Zugriff auf Unternehmenssysteme, E-Mails, Server, Cloud-Dienste und Datenbanken gewähren.

## 2. Anforderungen an Passwörter & Passphrasen
- **Mindestlänge:** Mindestens 14 Zeichen für Standardbenutzer; mindestens 18 Zeichen für privilegierte Administratorkonten.
- **Komplexität:** Kombination aus Groß-/Kleinbuchstaben, Ziffern und Sonderzeichen ODER eine aus mindestens vier Wörtern bestehende Passphrase (z.B. "BlauerSonneKaffeeWinter2026!").
- **Kein regelmäßiger Zwangswechsel:** Passwörter müssen nur geändert werden, wenn ein Verdacht auf Kompromittierung besteht (gemäß BSI- und NIST-Empfehlungen).

## 3. Multi-Faktor-Authentifizierung (MFA)
- MFA ist für alle Zugänge von extern (VPN, SaaS, Cloud, E-Mail) verpflichtend.
- Als zweiter Faktor sind bevorzugt Hardware-Sicherheitsschlüssel (FIDO2) oder Authenticator-Apps (TOTP / Push mit Nummern-Matching) zu verwenden. SMS-Codes sind nur als Fallback zulässig.

## 4. Nutzung von Passwort-Managern
- Die Nutzung des vom Unternehmen bereitgestellten Enterprise-Passwortmanagers (1Password) ist verpflichtend.
- Passwörter dürfen niemals in Klartextdateien, E-Mails, Chats oder auf Notizzetteln gespeichert werden.`,
  },
  {
    id: 'POL-03',
    identifier: 'POL-03',
    title: 'Richtlinie für Telearbeit und Mobile Geräte (Remote Work & BYOD)',
    category: 'Arbeitsplatzsicherheit',
    status: 'Gültig',
    version: '2.0',
    owner: 'CISO / HR',
    approvedBy: 'Geschäftsführung',
    effectiveDate: '2026-02-01',
    reviewCycleMonths: 12,
    content: `# Richtlinie für Telearbeit und Mobile Geräte
**Version:** 2.0 | **Status:** Gültig | **Normbezug:** ISO/IEC 27001:2022 Anhang A.6.7 & A.8.1

## 1. Zielsetzung
Sicherstellung des Datenschutzes und der IT-Sicherheit beim mobilen Arbeiten, im Home Office und auf Reisen.

## 2. Physische Sicherheit bei mobiler Arbeit
- Bildschirme dürfen in der Öffentlichkeit (Bahn, Café, Flugzeug) nicht von Dritten einsehbar sein (Einsatz von Blickschutzfiltern verpflichtend).
- Geräte dürfen niemals unbeaufsichtigt in Fahrzeugen oder ungesicherten Hotelzimmern gelassen werden.
- Dritte (auch Familienmitglieder) dürfen Firmenendgeräte unter keinen Umständen nutzen.

## 3. Technische Absicherung
- Firmenlaptops werden ausschließlich über das zentrale MDM (Microsoft Intune) verwaltet.
- Die Festplattenverschlüsselung darf nicht deaktiviert werden.
- Die Verbindung zum Firmennetz erfolgt immer über verschlüsselte Zero-Trust-Verbindungen oder VPN.
- Private USB-Speichermedien dürfen an Firmen-Hardware nicht angeschlossen werden.`,
  },
  {
    id: 'POL-04',
    identifier: 'POL-04',
    title: 'Richtlinie zur Behandlung von Sicherheitsvorfällen (Incident Response)',
    category: 'Incident Management',
    status: 'Gültig',
    version: '1.3',
    owner: 'SecOps Lead',
    approvedBy: 'CISO',
    effectiveDate: '2026-01-20',
    reviewCycleMonths: 12,
    content: `# Vorfallsbehandlungsrichtlinie (Incident Response Policy)
**Version:** 1.3 | **Status:** Gültig | **Normbezug:** ISO/IEC 27001:2022 Anhang A.5.24 - A.5.28

## 1. Definition eines Sicherheitsvorfalls
Ein Sicherheitsvorfall ist jedes unerwünschte Ereignis, das die Vertraulichkeit, Integrität oder Verfügbarkeit von Informationen oder Systemen beeinträchtigt oder wahrscheinlich beeinträchtigen wird (z.B. Ransomware, Phishing-Erfolg, verlorener Laptop, DDOS).

## 2. Meldewege & Fristen
- Jeder Mitarbeiter ist verpflichtet, auffällige Ereignisse sofort an das Security-Team unter security@acme-fintech.de oder über die Notfallnummer zu melden.
- Keine Sanktionen: Gutgläubige Meldungen von Fehlern oder Missgeschicken werden nicht disziplinarisch geahndet (Just Culture).

## 3. 72-Stunden-Frist nach DSGVO & NIS-2
- Bei Verletzungen des Schutzes personenbezogener Daten prüft der CISO gemeinsam mit dem Datenschutzbeauftragten innerhalb von 24 Stunden, ob ein Risiko für die Rechte betroffener Personen besteht.
- Falls meldepflichtig: Meldung an die zuständige Datenschutzaufsichtsbehörde binnen maximal 72 Stunden nach Bekanntwerden (Art. 33 DSGVO).`,
  },
  {
    id: 'POL-05',
    identifier: 'POL-05',
    title: 'Datensicherungs- & Kontinuitätsrichtlinie (Backup & Disaster Recovery)',
    category: 'Betrieb & Kontinuität',
    status: 'Gültig',
    version: '1.2',
    owner: 'IT Infrastructure Lead',
    approvedBy: 'IT-Leitung',
    effectiveDate: '2026-01-28',
    reviewCycleMonths: 12,
    content: `# Datensicherungs- und Kontinuitätsrichtlinie
**Version:** 1.2 | **Status:** Gültig | **Normbezug:** ISO/IEC 27001:2022 Anhang A.8.13 & A.5.30

## 1. Backup-Strategie (3-2-1-1 Regel)
- Mindestens 3 Kopien aller geschäftskritischen Daten.
- Gespeichert auf mindestens 2 unterschiedlichen Speichermedientypen.
- Mindestens 1 Kopie an einem geographisch getrennten Standort (z.B. AWS Sekundärregion).
- Mindestens 1 Kopie ist **unveränderbar (Immutable / WORM)** und gegen Ransomware-Löschung geschützt.

## 2. Wiederherstellungsziele
- **RTO (Recovery Time Objective):** Kritische Kundensysteme müssen innerhalb von 4 Stunden nach Totalausfall wieder funktionsfähig sein.
- **RPO (Recovery Point Objective):** Maximal zulässiger Datenverlust beträgt 1 Stunde.

## 3. Testpflichten
- Mindestens quartalsweise muss ein dokumentierter Test der Wiederherstellung einzelner Datenbanken und Server erfolgen.
- Jährlich findet eine vollumfängliche Katastrophenschutzübung (Disaster Recovery Simulation) statt.`,
  },
];

export const initialIncidents: ISMSIncident[] = [
  {
    id: 'INC-2026-001',
    title: 'Gezielte Phishing-Kampagne gegen Finanzbuchhaltung',
    detectedAt: '2026-02-14 09:15',
    reportedBy: 'K. Schmidt (Buchhaltung)',
    severity: 'Mittel',
    status: 'Behoben',
    gdprRelevant: false,
    affectedAssets: 'Mitarbeiter-Postfächer Exchange',
    description: 'Täuschend echte E-Mail mit angeblichem Zahlungsauftrag der Geschäftsführung (CEO-Fraud). Ein Mitarbeiter klickte auf den Link, gab aber dank 1Password keine Daten ein.',
    immediateAction: 'Absender-Domain auf Gateway blockiert, bösartige E-Mails aus allen Postfächern gelöscht, Entra ID Session des Nutzers zurückgesetzt.',
    rootCause: 'Neue Domain des Angreifers war noch auf keiner Threat-Intelligence-Blacklist verzeichnet.',
    correctiveAction: 'Sicherheits-Kurzschulung für alle Buchhaltungsmitarbeiter durchgeführt und Phishing-Meldebutton hervorgehoben.',
  },
  {
    id: 'INC-2026-002',
    title: 'Verlust eines Dienst-Smartphones auf Geschäftsreise',
    detectedAt: '2026-01-22 17:30',
    reportedBy: 'T. Müller (Vertrieb)',
    severity: 'Niedrig',
    status: 'Geschlossen',
    gdprRelevant: false,
    affectedAssets: 'iPhone 15 Pro (AST-03)',
    description: 'Smartphone im ICE verloren gegangen. Gerät war mit 6-stelligem PIN und FaceID gesichert.',
    immediateAction: 'Gerät binnen 15 Minuten über Intune remote gelöscht (Wipe) und SIM-Karte beim Provider gesperrt.',
    rootCause: 'Unachtsamkeit beim Aussteigen aus dem Zug.',
    correctiveAction: 'Mitarbeiter erhielt Ersatzgerät; Intune-Wipe-Protokoll im Audit-Archiv dokumentiert.',
  },
];

export const initialAudits: ISMSAudit[] = [
  {
    id: 'AUD-01',
    title: 'Internes ISMS System-Audit 2025 (Klauseln 4-10 & Anhang A)',
    type: 'Internes Audit',
    scope: 'Gesamtes ISMS: IT-Betrieb, Entwicklung, HR, Notfallvorsorge',
    auditor: 'Dr. C. Franke (Zertifizierter ISO 27001 Lead Auditor, extern)',
    plannedDate: '2025-11-15',
    status: 'Abgeschlossen',
    findingsCount: {
      conformities: 38,
      minorNC: 2,
      majorNC: 0,
      ofi: 4,
    },
    reportNotes: 'Sehr gute Vorbereitung. Geringfügige Abweichungen (Minor NCs) bei Dokumentation von Lieferantenprüfungen und Berechtigungs-Rezertifizierung behoben.',
  },
  {
    id: 'AUD-02',
    title: 'ISO/IEC 27001:2022 Stage 1 Vorbereitungsaudit',
    type: 'Stage 1 Audit',
    scope: 'Dokumentenprüfung der ISMS-Politik, SoA, Risikomethodik und Geltungsbereich',
    auditor: 'TÜV Rheinland Cert GmbH',
    plannedDate: '2026-05-12',
    status: 'Geplant',
    findingsCount: {
      conformities: 0,
      minorNC: 0,
      majorNC: 0,
      ofi: 0,
    },
    reportNotes: 'Offizielles Stage 1 Audit zur Feststellung der Zertifizierungsreife.',
  },
  {
    id: 'AUD-03',
    title: 'ISO/IEC 27001:2022 Stage 2 Zertifizierungsaudit',
    type: 'Stage 2 Zertifizierung',
    scope: 'Vollständige Prüfung der praktischen Wirksamkeit aller 93 Controls vor Ort und in AWS',
    auditor: 'TÜV Rheinland Cert GmbH',
    plannedDate: '2026-09-20',
    status: 'Geplant',
    findingsCount: {
      conformities: 0,
      minorNC: 0,
      majorNC: 0,
      ofi: 0,
    },
    reportNotes: 'Hauptaudit für das ISO 27001 Zertifikat mit 3-jähriger Gültigkeit.',
  },
];

export const initialISMSState: ISMSStoreData = {
  version: '2026.1',
  organization: initialOrganizationContext,
  controls: initialISO27001Controls,
  assets: initialAssets,
  risks: initialRisks,
  policies: initialPolicies,
  incidents: initialIncidents,
  audits: initialAudits,
  lastSavedAt: new Date().toISOString(),
};
