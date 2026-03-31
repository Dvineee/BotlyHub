
import { GoogleGenAI } from "@google/genai";
import { Bot } from "../types";

export class GeminiService {
  private static ai: GoogleGenAI | null = null;

  private static getAI() {
    if (!this.ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured");
      }
      this.ai = new GoogleGenAI({ apiKey });
    }
    return this.ai;
  }

  static async recommendBots(query: string, availableBots: Bot[]): Promise<string> {
    const ai = this.getAI();
    
    const botContext = availableBots.map(bot => 
      `Name: ${bot.name}, Category: ${bot.category}, Description: ${bot.description}, Price: ${bot.price} TRY`
    ).join("\n");

    const prompt = `
      You are an AI assistant for BotlyHub, a Telegram bot marketplace.
      A user is looking for a bot. Based on their query and the list of available bots below, recommend the most suitable bots.
      Explain why you are recommending them. Be helpful and professional.
      
      User Query: "${query}"
      
      Available Bots:
      ${botContext}
      
      Response format:
      - Start with a friendly greeting.
      - List 1-3 recommended bots with a brief explanation for each.
      - If no bots match perfectly, suggest the closest alternatives or ask for more details.
      - Keep it concise and formatted for a mobile app (use bullet points).
      - Language: Turkish.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
      });
      return response.text || "Üzgünüm, şu anda size yardımcı olamıyorum.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "AI asistanı şu anda meşgul. Lütfen daha sonra tekrar deneyin.";
    }
  }

  static async analyzeBot(bot: Bot): Promise<string> {
    const ai = this.getAI();
    
    const prompt = `
      Sen BotlyHub platformunun AI asistanısın. 
      Aşağıdaki botu analiz et ve kullanıcının neden bu botu seçmesi gerektiğini etkileyici bir dille anlat.
      Bot Adı: ${bot.name}
      Kategori: ${bot.category}
      Açıklama: ${bot.description}
      
      Yanıtın:
      - Botun en güçlü yanlarını vurgula.
      - Kullanıcıya sağlayacağı faydaları belirt.
      - Profesyonel, ikna edici ve samimi bir ton kullan.
      - Maksimum 3-4 kısa paragraf olsun.
      - Emoji kullan.
      - Dil: Türkçe.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
      });
      return response.text || "Analiz şu anda yapılamıyor.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "AI asistanı şu anda meşgul. Lütfen daha sonra tekrar deneyin.";
    }
  }

  static async generateBotDescription(botName: string, category: string): Promise<string> {
    const ai = this.getAI();
    
    const prompt = `
      Create a professional and catchy description for a Telegram bot named "${botName}" in the "${category}" category.
      The description should highlight potential features and benefits for users.
      Keep it under 200 characters.
      Language: Turkish.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
      });
      return response.text || "";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "";
    }
  }
}
