import React, { useState } from 'react';
import { Sparkles, X, Send, Shield, BookOpen, CheckCircle } from 'lucide-react';
import { ISMSStoreData } from '../types/isms';

interface AIConsultantModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ISMSStoreData;
}

export const AIConsultantModal: React.FC<AIConsultantModalProps> = ({ isOpen, onClose, data }) => {
  const [messages, setMessages] = useState<
    { role: 'assistant' | 'user'; text: string }[]
  >([
    {
      role: 'assistant',
      text: `Willkommen! Ich bin Ihr KI-Sicherheitsberater und Lead Auditor für ISO/IEC 27001:2022 und BSI IT-Grundschutz.

Ich kenne Ihren aktuellen Geltungsbereich (${data.organization.companyName}) und Ihre ${data.controls.length} Controls. 

Wie kann ich Sie heute unterstützen?
• Konkrete Nachweisführung (Evidenzen) für Klauseln oder Anhang-A-Maßnahmen
• Vorbereitung auf das TÜV / DEKRA Stage 1 oder Stage 2 Zertifizierungsaudit
• Risikobewertung nach ISO 27005 und Definition von Behandlungsplänen
• Mapping zwischen ISO 27001, BSI IT-Grundschutz und NIS-2`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    const updatedMessages = [...messages, { role: 'user' as const, text: userText }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const res = await fetch('/api/isms/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'consultant',
          prompt: userText,
          context: {
            company: data.organization.companyName,
            scope: data.organization.scopeStatement,
            ciso: data.organization.cisoName,
            totalControls: data.controls.length,
            implementedControls: data.controls.filter((c) => c.implementationStatus === 'implemented').length,
            risksCount: data.risks.length,
            recentConversation: updatedMessages.slice(-4),
          },
        }),
      });

      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || 'Serverfehler');

      setMessages((prev) => [...prev, { role: 'assistant', text: responseData.text }]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `Fehler: ${e.message || 'Verbindung fehlgeschlagen'}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl h-[650px] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                KI-Sicherheitsberater & Lead Auditor
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  Gemini 3.8 Flash
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Experte für ISO/IEC 27001:2022, BSI IT-Grundschutz, NIS-2 & DSGVO
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs leading-relaxed">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 ${
                m.role === 'assistant' ? 'items-start' : 'items-start flex-row-reverse'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                  m.role === 'assistant'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}
              >
                {m.role === 'assistant' ? 'ISO' : 'Sie'}
              </div>
              <div
                className={`p-3.5 rounded-xl max-w-xl whitespace-pre-wrap ${
                  m.role === 'assistant'
                    ? 'bg-slate-950/70 border border-slate-800 text-slate-200'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-slate-400">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold">
                ISO
              </div>
              <span className="italic">Lead Auditor analysiert Anfrage & Normenbezug...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-500 whitespace-nowrap">Vorschläge:</span>
          {[
            'Welche Evidenzen verlangt A.8.13?',
            'Unterschied ISO 27001:2013 zu 2022?',
            'Wie formuliere ich Klausel 4.3 Geltungsbereich?',
            'Welche Nachweise braucht der Auditor bei A.5.15?',
          ].map((q) => (
            <button
              key={q}
              onClick={() => setInput(q)}
              className="text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700/60 whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Footer Input */}
        <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Stellen Sie eine Frage zum ISMS, zu ISO 27001 Nachweisen oder zum Audit..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            Senden
          </button>
        </form>
      </div>
    </div>
  );
};
