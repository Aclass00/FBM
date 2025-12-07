import React, { useState, useMemo } from 'react';
import { Player, Formation, TacticStyle, Position, AttackFocus, PassingStyle, SetPieceTakers } from '../types';
import { Activity, UserMinus, GripVertical, RefreshCw, AlertTriangle, Target, ArrowRightLeft, Shield, Crosshair, X, Check, Globe } from 'lucide-react';

interface Props {
  players: Player[];
  lineup: string[]; // Array of Player IDs currently in starting XI
  formation: Formation;
  tacticStyle: TacticStyle;
  attackFocus?: AttackFocus;
  passingStyle?: PassingStyle;
  onUpdateTactics: (formation: Formation, style: TacticStyle, attackFocus?: AttackFocus, passingStyle?: PassingStyle) => void;
  onUpdateLineup: (newLineup: string[]) => void;
  teamName: string;
  setPieceTakers: SetPieceTakers;
  onUpdateSetPieceTakers: (takers: SetPieceTakers) => void;
}

// ... (KEEPING EXISTING HELPER FUNCTIONS AS IS) ...
// Full Formation Coordinates
const getFormationLayout = (fmt: Formation) => {
    const layouts: Record<string, {top: string, left: string, role: string}[]> = {
        '4-4-2': [
            {top: '88%', left: '50%', role: 'GK'},
            {top: '72%', left: '15%', role: 'LB'}, {top: '72%', left: '38%', role: 'CB'}, {top: '72%', left: '62%', role: 'CB'}, {top: '72%', left: '85%', role: 'RB'},
            {top: '45%', left: '15%', role: 'LM'}, {top: '45%', left: '38%', role: 'CM'}, {top: '45%', left: '62%', role: 'CM'}, {top: '45%', left: '85%', role: 'RM'},
            {top: '15%', left: '35%', role: 'ST'}, {top: '15%', left: '65%', role: 'ST'}
        ],
        '4-3-3': [
            {top: '88%', left: '50%', role: 'GK'},
            {top: '72%', left: '15%', role: 'LB'}, {top: '72%', left: '38%', role: 'CB'}, {top: '72%', left: '62%', role: 'CB'}, {top: '72%', left: '85%', role: 'RB'},
            {top: '52%', left: '50%', role: 'CDM'},
            {top: '38%', left: '30%', role: 'CM'}, {top: '38%', left: '70%', role: 'CM'},
            {top: '20%', left: '15%', role: 'LW'}, {top: '15%', left: '50%', role: 'ST'}, {top: '20%', left: '85%', role: 'RW'}
        ],
        '4-2-3-1': [
            {top: '88%', left: '50%', role: 'GK'},
            {top: '75%', left: '15%', role: 'LB'}, {top: '75%', left: '38%', role: 'CB'}, {top: '75%', left: '62%', role: 'CB'}, {top: '75%', left: '85%', role: 'RB'},
            {top: '60%', left: '35%', role: 'CDM'}, {top: '60%', left: '65%', role: 'CDM'},
            {top: '35%', left: '15%', role: 'LM'}, {top: '35%', left: '50%', role: 'CAM'}, {top: '35%', left: '85%', role: 'RM'},
            {top: '15%', left: '50%', role: 'ST'}
        ],
        '3-5-2': [
            {top: '88%', left: '50%', role: 'GK'},
            {top: '75%', left: '20%', role: 'CB'}, {top: '75%', left: '50%', role: 'CB'}, {top: '75%', left: '80%', role: 'CB'},
            {top: '50%', left: '10%', role: 'LM'}, {top: '55%', left: '35%', role: 'CDM'}, {top: '45%', left: '50%', role: 'CAM'}, {top: '55%', left: '65%', role: 'CDM'}, {top: '50%', left: '90%', role: 'RM'},
            {top: '15%', left: '35%', role: 'ST'}, {top: '15%', left: '65%', role: 'ST'}
        ],
        '5-3-2': [
            {top: '88%', left: '50%', role: 'GK'},
            {top: '72%', left: '10%', role: 'LB'}, {top: '75%', left: '30%', role: 'CB'}, {top: '75%', left: '50%', role: 'CB'}, {top: '75%', left: '70%', role: 'CB'}, {top: '72%', left: '90%', role: 'RB'},
            {top: '45%', left: '30%', role: 'CM'}, {top: '45%', left: '50%', role: 'CM'}, {top: '45%', left: '70%', role: 'CM'},
            {top: '15%', left: '35%', role: 'ST'}, {top: '15%', left: '65%', role: 'ST'}
        ],
        '3-4-3': [
            {top: '88%', left: '50%', role: 'GK'},
            {top: '75%', left: '20%', role: 'CB'}, {top: '75%', left: '50%', role: 'CB'}, {top: '75%', left: '80%', role: 'CB'},
            {top: '50%', left: '15%', role: 'LM'}, {top: '50%', left: '40%', role: 'CM'}, {top: '50%', left: '60%', role: 'CM'}, {top: '50%', left: '85%', role: 'RM'},
            {top: '20%', left: '20%', role: 'LW'}, {top: '15%', left: '50%', role: 'ST'}, {top: '20%', left: '80%', role: 'RW'}
        ],
        '4-1-4-1': [
            {top: '88%', left: '50%', role: 'GK'},
            {top: '75%', left: '15%', role: 'LB'}, {top: '75%', left: '38%', role: 'CB'}, {top: '75%', left: '62%', role: 'CB'}, {top: '75%', left: '85%', role: 'RB'},
            {top: '60%', left: '50%', role: 'CDM'},
            {top: '40%', left: '15%', role: 'LM'}, {top: '40%', left: '38%', role: 'CM'}, {top: '40%', left: '62%', role: 'CM'}, {top: '40%', left: '85%', role: 'RM'},
            {top: '15%', left: '50%', role: 'ST'}
        ],
        '4-5-1': [
            {top: '88%', left: '50%', role: 'GK'},
            {top: '75%', left: '15%', role: 'LB'}, {top: '75%', left: '38%', role: 'CB'}, {top: '75%', left: '62%', role: 'CB'}, {top: '75%', left: '85%', role: 'RB'},
            {top: '50%', left: '10%', role: 'LM'}, {top: '50%', left: '30%', role: 'CM'}, {top: '55%', left: '50%', role: 'CDM'}, {top: '50%', left: '70%', role: 'CM'}, {top: '50%', left: '90%', role: 'RM'},
            {top: '15%', left: '50%', role: 'ST'}
        ],
        '5-4-1': [
            {top: '88%', left: '50%', role: 'GK'},
            {top: '72%', left: '10%', role: 'LB'}, {top: '75%', left: '30%', role: 'CB'}, {top: '75%', left: '50%', role: 'CB'}, {top: '75%', left: '70%', role: 'CB'}, {top: '72%', left: '90%', role: 'RB'},
            {top: '45%', left: '15%', role: 'LM'}, {top: '45%', left: '38%', role: 'CM'}, {top: '45%', left: '62%', role: 'CM'}, {top: '45%', left: '85%', role: 'RM'},
            {top: '15%', left: '50%', role: 'ST'}
        ],
        '4-2-2-2': [
            {top: '88%', left: '50%', role: 'GK'},
            {top: '75%', left: '15%', role: 'LB'}, {top: '75%', left: '38%', role: 'CB'}, {top: '75%', left: '62%', role: 'CB'}, {top: '75%', left: '85%', role: 'RB'},
            {top: '55%', left: '35%', role: 'CDM'}, {top: '55%', left: '65%', role: 'CDM'},
            {top: '35%', left: '20%', role: 'CAM'}, {top: '35%', left: '80%', role: 'CAM'},
            {top: '15%', left: '35%', role: 'ST'}, {top: '15%', left: '65%', role: 'ST'}
        ]
    };
    return layouts[fmt] || layouts['4-3-3'];
};

