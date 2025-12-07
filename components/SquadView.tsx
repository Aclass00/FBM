
import React, { useState, useMemo } from 'react';
import { Player, Position, DrillType } from '../types';
import { Shield, LayoutGrid, List, ArrowUpDown, ArrowUp, ArrowDown, PlusSquare, TrendingUp, RectangleVertical, Activity } from 'lucide-react';
import PlayerDetailModal from './PlayerDetailModal';

interface Props {
  players: Player[];
  teamName: string;
  onSetDrill?: (drill: DrillType, playerIds: string[]) => void;
  userTeamId?: string;
}

type SortField = 'position' | 'name' | 'age' | 'rating' | 'potential' | 'value' | 'wage' | 'matchesPlayed' | 'goals' | 'assists' | 'yellowCards' | 'redCards' | 'averageRating';

const SquadView: React.FC<Props> = ({ players, teamName, onSetDrill, userTeamId }) => {
  const [filter, setFilter] = useState<'ALL' | 'GK' | 'DEF' | 'MID' | 'FWD'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table'); 
  const [sortConfig, setSortConfig] = useState<{ key: SortField; direction: 'asc' | 'desc' }>({ key: 'position', direction: 'asc' });
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const getFilteredPlayers = () => {
    let filtered = players;
    if (filter === 'GK') filtered = players.filter(p => p.position === Position.GK);
    if (filter === 'DEF') filtered = players.filter(p => [Position.CB, Position.LB, Position.RB].includes(p.position));
    if (filter === 'MID') filtered = players.filter(p => [Position.CDM, Position.CM, Position.CAM, Position.LM, Position.RM].includes(p.position));
    if (filter === 'FWD') filtered = players.filter(p => [Position.ST, Position.CF, Position.LW, Position.RW].includes(p.position));
    return filtered;
  };

  const sortedPlayers = useMemo(() => {
    let sortableItems = [...getFilteredPlayers()];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue: any = a[sortConfig.key];
        let bValue: any = b[sortConfig.key];
        if (sortConfig.key === 'position') {
            const order = ['GK', 'RB', 'CB', 'LB', 'CDM', 'RM', 'CM', 'LM', 'CAM', 'RW', 'ST', 'CF', 'LW'];
            aValue = order.indexOf(a.position);
            bValue = order.indexOf(b.position);
        }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [players, filter, sortConfig]);

  const requestSort = (key: SortField) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortField) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={12} className="opacity-30" />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

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

  const getFormBadge = (rating: number) => {
      if (rating >= 7.5) return <span className="text-xs font-bold text-white bg-emerald-500 px-1.5 py-0.5 rounded">Excellent ({rating.toFixed(1)})</span>;
      if (rating >= 6.5) return <span className="text-xs font-bold text-white bg-blue-500 px-1.5 py-0.5 rounded">Good ({rating.toFixed(1)})</span>;
      if (rating >= 5.5) return <span className="text-xs font-bold text-white bg-yellow-500 px-1.5 py-0.5 rounded">Average ({rating.toFixed(1)})</span>;
      if (rating > 0) return <span className="text-xs font-bold text-white bg-red-500 px-1.5 py-0.5 rounded">Poor ({rating.toFixed(1)})</span>;
      return <span className="text-xs text-slate-400">-</span>;
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Shield className="w-6 h-6 text-indigo-600" />
          {teamName} Squad
        </h2>
        
        <div className="flex flex-wrap items-center gap-4 justify-center">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List size={20} />
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

          <div className="flex gap-2">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'GK', label: 'GK' },
              { id: 'DEF', label: 'DEF' },
              { id: 'MID', label: 'MID' },
              { id: 'FWD', label: 'FWD' }
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === btn.id 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedPlayers.map(player => (
            <div onClick={() => setSelectedPlayer(player)} key={player.id} className="cursor-pointer bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-slate-200 group-hover:bg-indigo-500 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-4 pl-3">
                <div>
                  <div className="flex gap-1 flex-wrap mb-2">
                     <div className={`px-2 py-1 rounded text-[10px] border ${getPosColor(player.position)} flex items-center gap-1.5`}>
                         <span className="font-bold">{player.position}</span>
                     </div>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">{player.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-slate-500">{player.nationality} • {player.age} yrs</p>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                   <div className={`text-2xl font-black ${player.averageRating >= 7 ? 'text-emerald-600' : 'text-slate-700'}`}>
                       {player.averageRating > 0 ? player.averageRating : '-'}
                   </div>
                   <span className="text-[10px] text-slate-400 uppercase">Match Perf.</span>
                   
                   {/* Status Icons: Injury & Cards */}
                   <div className="flex gap-2 mt-2">
                      <div className={`p-1 rounded-full ${player.injuryWeeks > 0 ? 'bg-red-100 text-red-500' : 'bg-slate-100 text-slate-300'}`} title={player.injuryWeeks > 0 ? `Injured (${player.injuryWeeks} weeks)` : 'Fit'}>
                          <Activity size={14} fill={player.injuryWeeks > 0 ? 'currentColor' : 'none'} />
                      </div>
                      <div className={`p-1 rounded-full ${player.redCards > 0 ? 'bg-red-100 text-red-500' : 'bg-slate-100 text-slate-300'}`} title={player.redCards > 0 ? 'Suspended' : 'Available'}>
                          <RectangleVertical size={14} fill="currentColor" />
                      </div>
                   </div>
                </div>
              </div>
              
              <div className="mb-3 px-1">
                 <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                   <span>Potential Growth</span>
                   <span className="flex items-center gap-1"><TrendingUp size={10} /> {player.potential}</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(player.rating / player.potential) * 100}%`}}></div>
                 </div>
              </div>

              {/* CARD FOOTER STATS */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-slate-100 pt-3">
                <div className="space-y-1">
                  <div className="text-slate-400 text-[10px]">Played</div>
                  <div className="font-bold text-slate-700">{player.matchesPlayed}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-400 text-[10px]">Goals</div>
                  <div className="font-bold text-slate-700">{player.goals}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-400 text-[10px]">Value</div>
                  <div className="font-bold text-slate-700">{player.value}M</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th onClick={() => requestSort('name')} className="px-6 py-4 cursor-pointer hover:bg-slate-100">
                     <div className="flex items-center gap-1">Player {getSortIcon('name')}</div>
                  </th>
                  <th onClick={() => requestSort('position')} className="px-4 py-4 text-center cursor-pointer hover:bg-slate-100">
                     <div className="flex items-center justify-center gap-1">Pos {getSortIcon('position')}</div>
                  </th>
                  <th onClick={() => requestSort('rating')} className="px-4 py-4 text-center cursor-pointer hover:bg-slate-100">
                     <div className="flex items-center justify-center gap-1">OVR {getSortIcon('rating')}</div>
                  </th>
                  <th onClick={() => requestSort('averageRating')} className="px-4 py-4 text-center cursor-pointer hover:bg-slate-100">
                     <div className="flex items-center justify-center gap-1">Form {getSortIcon('averageRating')}</div>
                  </th>
                  
                  {/* STATS COLUMNS */}
                  <th onClick={() => requestSort('goals')} className="px-2 py-4 text-center cursor-pointer hover:bg-slate-100">
                      <div className="flex items-center justify-center">Goals</div>
                  </th>
                  <th onClick={() => requestSort('assists')} className="px-2 py-4 text-center cursor-pointer hover:bg-slate-100">
                      <div className="flex items-center justify-center">Assists</div>
                  </th>
                  
                  {/* Cards Columns Restored */}
                  <th onClick={() => requestSort('yellowCards')} className="px-2 py-4 text-center cursor-pointer hover:bg-slate-100">
                      <div className="flex items-center justify-center bg-yellow-100 w-6 h-8 mx-auto rounded-sm border border-yellow-200"></div>
                  </th>
                  <th onClick={() => requestSort('redCards')} className="px-2 py-4 text-center cursor-pointer hover:bg-slate-100">
                      <div className="flex items-center justify-center bg-red-100 w-6 h-8 mx-auto rounded-sm border border-red-200"></div>
                  </th>

                  <th onClick={() => requestSort('value')} className="px-4 py-4 text-center cursor-pointer hover:bg-slate-100">
                     <div className="flex items-center justify-center gap-1">Value {getSortIcon('value')}</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedPlayers.map((player) => (
                  <tr onClick={() => setSelectedPlayer(player)} key={player.id} className="cursor-pointer hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-900">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1">
                          {player.name}
                          {player.injuryWeeks > 0 && <PlusSquare size={14} fill="currentColor" className="text-red-500" />}
                        </span>
                        <span className="text-[10px] text-slate-400">{player.nationality} • {player.age} yrs</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                       <div className="flex justify-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] border ${getPosColor(player.position)} flex items-center gap-1`}>
                            <span className="font-bold">{player.position}</span>
                          </span>
                       </div>
                    </td>
                    <td className={`px-4 py-3 text-center font-bold text-lg ${getRatingColor(player.rating)}`}>
                      {player.rating}
                    </td>
                    <td className="px-4 py-3 text-center">
                        {getFormBadge(player.averageRating)}
                    </td>
                    
                    {/* STATS DATA */}
                    <td className="px-2 py-3 text-center font-bold text-slate-700">{player.goals}</td>
                    <td className="px-2 py-3 text-center font-bold text-slate-600">{player.assists}</td>
                    
                    {/* Card Data */}
                    <td className="px-2 py-3 text-center font-bold text-yellow-600">{player.yellowCards}</td>
                    <td className="px-2 py-3 text-center font-bold text-red-600">{player.redCards}</td>

                    <td className="px-4 py-3 text-center font-bold text-amber-600 text-sm">{player.value}M</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {selectedPlayer && (
          <PlayerDetailModal 
            player={selectedPlayer} 
            onClose={() => setSelectedPlayer(null)} 
            onSetDrill={onSetDrill} 
            isOwnPlayer={true} // In SquadView, it's always the user's player
          />
      )}

    </div>
  );
};

export default SquadView;