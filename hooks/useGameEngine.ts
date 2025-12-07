import { useState } from 'react';
import { Sponsor, Toast, Scenario, ScenarioResult } from '../types.ts';
import { useGameState } from './useGameState.ts';
import { useMatchSystem } from './useMatchSystem.ts';
import { useTransferSystem } from './useTransferSystem.ts';
import { useTrainingSystem } from './useTrainingSystem.ts';
import { useAcademySystem } from './useAcademySystem.ts';
import { MatchSimulationResult } from '../services/liveMatch.ts';
import { resolveScenario } from '../services/scenarios.ts';

export const useGameEngine = (addToast: (msg: string, type: Toast['type']) => void) => {
  // 1. Core State
  const gameState = useGameState();
  
  // --- SCENARIO STATE ---
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);

  const handleTriggerScenario = (scenario: Scenario) => {
      setActiveScenario(scenario);
  };

  const handleScenarioDecision = async (optionId: string): Promise<ScenarioResult> => {
      if (!activeScenario || !gameState.userTeamId) return { success: false, message: 'Error', changes: {} };
      
      const team = gameState.teams.find(t => t.id === gameState.userTeamId)!;
      const result = resolveScenario(team, activeScenario.id, optionId);

      // Apply Changes
      gameState.setTeams(prev => prev.map(t => {
          if (t.id !== gameState.userTeamId) return t;
          return { ...t, ...result.changes };
      }));

      // Add News if applicable (optional logic in resolveScenario usually returns newsItem)
      // For now we assume result message serves as immediate feedback
      
      return result;
  };

  const handleCloseScenario = () => {
      setActiveScenario(null);
  };

  // 2. Sub Systems
  const matchSystem = useMatchSystem({
      isLoaded: gameState.isLoaded,
      teams: gameState.teams, setTeams: gameState.setTeams,
      matches: gameState.matches, setMatches: gameState.setMatches,
      currentWeek: gameState.currentWeek, setCurrentWeek: gameState.setCurrentWeek,
      setNews: gameState.setNews,
      setAvailableScouts: gameState.setAvailableScouts,
      campaignStartTime: gameState.campaignStartTime,
      season: gameState.season, setSeason: gameState.setSeason, 
      setHistory: gameState.setHistory, 
      addToast,
      onTriggerScenario: handleTriggerScenario // Pass the trigger
  });

  const transferSystem = useTransferSystem({
      teams: gameState.teams, setTeams: gameState.setTeams,
      setNews: gameState.setNews,
      userTeamId: gameState.userTeamId,
      currentWeek: gameState.currentWeek,
      isGodMode: gameState.isGodMode,
      addToast
  });

  const trainingSystem = useTrainingSystem({
      teams: gameState.teams, setTeams: gameState.setTeams,
      userTeamId: gameState.userTeamId,
      isGodMode: gameState.isGodMode,
      addToast
  });

  const academySystem = useAcademySystem({
      teams: gameState.teams, setTeams: gameState.setTeams,
      availableScouts: gameState.availableScouts, setAvailableScouts: gameState.setAvailableScouts,
      userTeamId: gameState.userTeamId,
      currentWeek: gameState.currentWeek,
      isGodMode: gameState.isGodMode,
      addToast
  });

  // 3. Finances
  const handleSignSponsor = (sponsor: Sponsor) => {
      gameState.setTeams(prev => prev.map(t => {
          if(t.id !== gameState.userTeamId) return t;
          return { ...t, sponsor, budget: t.budget + sponsor.signingBonus };
      }));
      gameState.setAvailableSponsors(prev => prev.filter(s => s.id !== sponsor.id));
      addToast(`Successfully signed a contract with ${sponsor.name}!`, 'success');
  };

  const handleMatchComplete = (matchId: string, result: MatchSimulationResult) => {
      matchSystem.advanceWeekWithManualResult(
          matchId,
          result.finalHomeScore,
          result.finalAwayScore,
          result.scorers
      );
      addToast('Match finished! The table and results have been updated.', 'success');
  };

  // 4. Options
  const handleUpdateTeamInfo = (name: string, manager: string, logoUrl: string) => {
      gameState.setTeams(prev => prev.map(t => {
          if(t.id !== gameState.userTeamId) return t;
          return { ...t, name, managerName: manager, customLogoUrl: logoUrl };
      }));
      addToast("Team information updated", "success");
  };

  const toggleTheme = () => {
      const newTheme = gameState.theme === 'dark' ? 'light' : 'dark';
      gameState.setTheme(newTheme);
  };

  // 4. Return Combined Interface (Façade Pattern)
  return {
      // Data
      isLoaded: gameState.isLoaded,
      hasSave: gameState.hasSave,
      initializeNewGame: gameState.initializeNewGame,
      teams: gameState.teams,
      matches: gameState.matches,
      news: gameState.news,
      currentWeek: gameState.currentWeek,
      userTeam: gameState.teams.find(t => t.id === gameState.userTeamId),
      userTeamId: gameState.userTeamId,
      availableSponsors: gameState.availableSponsors,
      availableScouts: gameState.availableScouts,
      campaignStartTime: gameState.campaignStartTime,
      isGodMode: gameState.isGodMode,
      setIsGodMode: gameState.setIsGodMode,
      
      // Theme
      theme: gameState.theme,
      toggleTheme,

      // Match Actions
      handleForcePlay: matchSystem.forcePlay,
      handleMatchComplete,
      
      // Meta Actions
      handleResetGame: gameState.resetGame,
      handleUpdateTeamInfo,
      
      // Training & Tactics
      handleUpdateLineup: trainingSystem.updateLineup,
      handleUpdateTactics: trainingSystem.updateTactics,
      handleSetDrill: trainingSystem.setDrill,
      handleUnlockDrill: trainingSystem.unlockDrill,
      handleUpgradeFacility: trainingSystem.upgradeFacility,
      handleUpdateSetPieceTakers: trainingSystem.updateSetPieceTakers,
      
      // Transfers
      handleBuyPlayer: transferSystem.negotiateTransfer,
      
      // Academy & Scouting
      handlePromotePlayer: academySystem.promotePlayer,
      handleHireScout: academySystem.hireScout,
      handleFireScout: academySystem.fireScout,
      handleAssignScout: academySystem.assignScout,
      handleSpawnYouth: academySystem.spawnYouth,
      
      // Finance
      handleSignSponsor,

      // Scenarios
      activeScenario,
      handleScenarioDecision,
      handleCloseScenario
  };
};