const getEffectiveRating = (player: Player, requiredRole: string) => {
     if (player.position === requiredRole) return { rating: player.rating, penalty: 0 };
     if (player.secondaryPositions.includes(requiredRole as Position)) return { rating: player.rating, penalty: 0 };

     let penaltyPercent = 0;
     const p = player.position;
     const r = requiredRole;

     const isDef = [Position.CB, Position.LB, Position.RB].includes(p);
     const isMid = [Position.CDM, Position.CM, Position.CAM, Position.LM, Position.RM].includes(p);
     const isFwd = [Position.ST, Position.CF, Position.LW, Position.RW].includes(p);
     const isGK = p === Position.GK;

     const roleDef = ['CB', 'LB', 'RB'].includes(r);
     const roleMid = ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(r);
     const roleFwd = ['ST', 'CF', 'LW', 'RW'].includes(r);
     const roleGK = r === 'GK';

     if (isGK || roleGK) penaltyPercent = 90;
     else if (isDef && roleFwd) penaltyPercent = 50;
     else if (isFwd && roleDef) penaltyPercent = 50;
     else if ((isDef && roleMid) || (isMid && roleDef)) penaltyPercent = 20;
     else if ((isMid && roleFwd) || (isFwd && roleMid)) penaltyPercent = 15;
     else {
         penaltyPercent = 10; 
         if ((p === Position.CDM && r === 'CM') || (p === Position.CM && r === 'CDM')) penaltyPercent = 5;
     }

     return { rating: player.rating, penalty: penaltyPercent };
};

