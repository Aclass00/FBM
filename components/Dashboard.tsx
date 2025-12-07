import React, { useState, useEffect } from 'react';
import { Team, Match, NewsItem, ViewState } from '../types';
import { formatTimeRemaining } from '../services/scheduler';
import { calculateWeeklyFinances } from '../services/engine';
import { TrendingUp, Clock, BellRing, Newspaper, DollarSign, Trophy, ArrowUpRight, ArrowDownRight, Activity, Building2, CheckCircle2, GraduationCap, Users, Ticket, ArrowRight, History, PlayCircle, Dumbbell, Zap, Briefcase } from 'lucide-react';

interface Props {
  myTeam: Team;
  nextMatch: Match | undefined;
  opponent: Team | undefined;
  leaguePosition: number;
  news: NewsItem[];
  lastMatchResult: Match | null | undefined;
  teams: Team[];
  nextMatchTime: number | null;
  onNavigate: (view: ViewState) => void;
}

const CountdownTimer = ({ targetTime }: { targetTime: number | null }) => {
  const [timeLeft, setTimeLeft] = useState("00:00:00");

  useEffect(() => {
    if (!targetTime) {
        setTimeLeft("00:00:00");
        return;
    }
    const update = () => setTimeLeft(formatTimeRemaining(targetTime));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  return <span className="font-mono tracking-widest">{timeLeft}</span>;
};

// Mini League Table Component
const MiniLeagueTable = ({ teams, myTeamId }: { teams: Team[], myTeamId: string }) => {
    const sorted = [...teams].sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst));
    const myIndex = sorted.findIndex(t => t.id === myTeamId);
    
    // Logic to show 5 rows centered on user if possible
    let start = Math.max(0, myIndex - 2);
    let end = Math.min(sorted.length, start + 5);
    
    if (end - start < 5) {
        start = Math.max(0, end - 5);
    }
    
    const slice = sorted.slice(start, end);

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-full">
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                <Trophy size={14} className="text-indigo-600"/>
                <span className="text-xs font-bold text-slate-700">League Standings</span>
            </div>
            <table className="w-full text-xs">
                <thead>
                    <tr className="text-slate-400 border-b border-slate-50">
                        <th className="py-2 px-2 text-left">#</th>
                        <th className="py-2 px-2 text-left">Club</th>
                        <th className="py-2 px-2 text-center">P</th>
                        <th className="py-2 px-2 text-center">Pts</th>
                    </tr>
                </thead>
                <tbody>
                    {slice.map((t, i) => (
                        <tr key={t.id} className={`${t.id === myTeamId ? 'bg-indigo-50 font-bold' : ''} border-b border-slate-50 last:border-0`}>
                            <td className="py-2 px-2 text-left text-slate-500 w-8">{start + i + 1}</td>
                            <td className="py-2 px-2">
                                <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded-full ${t.color} text-[6px] text-white flex items-center justify-center`}>{t.logoCode}</div>
                                    <span className="truncate max-w-[80px]">{t.name}</span>
                                </div>
                            </td>
                            <td className="py-2 px-2 text-center text-slate-500">{t.wins + t.draws + t.losses}</td>
                            <td className="py-2 px-2 text-center font-bold text-slate-800">{t.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Value Chart Component (SVG)
const ValueChart = ({ history }: { history: number[] }) => {
    if (history.length < 2) return <div className="h-24 flex items-center justify-center text-xs text-slate-400">Not enough data for chart</div>;

    const max = Math.max(...history) * 1.05;
    const min = Math.min(...history) * 0.95;
    const range = max - min;
    const width = 100;
    const height = 40;
    
    const points = history.map((val, i) => {
        const x = (i / (history.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    const trend = history[history.length - 1] - history[0];

    return (
        <div className="w-full mt-2">
            <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] text-slate-400">Market Value Growth</span>
                <span className={`text-[10px] font-bold flex items-center gap-0.5 ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {trend >= 0 ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
                    {Math.abs(trend).toFixed(1)}M
                </span>
            </div>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12 overflow-visible">
                <polyline 
                    fill="none" 
                    stroke={trend >= 0 ? '#10b981' : '#ef4444'} 
                    strokeWidth="2" 
                    points={points} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                {/* Dots */}
                {history.map((val, i) => {
                    const x = (i / (history.length - 1)) * width;
                    const y = height - ((val - min) / range) * height;
                    return <circle key={i} cx={x} cy={y} r="1.5" fill="white" stroke={trend >= 0 ? '#10b981' : '#ef4444'} strokeWidth="1" />
                })}
            </svg>
        </div>
    );
};

const Dashboard: React.FC<Props> = ({ myTeam, nextMatch, opponent, leaguePosition, news, lastMatchResult, teams, nextMatchTime, onNavigate }) => {
  const lastMatch = lastMatchResult;
  const totalValue = myTeam.players.reduce((a,b) => a + b.value, 0);
  const weeklyProfit = myTeam.weeklyIncome - myTeam.weeklyExpenses;
  const isProfit = weeklyProfit >= 0;

  // Calculates PROJECTED finances (assuming home game)
  const finances = calculateWeeklyFinances(myTeam);
  const { meta, netProfit: projectedProfit } = finances;
  const attendancePercent = Math.round((meta.attendance / meta.capacity) * 100);

  // Find opponent for last match
  const lastMatchOpponent = lastMatch 
     ? teams.find(t => t.id === (lastMatch.homeTeamId === myTeam.id ? lastMatch.awayTeamId : lastMatch.homeTeamId))
     : null;
     
  const lastMatchScoreUser = lastMatch ? (lastMatch.homeTeamId === myTeam.id ? lastMatch.homeScore! : lastMatch.awayScore!) : 0;
  const lastMatchScoreOpp = lastMatch ? (lastMatch.homeTeamId === myTeam.id ? lastMatch.awayScore! : lastMatch.homeScore!) : 0;
  const isWin = lastMatchScoreUser > lastMatchScoreOpp;
  const isDraw = lastMatchScoreUser === lastMatchScoreOpp;

  // Board Confidence
  const negativeSeasons = myTeam.consecutiveNegativeSeasons || 0;
  const maxSeasons = 3;
  const confidence = 100 - (negativeSeasons * 33);
  let confidenceColor = 'text-emerald-500';
  if (negativeSeasons === 1) confidenceColor = 'text-yellow-500';
  if (negativeSeasons === 2) confidenceColor = 'text-red-500';

  return (
    <div className="space-y-6">
      
      {/* Top Row: Split 50/50 roughly as requested "Parallel" */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* LEFT COLUMN: Team Info (Main Card) */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[420px]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500 opacity-10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl"></div>
          
          <div className="flex justify-between items-start relative z-10 mb-6">
            <div>
              <div className="text-slate-400 text-sm font-medium mb-1">Club</div>
              <h1 className="text-4xl font-bold mb-2 tracking-tight">{myTeam.name}</h1>
              <div className="text-indigo-200 text-sm">{myTeam.managerName}</div>
            </div>
            <div className={`w-24 h-24 rounded-full ${myTeam.color} flex items-center justify-center text-4xl font-bold shadow-2xl ring-4 ring-white/10`}>
              {myTeam.logoCode}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 relative z-10 mt-auto">
              <div className="bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="text-slate-400 text-xs mb-1 uppercase tracking-wider">Position</div>
                  <div className="text-4xl font-black text-emerald-400">{leaguePosition}</div>
                  <div className="text-[10px] text-emerald-200/50 mt-1">in the league</div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="text-slate-400 text-xs mb-1 uppercase tracking-wider">Points</div>
                  <div className="text-4xl font-black text-white">{myTeam.points}</div>
                  <div className="text-[10px] text-slate-400 mt-1">points</div>
              </div>
              <div className="col-span-2 bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                        <div className="text-slate-400 text-xs mb-1 uppercase tracking-wider">Market Value</div>
                        <div className="text-3xl font-black text-amber-400">{totalValue.toFixed(0)}M</div>
                    </div>
                    <div className="w-1/2">
                        <ValueChart history={myTeam.valueHistory || [totalValue]} />
                    </div>
                  </div>
              </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Matches & Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
             
             {/* 1. Next Match */}
             <div className="bg-indigo-600 rounded-2xl shadow-lg border border-indigo-500 p-5 text-white relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                
                <h3 className="relative z-10 text-xs font-bold text-indigo-200 mb-2 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Next Match
                </h3>
                
                {nextMatch && opponent ? (
                    <div className="relative z-10 text-center">
                        <div className="flex justify-between items-center text-sm font-bold px-2 mb-3">
                            <div className="flex flex-col items-center gap-1">
                                <div className={`w-8 h-8 rounded-full ${myTeam.color} flex items-center justify-center text-[10px] shadow-sm`}>{myTeam.logoCode}</div>
                                <span className="truncate max-w-[80px] text-xs">{myTeam.name}</span>
                            </div>
                            <span className="text-indigo-300 text-xs font-mono">VS</span>
                            <div className="flex flex-col items-center gap-1">
                                <div className={`w-8 h-8 rounded-full ${opponent.color} flex items-center justify-center text-[10px] shadow-sm`}>{opponent.logoCode}</div>
                                <span className="truncate max-w-[80px] text-xs">{opponent.name}</span>
                            </div>
                        </div>
                        <div className="text-2xl font-mono font-bold tracking-widest bg-black/20 rounded-lg py-2">
                            <CountdownTimer targetTime={nextMatchTime} />
                        </div>
                        <button onClick={() => onNavigate('match')} className="w-full mt-3 py-2 bg-white text-indigo-700 font-bold rounded-lg text-xs hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1">
                           <PlayCircle size={14}/> Go to Stadium
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-6 text-indigo-200 text-sm">No matches scheduled</div>
                )}
             </div>

             {/* 2. Board Confidence (Replaces Last Match for now or added) - Let's replace Last Match or Mini Table? 
                 Actually, let's put it in the "Last Match" slot if no match, OR replace Fanbase.
                 Let's keep Last Match, it's important. I'll replace Fanbase with Board Confidence or squeeze it in.
                 Let's Replace Fanbase for now as it's less critical than "Game Over" warning.
             */}
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-slate-800 text-sm">Board Confidence</h4>
                        <div className="text-[10px] text-slate-500 mt-1">Job Security</div>
                    </div>
                    <div className={`p-2 rounded-lg ${negativeSeasons > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      <Briefcase size={16} />
                    </div>
                </div>
                
                <div className="mt-3">
                    <div className="flex items-end gap-1 mb-1">
                        <span className={`text-2xl font-black ${confidenceColor}`}>{confidence}%</span>
                    </div>
                    
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ${negativeSeasons === 0 ? 'bg-emerald-500' : negativeSeasons === 1 ? 'bg-yellow-500' : 'bg-red-600'}`} style={{width: `${confidence}%`}}></div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] text-slate-400">Deficit Seasons: {negativeSeasons}/3</span>
                        {negativeSeasons > 0 && <span className="text-[9px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">SACK RISK!</span>}
                    </div>
                </div>
             </div>

             {/* 3. Last Match (Moved down) */}
             <div className={`rounded-2xl shadow-sm border p-5 flex flex-col relative overflow-hidden justify-between
                ${isWin ? 'bg-emerald-600 border-emerald-500 text-white' : 
                  isDraw ? 'bg-slate-600 border-slate-500 text-white' : 
                  'bg-red-600 border-red-500 text-white'}
             `}>
                 <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                 
                 <h3 className="relative z-10 text-xs font-bold text-white/70 mb-2 flex items-center gap-2">
                     <History size={12}/> Last Result
                 </h3>

                 {lastMatch && lastMatchOpponent ? (
                    <div className="relative z-10 text-center flex-1 flex flex-col justify-center">
                        <div className="flex justify-between items-center text-sm font-bold px-2 mb-2">
                            <div className="flex flex-col items-center gap-1">
                                <div className={`w-8 h-8 rounded-full ${myTeam.color} flex items-center justify-center text-[10px] shadow-sm ring-2 ring-white/20`}>{myTeam.logoCode}</div>
                                <span className="truncate max-w-[80px] text-xs">{myTeam.name}</span>
                            </div>
                            
                            <div className="bg-black/20 px-4 py-1 rounded-lg">
                                <span className="text-2xl font-black font-mono">
                                    {lastMatchScoreUser} - {lastMatchScoreOpp}
                                </span>
                            </div>

                            <div className="flex flex-col items-center gap-1">
                                <div className={`w-8 h-8 rounded-full ${lastMatchOpponent.color} flex items-center justify-center text-[10px] shadow-sm ring-2 ring-white/20`}>{lastMatchOpponent.logoCode}</div>
                                <span className="truncate max-w-[80px] text-xs">{lastMatchOpponent.name}</span>
                            </div>
                        </div>
                    </div>
                 ) : (
                    <div className="flex-1 flex items-center justify-center text-white/50 text-xs italic">No previous results</div>
                 )}
             </div>

             {/* 4. Mini Table */}
             <div className="row-span-1 md:row-span-1">
                 <MiniLeagueTable teams={teams} myTeamId={myTeam.id} />
             </div>
        </div>
      </div>

      {/* Middle Row: Club Status & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Status 1: Training */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between h-full relative group">
              <div className="flex items-start gap-3">
                  <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                      <Activity size={20} />
                  </div>
                  <div>
                      <h4 className="font-bold text-slate-800 text-sm">Training Status</h4>
                      <p className="text-xs text-slate-500 mt-1">The team is ready for the next match.</p>
                      <div className="mt-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit">
                          Full Fitness
                      </div>
                  </div>
              </div>
              <button 
                  onClick={() => onNavigate('training')}
                  className="mt-3 w-full py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100 hover:text-indigo-600 flex items-center justify-center gap-1 transition-colors"
              >
                  <Dumbbell size={14}/> Go to Training Center
              </button>
          </div>

          {/* Status 3: Academy */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-3">
              <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
                  <GraduationCap size={20} />
              </div>
              <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-sm">Academy</h4>
                  <p className="text-xs text-slate-500 mt-1">A new batch of talent is available.</p>
                  <button onClick={() => onNavigate('academy')} className="mt-2 text-[10px] font-bold text-white bg-amber-500 px-3 py-1 rounded hover:bg-amber-600 transition-colors w-full">
                      Scout Talent
                  </button>
              </div>
          </div>

          {/* Status 4: Finances Quick Look */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-3">
               <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                  <DollarSign size={20} />
              </div>
              <div className="w-full">
                  <h4 className="font-bold text-slate-800 text-sm">Financial Status</h4>
                  <div className="flex justify-between items-center mt-2 text-xs">
                      <span className="text-slate-500">Balance</span>
                      <span className="font-bold text-slate-800">{myTeam.budget.toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between items-center mt-1 text-xs">
                      <span className="text-slate-500">Est. (Home)</span>
                      <span className={`font-bold ${projectedProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {projectedProfit > 0 ? '+' : ''}{projectedProfit.toFixed(1)}M
                      </span>
                  </div>
                  <button onClick={() => onNavigate('finances')} className="mt-2 w-full py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded hover:bg-slate-100">
                      Details
                  </button>
              </div>
          </div>
          
          {/* News Ticker (Improved Design) */}
          <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 p-0 overflow-hidden relative flex flex-col h-full">
               <div className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 flex items-center gap-1 z-10 w-fit rounded-br-lg">
                  <Zap size={10} fill="currentColor" /> BREAKING
               </div>
               
               <div className="flex-1 flex items-center p-4">
                 {news.length > 0 ? (
                    <div className="w-full">
                         <div className="animate-in fade-in slide-in-from-bottom duration-500" key={news[news.length-1].id}>
                             <p className="text-white font-medium text-xs leading-relaxed line-clamp-3">
                                 {news[news.length-1].message}
                             </p>
                             <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
                                 <Clock size={10} /> Week {news[news.length-1].week}
                             </div>
                         </div>
                    </div>
                 ) : (
                    <div className="text-center w-full text-slate-500 text-xs">No breaking news</div>
                 )}
               </div>
               
               <div className="bg-slate-800 p-2 text-center text-[9px] text-slate-400">
                   Latest news and updates from the league
               </div>
          </div>

      </div>
    </div>
  );
};

export default Dashboard;