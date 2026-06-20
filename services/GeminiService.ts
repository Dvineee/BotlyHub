import { Bot } from "../types";
import { API_BASE_URL } from "../constants";

export class GeminiService {
  static async recommendBots(query: string, availableBots: Bot[]): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL || ''}/api/ai/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, availableBots })
      });
      if (!response.ok) {
        throw new Error("Tavsiye API çağrısı başarısız.");
      }
      const data = await response.json();
      return data.text || "Üzgünüm, şu anda size yardımcı olamıyorum.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "AI asistanı şu anda meşgul. Lütfen daha sonra tekrar deneyin.";
    }
  }

  static async analyzeBot(bot: Bot): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL || ''}/api/ai/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bot })
      });
      if (!response.ok) {
        throw new Error("Analiz API çağrısı başarısız.");
      }
      const data = await response.json();
      return data.text || "Analiz şu anda yapılamıyor.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "AI asistanı şu anda meşgul. Lütfen daha sonra tekrar deneyin.";
    }
  }

  static async generateAd(prompt: string, generateImage: boolean = true): Promise<{ title: string; content: string; button_text: string; image_url: string }> {
    try {
      const response = await fetch(`${API_BASE_URL || ''}/api/ai/generate-ad`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, generateImage })
      });
      if (!response.ok) {
        throw new Error("Yapay zeka reklam üretimi başarısız.");
      }
      return await response.json();
    } catch (error) {
      console.error("Gemini Ad Generation Error:", error);
      throw error;
    }
  }

  static async generateBotDescription(botName: string, category: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL || ''}/api/ai/generate-description`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botName, category })
      });
      if (!response.ok) {
        throw new Error("Açıklama API çağrısı başarısız.");
      }
      const data = await response.json();
      return data.text || "";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "";
    }
  }

  static async generateSlug(title: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL || ''}/api/ai/generate-slug`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title })
      });
      if (!response.ok) {
        throw new Error("Slug API çağrısı başarısız.");
      }
      const data = await response.json();
      return data.slug || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    } catch (error) {
      console.error("Gemini Slug Generation Error:", error);
      return title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
  }
}
