import { GoogleGenAI, Modality } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    // In a real app, handle this gracefully. For this demo, we assume it exists.
  }
  return new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });
};

// Chat with Gemini 3 Pro
export const sendChatMessage = async (message: string, history: {role: string, parts: {text: string}[]}[] = []) => {
  const ai = getAiClient();
  // Convert simple history format to API format if needed, but Chat object handles history statefully usually.
  // Here we use a stateless approach for simplicity or instantiate a new chat with history.
  
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    history: history.map(h => ({
        role: h.role,
        parts: h.parts
    })),
    config: {
      systemInstruction: "You are a helpful AI assistant embedded in an image tool website. You help users with image editing advice, photography tips, and general questions.",
    }
  });

  const result = await chat.sendMessageStream({ message });
  return result;
};

// Analyze Image with Gemini 3 Pro
export const analyzeImage = async (base64Image: string, mimeType: string, prompt: string) => {
  const ai = getAiClient();
  
  const cleanBase64 = base64Image.split(',')[1] || base64Image;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64
          }
        },
        {
          text: prompt
        }
      ]
    }
  });

  return response.text;
};

// TTS with Gemini 2.5 Flash TTS
export const generateSpeech = async (text: string, voice: string = 'Kore') => {
  const ai = getAiClient();
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: {
      parts: [{ text }]
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice }
        }
      }
    }
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio;
};