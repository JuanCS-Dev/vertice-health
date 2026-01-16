import { VertexAI } from '@google-cloud/vertexai';

// Ajuste para o seu projeto e região reais
const PROJECT_ID = 'vertice-ai-health-hackathon';
const LOCATION = 'us-central1';

const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });

interface GenerateContentParams {
  model: string;
  config?: {
    systemInstruction?: string;
    temperature?: number;
  };
  contents: {
    role: string;
    parts: { text: string }[];
  }[];
}

export function getVertexAIClient() {
  return {
    models: {
      generateContent: async (params: GenerateContentParams) => {
        const model = vertexAI.getGenerativeModel({ 
            model: params.model,
            systemInstruction: params.config?.systemInstruction,
            generationConfig: {
                temperature: params.config?.temperature
            }
        });
        return model.generateContent(params.contents[0].parts[0].text);
      }
    }
  };
}
