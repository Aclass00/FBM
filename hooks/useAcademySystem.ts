import React from 'react';
import { Team, Scout, Toast } from '../types.ts';
import { generateAcademySpawns, generateRichScoutReport } from '../services/generator.ts';

interface AcademySystemProps {
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  availableScouts: Scout[];
  setAvailableScouts: React.Dispatch<React.SetStateAction<Scout[]>>;
  userTeamId: string;
  currentWeek: number;
  isGodMode: boolean;
  addToast: (message: string, type: Toast['type']) => void;
}

export const useAcademySystem = ({
  teams, setTeams,
  availableScouts, setAvailableScouts,
  userTeamId, currentWeek, isGodMode,
  addToast
}: AcademySystemProps) => {

  const spawnYouth = () => {
      setTeams(prev => prev.map(t => {
          if(t.id !== userTeamId) return t;
          const newPlayers = generateAcademySpawns(t.facilities.academyLevel);
          return { 
              ...t, 
              youthPlayers: [...t.youthPlayers, ...newPlayers],
              lastAcademySpawnWeek: currentWeek 
          };
      }));
      addToast("A new batch of players has joined the academy!", "success");
  };

  const promotePlayer = (playerId: string) => {
      let promotedName = "";
      setTeams(prev => prev.map(t => {
          if(t.id !== userTeamId) return t;
          const player = t.youthPlayers.find(p => p.id === playerId);
          if(!player) return t;
          promotedName = player.name;

          return {
              ...t,
              youthPlayers: t.youthPlayers.filter(p => p.id !== playerId),
              players: [...t.players, { ...player }] // Move to main squad
          };
      }));
      if(promotedName) addToast(`${promotedName} has been promoted to the first team!`, "success");
  };

  const hireScout = (scout: Scout) => {
      // 1. Validate against current state
      const team = teams.find(t => t.id === userTeamId);
      if (!team) return;

      const level = team.facilities.scoutingNetworkLevel;
      let maxScouts = 1;
      if (level >= 4) maxScouts = 2;
      if (level >= 8) maxScouts = 3;
      if (level >= 10) maxScouts = 5;

      if(team.scouts.length >= maxScouts) {
          addToast("You can't hire more scouts, upgrade your network first!", "error");
          return;
      }
      
      if(team.budget < scout.cost && !isGodMode) {
          addToast("Not enough budget to hire this scout", "error");
          return;
      }

      // 2. Perform Updates
      setTeams(prev => prev.map(t => {
          if(t.id !== userTeamId) return t;
          return { 
              ...t, 
              scouts: [...t.scouts, scout],
              budget: t.budget - (isGodMode ? 0 : scout.cost)
          };
      }));

      // 3. Remove from Market & Notify
      // CRITICAL FIX: Ensure we filter based on ID to remove from market immediately
      setAvailableScouts(prev => prev.filter(s => s.id !== scout.id));
      addToast(`Scout ${scout.name} has been hired`, "success");
  };

  const fireScout = (scoutId: string) => {
      setTeams(prev => prev.map(t => {
          if(t.id !== userTeamId) return t;
          return {
              ...t,
              scouts: t.scouts.filter(s => s.id !== scoutId)
          };
      }));
      addToast("The scout has been fired.", "info");
  };

  const assignScout = (playerId: string, scoutId: string) => {
      setTeams(prev => prev.map(t => {
          if(t.id !== userTeamId) return t;
          
          const updatedYouth = t.youthPlayers.map(p => {
              if(p.id === playerId) {
                  const scout = t.scouts.find(s => s.id === scoutId)!;
                  const report = generateRichScoutReport(p, scout);

                  return { 
                      ...p, 
                      isScouted: true, 
                      estimatedPotential: p.potential.toString(), 
                      scoutedBy: scoutId,
                      reports: [...(p.reports || []), report]
                  };
              }
              return p;
          });

          return { ...t, youthPlayers: updatedYouth };
      }));
      addToast("Scout report received", "info");
  };

  return { spawnYouth, promotePlayer, hireScout, assignScout, fireScout };
};