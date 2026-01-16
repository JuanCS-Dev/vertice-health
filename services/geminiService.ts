import { GoogleGenAI } from "@google/genai";
import { GENESIS_SYSTEM_INSTRUCTION, DR_HOUSE_SYSTEM_INSTRUCTION, MODEL_NAME } from "../constants";
import { Attachment, PatientData, GeminiPart, VerticeError } from "../types";
import { DIAGNOSTIC_PERSONAS } from "../src/ai/diagnostic-personas";

/**
 * TRINITY ARCHITECTURE: Client-Side Implementation
 * ================================================
 * 
 * Orchestrates the "Trinity" consensus using Gemini 3 Pro.
 * 1. Parallel Personas (Conservative, Aggressive, Academic)
 * 2. Consensus Fusion
 */

// Helper to format the prompt
const formatPatientPrompt = (data: PatientData): string => `
PATIENT CONTEXT:
Age: ${data.age} | Sex: ${data.sex} | Location: ${data.location}
Biometrics: ${data.weight}kg / ${data.height}cm
Vitals: ${data.vitals}

MAIN SYMPTOMS:
${data.symptoms}

MEDICAL HISTORY:
${data.history}

REGIONAL CONTEXT:
${data.context}

INSTRUCTIONS:
Analyze this case strictly according to your system persona.
`;

// Adicione esta interface para tipar o retorno do "Juiz"
interface DiagnosticSafetyCheck {
  confidenceScore: number; // 0 a 100
  criticalFlag: boolean;
  disagreementLevel: "LOW" | "MEDIUM" | "HIGH";
  reasoning: string;
  finalReportMarkdown: string;
}

