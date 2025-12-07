

import React, { useState } from 'react';
import { Player, Position, Scout } from '../types';
import { Sparkles, TrendingUp, UserPlus, Search, Map, CheckCircle2, Crown, Star, ArrowUpCircle, Eye, RefreshCw, FileText, AlertCircle, Trash2, AlertTriangle, Lock } from 'lucide-react';
import PlayerDetailModal from './PlayerDetailModal';

interface Props {
  youthPlayers: Player[];
  onPromote: (playerId: string) => void;
  onScout: (playerId: string, scoutId: string) => void;
  onHireScout: (scout: Scout) => void;
  onFireScout?: (scoutId: string) => void; // Added Prop
  onSpawn?: () => void;
  canSpawn?: boolean;
  
  availableScouts: Scout[];
  myScouts: Scout[];
  teamName: string;
  academyLevel: number;
  scoutingLevel: number;
  onUpgrade: (type: 'academy' | 'scouting') => void;
  
  // For assigning drills
  onSetDrill?: (drill: any, playerIds: string[]) => void;
  userTeamId?: string;
}

const AcademyView: React.FC<Props> = ({ 
    youthPlayers, onPromote, onScout, onHireScout, onFireScout, onSpawn, canSpawn,
    availableScouts, myScouts, teamName, academyLevel, scoutingLevel, onUpgrade, onSetDrill, userTeamId
}) => {
  const [activeTab, setActiveTab] = useState<'players' | 'scouts'>('players');
  const [targetPlayerId, setTargetPlayerId] = useState<string | null>(null);
  const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<'stats' | 'reports'>('stats');

  const getPosColor = (pos: Position) => {
    if (pos === Position.GK) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if ([Position.CB, Position.LB, Position.RB].includes(pos)) return 'bg-blue-100 text-blue-700 border-blue-200';
    if ([Position.CDM, Position.CM, Position.CAM, Position.LM, Position.RM].includes(pos)) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const ACADEMY_ROADMAP = [
      { lvl: 1, desc: 'Academy Founded: 1 player/week (normal potential)' },
      { lvl: 2, desc: 'Improved Scouting: Players with slightly better fundamentals' },
      { lvl: 3, desc: 'Accelerated Growth: Youth development speed +5%' },
      { lvl: 4, desc: 'Reduced cost for first-team promotion' },
      { lvl: 5, desc: 'Turning Point: 2 players/week' },
      { lvl: 6, desc: 'Network Improvement: Increased scout capacity' },
      { lvl: 7, desc: 'Second Chance: Ability to reject a batch and request another (soon)' },
      { lvl: 8, desc: 'Prolific Production: 3 players/week + Wonderkids appear' },
      { lvl: 9, desc: 'Global Network: Players with dual nationalities' },
      { lvl: 10, desc: 'Elite: 5 players/week with legendary potential' },
  ];

  const SCOUTING_ROADMAP = [
      { lvl: 1, desc: 'Capacity: 1 scout. (Mostly 1-star scouts)' },
      { lvl: 2, desc: 'Start seeing 2-star scouts more often.' },
      { lvl: 3, desc: 'Increased chance of 2-3 star scouts.' },
      { lvl: 4, desc: 'Capacity: 2 scouts. 1-star scouts gradually disappear.' },
      { lvl: 5, desc: 'Regional Market: 3-star scouts appear frequently.' },
      { lvl: 6, desc: '1-star scouts completely disappear.' },
      { lvl: 7, desc: 'Precise Analysis: Specialist scouts give +15% accuracy.' },
      { lvl: 8, desc: 'Capacity: 3 scouts. Start seeing 5-star scouts (very rare).' },
      { lvl: 9, desc: 'Global Market: Increased rate of 4 and 5-star scouts.' },
      { lvl: 10, desc: 'Capacity: 5 scouts. 5-star (2/season), 4-star (10/season).' },
  ];

  const academyUpgradeCost = academyLevel * 10;
  const scoutingUpgradeCost = scoutingLevel * 8;
  const canUpgradeScouting = scoutingLevel < academyLevel; 

  // Capacity Logic
  let maxScouts = 1;
  if (scoutingLevel >= 4) maxScouts = 2;
  if (scoutingLevel >= 8) maxScouts = 3;
  if (scoutingLevel >= 10) maxScouts = 5;
  
  const isFull = myScouts.length >= maxScouts;

  const handleOpenAssignModal = (e: React.MouseEvent, pid: string) => {
      e.stopPropagation();
      setTargetPlayerId(pid);
  };

  const handlePromoteClick = (e: React.MouseEvent, pid: string) => {
      e.stopPropagation();
      onPromote(pid);
  };

  const handleViewDetails = (player: Player, tab: 'stats' | 'reports') => {
      setViewingPlayer(player);
      setModalInitialTab(tab);
  };

  const executeAssign = (scoutId: string) => {
      if(targetPlayerId) {
          onScout(targetPlayerId, scoutId);
          setTargetPlayerId(null);
      }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 p-6 rounded-2xl text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="text-yellow-400 w-6 h-6" />
                {teamName} Academy
            </h2>
            <div className="flex gap-4 mt-2 text-sm text-indigo-200">
                <span>Academy Level: <strong>{academyLevel}</strong></span>
                <span>Scouting Network Level: <strong>{scoutingLevel}</strong></span>
            </div>
            </div>
            
            <div className="flex gap-2 bg-indigo-950/50 p-1 rounded-lg">
                <button onClick={() => setActiveTab('players')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'players' ? 'bg-white text-indigo-900 shadow' : 'text-indigo-300 hover:text-white'}`}>Youth Squad</button>
                <button onClick={() => setActiveTab('scouts')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'scouts' ? 'bg-white text-indigo-900 shadow' : 'text-indigo-300 hover:text-white'}`}>Scouting Network</button>
            </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-indigo-700/50">
             <button 
                onClick={() => onUpgrade('academy')}
                disabled={academyLevel >= 10}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-md transition-colors disabled:opacity-50"
            >
                <ArrowUpCircle size={14} /> Upgrade Academy ({academyUpgradeCost}M)
            </button>

            <button 
                onClick={() => onUpgrade('scouting')}
                disabled={!canUpgradeScouting}
                className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1 shadow-md transition-colors
                    ${canUpgradeScouting ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}
                `}
                title={!canUpgradeScouting ? "Must upgrade academy level first" : ""}
            >
                <ArrowUpCircle size={14} /> Upgrade Network ({scoutingUpgradeCost}M)
            </button>
        </div>
      </div>

      {activeTab === 'players' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Column: Player List */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Spawn Button Area */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-800">Generate New Youth Intake</h3>
                        <p className="text-xs text-slate-500">Available once per week (on Saturday)</p>
                    </div>
                    {canSpawn ? (
                        <button onClick={onSpawn} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg animate-pulse">
                            Generate Players Now
                        </button>
                    ) : (
                        <button disabled className="bg-slate-100 text-slate-400 px-6 py-2 rounded-lg font-bold cursor-not-allowed">
                            Generated This Week
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {youthPlayers.map(player => {
                        const isWonderkid = player.isWonderkid || (player.isScouted && player.potential > 90);
                        const isScouted = player.isScouted;
                        const isLastChance = player.age === 18;
                        const canPromote = player.age >= 16;

                        return (
                            <div 
                                onClick={() => handleViewDetails(player, 'stats')}
                                key={player.id} 
                                className={`cursor-pointer bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-all group relative overflow-hidden flex flex-col
                                ${isWonderkid ? 'border-yellow-400 ring-1 ring-yellow-100' : 'border-slate-200'}
                            `}>
                                {isWonderkid && isScouted && (
                                    <div className="absolute top-0 right-0 bg-yellow-400 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg shadow-sm flex items-center gap-1">
                                        <Crown size={10} fill="currentColor" /> Wonderkid
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-3">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-slate-100 text-slate-400`}>
                                            {isScouted ? player.rating : '?'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{player.name}</h3>
                                            <div className="flex gap-2 items-center mt-1">
                                                <span className={`px-2 py-0.5 rounded text-[10px] border ${getPosColor(player.position)} flex items-center gap-1`}>
                                                    <span className="font-bold">{player.position}</span>
                                                    {player.secondaryPositions && player.secondaryPositions.length > 0 && (
                                                        <>
                                                            <span className="opacity-40">|</span>
                                                            <span className="font-normal opacity-90">{player.secondaryPositions.join(' | ')}</span>
                                                        </>
                                                    )}
                                                </span>
                                                <span className={`text-xs ${isLastChance ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                                                    {player.age} yrs
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isLastChance && (
                                    <div className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded mb-3 flex items-center gap-1">
                                        <AlertTriangle size={12} />
                                        Last chance! Player will leave the academy at the end of the season.
                                    </div>
                                )}

                                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-slate-500">Potential</span>
                                        <span className={`text-sm font-bold flex items-center gap-1 ${isScouted ? 'text-indigo-600' : 'text-slate-400'}`}>
                                            <TrendingUp className="w-3 h-3" /> {isScouted ? player.potential : player.estimatedPotential}
                                        </span>
                                    </div>
                                    {isScouted ? (
                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                            <div className={`h-2 rounded-full ${isWonderkid ? 'bg-yellow-400' : 'bg-indigo-500'}`} style={{ width: `${(player.rating / player.potential) * 100}%` }}></div>
                                        </div>
                                    ) : (
                                        <div className="text-[10px] text-slate-400 italic text-center bg-slate-100 py-1 rounded border border-slate-200">
                                            Potential Unknown
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={(e) => handleOpenAssignModal(e, player.id)}
                                        className="py-2 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1"
                                    >
                                        {isScouted ? <RefreshCw size={12}/> : <Eye size={12}/>} 
                                        {isScouted ? 'Re-Scout' : 'Scout Now'}
                                    </button>
                                    
                                    {isScouted && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleViewDetails(player, 'reports'); }}
                                            className="py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1"
                                        >
                                            <FileText size={12} /> Reports
                                        </button>
                                    )}

                                    <button 
                                        onClick={(e) => handlePromoteClick(e, player.id)}
                                        disabled={!canPromote}
                                        className={`col-span-2 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-colors
                                            ${canPromote 
                                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                                        `}
                                    >
                                        {canPromote ? <><UserPlus size={14} /> Promote to First Team</> : <><Lock size={12} /> Promotable at 16</>}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {youthPlayers.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No players currently in the academy.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Roadmap */}
            <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-[500px] overflow-y-auto custom-scrollbar">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 sticky top-0 bg-white z-10 pb-2 border-b border-slate-100">
                        <Map className="text-indigo-600" /> Development Roadmap
                    </h3>
                    <div className="space-y-4 relative">
                        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100"></div>
                        {ACADEMY_ROADMAP.map((item) => {
                            const isUnlocked = academyLevel >= item.lvl;
                            return (
                                <div key={item.lvl} className={`relative flex items-start gap-3 ${isUnlocked ? 'opacity-100' : 'opacity-40'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 z-10 bg-white 
                                        ${isUnlocked ? 'border-emerald-500 text-emerald-500' : 'border-slate-300 text-slate-300'}
                                    `}>
                                        {isUnlocked ? <CheckCircle2 size={14} /> : <span className="text-[10px] font-bold">{item.lvl}</span>}
                                    </div>
                                    <div>
                                        <div className={`text-xs font-bold ${isUnlocked ? 'text-indigo-900' : 'text-slate-800'}`}>Level {item.lvl}</div>
                                        <div className="text-[10px] text-slate-500 leading-tight">{item.desc}</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
          </div>
      )}

      {activeTab === 'scouts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 space-y-8">
                  {/* My Scouts */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between pb-2 border-b">
                         <div className="flex items-center gap-2"><Search className="text-indigo-600" /> Club Scouts</div>
                         <div className={`text-xs px-2 py-1 rounded ${isFull ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                             Capacity: {myScouts.length} / {maxScouts}
                         </div>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {myScouts.map(scout => (
                              <div key={scout.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center group hover:border-indigo-300 transition-colors">
                                  <div>
                                      <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                          {scout.name}
                                          <span className="text-[9px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500">{scout.speciality}</span>
                                      </div>
                                      <div className="flex text-yellow-400 text-[10px] mb-1 mt-1">
                                          {Array.from({length: scout.stars}).map((_, i) => <Star key={i} size={12} fill="currentColor"/>)}
                                      </div>
                                      <div className="text-[10px] text-slate-500 mt-1">
                                          Salary: <span className="font-bold">{scout.salary}k</span>
                                      </div>
                                  </div>
                                  <div className="flex flex-col gap-2 items-end">
                                      <div className="h-8 w-8 rounded-full bg-white border flex items-center justify-center text-emerald-500 shadow-sm">
                                          <CheckCircle2 size={16} />
                                      </div>
                                      {onFireScout && (
                                          <button 
                                            onClick={() => onFireScout(scout.id)} 
                                            className="text-xs text-red-400 hover:text-red-600 bg-white border border-slate-200 px-2 py-1 rounded-md flex items-center gap-1 hover:border-red-200"
                                            title="Fire Scout"
                                          >
                                              <Trash2 size={10} /> Fire
                                          </button>
                                      )}
                                  </div>
                              </div>
                          ))}
                          {myScouts.length === 0 && <div className="col-span-full text-slate-400 text-sm italic py-4 text-center">No scouts currently hired.</div>}
                      </div>
                  </div>

                  {/* Hire Scouts */}
                  <div>
                      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 px-2">
                         <UserPlus className="text-emerald-600" /> Scout Market
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {availableScouts.map(scout => (
                              <div key={scout.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                                  <div className="flex justify-between items-start mb-2">
                                      <div>
                                          <div className="font-bold text-slate-800 text-sm">{scout.name}</div>
                                          <div className="text-xs text-slate-500 mt-0.5">{scout.age} yrs • {scout.speciality}</div>
                                      </div>
                                      <div className="flex text-yellow-400">
                                          {Array.from({length: scout.stars}).map((_, i) => <Star key={i} size={14} fill="currentColor"/>)}
                                      </div>
                                  </div>
                                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                                      <div className="text-xs font-bold text-slate-600">{scout.cost}M <span className="text-[10px] font-normal text-slate-400">cost</span></div>
                                      <button 
                                          onClick={() => onHireScout(scout)}
                                          disabled={isFull}
                                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm
                                            ${isFull ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'}
                                          `}
                                      >
                                          {isFull ? 'Full' : 'Hire'}
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Scouting Roadmap Side Panel */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-[500px] overflow-y-auto custom-scrollbar">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 sticky top-0 bg-white z-10 pb-2 border-b border-slate-100">
                        <Map className="text-indigo-600" /> Scouting Network Roadmap
                    </h3>
                    {isFull && (
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-red-600 text-xs font-bold mb-4 flex items-center gap-2">
                            <AlertCircle size={14}/> Max capacity reached ({maxScouts}). Upgrade the network to hire more.
                        </div>
                    )}
                    <div className="space-y-4 relative">
                        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100"></div>
                        {SCOUTING_ROADMAP.map((item) => {
                            const isUnlocked = scoutingLevel >= item.lvl;
                            return (
                                <div key={item.lvl} className={`relative flex items-start gap-3 ${isUnlocked ? 'opacity-100' : 'opacity-40'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 z-10 bg-white 
                                        ${isUnlocked ? 'border-blue-500 text-blue-500' : 'border-slate-300 text-slate-300'}
                                    `}>
                                        {isUnlocked ? <CheckCircle2 size={14} /> : <span className="text-[10px] font-bold">{item.lvl}</span>}
                                    </div>
                                    <div>
                                        <div className={`text-xs font-bold ${isUnlocked ? 'text-indigo-900' : 'text-slate-800'}`}>Level {item.lvl}</div>
                                        <div className="text-[10px] text-slate-500 leading-tight">{item.desc}</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

          </div>
      )}

      {/* Scout Assignment Modal - Fixed Height & Scroll */}
      {targetPlayerId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setTargetPlayerId(null)}>
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                  <div className="p-5 border-b border-slate-100">
                      <h3 className="font-bold text-lg text-slate-800">Select Scout for Assignment</h3>
                      <p className="text-xs text-slate-500 mt-1">The scout will analyze the player and provide an immediate report.</p>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                      <div className="space-y-2">
                          {myScouts.length === 0 && (
                              <div className="text-red-500 text-sm bg-red-50 p-4 rounded-xl text-center border border-red-100">
                                  No scouts are available at the club.<br/>
                                  <span className="text-xs text-red-400 mt-1 block">Go to the "Scouting Network" tab to hire one.</span>
                              </div>
                          )}
                          {myScouts.map(scout => (
                              <button
                                  key={scout.id}
                                  onClick={() => executeAssign(scout.id)}
                                  className="w-full flex justify-between items-center p-4 rounded-xl border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all group"
                              >
                                  <div className="text-left">
                                      <span className="font-bold text-sm text-slate-800 group-hover:text-indigo-700">{scout.name}</span>
                                      <div className="text-[10px] text-slate-500">{scout.speciality}</div>
                                  </div>
                                  <div className="flex text-yellow-400 bg-yellow-50 px-2 py-1 rounded-lg">
                                      {Array.from({length: scout.stars}).map((_, i) => <Star key={i} size={12} fill="currentColor"/>)}
                                  </div>
                              </button>
                          ))}
                      </div>
                  </div>
                  
                  <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                      <button onClick={() => setTargetPlayerId(null)} className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-colors">
                          Cancel
                      </button>
                  </div>
              </div>
          </div>
      )}

      {viewingPlayer && (
          <PlayerDetailModal 
            player={viewingPlayer} 
            onClose={() => setViewingPlayer(null)} 
            onSetDrill={onSetDrill} 
            initialTab={modalInitialTab}
            isOwnPlayer={userTeamId ? viewingPlayer.id.includes(userTeamId) : false} // Academy players are not fully part of main team logic for stats, but we can see their potential
          />
      )}

    </div>
  );
};

export default AcademyView;