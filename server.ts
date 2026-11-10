import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Endpoint for ISMS Copilot
app.post('/api/isms/ai', async (req, res) => {
  try {
    const { action, prompt, context } = req.body;

    if (!prompt && action !== 'audit_check') {
      return res.status(400).json({ error: 'Prompt ist erforderlich' });
    }

    if (!aiClient) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY ist serverseitig nicht konfiguriert. Bitte überprüfen Sie die Secrets in AI Studio.',
      });
    }

    let systemInstruction = `Du bist ein hochqualifizierter Senior CISO und Lead Auditor für ISO/IEC 27001:2022 und BSI IT-Grundschutz.
Du unterstützt den Anwender beim Aufbau und Betrieb seines Informationssicherheits-Managementsystems (ISMS).
Antworte präzise, professionell, strukturiert und praxisnah auf Deutsch.
Orientiere dich stets an den 93 Maßnahmen des Anhang A der ISO/IEC 27001:2022 (A.5 Organisatorisch, A.6 Personal, A.7 Physisch, A.8 Technologisch) sowie den Normanforderungen der Kapitel 4 bis 10.`;

    let userPrompt = prompt;

    if (action === 'assess_risk') {
      systemInstruction += `\nDeine Aufgabe: Führe eine fundierte Bedrohungs- und Risikoanalyse (ISO 27005 / ISO 27001 Klausel 6.1.2) für das gegebene Szenario durch.
Gib das Ergebnis als valides JSON-Objekt zurück mit exakt folgendem Schema:
{
  "title": "Prägnanter Risikotitel",
  "threat": "Konkrete Bedrohung",
  "vulnerability": "Bestehende Schwachstelle",
  "impactDescription": "Detaillierte Auswirkungsbeschreibung",
  "ciaImpact": {
    "c": "Low" | "Medium" | "High",
    "i": "Low" | "Medium" | "High",
    "a": "Low" | "Medium" | "High"
  },
  "likelihood": 1-5,
  "impact": 1-5,
  "suggestedTreatment": "Mitigate" | "Accept" | "Avoid" | "Transfer",
  "treatmentPlan": "Konkrete Behandlungsmaßnahmen",
  "suggestedControls": ["A.8.7", "A.5.15"]
}`;
      userPrompt = `Analysiere folgendes Risiko-/Assetszenario:\n${prompt}\nKontext: ${JSON.stringify(context || {})}`;
    } else if (action === 'audit_challenge') {
      systemInstruction += `\nDu agierst als erfahrener externer Lead Auditor (TÜV / DEKRA / DQS) in einem ISO 27001 Stage 2 Zertifizierungsaudit.
Stelle kritische, realistische Prüffragen zu Nachweisen (Evidenzen), Prozessreife und Management-Commitment.
Bewerte die Antwort des Nutzers konstruktiv mit Stärken, Abweichungen (Minor/Major Non-Conformity) und Verbesserungspotenzialen.`;
      userPrompt = `Auditsituation / Thema:\n${prompt}\nBisheriger Stand des Unternehmens: ${JSON.stringify(context || {})}`;
    } else if (action === 'generate_policy') {
      systemInstruction += `\nErstelle eine vollständige, normkonforme Unternehmensrichtlinie (Policy) nach ISO 27001:2022.
Gliedere sie professionell mit: 1. Zweck & Geltungsbereich, 2. Rollen & Verantwortlichkeiten, 3. Regelungen & Vorgaben, 4. Ausnahmen & Genehmigung, 5. Sanktionen bei Verstößen, 6. Überprüfung & Gültigkeit. Formatiere in klarem Markdown.`;
      userPrompt = `Erstelle eine Richtlinie für: ${prompt}. Kontext zum Unternehmen: ${JSON.stringify(context || {})}`;
    } else if (action === 'soa_justification') {
      systemInstruction += `\nErstelle eine professionelle und prüfungssichere Begründung für das Statement of Applicability (SoA) für eine ISO 27001 Maßnahme.
Formuliere entweder eine Begründung für die Anwendbarkeit inklusive typischer technischer/organisatorischer Nachweise ODER eine fundierte Nichtanwendbarkeitsbegründung.`;
      userPrompt = `Begründe folgende ISO 27001:2022 Maßnahme im SoA:\n${prompt}`;
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        ...(action === 'assess_risk' ? { responseMimeType: 'application/json' } : {}),
      },
    });

    return res.json({
      text: response.text || '',
      action,
    });
  } catch (error: any) {
    console.error('ISMS AI Error:', error);
    return res.status(500).json({
      error: error.message || 'Fehler bei der KI-Analyse',
    });
  }
});

// Setup dev server with Vite middlewares, or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`one-GRC NEXT Server running on port ${port}`);
  });
}

startServer();
