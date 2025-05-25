
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { VocabularyQuestion } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable is not set.");
  // The app will show a generic error if API_KEY is missing, 
  // as specific error handling for this is complex without a backend.
}

const ai = new GoogleGenAI({ apiKey: API_KEY! }); // Assume API_KEY is present per instructions

const model = ai.models;

const PROMPT = `
Generate a vocabulary question for a 7th-grade student.
The response MUST be a JSON object with the following fields:
- "word": A single vocabulary word suitable for a 7th grader.
- "sentences": An array of three distinct sentences. One sentence should correctly use the vocabulary word (replace the word with '_____'). The other two sentences should be distractors where the word does not fit (also use '_____' as a placeholder). The sentences should be at a 7th-grade reading level. Ensure the '_____' placeholder is present in each sentence.
- "correctSentenceIndex": A number (0, 1, or 2) indicating the index of the sentence in the "sentences" array where the "word" correctly fits.
- "explanation": A simple explanation of the vocabulary word's meaning and why it fits in the correct sentence, suitable for a 7th grader.

Example output format:
{
  "word": "eloquent",
  "sentences": [
    "The old house looked _____ in the moonlight.",
    "She gave an _____ speech that moved everyone.",
    "He _____ ate his dinner quickly."
  ],
  "correctSentenceIndex": 1,
  "explanation": "Eloquent means fluent or persuasive in speaking or writing. The speech was moving because it was eloquent."
}
`;

export const fetchVocabularyQuestion = async (): Promise<VocabularyQuestion> => {
  if (!API_KEY) {
    throw new Error("API Key is not configured. Cannot fetch question.");
  }
  try {
    const response: GenerateContentResponse = await model.generateContent({
      model: "gemini-2.5-flash-preview-04-17", // Use appropriate model
      contents: PROMPT,
      config: {
        responseMimeType: "application/json",
      }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; // Matches ```json ... ``` or ``` ... ```
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr) as VocabularyQuestion;

    if (
      !parsedData.word ||
      !parsedData.sentences ||
      parsedData.sentences.length !== 3 ||
      !parsedData.sentences.every(s => typeof s === 'string' && s.includes('_____')) ||
      typeof parsedData.correctSentenceIndex !== 'number' ||
      parsedData.correctSentenceIndex < 0 || parsedData.correctSentenceIndex > 2 ||
      !parsedData.explanation
    ) {
      console.error("Invalid data structure from API:", parsedData);
      throw new Error("Received invalid data structure from API.");
    }
    
    return parsedData;

  } catch (error) {
    console.error("Error fetching vocabulary question from Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to fetch data from Gemini API: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching data.");
  }
};
    