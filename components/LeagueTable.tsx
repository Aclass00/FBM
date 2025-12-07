

import React, { useState, useEffect } from 'react';
import { Team, SeasonHistory } from '../types';
import { Trophy, Activity, Goal, Footprints, Shield, AlertTriangle, RectangleVertical, ArrowRightCircle, History } from 'lucide-react';
import { useGameState } from '../hooks/useGameState'; // Need access to global history

interface Props {
  teams: Team[];
  onTeamClick?: (teamId: string) => void;
}

const LeagueTable: React.FC<Props> = ({ teams, onTeamClick }) => {
  const [activeTab, setActiveTab] = useState<'table' | 'stats' | 'history'>('table');
  const { history } = useGameState(); // Access history from global state hook

  // Sort Table: Points > Goal Difference > Goals For
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });

  // Calculate Stats
  const allPlayers = teams.flatMap(t => t.players.map(p => ({...p, teamName: t.name, teamLogo: t.logoCode, teamColor: t.color})));
  
  const topScorers = [...allPlayers].sort((a, b) => b.goals - a.goals).slice(0, 5);
  const topAssists = [...allPlayers].sort((a, b) => b.assists - a.assists).slice(0, 5);
  const topYellow = [...allPlayers].sort((a, b) => b.yellowCards - a.yellowCards).slice(0, 5);
  const topRed = [...allPlayers].sort((a, b) => b.redCards - a.redCards).slice(0, 5);
  
  const topDefenses = [...teams].sort((a, b) => a.goalsAgainst - b.goalsAgainst).slice(0, 5);

  const PlayerRow = ({ player, value }: any) => (
      <div className="flex items-center justify-between p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full ${player.teamColor} text-white flex items-center justify-center text-[10px]`}>
                  {player.teamLogo}
              </div>
              <div>
                  <div className="font-bold text-slate-800 text-sm">{player.name}</div>
                  <div className="text-[10px] text-slate-400">{player.teamName}</div>
              </div>
          </div>
          <div className="font-black text-lg text-slate-700">{value}</div>
      </div>
  );

  return (
    <div className="space-y-6">
       
       {/* Toggle Switch */}
       <div className="flex justify-center">
           <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex gap-1">
               <button 
                  onClick={() => setActiveTab('table')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all
                     ${activeTab === 'table' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}
                  `}
               >
                   <Trophy size={16} /> League Table
               </button>
               <button 
                  onClick={() => setActiveTab('stats')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all
                     ${activeTab === 'stats' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}
                  `}
               >
                   <Activity size={16} /> Statistics
               </button>
               <button 
                  onClick={() => setActiveTab('history')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all
                     ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}
                  `}
               >
                   <History size={16} /> History
               </button>
           </div>
       </div>

       {activeTab === 'table' && (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Club</th>
                <th className="px-4 py-4 text-center">P</th>
                <th className="px-4 py-4 text-center">W</th>
                <th className="px-4 py-4 text-center">D</th>
                <th className="px-4 py-4 text-center">L</th>
                <th className="px-4 py-4 text-center hidden sm:table-cell">GF</th>
                <th className="px-4 py-4 text-center hidden sm:table-cell">GA</th>
                <th className="px-4 py-4 text-center">GD</th>
                <th className="px-6 py-4 text-center">Pts</th>
                <th className="px-6 py-4 text-center hidden md:table-cell">Form</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedTeams.map((team, index) => {
                 const gd = team.goalsFor - team.goalsAgainst;
                 return (
                  <tr key={team.id} className={`hover:bg-slate-50 transition-colors ${index < 3 ? 'bg-emerald-50/30' : ''} ${index > 12 ? 'bg-red-50/30' : ''}`}>
                    <td className="px-6 py-4 font-medium text-slate-400">{index + 1}</td>
                    <td 
                        className="px-6 py-4 font-semibold text-slate-800 flex items-center gap-3 cursor-pointer hover:text-indigo-600 transition-colors group"
                        onClick={() => onTeamClick && onTeamClick(team.id)}
                    >
                      <div className={`w-8 h-8 rounded-full ${team.color} text-white flex items-center justify-center text-xs shadow-sm group-hover:ring-2 group-hover:ring-indigo-200 transition-all`}>
                        {team.logoCode}
                      </div>
                      {team.name}
                    </td>
                    <td className="px-4 py-4 text-center text-slate-600">{team.wins + team.draws + team.losses}</td>
                    <td className="px-4 py-4 text-center text-emerald-600 font-medium">{team.wins}</td>
                    <td className="px-4 py-4 text-center text-slate-500">{team.draws}</td>
                    <td className="px-4 py-4 text-center text-red-500">{team.losses}</td>
                    <td className="px-4 py-4 text-center text-slate-400 hidden sm:table-cell">{team.goalsFor}</td>
                    <td className="px-4 py-4 text-center text-slate-400 hidden sm:table-cell">{team.goalsAgainst}</td>
                    <td className="px-4 py-4 text-center font-medium dir-ltr hidden sm:table-cell text-slate-700">{gd > 0 ? `+${gd}` : gd}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-900 text-lg">{team.points}</td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex gap-1 justify-center">
                        {team.form.map((f, i) => (
                          <span key={i} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white
                            ${f === 'W' ? 'bg-emerald-500' : f === 'D' ? 'bg-slate-400' : 'bg-red-500'}
                          `}>
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                 );
              })}
            </tbody>
          </table>
        </div>
       )}

       {activeTab === 'stats' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
               {/* Scorers */}
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                   <div className="p-4 bg-emerald-50 border-b border-emerald-100 font-bold text-emerald-800 flex items-center gap-2">
                       <Goal size={18} /> Top Scorers
                   </div>
                   <div>
                       {topScorers.map(p => <PlayerRow key={p.id} player={p} value={p.goals} />)}
                   </div>
               </div>

               {/* Assists */}
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                   <div className="p-4 bg-blue-50 border-b border-blue-100 font-bold text-blue-800 flex items-center gap-2">
                       <Footprints size={18} /> Top Assists
                   </div>
                   <div>
                       {topAssists.map(p => <PlayerRow key={p.id} player={p} value={p.assists} />)}
                   </div>
               </div>

               {/* Defense */}
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                   <div className="p-4 bg-slate-100 border-b border-slate-200 font-bold text-slate-800 flex items-center gap-2">
                       <Shield size={18} /> Best Defenses (Goals Conceded)
                   </div>
                   <div>
                       {topDefenses.map(t => (
                           <div key={t.id} className="flex items-center justify-between p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                               <div className="flex items-center gap-3">
                                   <div className={`w-8 h-8 rounded-full ${t.color} text-white flex items-center justify-center text-[10px]`}>
                                       {t.logoCode}
                                   </div>
                                   <div className="font-bold text-slate-800 text-sm">{t.name}</div>
                               </div>
                               <div className="font-black text-lg text-slate-700">{t.goalsAgainst}</div>
                           </div>
                       ))}
                   </div>
               </div>

               {/* Yellow Cards */}
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                   <div className="p-4 bg-yellow-50 border-b border-yellow-100 font-bold text-yellow-800 flex items-center gap-2">
                       <AlertTriangle size={18} /> Yellow Cards
                   </div>
                   <div>
                       {topYellow.map(p => <PlayerRow key={p.id} player={p} value={p.yellowCards} />)}
                   </div>
               </div>

               {/* Red Cards */}
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                   <div className="p-4 bg-red-50 border-b border-red-100 font-bold text-red-800 flex items-center gap-2">
                       <RectangleVertical size={18} /> Red Cards
                   </div>
                   <div>
                       {topRed.map(p => <PlayerRow key={p.id} player={p} value={p.redCards} />)}
                   </div>
               </div>
           </div>
       )}

       {activeTab === 'history' && (
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
               {history && history.length > 0 ? (
                   <table className="w-full text-left">
                       <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                           <tr>
                               <th className="px-6 py-4">Season</th>
                               <th className="px-6 py-4 text-emerald-700">Champion</th>
                               <th className="px-6 py-4 text-slate-500">Runner-Up</th>
                               <th className="px-6 py-4">Top Scorer</th>
                               <th className="px-6 py-4">Top Assister</th>
                               <th className="px-6 py-4">Best Player</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                           {history.map((season) => (
                               <tr key={season.seasonNumber} className="hover:bg-slate-50">
                                   <td className="px-6 py-4 font-bold text-slate-800">Season {season.seasonNumber}</td>
                                   <td className="px-6 py-4 font-black text-emerald-600 flex items-center gap-2">
                                       <Trophy size={14} className="text-yellow-500" /> {season.championName}
                                   </td>
                                   <td className="px-6 py-4 font-medium text-slate-500">{season.runnerUpName}</td>
                                   <td className="px-6 py-4 text-sm">
                                       <div className="font-bold text-slate-800">{season.topScorer.name}</div>
                                       <div className="text-[10px] text-slate-400">{season.topScorer.goals} goals</div>
                                   </td>
                                   <td className="px-6 py-4 text-sm">
                                       <div className="font-bold text-slate-800">{season.topAssister.name}</div>
                                       <div className="text-[10px] text-slate-400">{season.topAssister.assists} assists</div>
                                   </td>
                                   <td className="px-6 py-4 text-sm">
                                       <div className="font-bold text-slate-800">{season.bestPlayer.name}</div>
                                       <div className="text-[10px] text-slate-400">{season.bestPlayer.rating.toFixed(2)} rating</div>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               ) : (
                   <div className="p-12 text-center text-slate-400">
                       <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                       <p>No historical records yet. Complete one season to start writing history.</p>
                   </div>
               )}
           </div>
       )}
    </div>
  );
};

export default LeagueTable;