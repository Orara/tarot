import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getTarotReading(cards, mode, language) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "여기에_발급받은_GEMINI_API_키를_입력하세요") {
    throw new Error("API_KEY_MISSING");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // We use gemini-1.5-flash as it is fast and powerful enough for this task
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const cardNames = cards.map(c => c.name).join(', ');
  
  let prompt = "";
  if (mode === 'free') {
    prompt = `You are a mystical, blunt, and extremely accurate Tarot Master. 
The user has drawn the following Tarot card for a quick, 1-card reading: ${cardNames}.
Please provide a very short, impactful, and slightly blunt "팩폭" (hard truth) interpretation. 
It should be maximum 3-4 sentences. Do not be overly polite, be mysterious, slightly dramatic, and direct.
IMPORTANT: You MUST answer strictly and fluently in this language code: ${language}. Do not use English unless the language code is 'en'.`;
  } else if (mode === 'basic') {
    prompt = `You are a premium, world-class mystical Tarot Master providing a basic 3-card reading.
The user has drawn the following 3 Tarot cards: ${cardNames}.
Assume the first card is the Past, the second is the Present, and the third is the Future/Outcome.
Provide a detailed, insightful, and beautifully written deep reading.
Use Markdown to format the reading clearly with headings (##), bold text, and bullet points.
Structure the reading into:
1. Introduction & Overall Energy
2. The Past
3. The Present
4. The Future / Outcome
5. Summary Advice
IMPORTANT: You MUST answer strictly and fluently in this language code: ${language}. Do not use English unless the language code is 'en'.`;
  } else if (mode === 'premium') {
    prompt = `You are a premium, world-class mystical Tarot Master providing a 5-card cross reading.
The user has drawn the following 5 Tarot cards: ${cardNames}.
Assume the sequence: 1. Present Situation, 2. Core Conflict/Obstacle, 3. Hidden Influence/Subconscious, 4. Advice/Action to take, 5. Likely Outcome.
Provide a highly detailed, premium spiritual consultation.
Use Markdown to format the reading clearly with headings (##), bold text, and bullet points.
Structure the reading into:
1. Overall Atmosphere
2. Present & Conflict (Cards 1 & 2)
3. Hidden Influences (Card 3)
4. Recommended Action (Card 4)
5. Likely Outcome (Card 5)
6. Final Blessings
IMPORTANT: You MUST answer strictly and fluently in this language code: ${language}. Do not use English unless the language code is 'en'.`;
  } else if (mode === 'vip') {
    prompt = `You are a legendary, world-class mystical Tarot Master providing the ultimate 10-card Celtic Cross reading.
The user has drawn the following 10 Tarot cards: ${cardNames}.
Assume the Celtic Cross sequence: 1. Present, 2. Challenge, 3. Subconscious/Root Cause, 4. Past, 5. Conscious/Goals, 6. Near Future, 7. Self/Attitude, 8. Environment/Others, 9. Hopes/Fears, 10. Ultimate Outcome.
Provide the most extensive, incredibly detailed, and profound reading possible. It should feel like a $100 professional consultation.
Use Markdown to format the reading beautifully with headings (##), bold text, and bullet points.
Structure the reading comprehensively covering all 10 positions and provide a majestic concluding summary.
IMPORTANT: You MUST answer strictly and fluently in this language code: ${language}. Do not use English unless the language code is 'en'.`;
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("API_ERROR");
  }
}
