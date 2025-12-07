
import React, { useState } from 'react';
import { Team, Match, Player } from '../types';
import { Users, Ticket, Award, Goal, Calendar, Search, ArrowLeft, Shirt } from 'lucide-react';
import PlayerDetailModal from './PlayerDetailModal';
import { calculateWeeklyFinances } from '../services/engine';
import { NegotiationResult } from '../hooks/useTransferSystem';

interface Props {
  team: Team;
  matches: Match[];
  allTeams: Team[];
  onBack: () => void;
  onBuyPlayer?: (player: Player, fromTeamId: string, offerAmount: number) => Promise<NegotiationResult>;
  userBudget: number;
  userTeamId: string;
}

const TeamDetailView: React.FC<Props> = ({ team, matches, allTeams, onBack, onBuyPlayer, userBudget, userTeamId }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // 1. Calculate History (Last 10 matches)
  const history = matches
    .filter(m => (m.homeTeamId === team.id || m.awayTeamId === team.id) && m.played)
    .sort((a, b) => b.week - a.week)
    .slice(0, 10);

  // 2. Identify Key Players
  const sortedByRating = [...team.players].sort((a, b) => b.rating - a.rating);
  const bestPlayer = sortedByRating[0];
  
  const sortedByGoals = [...team.players].sort((a, b) => b.goals - a.goals);
  const topScorer = sortedByGoals[0];

  // 3. Finances for Fan info
  const { meta } = calculateWeeklyFinances(team);
  
  const isUserTeam = team.id === userTeamId;

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
             <button onClick={onBack} className="absolute top-4 left-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-20">
                 <ArrowLeft size={20} className="text-slate-600"/>
             </button>

             <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                 <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold shadow-xl border-4 border-white ${team.color}`}>
                     {team.customLogoUrl ? <img src={team.customLogoUrl} className="w-full h-full object-cover rounded-full" alt="logo" /> : team.logoCode}
                 </div>
                 <div className="text-center md:text-right">
                     <h1 className="text-3xl font-bold text-slate-800">{team.name}</h1>
                     <div className="text-slate-500 font-medium mt-1">المدرب: {team.managerName || 'غير معروف'}</div>
                     <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                         <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                             <Users size={14} /> الجمهور: {meta.attendance.toLocaleString()}
                         </div>
                         <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                             <Ticket size={14} /> السعة: {meta.capacity.toLocaleString()}
                         </div>
                     </div>
                 </div>
             </div>
             
             {/* Background Decoration */}
             <div className={`absolute top-0 right-0 w-64 h-64 ${team.color} opacity-5 rounded-bl-full -mr-10 -mt-10`}></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Stats & Stars */}
            <div className="space-y-6">
                
                {/* Form History */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Calendar className="text-indigo-600" size={18} /> آخر المباريات
                    </h3>
                    <div className="space-y-3">
                        {history.length > 0 ? history.map(m => {
                            const isHome = m.homeTeamId === team.id;
                            const oppId = isHome ? m.awayTeamId : m.homeTeamId;
                            const opponent = allTeams.find(t => t.id === oppId);
                            const myScore = isHome ? m.homeScore! : m.awayScore!;
                            const oppScore = isHome ? m.awayScore! : m.homeScore!;
                            
                            let result = 'D';
                            let bgClass = 'bg-slate-100 text-slate-500';
                            if (myScore > oppScore) { result = 'W'; bgClass = 'bg-emerald-500 text-white shadow-md shadow-emerald-200'; }
                            else if (myScore < oppScore) { result = 'L'; bgClass = 'bg-red-500 text-white shadow-md shadow-red-200'; }

                            return (
                                <div key={m.id} className="flex items-center justify-between text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${bgClass}`}>
                                            {result === 'W' ? '✓' : result === 'L' ? '✕' : '-'}
                                        </div>
                                        <span className="text-slate-600">ضد {opponent?.name}</span>
                                    </div>
                                    <span className="font-mono font-bold text-slate-800">{myScore} - {oppScore}</span>
                                </div>
                            );
                        }) : (
                            <div className="text-slate-400 text-center text-sm py-4">لم يلعب الفريق مباريات بعد</div>
                        )}
                    </div>
                </div>

                {/* Star Players */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                    <h3 className="font-bold text-slate-800 mb-4">أبرز النجوم</h3>
                    
                    {/* Best Player */}
                    <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-yellow-50 to-white rounded-xl border border-yellow-100">
                        <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                            <Award size={20} />
                        </div>
                        <div>
                            <div className="text-xs text-slate-400 font-bold uppercase">النجم الأول</div>
                            <div className="font-bold text-slate-800">{bestPlayer.name}</div>
                            <div className="text-xs text-yellow-600 font-bold">تقييم {bestPlayer.rating}</div>
                        </div>
                    </div>

                    {/* Top Scorer */}
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-white rounded-xl border border-emerald-100">
                        <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                            <Goal size={20} />
                        </div>
                        <div>
                            <div className="text-xs text-slate-400 font-bold uppercase">الهداف</div>
                            <div className="font-bold text-slate-800">{topScorer.name}</div>
                            <div className="text-xs text-emerald-600 font-bold">{topScorer.goals} أهداف</div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Right Column: Squad List */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Shirt className="text-indigo-600" size={18} /> قائمة اللاعبين
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {team.players.map(player => (
                        <div 
                            key={player.id} 
                            onClick={() => setSelectedPlayer(player)}
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold border ${
                                    player.position === 'GK' ? 'bg-yellow-100 border-yellow-200 text-yellow-700' : 
                                    ['CB','LB','RB'].includes(player.position) ? 'bg-blue-100 border-blue-200 text-blue-700' :
                                    ['CM','CDM','CAM','RM','LM'].includes(player.position) ? 'bg-emerald-100 border-emerald-200 text-emerald-700' :
                                    'bg-red-100 border-red-200 text-red-700'
                                }`}>
                                    {player.position}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-700 text-sm group-hover:text-indigo-700">{player.name}</div>
                                    <div className="text-[10px] text-slate-400">{player.age} سنة • {player.nationality}</div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`font-bold ${player.rating >= 80 ? 'text-emerald-600' : 'text-slate-600'}`}>{player.rating}</span>
                                {!isUserTeam && (
                                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 rounded mt-1 group-hover:bg-white">
                                        {player.value}M
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>

        {selectedPlayer && (
            <PlayerDetailModal 
                player={selectedPlayer} 
                onClose={() => setSelectedPlayer(null)} 
                isOwnPlayer={isUserTeam}
                // Pass buy negotiation function if it's not our team
                onNegotiate={!isUserTeam && onBuyPlayer ? (amount) => onBuyPlayer(selectedPlayer, team.id, amount) : undefined}
                userBudget={userBudget}
            />
        )}
    </div>
  );
};

export default TeamDetailView;
