
import { GoogleGenAI } from "@google/genai";
import { Bot } from "../types";

export class GeminiService {
  private static getAI() {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API anahtarı yapılandırılmadı. Lütfen ayarlardan API anahtarınızı ekleyin.");
    }
    return new GoogleGenAI({ apiKey });
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

  static async generateAd(prompt: string, generateImage: boolean = true): Promise<{ title: string; content: string; button_text: string; image_url: string }> {
    const ai = this.getAI();
    
    try {
      // Text Generation
      const textResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Create a compelling advertisement for: ${prompt}. 
        Return a JSON object with:
        - title: A catchy short title (max 40 chars)
        - content: Engaging ad copy (max 200 chars)
        - button_text: Short call to action (max 15 chars)
        All text should be in Turkish.`,
        config: {
          responseMimeType: "application/json",
        }
      });

      if (!textResponse.text) {
        throw new Error("Yapay zeka metin içeriği üretemedi.");
      }

      const adData = JSON.parse(textResponse.text);

      // Image Generation with Fallback
      let imageUrl = '';
      if (generateImage) {
        try {
          const imageResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
              parts: [{ text: `A high-quality, professional advertisement visual for: ${prompt}. Modern, vibrant, and eye-catching.` }]
            },
            config: {
              imageConfig: {
                aspectRatio: "16:9"
              }
            }
          });

          const parts = imageResponse.candidates?.[0]?.content?.parts;
          if (parts) {
            for (const part of parts) {
              if (part.inlineData) {
                imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                break;
              }
            }
          }
        } catch (imgError) {
          console.warn("Gemini Image Generation failed (likely quota), using fallback:", imgError);
        }
      }

      if (!imageUrl) {
        imageUrl = `https://picsum.photos/seed/${encodeURIComponent(prompt)}/1280/720`;
      }

      return {
        title: adData.title || '',
        content: adData.content || '',
        button_text: adData.button_text || 'İNCELE',
        image_url: imageUrl
      };
    } catch (error) {
      console.error("Gemini Ad Generation Error:", error);
      throw error;
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
