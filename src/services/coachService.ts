import { GoogleGenAI } from "@google/genai";
import { UserProfile, MealLog } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getCoachAdvice(profile: UserProfile, todayMeals: MealLog[]): Promise<string> {
  const model = "gemini-3-flash-preview";
  
  const consumedCalories = todayMeals.reduce((acc, m) => acc + m.calories, 0);
  const consumedProtein = todayMeals.reduce((acc, m) => acc + m.protein, 0);
  const consumedCarbs = todayMeals.reduce((acc, m) => acc + m.carbs, 0);
  const consumedFat = todayMeals.reduce((acc, m) => acc + m.fat, 0);

  const prompt = `
    You are a professional AI health and nutrition coach for an app called DietSnap.
    Your tone is motivational, expert, and direct (like a premium personal trainer).
    
    User Profile:
    - Age: ${profile.age}
    - Gender: ${profile.gender}
    - Current Weight: ${profile.weight}
    - Height: ${profile.height}
    - Activity Level: ${profile.activityLevel}
    - Goal: ${profile.goalType}
    - Daily Calorie Target: ${profile.goal}
    
    Today's Data:
    - Consumed: ${consumedCalories} kcal
    - Protein: ${consumedProtein}g
    - Carbs: ${consumedCarbs}g
    - Fat: ${consumedFat}g
    - Meals Logged: ${todayMeals.length}
    
    Based on this information, provide a short, punchy, and highly personalized piece of advice (max 2 sentences).
    If they are over their budget, be encouraging but firm. 
    If they are under, suggest what to eat next.
    If they haven't logged anything, encourage them to start their day.
    Mention specific things like protein needs if relevant.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        maxOutputTokens: 100,
        temperature: 0.7,
      }
    });

    return response.text || "Keep pushing towards your goals! Every snap counts.";
  } catch (error) {
    console.error("Coach Service Error:", error);
    return "Your AI Coach is currently analyzing your data. Check back in a moment!";
  }
}
