
import { GoogleGenAI, Type } from "@google/genai";
import { WeatherForecastItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const MODEL_FAST = 'gemini-2.5-flash';

export const getHistoricalFacts = async (date: Date): Promise<Array<{ year: string; text: string }>> => {
  const dateString = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: `Give me 3 interesting, short historical facts that happened on ${dateString}. Keep them concise.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              year: { type: Type.STRING },
              text: { type: Type.STRING }
            },
            required: ["year", "text"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Error fetching history:", error);
    return [{ year: "Unknown", text: "Could not retrieve historical data at this time." }];
  }
};

export const getDailyHolidays = async (date: Date): Promise<string[]> => {
  const dateString = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  try {
    // Prompt for holidays
    const prompt = `List up to 4 major holidays, observances, or fun national days (e.g., "National Pizza Day") for ${dateString}. 
    Include international, national (US/UK/Major), or religious observances. 
    Return ONLY a JSON array of strings. If none, return an empty array.`;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return [];
  }
};

export const generateMeetingDetails = async (
  title: string, 
  description: string,
  startTime: string,
  endTime: string
): Promise<{ summary: string; meetLink: string; agenda: string[] }> => {
  try {
    const prompt = `
      I am scheduling a meeting titled "${title}".
      Description: "${description}".
      Time: ${startTime} to ${endTime}.
      
      Please act as an executive assistant. 
      1. Create a polite 1-sentence summary of the meeting event.
      2. Generate a realistic-looking (but mock) Google Meet link (format: https://meet.google.com/xxx-yyyy-zzz).
      3. Create a suggested 3-item agenda based on the title.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            meetLink: { type: Type.STRING },
            agenda: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["summary", "meetLink", "agenda"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Error generating meeting:", error);
    return {
      summary: "Meeting scheduled.",
      meetLink: "https://meet.google.com/abc-defg-hij",
      agenda: ["Introduction", "Discussion", "Next Steps"]
    };
  }
};

export const askAiAssistant = async (message: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: `You are a helpful, witty, and concise AI calendar assistant. Answer this query in 1-2 sentences: "${message}"`,
    });
    return response.text || "I'm having trouble thinking right now.";
  } catch (error) {
    return "Sorry, I am offline momentarily.";
  }
}

export const getWeatherForecast = async (location: string, date: Date): Promise<WeatherForecastItem[]> => {
  try {
    const timeNow = date.getHours();
    const prompt = `
      Generate a realistic hourly weather forecast for ${location} starting from hour ${timeNow}:00.
      Generate 24 hours of data.
      Condition MUST be one of: 'Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Snowy', 'Night', 'Clear'.
      If hour is between 19:00 and 06:00, bias towards 'Night' or 'Clear' unless raining/snowing.
      Include humidity (e.g. "45%"), wind speed (e.g. "10 mph"), and precipitation chance (e.g. "0%").
      Return JSON array.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING, description: "Time in HH:00 format" },
              temp: { type: Type.NUMBER },
              condition: { type: Type.STRING },
              humidity: { type: Type.STRING },
              windSpeed: { type: Type.STRING },
              precipitation: { type: Type.STRING }
            },
            required: ["time", "temp", "condition"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Error generating weather:", error);
    // Fallback data
    return Array.from({length: 24}, (_, i) => ({
      time: `${(new Date().getHours() + i) % 24}:00`,
      temp: 70 + Math.floor(Math.random() * 10),
      condition: 'Sunny',
      humidity: '50%',
      windSpeed: '5 mph',
      precipitation: '0%'
    }));
  }
};
