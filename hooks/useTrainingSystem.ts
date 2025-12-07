import React from 'react';
import { Team, DrillType, Formation, TacticStyle, AttackFocus, PassingStyle, Toast, SetPieceTakers } from '../types.ts';

interface TrainingSystemProps {
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  userTeamId: string;
  isGodMode: boolean;
  addToast: (message: string, type: Toast['type']) => void;
}

export const useTrainingSystem = ({ teams, setTeams, userTeamId, isGodMode, addToast }: TrainingSystemProps) => {

  const setDrill = (drill: DrillType, playerIds: string[]) => {
      setTeams(prev => prev.map(t => {
          if (t.id !== userTeamId) return t;
          const newAssignments = { ...t.trainingAssignments };
          playerIds.forEach(pid => newAssignments[pid] = drill);
          return { ...t, trainingAssignments: newAssignments };
      }));
      addToast(`Training updated for ${playerIds.length} players`, "success");
  };

  const unlockDrill = (drill: DrillType) => {
      setTeams(prev => prev.map(t => {
          if(t.id !== userTeamId) return t;
          return { ...t, unlockedDrills: [...(t.unlockedDrills || []), drill] };
      }));
      addToast(`New drill unlocked successfully!`, "success");
  };

  const updateLineup = (newLineup: string[]) => {
      setTeams(prev => prev.map(t => t.id === userTeamId ? { ...t, lineup: newLineup } : t));
  };

  const updateTactics = (formation: Formation, style: TacticStyle, attackFocus?: AttackFocus, passingStyle?: PassingStyle) => {
      setTeams(prev => prev.map(t => {
          if(t.id !== userTeamId) return t;
          return { 
              ...t, 
              formation, 
              tacticStyle: style,
              attackFocus: attackFocus || t.attackFocus,
              passingStyle: passingStyle || t.passingStyle
          };
      }));
      addToast(`Tactical instructions have been updated`, "success");
  };

  const updateSetPieceTakers = (newTakers: SetPieceTakers) => {
      setTeams(prev => prev.map(t => {
          if(t.id !== userTeamId) return t;
          return { ...t, setPieceTakers: newTakers };
      }));
      addToast(`Set piece specialists updated`, "success");
  };

  const upgradeFacility = (category: 'stadium' | 'store' | 'hospitality' | 'academy' | 'scouting', subType?: string, cost?: number) => {
      setTeams(prev => prev.map(t => {
          if(t.id !== userTeamId) return t;
          if(t.budget < (cost || 0) && !isGodMode) {
              addToast("You don't have enough budget for this upgrade!", "error");
              return t; 
          }

          const newFac = { ...t.facilities };
          
          if (category === 'academy') newFac.academyLevel += 1;
          else if (category === 'scouting') newFac.scoutingNetworkLevel += 1;
          else if (subType) {
              (newFac as any)[category][subType] += 1;
          }

          addToast("Facility upgraded successfully!", "success");

          return { ...t, facilities: newFac, budget: t.budget - (isGodMode ? 0 : (cost || 0)) };
      }));
  };

  return { setDrill, unlockDrill, updateLineup, updateTactics, updateSetPieceTakers, upgradeFacility };
};