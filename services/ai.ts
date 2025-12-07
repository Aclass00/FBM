import { GoogleGenAI } from "@google/genai";
import { Team, Formation, TacticStyle } from '../types.ts';

interface AIAnalysis {
  formation: Formation;
  tacticStyle: TacticStyle;
  reason: string;
}

export const analyzeTeamPerformance = async (team: Team, leaguePosition: number): Promise<AIAnalysis | null> => {
  // Use environment variable for API Key
  if (!process.env.API_KEY) {
    return simulateAIDecision(team, leaguePosition);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      You are the manager of a football team named "${team.name}".
      Current Stats:
      - League Position: ${leaguePosition}
      - Points: ${team.points}
      - Form: ${team.form.join('-')} (W=Win, D=Draw, L=Loss)
      - Current Formation: ${team.formation}
      - Current Style: ${team.tacticStyle}
      - Goals For: ${team.goalsFor}, Goals Against: ${team.goalsAgainst}

      Analyze the team's performance. If the form is bad (mostly L or D) or position is low, suggest a tactical change.
      
      Return ONLY a JSON object with this structure:
      {
        "formation": "Formation name (e.g. 4-3-3, 4-4-2, 5-3-2...)",
        "tacticStyle": "Style name (e.g. Attacking, Defensive, Counter Attack...)",
        "reason": "A short sentence in English explaining why you made this change as a manager."
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text) as AIAnalysis;

  } catch (error) {
    console.error("AI Error:", error);
    return simulateAIDecision(team, leaguePosition);
  }
};

// Fallback function that works without internet/API key
const simulateAIDecision = (team: Team, pos: number): AIAnalysis => {
  const recentForm = team.form.slice(-3);
  const losses = recentForm.filter(f => f === 'L').length;
  // Calculate matches played as it is not a direct property of Team
  const matchesPlayed = team.wins + team.draws + team.losses;
  
  // If the team is losing a lot, switch to defense
  if (losses >= 2) {
     return {
         formation: '5-3-2',
         tacticStyle: 'Counter Attack',
         reason: `The manager of ${team.name} has opted for a defensive counter-attacking setup after recent disappointing results.`
     };
  }

  // If the team is conceding too many goals
  if (team.goalsAgainst > team.goalsFor + 5) {
      return {
          formation: '4-5-1',
          tacticStyle: 'Defensive',
          reason: `Due to defensive fragility, the manager of ${team.name} has decided to pack the midfield to close down spaces.`
      };
  }

  // If the team is not scoring
  if (team.goalsFor < matchesPlayed) {
      return {
          formation: '3-4-3',
          tacticStyle: 'Attacking',
          reason: `${team.name}'s manager is going all-out attack to solve their goal-scoring problems.`
      };
  }

  // Random change to break routine
  const formations: Formation[] = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2'];
  const styles: TacticStyle[] = ['Possession', 'High Press', 'Balanced'];
  
  return {
      formation: formations[Math.floor(Math.random() * formations.length)],
      tacticStyle: styles[Math.floor(Math.random() * styles.length)],
      reason: `The manager of ${team.name} is looking to freshen things up with a new tactic to surprise opponents.`
  };
};