import React, { useEffect } from 'react';
import { Team, Match, NewsItem, MatchEvent, Toast, Scout, SeasonHistory, Scenario } from '../types.ts';
import { simulateMatch, calculateWeeklyFinances, processWeeklyUpdates, startNewSeason } from '../services/engine.ts';
import { generateRandomNews, generateScouts } from '../services/generator.ts';
import { getTargetWeek } from '../services/scheduler.ts';
import { generateFixtures } from '../services/engine.ts';
import { getRandomScenario } from '../services/scenarios.ts';

interface MatchSystemProps {
  isLoaded: boolean;
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  currentWeek: number;
  setCurrentWeek: React.Dispatch<React.SetStateAction<number>>;
  setNews: React.Dispatch<React.SetStateAction<NewsItem[]>>;
  setAvailableScouts: React.Dispatch<React.SetStateAction<Scout[]>>;
  campaignStartTime: number;
  season: number; 
  setSeason: React.Dispatch<React.SetStateAction<number>>; 
  setHistory: React.Dispatch<React.SetStateAction<SeasonHistory[]>>; 
  addToast: (message: string, type: Toast['type']) => void;
  onTriggerScenario: (scenario: Scenario) => void; 
}

export const useMatchSystem = ({
  isLoaded,
  teams, setTeams,
  matches, setMatches,
  currentWeek, setCurrentWeek,
  setNews,
  setAvailableScouts,
  campaignStartTime,
  season, setSeason,
  setHistory,
  addToast,
  onTriggerScenario
}: MatchSystemProps) => {

  const advanceWeek = (userMatchId?: string, manualHomeScore?: number, manualAwayScore?: number, manualScorers?: any[]) => {
    const nextWeek = currentWeek + 1;
    
    // --- SEASON RESET LOGIC ---
    if (nextWeek > 30) { 
        if(confirm("The season has ended! Do you want to start a new season?")) {
            const userTeam = teams.find(t => t.managerName !== 'CPU'); 
            const { updatedTeams: resetTeams, history: newHistoryEntry, gameOver, retiredPlayers } = startNewSeason(teams, season, userTeam?.id);
            
            if (gameOver) {
                window.dispatchEvent(new CustomEvent('GAME_OVER'));
                return;
            }

            if (retiredPlayers && retiredPlayers.length > 0) {
                const names = retiredPlayers.map(p => p.name).join(', ');
                addToast(`Retired Players: ${names}`, "info");
                const retirementNews: NewsItem = {
                    id: `retire-${Date.now()}`,
                    week: 0,
                    message: `The following players have announced their retirement from professional football: ${names}`,
                    type: 'general'
                };
                setNews(prev => [retirementNews, ...prev]);
            }

            setTeams(resetTeams);
            setHistory(prev => [...prev, newHistoryEntry]);
            const newMatches = generateFixtures(resetTeams);
            setMatches(newMatches);
            setCurrentWeek(0);
            setSeason(prev => prev + 1);
            addToast("A new season has begun! Records have been updated and champions crowned.", "success");
            return;
        } else {
            return;
        }
    }

    const thisWeekMatches = matches.filter(m => m.week === nextWeek);
    
    if (thisWeekMatches.length === 0) {
        addToast("No matches this week or the season has ended.", "warning");
        return;
    }

    let updatedTeams = [...teams];
    const updatedMatches = [...matches];
    let weekNews: NewsItem[] = [];

    // 1. Simulate Matches
    thisWeekMatches.forEach(match => {
        const homeTeam = updatedTeams.find(t => t.id === match.homeTeamId)!;
        const awayTeam = updatedTeams.find(t => t.id === match.awayTeamId)!;
        
        let simResult = simulateMatch(match, homeTeam, awayTeam);
        
        if (userMatchId && match.id === userMatchId && manualHomeScore !== undefined && manualAwayScore !== undefined) {
             simResult.match.homeScore = manualHomeScore;
             simResult.match.awayScore = manualAwayScore;
             // if (manualScorers) simResult.scorers = manualScorers; // Removed to fix type error, scorers logic pending full implementation

             const isHomeWin = manualHomeScore > manualAwayScore;
             const isDraw = manualHomeScore === manualAwayScore;
             
             simResult.homeUpdates.goalsFor = homeTeam.goalsFor + manualHomeScore;
             simResult.homeUpdates.goalsAgainst = homeTeam.goalsAgainst + manualAwayScore;
             simResult.homeUpdates.points = homeTeam.points + (isHomeWin ? 3 : (isDraw ? 1 : 0));
             simResult.homeUpdates.wins = homeTeam.wins + (isHomeWin ? 1 : 0);
             simResult.homeUpdates.draws = homeTeam.draws + (isDraw ? 1 : 0);
             simResult.homeUpdates.losses = homeTeam.losses + (!isHomeWin && !isDraw ? 1 : 0);
             simResult.homeUpdates.form = [...homeTeam.form, isHomeWin ? 'W' : (isDraw ? 'D' : 'L')].slice(-5);

             simResult.awayUpdates.goalsFor = awayTeam.goalsFor + manualAwayScore;
             simResult.awayUpdates.goalsAgainst = awayTeam.goalsAgainst + manualHomeScore;
             simResult.awayUpdates.points = awayTeam.points + (!isHomeWin && !isDraw ? 3 : (isDraw ? 1 : 0));
             simResult.awayUpdates.wins = awayTeam.wins + (!isHomeWin && !isDraw ? 1 : 0);
             simResult.awayUpdates.draws = awayTeam.draws + (isDraw ? 1 : 0);
             simResult.awayUpdates.losses = awayTeam.losses + (isHomeWin ? 1 : 0);
             simResult.awayUpdates.form = [...awayTeam.form, !isHomeWin && !isDraw ? 'W' : (isDraw ? 'D' : 'L')].slice(-5);
        }

        const homeIdx = updatedTeams.findIndex(t => t.id === homeTeam.id);
        updatedTeams[homeIdx] = { ...homeTeam, ...simResult.homeUpdates };
        
        const awayIdx = updatedTeams.findIndex(t => t.id === awayTeam.id);
        updatedTeams[awayIdx] = { ...awayTeam, ...simResult.awayUpdates };

        const matchIdx = updatedMatches.findIndex(m => m.id === match.id);
        updatedMatches[matchIdx] = simResult.match;
    });

    // 2. Financial Updates & Weekly Process
    updatedTeams = updatedTeams.map(t => {
        // Find if this team played a match this week and get the result context
        const playedMatch = updatedMatches.find(m => m.week === nextWeek && (m.homeTeamId === t.id || m.awayTeamId === t.id));
        
        let matchContext = undefined;
        if (playedMatch && playedMatch.played) {
            const isHome = playedMatch.homeTeamId === t.id;
            const myScore = isHome ? playedMatch.homeScore! : playedMatch.awayScore!;
            const oppScore = isHome ? playedMatch.awayScore! : playedMatch.homeScore!;
            
            let result: 'W' | 'D' | 'L' = 'D';
            if (myScore > oppScore) result = 'W';
            else if (myScore < oppScore) result = 'L';
            
            matchContext = { isHome, result };
        }

        const finances = calculateWeeklyFinances(t, matchContext);
        const budgetUpdate = t.budget + finances.netProfit;
        const processedTeam = processWeeklyUpdates(t);
        return { ...processedTeam, budget: budgetUpdate };
    });

    // 3. Generate News
    if (nextWeek % 2 === 0) {
        weekNews.push(generateRandomNews(nextWeek, updatedTeams));
    }

    // 4. Refresh Scouts
    if (nextWeek % 4 === 0) {
        setAvailableScouts(generateScouts(5, 5));
        weekNews.push({
            id: Date.now().toString() + 'scout',
            week: nextWeek,
            message: "A new batch of scouts has arrived on the market.",
            type: 'general'
        });
    }

    setTeams(updatedTeams);
    setMatches(updatedMatches);
    setCurrentWeek(nextWeek);
    if (weekNews.length > 0) setNews(prev => [...weekNews, ...prev]);
    
    if (!userMatchId) {
        addToast(`Matches for week ${nextWeek} have concluded`, "info");
    }

    // --- TRIGGER SCENARIO LOGIC ---
    // 20% Chance every week to trigger a scenario
    if (Math.random() < 0.20) {
        setTimeout(() => {
            onTriggerScenario(getRandomScenario());
        }, 1500); // Small delay for effect
    }
  };

  const advanceWeekWithManualResult = (matchId: string, homeScore: number, awayScore: number, scorers: any[]) => {
      advanceWeek(matchId, homeScore, awayScore, scorers);
  };

  const forcePlay = () => {
      advanceWeek();
  };

  return {
      advanceWeekWithManualResult,
      forcePlay
  };
};