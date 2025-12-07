

import React, { useState, useMemo } from 'react';
import { Player, Team, Position } from '../types';
import { Search, Ruler, Weight, Flag, Users, Briefcase, AlertCircle } from 'lucide-react';
import PlayerDetailModal from './PlayerDetailModal';
import { NegotiationResult } from '../hooks/useTransferSystem';

interface Props {
  teams: Team[];
  userTeamId: string;
  onBuyPlayer: (player: Player, fromTeamId: string, offerAmount: number) => Promise<NegotiationResult>;
  userBudget: number;
}

type SortOption = 'RATING_DESC' | 'PRICE_ASC' | 'POT_DESC';

const TransferMarket: React.FC<Props> = ({ teams, userTeamId, onBuyPlayer, userBudget }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [posFilter, setPosFilter] = useState<'ALL' | Position>('ALL');
  const [minAge, setMinAge] = useState<number | ''>('');
  const [maxAge, setMaxAge] = useState<number | ''>('');
  const [sortOption, setSortOption] = useState<SortOption>('RATING_DESC');
  const [selectedPlayer, setSelectedPlayer] = useState<{player: Player, teamName: string, teamId: string} | null>(null);

  // --- OPTIMIZATION: Memoize Market Players aggregation ---
  const marketPlayers = useMemo(() => {
      return teams
        .filter(t => t.id !== userTeamId)
        .flatMap(t => t.players.map(p => ({ ...p, teamId: t.id, teamName: t.name })));
  }, [teams, userTeamId]);

  // --- OPTIMIZATION: Memoize Filter/Sort Logic ---
  const filteredPlayers = useMemo(() => {
    return marketPlayers.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesPos = true;
      if (posFilter !== 'ALL') {
        matchesPos = p.position === posFilter;
      }

      // Age Range Check
      const meetsMinAge = minAge === '' || p.age >= minAge;
      const meetsMaxAge = maxAge === '' || p.age <= maxAge;

      // Only show players who are transfer listed
      const isListed = p.isTransferListed === true;

      return matchesSearch && matchesPos && isListed && meetsMinAge && meetsMaxAge;
    }).sort((a, b) => {
        switch(sortOption) {
            case 'RATING_DESC': return b.rating - a.rating;
            case 'PRICE_ASC': return a.value - b.value;
            case 'POT_DESC': return b.potential - a.potential;
            default: return b.rating - a.rating;
        }
    });
  }, [marketPlayers, searchTerm, posFilter, minAge, maxAge, sortOption]);

  const getPosColor = (pos: Position) => {
    if (pos === Position.GK) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if ([Position.CB, Position.LB, Position.RB].includes(pos)) return 'bg-blue-100 text-blue-700 border-blue-200';
    if ([Position.CDM, Position.CM, Position.CAM, Position.LM, Position.RM].includes(pos)) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 85) return 'text-emerald-600';
    if (rating >= 75) return 'text-blue-600';
    if (rating >= 65) return 'text-yellow-600';
    return 'text-slate-500';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="text-emerald-600" />
            Transfer Market
          </h2>
          <div className="bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 flex items-center gap-2">
            <span className="text-sm text-slate-500">Your Budget:</span>
            <span className="text-xl font-bold text-emerald-700">{userBudget.toFixed(1)}M</span>
          </div>
        </div>

        <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2 text-sm text-blue-800 border border-blue-100">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>Only players who have been placed on the <strong>transfer list</strong> by their clubs will appear here. You can negotiate the price with the selling club.</span>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Search (4 cols) */}
              <div className="md:col-span-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search for player..." 
                  className="w-full pr-4 pl-10 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Position Dropdown (3 cols) */}
              <div className="md:col-span-3">
                <select 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium text-slate-600 cursor-pointer"
                    value={posFilter}
                    onChange={(e) => setPosFilter(e.target.value as any)}
                >
                    <option value="ALL">All Positions</option>
                    <optgroup label="Defense">
                        <option value="GK">GK</option>
                        <option value="CB">CB</option>
                        <option value="LB">LB</option>
                        <option value="RB">RB</option>
                    </optgroup>
                    <optgroup label="Midfield">
                        <option value="CDM">CDM</option>
                        <option value="CM">CM</option>
                        <option value="CAM">CAM</option>
                        <option value="LM">LM</option>
                        <option value="RM">RM</option>
                    </optgroup>
                    <optgroup label="Attack">
                        <option value="LW">LW</option>
                        <option value="RW">RW</option>
                        <option value="CF">CF</option>
                        <option value="ST">ST</option>
                    </optgroup>
                </select>
              </div>

              {/* Age Range Inputs (3 cols) */}
              <div className="md:col-span-3 flex gap-2">
                 <div className="relative flex-1">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">Min</span>
                     <input 
                       type="number" 
                       placeholder="16" 
                       min="15" 
                       max="45"
                       className="w-full pl-8 pr-2 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-center"
                       value={minAge}
                       onChange={(e) => setMinAge(e.target.value === '' ? '' : parseInt(e.target.value))}
                     />
                 </div>
                 <div className="relative flex-1">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">Max</span>
                     <input 
                       type="number" 
                       placeholder="40" 
                       min="15" 
                       max="45"
                       className="w-full pl-8 pr-2 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-center"
                       value={maxAge}
                       onChange={(e) => setMaxAge(e.target.value === '' ? '' : parseInt(e.target.value))}
                     />
                 </div>
              </div>

              {/* Sorting Dropdown (2 cols) */}
              <div className="md:col-span-2">
                  <select
                     className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium text-slate-600 cursor-pointer"
                     value={sortOption}
                     onChange={(e) => setSortOption(e.target.value as SortOption)}
                  >
                      <option value="RATING_DESC">Highest Rated</option>
                      <option value="POT_DESC">Highest Potential</option>
                      <option value="PRICE_ASC">Lowest Price</option>
                  </select>
              </div>
            </div>

        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPlayers.slice(0, 50).map(item => {
             const { teamName, ...player } = item;

             return (
              <div 
                key={player.id} 
                onClick={() => setSelectedPlayer({ player, teamName, teamId: item.teamId })}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-slate-100 to-transparent rounded-br-full -ml-4 -mt-4 opacity-50 group-hover:from-indigo-50 transition-colors"></div>

                <div className="flex justify-between items-start mb-3 relative z-10">
                   <div className="flex flex-col">
                      <div className="flex items-center gap-1 mb-1">
                          <span className={`self-start px-2 py-0.5 rounded text-[10px] border ${getPosColor(player.position)} flex items-center gap-1`}>
                            <span className="font-bold">{player.position}</span>
                            {player.secondaryPositions && player.secondaryPositions.length > 0 && (
                                <>
                                    <span className="opacity-40">|</span>
                                    <span className="font-normal opacity-90">{player.secondaryPositions.join('|')}</span>
                                </>
                            )}
                          </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg leading-tight">{player.name}</h3>
                      <div className="flex flex-col gap-1 mt-1 text-xs text-slate-500">
                         <div className="flex items-center gap-1">
                             <Flag size={10} /> {player.nationality} • {player.age} yrs
                         </div>
                         <div className="flex items-center gap-1 font-medium text-indigo-500">
                             <Users size={10} /> {teamName}
                         </div>
                      </div>
                   </div>
                   <div className={`text-2xl font-black ${getRatingColor(player.rating)}`}>
                     {player.rating}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg">
                   <div className="flex items-center gap-1"><Ruler size={10}/> {player.height} cm</div>
                   <div className="flex items-center gap-1"><Weight size={10}/> {player.weight} kg</div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-between items-end">
                   <div>
                      <div className="text-[10px] text-slate-400">Market Value</div>
                      <div className="font-bold text-slate-700">{player.value}M</div>
                   </div>
                   <div className="text-right">
                      <button className="text-[10px] bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-700">
                          Negotiate
                      </button>
                   </div>
                </div>
              </div>
             )
        })}
      </div>

      {filteredPlayers.length === 0 && (
          <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No players match your current filter criteria.</p>
          </div>
      )}

      {selectedPlayer && (
        <PlayerDetailModal 
          player={selectedPlayer.player} 
          isOwnPlayer={false}
          userBudget={userBudget}
          onNegotiate={(amount) => onBuyPlayer(selectedPlayer.player, selectedPlayer.teamId, amount)}
          onClose={() => setSelectedPlayer(null)} 
        />
      )}
    </div>
  );
};

export default TransferMarket;