const getPosColor = (pos: Position) => {
    if (pos === Position.GK) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if ([Position.CB, Position.LB, Position.RB].includes(pos)) return 'bg-blue-100 text-blue-700 border-blue-200';
    if ([Position.CDM, Position.CM, Position.CAM, Position.LM, Position.RM].includes(pos)) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    return 'bg-red-100 text-red-700 border-red-200';
};

const TacticsView: React.FC<Props> = ({ 
    players, lineup, formation, tacticStyle, 
    attackFocus = 'MIXED', passingStyle = 'MIXED',
    onUpdateTactics, onUpdateLineup, teamName,
    setPieceTakers, onUpdateSetPieceTakers
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverPlayerId, setDragOverPlayerId] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [showSetPieceModal, setShowSetPieceModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const starters = useMemo(() => {
    return lineup.map(id => players.find(p => p.id === id)).filter((p): p is Player => !!p);
  }, [lineup, players]);

  const substitutes = useMemo(() => {
    return players.filter(p => !lineup.includes(p.id)).sort((a, b) => b.rating - a.rating);
  }, [lineup, players]);

  const selectedPlayer = useMemo(() => {
    return selectedPlayerId ? players.find(p => p.id === selectedPlayerId) : null;
  }, [selectedPlayerId, players]);

  const layout = useMemo(() => getFormationLayout(formation), [formation]);

  // Logic to identify foreigners (Not Saudi '🇸🇦')
  const foreignersCount = starters.filter(p => !p.nationality.includes('🇸🇦')).length;
  const isForeignLimitExceeded = foreignersCount > 5;

  const handleSwap = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;

    // Check foreigner rule before swapping
    const sourcePlayer = players.find(p => p.id === sourceId);
    const targetPlayer = players.find(p => p.id === targetId);
    
    if (!sourcePlayer || !targetPlayer) return;

    const isSourceStarter = lineup.includes(sourceId);
    const isTargetStarter = lineup.includes(targetId);

    // If swapping bench player IN to lineup
    if (!isSourceStarter && isTargetStarter) {
        const isSourceForeign = !sourcePlayer.nationality.includes('🇸🇦');
        const isTargetForeign = !targetPlayer.nationality.includes('🇸🇦');
        
        if (isSourceForeign && !isTargetForeign) {
            // Adding a foreigner, removing a local
            if (foreignersCount >= 5) {
                setErrorMsg("Cannot have more than 5 foreign players in the starting lineup!");
                setTimeout(() => setErrorMsg(null), 3000);
                return;
            }
        }
    }
    
    // Also check the reverse (swapping starter (source) with bench (target) - if we initiated drag from starter)
    if (isSourceStarter && !isTargetStarter) {
         const isSourceForeign = !sourcePlayer.nationality.includes('🇸🇦');
         const isTargetForeign = !targetPlayer.nationality.includes('🇸🇦');
         
         if (!isSourceForeign && isTargetForeign) {
             if (foreignersCount >= 5) {
                 setErrorMsg("Cannot have more than 5 foreign players in the starting lineup!");
                 setTimeout(() => setErrorMsg(null), 3000);
                 return;
             }
         }
    }

    const newLineup = [...lineup];
    const sourceIndex = newLineup.indexOf(sourceId);
    const targetIndex = newLineup.indexOf(targetId);

    if (sourceIndex !== -1 && targetIndex !== -1) {
       newLineup[sourceIndex] = targetId;
       newLineup[targetIndex] = sourceId;
    }
    else if (sourceIndex !== -1 && targetIndex === -1) {
       newLineup[sourceIndex] = targetId;
    }
    else if (sourceIndex === -1 && targetIndex !== -1) {
       newLineup[targetIndex] = sourceId;
    }

    onUpdateLineup(newLineup);
    setSelectedPlayerId(null);
    setDraggedId(null);
    setDragOverPlayerId(null);
  };

  const handlePlayerClick = (targetId: string) => {
    if (!selectedPlayerId) {
      setSelectedPlayerId(targetId);
      return;
    }
    if (selectedPlayerId === targetId) {
      setSelectedPlayerId(null);
      return;
    }
    handleSwap(selectedPlayerId, targetId);
  };

  const handleDragStart = (e: React.DragEvent, playerId: string) => {
    setDraggedId(playerId);
    e.dataTransfer.effectAllowed = 'move';
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; 
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverPlayerId(null);
  };

  const handleDragOver = (e: React.DragEvent, playerId: string) => {
    e.preventDefault();
    if (draggedId !== playerId) {
        e.dataTransfer.dropEffect = 'move';
        setDragOverPlayerId(playerId);
    }
  };

  const handleDragLeave = () => {
    setDragOverPlayerId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedId) {
        handleSwap(draggedId, targetId);
    }
  };

  // --- SET PIECE MODAL COMPONENT ---
  const SetPieceModal = () => {
      const [takers, setTakers] = useState<SetPieceTakers>(setPieceTakers || {
          penalty: [], freeKick: [], leftCorner: [], rightCorner: []
      });

      const handleAssign = (type: keyof SetPieceTakers, playerId: string, rank: number) => {
          setTakers(prev => {
              const list = [...prev[type]];
              // Remove if already exists elsewhere in this list
              const existingIdx = list.indexOf(playerId);
              if(existingIdx > -1) list.splice(existingIdx, 1);
              
              // Place at rank
              list[rank] = playerId;
              
              // Clean undefined
              return { ...prev, [type]: list.slice(0, 3) };
          });
      };

      const save = () => {
          onUpdateSetPieceTakers(takers);
          setShowSetPieceModal(false);
      };

      const categories: {key: keyof SetPieceTakers, label: string}[] = [
          {key: 'penalty', label: 'Penalties'},
          {key: 'freeKick', label: 'Free Kicks'},
          {key: 'leftCorner', label: 'Left Corners'},
          {key: 'rightCorner', label: 'Right Corners'}
      ];

      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowSetPieceModal(false)}>
              <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="p-5 border-b flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-lg flex items-center gap-2"><Crosshair className="text-indigo-600"/> Set Piece Takers</h3>
                      <button onClick={() => setShowSetPieceModal(false)}><X className="text-slate-400"/></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {categories.map(cat => (
                          <div key={cat.key} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">{cat.label}</h4>
                              <div className="space-y-2">
                                  {[0, 1, 2].map(rank => {
                                      const assignedId = takers[cat.key][rank];
                                      return (
                                          <div key={rank} className="flex items-center gap-2">
                                              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">{rank + 1}</span>
                                              <select 
                                                  className="flex-1 p-2 rounded-lg border text-sm font-medium outline-none focus:border-indigo-500"
                                                  value={assignedId || ''}
                                                  onChange={(e) => handleAssign(cat.key, e.target.value, rank)}
                                              >
                                                  <option value="">-- Select --</option>
                                                  {starters.map(p => (
                                                      <option key={p.id} value={p.id}>
                                                          {p.name} ({
                                                              cat.key === 'penalty' ? `PEN: ${p.attributes.penalties}` : 
                                                              cat.key === 'freeKick' ? `FK: ${p.attributes.freeKickAccuracy}` : 
                                                              `PASS: ${p.attributes.shortPassing}`
                                                          })
                                                      </option>
                                                  ))}
                                              </select>
                                          </div>
                                      )
                                  })}
                              </div>
                          </div>
                      ))}
                  </div>

                  <div className="p-5 border-t bg-slate-50 flex justify-end gap-3">
                      <button onClick={() => setShowSetPieceModal(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-200 rounded-lg">Cancel</button>
                      <button onClick={save} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg flex items-center gap-2">
                          <Check size={16} /> Save Changes
                      </button>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="space-y-6">
        
        {/* Error Toast */}
        {errorMsg && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 font-bold animate-in slide-in-from-top-4 flex items-center gap-2">
                <AlertTriangle size={20} />
                {errorMsg}
            </div>
        )}

        {/* Header Control Panel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex flex-col xl:flex-row justify-between items-center gap-6 mb-4 pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600"><Activity size={24}/></div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Tactics Management</h2>
                    </div>
                </div>
                
                {/* TACTICAL INSTRUCTIONS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full xl:w-auto">
                    
                    {/* Style */}
                    <div className="flex flex-col">
                        <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><Shield size={10} /> Tactic Style</label>
                        <select 
                            value={tacticStyle}
                            onChange={(e) => onUpdateTactics(formation, e.target.value as TacticStyle, attackFocus, passingStyle)}
                            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="Balanced">Balanced</option>
                            <option value="Attacking">Attacking</option>
                            <option value="Defensive">Defensive</option>
                            <option value="Possession">Possession</option>
                            <option value="Counter Attack">Counter Attack</option>
                            <option value="High Press">High Press</option>
                        </select>
                    </div>

                    {/* Attack Focus */}
                    <div className="flex flex-col">
                        <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><Target size={10} /> Attack Focus</label>
                        <div className="flex bg-slate-50 rounded-lg border border-slate-200 p-0.5">
                            <button onClick={() => onUpdateTactics(formation, tacticStyle, 'WINGS', passingStyle)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md ${attackFocus === 'WINGS' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'}`}>Wings</button>
                            <button onClick={() => onUpdateTactics(formation, tacticStyle, 'MIXED', passingStyle)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md ${attackFocus === 'MIXED' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'}`}>Mixed</button>
                            <button onClick={() => onUpdateTactics(formation, tacticStyle, 'CENTER', passingStyle)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md ${attackFocus === 'CENTER' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'}`}>Center</button>
                        </div>
                    </div>

                    {/* Passing Style */}
                    <div className="flex flex-col">
                        <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><ArrowRightLeft size={10} /> Passing Style</label>
                        <div className="flex bg-slate-50 rounded-lg border border-slate-200 p-0.5">
                            <button onClick={() => onUpdateTactics(formation, tacticStyle, attackFocus, 'SHORT')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md ${passingStyle === 'SHORT' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'}`}>Short</button>
                            <button onClick={() => onUpdateTactics(formation, tacticStyle, attackFocus, 'MIXED')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md ${passingStyle === 'MIXED' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'}`}>Mixed</button>
                            <button onClick={() => onUpdateTactics(formation, tacticStyle, attackFocus, 'LONG')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md ${passingStyle === 'LONG' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'}`}>Long</button>
                        </div>
                    </div>

                    {/* Set Pieces Button */}
                    <div className="flex flex-col justify-end">
                        <button 
                            onClick={() => setShowSetPieceModal(true)}
                            className="w-full py-2 bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-700"
                        >
                            <Crosshair size={14} /> Set Pieces
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Formation Selector */}
            <div className="overflow-x-auto pb-2">
                <div className="flex gap-2 min-w-max">
                    {['4-4-2', '4-3-3', '4-2-3-1', '3-5-2', '5-3-2', '3-4-3', '4-1-4-1', '4-5-1', '5-4-1', '4-2-2-2'].map((fmt) => (
                        <button
                            key={fmt}
                            onClick={() => onUpdateTactics(fmt as Formation, tacticStyle, attackFocus, passingStyle)}
                            className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all whitespace-nowrap
                            ${formation === fmt 
                                ? 'bg-indigo-600 text-white shadow-lg scale-105' 
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300'}
                            `}
                        >
                            {fmt}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* STADIUM (Left / Main) */}
          <div className="lg:col-span-8 order-1 lg:order-1 relative">
              <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-3xl p-6 shadow-2xl border-4 border-slate-700 relative overflow-hidden select-none">
                 
                 {/* Stadium Background */}
                 <div className="absolute inset-0 bg-gradient-to-b from-emerald-900 via-emerald-950 to-black opacity-90"></div>
                 
                 {/* Stadium Lights Effect */}
                 <div className="absolute top-0 left-[15%] w-48 h-48 bg-yellow-300/15 rounded-full blur-3xl animate-pulse"></div>
                 <div className="absolute top-0 right-[15%] w-48 h-48 bg-yellow-300/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                 <div className="absolute bottom-0 left-[20%] w-40 h-40 bg-blue-400/10 rounded-full blur-3xl"></div>
                 <div className="absolute bottom-0 right-[20%] w-40 h-40 bg-blue-400/10 rounded-full blur-3xl"></div>
                 
                 {/* Scoreboard / Info */}
                 <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md px-6 py-2 rounded-lg border-2 border-yellow-400/50 shadow-2xl z-30 flex gap-4">
                       <div className="text-center">
                          <div className="text-yellow-400 text-[10px] font-bold">Formation</div>
                          <div className="text-white text-lg font-black font-mono">{formation}</div>
                       </div>
                       <div className="h-full w-px bg-yellow-400/30"></div>
                       <div className="text-center">
                          <div className="text-emerald-400 text-[10px] font-bold">Rating</div>
                          <div className="text-white text-lg font-black font-mono">{Math.round(starters.reduce((sum, p) => sum + p.rating, 0) / (starters.length || 1))}</div>
                       </div>
                 </div>

                 {/* Foreign Player Counter - NEW */}
                 <div className={`absolute top-4 right-4 bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-lg border-2 shadow-2xl z-30 flex flex-col items-center
                    ${isForeignLimitExceeded ? 'border-red-500 animate-pulse' : 'border-indigo-500'}
                 `}>
                     <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300">
                         <Globe size={10} /> Foreigners
                     </div>
                     <div className={`text-lg font-black font-mono ${isForeignLimitExceeded ? 'text-red-500' : 'text-white'}`}>
                         {foreignersCount}/5
                     </div>
                 </div>
                 
                 {/* THE PITCH */}
                 <div className="relative w-full mx-auto aspect-[2/3] border-4 border-white/40 rounded-lg shadow-2xl overflow-hidden" style={{maxWidth: '600px', minHeight: '750px'}}>
                     {/* Grass Gradients & Patterns */}
                     <div className="absolute inset-0 bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700"></div>
                     <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0,50,0,0.3) 40px, rgba(0,50,0,0.3) 80px)' }}></div>
                     <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 5px, rgba(255,255,255,0.1) 5px, rgba(255,255,255,0.1) 10px)' }}></div>
                     
                     {/* Lines */}
                     <div className="absolute inset-0 border-8 border-white/80 rounded-sm"></div>
                     <div className="absolute inset-6 border-2 border-white/70 rounded-sm"></div>
                     <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-white/70"></div>
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/70 rounded-full"></div>
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>

                     {/* Penalty Areas */}
                     <div className="absolute top-6 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-white/70 border-t-0 bg-white/5"></div>
                     <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-white/70 border-b-0 bg-white/5"></div>

                     {/* PLAYERS ON PITCH */}
                     {layout.map((slot, index) => {
                         const player = starters[index];
                         // Safety check if lineup isn't full
                         if (!player) return null;

                         const isSelected = selectedPlayerId === player.id;
                         const isDragging = draggedId === player.id;
                         const isDragOver = dragOverPlayerId === player.id;
                         const { rating, penalty } = getEffectiveRating(player, slot.role);
                         
                         let ringColor = 'border-emerald-400';
                         if (penalty > 40) ringColor = 'border-red-500';
                         else if (penalty > 15) ringColor = 'border-orange-500';
                         else if (penalty > 0) ringColor = 'border-yellow-400';

                         const isInjured = player.injuryWeeks > 0;

                         return (
                             <div 
                                 key={player.id}
                                 draggable="true"
                                 onDragStart={(e) => handleDragStart(e, player.id)}
                                 onDragEnd={handleDragEnd}
                                 onDragOver={(e) => handleDragOver(e, player.id)}
                                 onDragLeave={handleDragLeave}
                                 onDrop={(e) => handleDrop(e, player.id)}
                                 onClick={() => handlePlayerClick(player.id)}
                                 className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-move z-10 transition-all duration-300
                                   ${isDragging ? 'opacity-40 scale-90' : ''}
                                   ${isDragOver ? 'scale-125 z-30' : ''}
                                 `}
                                 style={{ top: slot.top, left: slot.left }}
                             >
                                 {/* Shadow */}
                                 <div className={`absolute top-10 w-12 h-3 bg-black/40 rounded-full blur-sm transition-all ${isDragging ? 'opacity-0' : ''}`}></div>
                                 
                                 {/* Drop Zone Indicator */}
                                 <div className={`absolute -z-10 w-20 h-20 rounded-full border-2 border-dashed transition-all duration-500
                                   ${isDragOver ? 'border-yellow-400 border-solid scale-150 animate-pulse bg-yellow-400/20' : 'border-white/0 group-hover:border-white/30'}
                                 `}></div>

                                 {/* Player Token */}
                                 <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold shadow-2xl border-4 transition-all relative
                                   ${isDragOver ? 'scale-125 ring-4 ring-yellow-400 border-yellow-400' : 'group-hover:scale-110'}
                                   ${isSelected && !isDragOver
                                      ? 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 text-white border-yellow-400 ring-4 ring-yellow-400/50 scale-110' 
                                      : !isDragOver 
                                          ? `bg-gradient-to-br from-white via-slate-100 to-slate-200 text-slate-900 ${ringColor}` 
                                          : 'bg-yellow-400 text-slate-900'}
                                 `}>
                                     <div className="flex flex-col items-center leading-none">
                                        <span className="text-lg font-black">{rating}</span>
                                        {penalty > 0 && <span className="text-[8px] text-red-600 font-bold">-{penalty}%</span>}
                                     </div>

                                     {/* Pos Badge */}
                                     <div className={`absolute -top-2 -right-3 h-5 px-1.5 min-w-[20px] rounded-full flex items-center justify-center text-[8px] border border-white font-bold shadow-sm ${getPosColor(player.position)} transition-all`}>
                                       <span>{player.position}</span>
                                       {player.secondaryPositions && player.secondaryPositions.length > 0 && (
                                          <>
                                            <span className="mx-0.5 opacity-50">|</span>
                                            <span className="font-normal">{player.secondaryPositions.join('|')}</span>
                                          </>
                                       )}
                                     </div>
                                     
                                     {isInjured && (
                                         <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center border border-white shadow-sm z-20 animate-pulse">
                                             <AlertTriangle size={10} />
                                         </div>
                                     )}

                                     {index === 0 && (
                                        <div className="absolute -top-1 -left-2 w-5 h-5 rounded-full bg-yellow-400 border border-yellow-600 flex items-center justify-center shadow-lg text-[8px] font-black text-slate-900">
                                           C
                                        </div>
                                     )}
                                 </div>
                                 
                                 <div className={`mt-1.5 px-2 py-1 rounded text-[10px] font-bold backdrop-blur-md shadow-lg border transition-all max-w-[100px] truncate
                                   ${isSelected ? 'bg-indigo-600 text-white border-yellow-400' : 'bg-slate-900/80 text-white border-white/20'}
                                 `}>
                                     {player.name.split(' ').pop()}
                                 </div>
                                 
                                 <div className="mt-0.5 text-[8px] text-white/80 font-bold uppercase tracking-widest bg-black/20 px-2 rounded-full backdrop-blur-sm">
                                     {slot.role}
                                 </div>
                             </div>
                         );
                     })}
                 </div>
              </div>
              
              {/* Legend */}
              <div className="mt-4 bg-white/90 backdrop-blur border border-slate-200 p-4 rounded-xl flex gap-4 text-xs shadow-sm">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-white border-4 border-emerald-400"></div> Correct Position</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-white border-4 border-yellow-400"></div> Secondary Pos (-10%)</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-white border-4 border-red-500"></div> Wrong Pos (-50%)</div>
              </div>
          </div>

          {/* SUBSTITUTES (Right Sidebar) */}
          <div className="lg:col-span-4 order-2 lg:order-2">
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 sticky top-4 h-[calc(100vh-2rem)] flex flex-col">
                 <div className="p-4 border-b bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-2xl flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <UserMinus size={18} className="text-orange-500"/> Substitutes Bench
                    </h3>
                    <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-full">{substitutes.length}</span>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    {substitutes.map(player => {
                       const isSelected = selectedPlayerId === player.id;
                       const isDragging = draggedId === player.id;
                       const isDragOver = dragOverPlayerId === player.id;
                       
                       return (
                         <div 
                           key={player.id}
                           draggable="true"
                           onDragStart={(e) => handleDragStart(e, player.id)}
                           onDragEnd={handleDragEnd}
                           onDragOver={(e) => handleDragOver(e, player.id)}
                           onDragLeave={handleDragLeave}
                           onDrop={(e) => handleDrop(e, player.id)}
                           onClick={() => handlePlayerClick(player.id)}
                           className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-move transition-all duration-200 group
                             ${isDragging ? 'opacity-40 scale-95 border-dashed border-slate-300' : ''}
                             ${isDragOver ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200' : ''}
                             ${isSelected && !isDragging && !isDragOver
                               ? 'bg-indigo-50 border-indigo-500 shadow-md' 
                               : !isDragOver ? 'bg-white border-slate-100 hover:border-orange-300 hover:shadow-sm' : ''}
                           `}
                         >
                            <div className="flex items-center gap-3 pointer-events-none w-full">
                               <div className={`shrink-0 px-2 py-1.5 rounded-lg border flex items-center justify-center gap-1 shadow-sm ${getPosColor(player.position)}`}>
                                   <span className="font-bold text-xs">{player.position}</span>
                                   {player.secondaryPositions && player.secondaryPositions.length > 0 && (
                                       <>
                                           <span className="opacity-40 text-[10px]">|</span>
                                           <span className="font-normal text-[10px] opacity-90">{player.secondaryPositions.join('|')}</span>
                                       </>
                                   )}
                               </div>

                               <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                      <div className="font-bold text-sm text-slate-800 group-hover:text-indigo-700 transition-colors truncate">{player.name}</div>
                                      <div className={`text-sm font-black ${player.rating >= 80 ? 'text-emerald-600' : 'text-slate-700'}`}>{player.rating}</div>
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                      <div className="text-[10px] text-slate-500 flex items-center gap-1.5 shrink-0">
                                          <span>{player.nationality}</span>
                                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                          <span>{player.age} yrs</span>
                                      </div>
                                      {player.injuryWeeks > 0 && <span className="text-[9px] bg-red-100 text-red-600 px-1 rounded ml-auto flex items-center gap-1"><AlertTriangle size={8}/> Injured</span>}
                                  </div>
                               </div>
                            </div>
                         </div>
                       );
                    })}
                 </div>
                 
                 <div className="p-4 border-t bg-orange-50/50 text-center rounded-b-2xl">
                    <p className="text-xs text-orange-700 font-bold flex items-center justify-center gap-2">
                       <GripVertical size={14} /> Drag or Click to Swap
                    </p>
                 </div>
             </div>
          </div>
        </div>

        {selectedPlayer && (
           <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-slate-700 animate-in slide-in-from-bottom-4">
              <RefreshCw className="text-yellow-400 w-5 h-5 animate-spin-slow" />
              <div className="text-sm">
                 <span className="text-slate-400">Moving:</span> 
                 <span className="font-bold text-white mx-1">{selectedPlayer.name}</span>
                 <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-yellow-300">{selectedPlayer.position}</span>
              </div>
              <button 
                onClick={() => setSelectedPlayerId(null)} 
                className="text-xs bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 font-bold transition-colors"
              >
                  Cancel
              </button>
           </div>
        )}

        {showSetPieceModal && <SetPieceModal />}
    </div>
  );
};

export default TacticsView;