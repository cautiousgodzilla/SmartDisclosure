import { GoogleGenAI, Type } from "@google/genai";
import { IDFData, Message, AIResponseSchema, Phase } from '../types';
import { getSystemInstruction } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = 'gemini-3-flash-preview';

export interface AIInputData {
    text?: string;
    audioBase64?: string;
    media?: {
        mimeType: string;
        data: string; // base64
        isText?: boolean;
    };
}

export const generateAIResponse = async (
  currentData: IDFData,
  history: Message[],
  newItem: AIInputData
): Promise<AIResponseSchema> => {
  
  try {
    const parts: any[] = [];
    const currentPhase = currentData.currentPhase;

    // 1. Get Phase-Specific System Instruction
    const systemInstruction = getSystemInstruction(currentPhase);

    // 2. Build Context
    const stateContext = `
      CURRENT IDF STATE (JSON):
      ${JSON.stringify(currentData, null, 2)}
      
      INSTRUCTION FOR PHASE: ${currentPhase}
      Review the conversation history.
      - If I asked for clarification on a vague answer previously, and the user is still vague, provide the 3-option list.
      - If the user uploaded a file in this turn, SUMMARIZE it and ASK FOR CONFIRMATION.
    `;
    
    parts.push({ text: stateContext });

    // 3. Add History (filtered to relevant context if needed, but last 10 is usually safe)
    const recentHistory = history.slice(-10);
    recentHistory.forEach(msg => {
       if (msg.role !== 'system') {
           // We might include phase info in history to help model understand context switches
           parts.push({ text: `[Phase: ${msg.phase}] ${msg.role.toUpperCase()}: ${msg.content}` });
       }
    });

    // 4. Add new user input
    parts.push({ text: "USER INPUT (New):" });
    
    if (newItem.text) {
      parts.push({ text: newItem.text });
    }
    
    // Handle Media
    if (newItem.media) {
        if (newItem.media.isText) {
             parts.push({ text: `\n[ATTACHED FILE CONTENT]\n${newItem.media.data}\n[END ATTACHED FILE]\n` });
        } else {
            parts.push({
                inlineData: {
                  mimeType: newItem.media.mimeType,
                  data: newItem.media.data
                }
            });
        }
    }

    if (newItem.audioBase64) {
       parts.push({
        inlineData: {
          mimeType: 'audio/mp3',
          data: newItem.audioBase64
        }
      });
    }

    // 5. Call API
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            updatedFields: {
              type: Type.OBJECT,
              properties: {
                // Phase 0
                title: { type: Type.STRING },
                generalOverview: { type: Type.STRING },
                // Phase 1
                inventorName: { type: Type.STRING },
                inventorEmail: { type: Type.STRING },
                problem: { type: Type.STRING },
                // Phase 2
                solution: { type: Type.STRING },
                technicalDetails: { type: Type.STRING },
                diagramDescription: { type: Type.STRING },
                // Phase 3
                inventorsList: { type: Type.STRING },
                testingDates: { type: Type.STRING },
                publicDisclosures: { type: Type.STRING },
                upcomingDisclosures: { type: Type.STRING },
              }
            },
            aiResponse: { type: Type.STRING },
            nextPhase: { type: Type.BOOLEAN, description: "Set to true ONLY if all goals for the current phase are met and confirmed." }
          },
          required: ["aiResponse"]
        }
      },
      contents: {
        parts: parts
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIResponseSchema;
    }
    
    throw new Error("No response from AI");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return {
      updatedFields: {},
      aiResponse: "I encountered an error processing your request. Please try again."
    };
  }
};