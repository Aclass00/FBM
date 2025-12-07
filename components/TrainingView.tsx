

import React, { useState } from 'react';
import { Team, DrillType } from '../types';
import { Dumbbell, Zap, ArrowUpCircle, Lock, CheckCircle2, Shield, Target, Brain, Activity, Hand, X, Plus, Move, Gauge, Crosshair, Users, Swords, Anchor, Share2, Unlock, User, Info } from 'lucide-react';

interface Props {
  team: Team;
  onUpgradeFacility: (type: 'academy') => void;
  onSetDrill: (drill: DrillType, playerIds: string[]) => void;
  onUnlockDrill: (drill: DrillType) => void;
}

const TrainingView: React.FC<Props> = ({ team, onUpgradeFacility, onSetDrill, onUnlockDrill }) => {
  const academyLevel = team.facilities.academyLevel;
  const isMaxLevel = academyLevel >= 10;
  const upgradeCost = academyLevel * 10;
  
  // Calculate Unlock Points
  const maxUnlockable = 3 + (academyLevel - 1) * 2;
  const unlockedCount = team.unlockedDrills ? team.unlockedDrills.length : 3;
  const availableUnlockPoints = Math.max(0, maxUnlockable - unlockedCount);

  // Modal State
  const [assigningDrill, setAssigningDrill] = useState<DrillType | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  // Drill Definitions - 16 Types (8 Basic + 8 Combo)
  const DRILLS: { id: DrillType; name: string; type: 'BASIC' | 'COMBO'; icon: any; color: string; desc: string; focus: string; suitableFor: string; boosts: string[] }[] = [
    // --- BASIC DRILLS (Limit ~6 players) ---
    { id: 'GK', name: 'Goalkeeping', type: 'BASIC', icon: Hand, color: 'text-yellow-500', desc: 'Specialized training for keepers: reflexes, handling, and positioning.', focus: 'Goalkeeping', suitableFor: 'Suitable for: Goalkeepers (GK)', boosts: ['Reflexes', 'Handling', 'Kicking'] },
    { id: 'DEFENDING', name: 'Defending (Tackling)', type: 'BASIC', icon: Shield, color: 'text-slate-600', desc: 'Preventing goals: defensive awareness, interceptions, and tackling.', focus: 'Defense', suitableFor: 'Suitable for: Defenders (CB, LB, RB)', boosts: ['Standing Tackle', 'Awareness', 'Sliding Tackle'] },
    { id: 'ATTACKING', name: 'Attacking (Shooting)', type: 'BASIC', icon: Target, color: 'text-red-500', desc: 'Scoring goals: finishing, shot power, and heading.', focus: 'Attack', suitableFor: 'Suitable for: Forwards (ST, CF, Wings)', boosts: ['Finishing', 'Shot Power', 'Heading'] },
    { id: 'FITNESS_POWER', name: 'Fitness (Power)', type: 'BASIC', icon: Dumbbell, color: 'text-stone-500', desc: 'Building muscle: physical strength, stamina, and sprint speed.', focus: 'Physical', suitableFor: 'Suitable for: All players', boosts: ['Strength', 'Stamina', 'Sprint Speed'] },
    { id: 'FITNESS_MOVEMENT', name: 'Fitness (Movement)', type: 'BASIC', icon: Activity, color: 'text-emerald-500', desc: 'Flexibility: acceleration, agility, balance, and jumping.', focus: 'Movement', suitableFor: 'Suitable for: Wingers & Midfielders', boosts: ['Acceleration', 'Agility', 'Balance'] },
    { id: 'TECHNICAL_CONTROL', name: 'Technical (Control)', type: 'BASIC', icon: Zap, color: 'text-amber-500', desc: 'Ball mastery: ball control and dribbling.', focus: 'Skill', suitableFor: 'Suitable for: Playmakers (CAM, Wings)', boosts: ['Ball Control', 'Dribbling'] },
    { id: 'TECHNICAL_PASSING', name: 'Technical (Passing)', type: 'BASIC', icon: Brain, color: 'text-blue-500', desc: 'Playmaking: short passing, long passing, and vision.', focus: 'Passing', suitableFor: 'Suitable for: Midfielders (CM, CDM)', boosts: ['Short Passing', 'Long Passing', 'Vision'] },
    { id: 'SET_PIECES', name: 'Set Pieces', type: 'BASIC', icon: Crosshair, color: 'text-pink-500', desc: 'Specialist training: free kicks and penalties.', focus: 'Set Pieces', suitableFor: 'Suitable for: Specialists only', boosts: ['Free Kicks', 'Penalties', 'Crossing'] },

    // --- COMBO DRILLS (Limit 4 players) ---
    { id: 'COMBO_OFFENSIVE_UNIT', name: 'Offensive Unit', type: 'COMBO', icon: Swords, color: 'text-orange-600', desc: 'Forward chemistry: finishing, vision, and attacking positioning.', focus: 'Attack Unit', suitableFor: 'Suitable for: ST + CAM + Wingers', boosts: ['Finishing', 'Vision', 'Positioning'] },
    { id: 'COMBO_DEFENSIVE_UNIT', name: 'Defensive Wall', type: 'COMBO', icon: Anchor, color: 'text-slate-800', desc: 'Defensive solidity: marking, tackling, and strength.', focus: 'Defense Unit', suitableFor: 'Suitable for: CB + CDM', boosts: ['Marking', 'Tackling', 'Strength'] },
    { id: 'COMBO_WING_PLAY', name: 'Wing Play', type: 'COMBO', icon: Move, color: 'text-cyan-500', desc: 'Full-backs & Wingers: crossing, speed, and dribbling.', focus: 'Wings', suitableFor: 'Suitable for: LB/RB + LW/RW', boosts: ['Crossing', 'Speed', 'Dribbling'] },
    { id: 'COMBO_MIDFIELD_CONTROL', name: 'Midfield Control', type: 'COMBO', icon: Users, color: 'text-indigo-500', desc: 'Midfield triangle: short passing, control, and vision.', focus: 'Midfield', suitableFor: 'Suitable for: CM + CDM + CAM', boosts: ['Passing', 'Control', 'Vision'] },
    { id: 'COMBO_HIGH_PRESS', name: 'High Press', type: 'COMBO', icon: Gauge, color: 'text-red-600', desc: 'Ball recovery: stamina, sprint speed, and advanced tackling.', focus: 'Pressing', suitableFor: 'Suitable for: Forwards & Advanced Midfielders', boosts: ['Stamina', 'Sprint Speed', 'Tackling'] },
    { id: 'COMBO_COUNTER_ATTACK', name: 'Counter Attack', type: 'COMBO', icon: Zap, color: 'text-yellow-600', desc: 'Quick transitions: acceleration, long passing, and finishing.', focus: 'Counter', suitableFor: 'Suitable for: Fast players', boosts: ['Acceleration', 'Long Ball', 'Finishing'] },
    { id: 'COMBO_AERIAL', name: 'Aerial Play', type: 'COMBO', icon: ArrowUpCircle, color: 'text-purple-600', desc: 'Aerial dominance: jumping, heading, and strength.', focus: 'Aerial', suitableFor: 'Suitable for: CB + ST', boosts: ['Jumping', 'Heading', 'Strength'] },
    { id: 'COMBO_TOTAL_FOOTBALL', name: 'Total Football', type: 'COMBO', icon: Share2, color: 'text-teal-600', desc: 'Complete player: passing, control, vision, and positioning.', focus: 'Total', suitableFor: 'Suitable for: Talented players (Wonderkids)', boosts: ['All Attributes (Small Boost)'] },
  ];

  const handleOpenAssign = (drill: DrillType) => {
      // Find players currently assigned to this drill
      const currentAssigned = [...team.players, ...team.youthPlayers]
          .filter(p => (team.trainingAssignments[p.id]) === drill)
          .map(p => p.id);
      
      setSelectedPlayers(currentAssigned);
      setAssigningDrill(drill);
  };

  const togglePlayerSelection = (pid: string, limit: number) => {
      if (selectedPlayers.includes(pid)) {
          setSelectedPlayers(prev => prev.filter(id => id !== pid));
      } else {
          if (selectedPlayers.length >= limit) return; // Prevent exceeding limit
          setSelectedPlayers(prev => [...prev, pid]);
      }
  };

  const handleConfirmAssign = () => {
      if (assigningDrill) {
          onSetDrill(assigningDrill, selectedPlayers);
          setAssigningDrill(null);
      }
  };

  // Assign Modal Component
  const AssignModal = () => {
     if (!assigningDrill) return null;
     const drillInfo = DRILLS.find(d => d.id === assigningDrill);
     if (!drillInfo) return null;

     const allPlayers = [...team.players, ...team.youthPlayers];
     const limit = drillInfo.type === 'COMBO' ? 4 : 6;
     const isFull = selectedPlayers.length >= limit;

     return (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setAssigningDrill(null)}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
               <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-2xl">
                   <div>
                       <h3 className="font-bold text-lg flex items-center gap-2">
                           <drillInfo.icon className={drillInfo.color} />
                           Assign players to {drillInfo?.name}
                       </h3>
                       <div className="text-xs text-slate-500 mt-1">Maximum: <span className="font-bold text-slate-800">{limit} players</span> (Selected: {selectedPlayers.length})</div>
                   </div>
                   <button onClick={() => setAssigningDrill(null)}><X className="text-slate-400" /></button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                       {allPlayers.map(p => {
                           const isSelected = selectedPlayers.includes(p.id);
                           const currentDrillId = team.trainingAssignments[p.id];
                           const currentDrill = DRILLS.find(d => d.id === currentDrillId);
                           
                           return (
                               <div 
                                 key={p.id} 
                                 onClick={() => togglePlayerSelection(p.id, limit)}
                                 className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center transition-all
                                   ${isSelected 
                                     ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' 
                                     : isFull && !isSelected ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'bg-white border-slate-200 hover:bg-slate-50'}
                                 `}
                               >
                                   <div>
                                       <div className="font-bold text-sm text-slate-800">{p.name}</div>
                                       <div className="text-xs text-slate-500">{p.position} • {p.age} yrs</div>
                                       {!isSelected && currentDrill && <div className="text-[10px] text-slate-400 mt-1">Current: {currentDrill.focus}</div>}
                                       {!isSelected && !currentDrill && <div className="text-[10px] text-red-300 mt-1">Not Assigned</div>}
                                   </div>
                                   {isSelected && <CheckCircle2 className="text-indigo-600 w-5 h-5" />}
                               </div>
                           )
                       })}
                   </div>
               </div>

               <div className="p-4 border-t bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                   <button onClick={() => setAssigningDrill(null)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-200 rounded-lg">Cancel</button>
                   <button onClick={handleConfirmAssign} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg">Save Changes</button>
               </div>
            </div>
         </div>
     )
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-4">
               <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl">
                 <Dumbbell />
               </div>
               <div>
                 <h2 className="text-2xl font-bold">Training & Development Center</h2>
                 <p className="text-indigo-200 font-medium text-sm">
                     Level: {academyLevel} • Upgrade the center to get points to unlock new drills.
                 </p>
                 <div className="flex gap-4 mt-2 text-xs">
                     <span className="bg-white/10 px-2 py-1 rounded">Unlocked Drills: <strong>{team.unlockedDrills?.length || 3}</strong></span>
                     <div className={`px-2 py-1 rounded border flex items-center gap-1
                        ${availableUnlockPoints > 0 ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 animate-pulse' : 'bg-white/10 border-transparent text-slate-400'}`}>
                         <Unlock size={12} />
                         Drill Unlock Points: <strong>{availableUnlockPoints}</strong>
                     </div>
                 </div>
               </div>
            </div>

            <button 
                 onClick={() => onUpgradeFacility('academy')}
                 disabled={team.budget < upgradeCost || isMaxLevel}
                 className={`px-5 py-3 rounded-xl font-bold flex flex-col items-center justify-center transition-all min-w-[160px]
                   ${team.budget >= upgradeCost && !isMaxLevel
                     ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg' 
                     : 'bg-white/5 text-slate-400 cursor-not-allowed'}
                 `}
               >
                 {isMaxLevel ? (
                     <span className="flex items-center gap-1 text-sm"><CheckCircle2 size={14} /> Max Level</span>
                 ) : (
                    <>
                        <span className="flex items-center gap-1 text-sm"><ArrowUpCircle size={14} /> Upgrade Academy</span>
                        <span className="text-xs opacity-75 mt-0.5">Cost: {upgradeCost}M</span>
                        <span className="text-[10px] text-emerald-200 mt-1">+2 Unlock Points</span>
                    </>
                 )}
            </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {DRILLS.map(drill => {
              const isUnlocked = team.unlockedDrills ? team.unlockedDrills.includes(drill.id) : ['GK', 'DEFENDING', 'ATTACKING'].includes(drill.id);
              const canUnlock = !isUnlocked && availableUnlockPoints > 0;
              const Icon = drill.icon;
              
              const assignedPlayers = [...team.players, ...team.youthPlayers].filter(p => team.trainingAssignments[p.id] === drill.id);
              const assignedCount = assignedPlayers.length;
              const limit = drill.type === 'COMBO' ? 4 : 6;

              return (
                  <div 
                    key={drill.id}
                    className={`relative overflow-hidden p-5 rounded-2xl border transition-all flex flex-col h-full min-h-[300px]
                      ${!isUnlocked 
                        ? 'border-slate-200 bg-slate-50 opacity-90 grayscale-[0.3]' // Dimmed look when locked
                        : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md'}
                    `}
                  >
                      {/* Top Icons */}
                      <div className="flex justify-between items-start mb-3">
                           <div className={`p-3 rounded-2xl shadow-sm border border-slate-100 ${isUnlocked ? 'bg-white' : 'bg-slate-200'} ${drill.color}`}>
                              <Icon size={24} />
                           </div>
                           
                           {!isUnlocked && (
                               <div className="bg-slate-200 p-1.5 rounded-lg text-slate-500" title="Locked">
                                   <Lock size={16} />
                               </div>
                           )}

                           {isUnlocked && (
                              <div className={`text-[10px] font-bold px-2 py-1 rounded-lg ${assignedCount >= limit ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                 {assignedCount}/{limit}
                              </div>
                           )}
                      </div>
                      
                      <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                             <h4 className={`font-bold text-sm ${!isUnlocked ? 'text-slate-600' : 'text-slate-800'}`}>{drill.name}</h4>
                             {drill.type === 'COMBO' && <span className="text-[8px] font-bold text-white bg-indigo-500 px-1.5 py-0.5 rounded">COMBO</span>}
                          </div>
                          
                          <p className="text-[10px] text-slate-500 mb-3 leading-snug">{drill.desc}</p>
                          
                          {/* Suitable For (Helper Text) */}
                          <div className="flex items-start gap-1 mb-2">
                              <Info size={10} className="text-indigo-400 mt-0.5 shrink-0" />
                              <span className="text-[10px] text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded font-medium">{drill.suitableFor}</span>
                          </div>

                          {/* Attribute Boosts List - Visible even if locked */}
                          <div className="mb-2">
                              <span className="text-[9px] text-slate-400 font-bold block mb-1">Boosts the following attributes:</span>
                              <div className="flex flex-wrap gap-1">
                                  {drill.boosts.map((b, i) => (
                                      <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded border 
                                          ${isUnlocked ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-200 text-slate-500 border-slate-300'}`}>
                                          {b}
                                      </span>
                                  ))}
                              </div>
                          </div>
                      </div>
                      
                      {/* Footer Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100">
                          {isUnlocked ? (
                              <button 
                                 onClick={() => handleOpenAssign(drill.id)}
                                 className="w-full py-2 bg-slate-900 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                              >
                                  <Plus size={14} /> Manage Players
                              </button>
                          ) : (
                              // Locked State Actions
                              canUnlock ? (
                                  <button 
                                    onClick={() => onUnlockDrill(drill.id)}
                                    className="w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-md hover:bg-emerald-700 animate-pulse flex items-center justify-center gap-2"
                                  >
                                      <Unlock size={14} /> Unlock Drill (1 Point)
                                  </button>
                              ) : (
                                  <button disabled className="w-full py-2 bg-slate-100 text-slate-400 text-xs font-bold rounded-lg cursor-not-allowed flex items-center justify-center gap-2">
                                      <Lock size={12} /> Requires Unlock Points
                                  </button>
                              )
                          )}
                      </div>
                  </div>
              );
          })}
      </div>

      {/* Assignment Modal */}
      {assigningDrill && <AssignModal />}
    </div>
  );
};

export default TrainingView;