export const analyzeCase = async (
  patientData: PatientData,
  attachments: Attachment[]
): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new VerticeError("API Key not found", "CONFIG_ERROR");

  const client = new GoogleGenAI({ apiKey });

  // 1. Prepare Inputs (Mantido igual)
  const basePrompt = formatPatientPrompt(patientData);
  const parts: GeminiPart[] = [{ text: basePrompt }];
  const attachmentParts = attachments.map(att => ({
    inlineData: { mimeType: att.mimeType, data: att.data }
  }));
  const fullContents = [{ role: 'user', parts: [...parts, ...attachmentParts] }];

  try {
    // 2. Trinity Execution (Mantido igual - Coleta as 3 visões)
    console.log(`[Trinity] Launching 3 Personas on ${MODEL_NAME}...`);
    
    const personaPromises = DIAGNOSTIC_PERSONAS.map(async (persona) => {
      try {
        const response = await client.models.generateContent({
            model: MODEL_NAME,
            config: { systemInstruction: persona.systemPrompt, temperature: persona.temperature },
            contents: fullContents
        });
        return { id: persona.id, name: persona.name, output: response.text || "No analysis provided." };
      } catch (e) {
        return { id: persona.id, name: persona.name, output: "Analysis Failed." };
      }
    });

    const personaResults = await Promise.all(personaPromises);
    const successfulPersonas = personaResults.filter(r => r.output !== "Analysis Failed.");

    if (successfulPersonas.length === 0) {
      throw new VerticeError("Falha total nos agentes de diagnóstico.", "TRINITY_FATAL");
    }

    // ---------------------------------------------------------
    // AQUI ENTRA A NOVA CAMADA DE TRATAMENTO E SEGURANÇA
    // ---------------------------------------------------------
    
    console.log(`[The Judge] Analyzing consensus via Adversarial Review...`);

    // Prompt "O Juiz" - Focado em Segurança e Protocolos OMS
    const judgePrompt = `
      ATUE COMO: Presidente da Junta Médica (Review Board) em contexto humanitário.
      
      ENTRADA: ${successfulPersonas.length} análises de especialistas sobre o mesmo paciente.
      
      SUA MISSÃO CRÍTICA:
      1. Identifique contradições perigosas entre os agentes (ex: um sugere esperar, outro sugere cirurgia urgente).
      2. Valide as hipóteses contra protocolos internacionais (OMS/MSF).
      3. Se houver dúvida razoável, opte pela segurança (pior cenário possível).
      4. Calcule um SCORE DE CONFIANÇA (0-100) baseado na concordância dos agentes e clareza dos sintomas.

      AGENTES:
      ${successfulPersonas.map(p => `[${p.name.toUpperCase()}]: ${p.output}`).join('\n\n')}

      SAÍDA OBRIGATÓRIA (JSON Block):
      \`\`\`json
      {
        "confidenceScore": number,
        "disagreementLevel": "LOW" | "MEDIUM" | "HIGH",
        "criticalFlag": boolean (true se houver risco de morte iminente),
        "reasoning": "Explicação breve da decisão da junta",
        "finalReportMarkdown": "O relatório final formatado em Markdown..."
      }
      \`\`\`
      
      No "finalReportMarkdown", use a estrutura:
      🚨 URGÊNCIA (Score: X%)
      🏥 DIAGNÓSTICO PRIMÁRIO (Com base em evidências)
      💊 PLANO DE AÇÃO (Protocolo Humanitário)
      ⚠️ SINAIS DE ALERTA (Red Flags)
    `;

    const consensusResponse = await client.models.generateContent({
      model: MODEL_NAME,
      config: { 
        responseMimeType: "application/json", // Força JSON para podermos validar via código
        temperature: 0.1 // Temperatura baixíssima para precisão cirúrgica
      },
      contents: [{ role: 'user', parts: [{ text: judgePrompt }] }]
    });

    const consensusText = consensusResponse.text || "{}";
    // Clean potential markdown fencing if the model adds it despite JSON mode
    const cleanJson = consensusText.replace(/```json\n?|```/g, "").trim();
    const judgeResult = JSON.parse(cleanJson) as DiagnosticSafetyCheck;

    // ---------------------------------------------------------
    // LÓGICA DE BLOQUEIO (TRATAMENTO DE DADOS)
    // ---------------------------------------------------------

    // Regra 1: Baixa Confiança = Bloqueio de Diagnóstico
    if (judgeResult.confidenceScore < 60) {
      console.warn("Diagnóstico bloqueado por baixa confiança:", judgeResult.confidenceScore);
      return `
# ⚠️ DIAGNÓSTICO INCONCLUSIVO - PROTOCOLO DE SEGURANÇA

**Nível de Confiança da IA:** Baixo (${judgeResult.confidenceScore}%)
**Motivo:** ${judgeResult.reasoning}

Os dados fornecidos não são suficientes para um diagnóstico seguro ou há divergência grave entre os modelos clínicos.

**AÇÃO RECOMENDADA:**
1. Monitorar Sinais Vitais a cada 4 horas.
2. Se houver piora, buscar transporte imediato (mesmo que difícil).
3. Tentar nova consulta com mais detalhes (fotos da lesão, áudio da tosse, medição exata de febre).

*O sistema priorizou a segurança do paciente ao não "chutar" um diagnóstico incerto.*
      `;
    }

    // Regra 2: Divergência Alta em Casos Críticos
    if (judgeResult.disagreementLevel === "HIGH" && judgeResult.criticalFlag) {
       return `
# 🚨 ALERTA DE DIVERGÊNCIA CLÍNICA

**Atenção:** Detectamos sinais graves, mas os modelos divergem sobre a causa exata.
**Consenso:** Tratar como o PIOR CENÁRIO POSSÍVEL (Princípio da Precaução).

${judgeResult.finalReportMarkdown}
       `;
    }

    // Se passou nos filtros, retorna o relatório aprovado
    return judgeResult.finalReportMarkdown;

  } catch (error: unknown) {
    console.error("Trinity Execution Error:", error);
    // Fallback de segurança máxima
    return "ERRO CRÍTICO NO SISTEMA. POR FAVOR, BUSQUE AJUDA HUMANA IMEDIATAMENTE. NÃO CONFIE EM DADOS PARCIAIS.";
  }
};

/**
 * Generates a concise medical referral note for telemedicine handoffs.
 * Optimized for pasting into Google Meet chat or WhatsApp.
 */
export const generateReferralSummary = async (
  patientContext: string,
  specialistType: string
): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new VerticeError("API Key missing", "CONFIG_ERROR");

  const client = new GoogleGenAI({ apiKey });
  
  const prompt = `
    ACT AS: Medical Scribe / Triage Officer.
    TASK: Write a short, professional referral note for a ${specialistType}.
    CONTEXT: ${patientContext}
    
    FORMAT:
    [URGENCY INDICATOR] Patient Name (Age)
    - Chief Complaint: ...
    - Key Vitals: ...
    - Suspicion: ...
    - Request: "Please evaluate for..."
    
    CONSTRAINT: Keep it under 100 words. optimize for reading on a mobile screen (WhatsApp/Meet).
  `;

  try {
    const response = await client.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    return response.text || "Failed to generate referral.";
  } catch (e) {
    console.error(e);
    return "Error generating referral note.";
  }
};

