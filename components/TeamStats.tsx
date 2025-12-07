
import React from 'react';
import { Team, Match } from '../types';
import { Calendar, Shield, Activity, Trophy, Clock } from 'lucide-react';
import { getNextMatchTime } from '../services/scheduler';

interface Props {
  team: Team;
  matches: Match[];
  teams: Team[];
  campaignStartTime: number;
}

const TeamStats: React.FC<Props> = ({ team, matches, teams, campaignStartTime }) => {
  const goalDiff = team.goalsFor - team.goalsAgainst;
  
  // Calculate Rank
  const sorted = [...teams].sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst));
  const rank = sorted.findIndex(t => t.id === team.id) + 1;

  // Calculate Clean Sheets
  let cleanSheets = 0;
  matches.forEach(m => {
      if(!m.played) return;
      if(m.homeTeamId === team.id && m.awayScore === 0) cleanSheets++;
      if(m.awayTeamId === team.id && m.homeScore === 0) cleanSheets++;
  });

  const totalYellow = team.players.reduce((sum, p) => sum + p.yellowCards, 0);
  const totalRed = team.players.reduce((sum, p) => sum + p.redCards, 0);

  // Filter My Matches
  const myMatches = matches.filter(m => m.homeTeamId === team.id || m.awayTeamId === team.id);
  const nextMatch = myMatches.find(m => !m.played);
  const nextMatchOpponentId = nextMatch ? (nextMatch.homeTeamId === team.id ? nextMatch.awayTeamId : nextMatch.homeTeamId) : null;
  const nextMatchOpponent = teams.find(t => t.id === nextMatchOpponentId);
  const nextMatchDate = nextMatch ? new Date(getNextMatchTime(campaignStartTime, nextMatch.week)) : null;

  return (
    <div className="space-y-8 mt-8">
       <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
           <Activity className="text-indigo-600" /> مركز بيانات الفريق
       </h2>

       {/* Top Stats Cards */}
       <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
           
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
               <div className="text-slate-400 text-xs font-bold mb-1">الترتيب</div>
               <div className="text-3xl font-black text-slate-800">{rank}</div>
               <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                   <Trophy size={10}/> في الدوري
               </div>
           </div>

           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
               <div className="text-slate-400 text-xs font-bold mb-1">النقاط</div>
               <div className="text-3xl font-black text-emerald-600">{team.points}</div>
               <div className="text-xs text-slate-400 mt-1">نقطة</div>
           </div>

           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
               <div className="text-slate-400 text-xs font-bold mb-1">الأهداف (له/عليه)</div>
               <div className="text-2xl font-black text-slate-800 flex gap-1">
                   <span className="text-emerald-600">{team.goalsFor}</span>
                   <span className="text-slate-300">/</span>
                   <span className="text-red-500">{team.goalsAgainst}</span>
               </div>
               <div className={`text-xs font-bold mt-1 ${goalDiff > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                   {goalDiff > 0 ? '+' : ''}{goalDiff}
               </div>
           </div>

           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
               <div className="text-slate-400 text-xs font-bold mb-1">شباك نظيفة</div>
               <div className="text-3xl font-black text-blue-600">{cleanSheets}</div>
               <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                   <Shield size={10}/> مباريات
               </div>
           </div>

           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
               <div className="text-slate-400 text-xs font-bold mb-1">الانضباط</div>
               <div className="flex gap-3 mt-1">
                   <div className="flex flex-col items-center">
                       <span className="text-xl font-black text-yellow-500">{totalYellow}</span>
                       <div className="w-3 h-4 bg-yellow-400 rounded-sm shadow-sm mt-1"></div>
                   </div>
                   <div className="w-px bg-slate-100"></div>
                   <div className="flex flex-col items-center">
                       <span className="text-xl font-black text-red-500">{totalRed}</span>
                       <div className="w-3 h-4 bg-red-500 rounded-sm shadow-sm mt-1"></div>
                   </div>
               </div>
           </div>
       </div>

       {/* Next Match Big Card */}
       {nextMatch && nextMatchOpponent && nextMatchDate && (
           <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                   <div className="flex flex-col items-center">
                        <div className={`w-20 h-20 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-slate-900 shadow-lg border-4 ${team.color.replace('bg-', 'border-')}`}>
                            {team.logoCode}
                        </div>
                        <span className="mt-2 font-bold text-lg">{team.name}</span>
                   </div>

                   <div className="text-center flex-1">
                       <div className="text-indigo-300 text-sm font-bold mb-1">الجولة {nextMatch.week}</div>
                       <div className="text-3xl font-black mb-2 font-mono">VS</div>
                       <div className="bg-white/10 px-4 py-2 rounded-lg inline-flex items-center gap-4 text-sm font-medium backdrop-blur-sm">
                           <span className="flex items-center gap-1"><Clock size={14} className="text-emerald-400"/> {nextMatchDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                           <span className="w-px h-4 bg-white/20"></span>
                           <span className="flex items-center gap-1"><Calendar size={14} className="text-emerald-400"/> {nextMatchDate.toLocaleDateString('en-GB')}</span>
                       </div>
                   </div>

                   <div className="flex flex-col items-center">
                        <div className={`w-20 h-20 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-slate-900 shadow-lg border-4 ${nextMatchOpponent.color.replace('bg-', 'border-')}`}>
                            {nextMatchOpponent.logoCode}
                        </div>
                        <span className="mt-2 font-bold text-lg">{nextMatchOpponent.name}</span>
                   </div>
               </div>
           </div>
       )}

       {/* Fixtures Table */}
       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-4 border-b bg-slate-50 font-bold text-slate-700 flex items-center gap-2">
               <Calendar size={18} /> جدول المباريات والنتائج
           </div>
           <div className="overflow-x-auto">
               <table className="w-full text-sm text-right">
                   <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
                       <tr>
                           <th className="px-4 py-3">الجولة</th>
                           <th className="px-4 py-3 text-center">التاريخ / الوقت</th>
                           <th className="px-4 py-3 text-center">المواجهة</th>
                           <th className="px-4 py-3 text-center">النتيجة</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                       {myMatches.map(m => {
                           const isHome = m.homeTeamId === team.id;
                           const oppId = isHome ? m.awayTeamId : m.homeTeamId;
                           const opp = teams.find(t => t.id === oppId);
                           const matchDate = new Date(getNextMatchTime(campaignStartTime, m.week));
                           
                           // Determine Result Color
                           let resultClass = 'bg-slate-100 text-slate-500';
                           if(m.played) {
                               const myScore = isHome ? m.homeScore! : m.awayScore!;
                               const oppScore = isHome ? m.awayScore! : m.homeScore!;
                               if(myScore > oppScore) resultClass = 'bg-emerald-100 text-emerald-700 font-bold';
                               else if(myScore === oppScore) resultClass = 'bg-yellow-100 text-yellow-700 font-bold';
                               else resultClass = 'bg-red-100 text-red-700 font-bold';
                           }

                           return (
                               <tr key={m.id} className="hover:bg-slate-50">
                                   <td className="px-4 py-3 font-medium text-slate-600">أسبوع {m.week}</td>
                                   <td className="px-4 py-3 text-center text-slate-500 dir-ltr">
                                       {matchDate.toLocaleDateString('en-GB')} <span className="text-xs text-slate-400 block">{matchDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                   </td>
                                   <td className="px-4 py-3 text-center">
                                       <div className="flex items-center justify-center gap-2">
                                           <span className={isHome ? 'font-bold text-slate-900' : 'text-slate-600'}>{isHome ? team.name : opp?.name}</span>
                                           <span className="text-xs text-slate-400">vs</span>
                                           <span className={!isHome ? 'font-bold text-slate-900' : 'text-slate-600'}>{!isHome ? team.name : opp?.name}</span>
                                       </div>
                                   </td>
                                   <td className="px-4 py-3 text-center">
                                       {m.played ? (
                                           <span className={`px-3 py-1 rounded text-xs ${resultClass}`}>
                                               {m.homeScore} - {m.awayScore}
                                           </span>
                                       ) : (
                                           <span className="text-slate-400 text-xs italic">-- : --</span>
                                       )}
                                   </td>
                               </tr>
                           )
                       })}
                   </tbody>
               </table>
           </div>
       </div>
    </div>
  );
};

export default TeamStats;