/**
 * Generates structured JSON instructions for the Pictogram Engine.
 * Converts complex medical advice into simple visual steps (Sun/Moon/Pill).
 */
export const generatePictogramInstructions = async (diagnosisContext: string): Promise<any[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new VerticeError("API Key missing", "CONFIG_ERROR");

  const client = new GoogleGenAI({ apiKey });

  const prompt = `
    ACT AS: Visual Communication Expert for Low-Literacy Patients.
    INPUT: Medical diagnosis/treatment plan.
    TASK: Break down the treatment into simple, visual steps.
    
    CONTEXT: ${diagnosisContext.substring(0, 2000)}

    OUTPUT JSON ARRAY (Strict Schema):
    [
      {
        "id": 1,
        "timeOfDay": "morning" | "noon" | "evening" | "night" | "any",
        "action": "take-pill" | "drink-water" | "eat" | "rest" | "alert",
        "quantity": 1 (number, e.g. 2 pills),
        "instruction": "Simple text (max 5 words, e.g. 'Take 2 pills')"
      }
    ]

    RULES:
    - Keep it extremely simple.
    - If medication is needed, specify quantity.
    - Limit to max 5 key steps.
  `;

  try {
    const response = await client.models.generateContent({
      model: MODEL_NAME,
      config: { responseMimeType: "application/json" },
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    
    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (e) {
    console.error("Pictogram Gen Error:", e);
    // Fallback manual instructions if AI fails
    return [
      { id: 1, timeOfDay: "any", action: "alert", quantity: 1, instruction: "Follow doctor advice" }
    ];
  }
};

/**
 * VOX MEDICUS: Medical Scribe
 * Extracts structured clinical data from raw voice transcripts.
 */

/**
 * VOX MEDICUS: Multimodal Medical Scribe (Audio Native)
 * Uses Gemini 3 Pro to listen to audio, analyze intonation/urgency, and extract clinical data.
 */
export const processMedicalAudioScribe = async (audioBase64: string, mimeType: string = 'audio/webm'): Promise<PatientData> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new VerticeError("API Key missing", "CONFIG_ERROR");

  const client = new GoogleGenAI({ apiKey });

  // 2026 Humanitarian Prompt: Focus on acoustic cues + data
  const prompt = `
    ACT AS: Elite Medical Scribe & Triage Specialist.
    INPUT: Audio recording of a consultation (Doctor/Patient) in a humanitarian zone.
    
    YOUR MULTIMODAL TASKS:
    1. LISTEN: Transcribe the dialogue faithfully.
    2. ANALYZE ACOUSTICS: Detect pain in the voice, labored breathing (dyspnea), or panic. Use this to flag "Urgency".
    3. EXTRACT: Structured clinical data.
    
    OUTPUT JSON (Strictly matching this schema):
    {
      "age": "string (estimated if missing)",
      "sex": "M/F/Other",
      "symptoms": "Chief complaint + Acoustic findings (e.g. 'Patient sounds breathless')",
      "history": "Medical history mentioned",
      "vitals": "Any numbers mentioned (BP, HR, Temp)",
      "location": "Inferred or 'Unknown'",
      "weight": "string or empty",
      "height": "string or empty",
      "context": "Resource context + Urgency Assessment (Low/Medium/High)"
    }
  `;

  try {
    const response = await client.models.generateContent({
      model: MODEL_NAME,
      config: { responseMimeType: "application/json" },
      contents: [
        { 
          role: 'user', 
          parts: [
            { text: prompt },
            { inlineData: { mimeType: mimeType, data: audioBase64 } }
          ] 
        }
      ]
    });
    
    const text = response.text || "{}";
    return JSON.parse(text) as PatientData;
  } catch (e) {
    console.error("Multimodal Scribe Error:", e);
    throw new VerticeError("Failed to process audio stream.", "SCRIBE_ERROR");
  }
};

export const createDrHouseChat = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new VerticeError("API Key missing", "CONFIG_ERROR");
  
  const client = new GoogleGenAI({ apiKey });
  
  // Creating a chat session using the unified client
  return client.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: DR_HOUSE_SYSTEM_INSTRUCTION,
      temperature: 0.5,
    }
  });
};
