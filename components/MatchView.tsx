

import React, { useState, useEffect, useRef } from 'react';
import { Team, Match, MatchEvent, Player, TacticStyle, AttackFocus, PassingStyle, WeatherType } from '../types';
import { generateMatchTimeline, MatchSimulationResult } from '../services/liveMatch';
import { autoFixLineup } from '../services/engine';
import { Play, Pause, FastForward, SkipForward, Clock, Shield, Activity, Flag, AlertTriangle, Settings, ArrowRightLeft, Target, CloudRain, Sun, CloudSnow, ThermometerSun } from 'lucide-react';

interface Props {
  userTeam: Team;
  opponent: Team;
  match: Match;
  onMatchComplete: (result: MatchSimulationResult) => void;
}

const MatchView: React.FC<Props> = ({ userTeam: initialUserTeam, opponent: initialOpponent, match, onMatchComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x, 2x, 5x
  const [currentMinute, setCurrentMinute] = useState(0);
  const [simulation, setSimulation] = useState<MatchSimulationResult | null>(null);
  
  // Real-time state derived from simulation
  const [currentHomeScore, setCurrentHomeScore] = useState(0);
  const [currentAwayScore, setCurrentAwayScore] = useState(0);
  const [logs, setLogs] = useState<MatchEvent[]>([]);

  // Fixed teams after auto-swap (Temporary for this match)
  const [fixedUserTeam, setFixedUserTeam] = useState<Team>(initialUserTeam);
  const [fixedOpponent, setFixedOpponent] = useState<Team>(initialOpponent);

  // Tactics Modal
  const [showTacticsModal, setShowTacticsModal] = useState(false);
  const [pendingStyle, setPendingStyle] = useState<TacticStyle>(initialUserTeam.tacticStyle);
  const [pendingFocus, setPendingFocus] = useState<AttackFocus>(initialUserTeam.attackFocus);
  const [pendingPassing, setPendingPassing] = useState<PassingStyle>(initialUserTeam.passingStyle);

  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Initialize Simulation once
  useEffect(() => {
    if (!simulation) {
        const fixedUser = autoFixLineup(initialUserTeam);
        const fixedOpp = autoFixLineup(initialOpponent);

        setFixedUserTeam(fixedUser);
        setFixedOpponent(fixedOpp);

        const isHome = match.homeTeamId === initialUserTeam.id;
        const homeTeam = isHome ? fixedUser : fixedOpp;
        const awayTeam = isHome ? fixedOpp : fixedUser;
        
        const result = generateMatchTimeline(homeTeam, awayTeam);
        setSimulation(result);
        
        // Initial Log
        setLogs([result.timeline[0]]);
    }
  }, [match, initialUserTeam, initialOpponent]);

  // 2. Game Loop
  useEffect(() => {
    let interval: any;

    if (isPlaying && currentMinute < 90) {
        const msPerMinute = 1000 / speed; // Base: 1 second per game minute

        interval = setInterval(() => {
            setCurrentMinute(prev => {
                const next = prev + 1;
                if (next > 90) {
                    setIsPlaying(false);
                    return 90;
                }
                return next;
            });
        }, msPerMinute);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentMinute, speed]);

  // 3. Process Events when minute changes
  useEffect(() => {
      if (!simulation || currentMinute === 0) return;

      const events = simulation.timeline.filter(e => e.minute === currentMinute);
      
      if (events.length > 0) {
          setLogs(prev => [...prev, ...events]);
          
          events.forEach(e => {
              if (e.type === 'GOAL') {
                  const isHomeGoal = e.teamId === match.homeTeamId;
                  if (isHomeGoal) setCurrentHomeScore(s => s + 1);
                  else setCurrentAwayScore(s => s + 1);
              }
          });
      }

      if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }

  }, [currentMinute, simulation]);

  const handleFinish = () => {
      if (simulation) {
          onMatchComplete(simulation);
      }
  };

  const handleApplyTactics = () => {
      if(!simulation) return;

      const updatedUserTeam = {
          ...fixedUserTeam,
          tacticStyle: pendingStyle,
          attackFocus: pendingFocus,
          passingStyle: pendingPassing
      };

      setFixedUserTeam(updatedUserTeam);
      
      const isHome = match.homeTeamId === fixedUserTeam.id;
      const homeTeam = isHome ? updatedUserTeam : fixedOpponent;
      const awayTeam = isHome ? fixedOpponent : updatedUserTeam;

      const remainingSimulation = generateMatchTimeline(
          homeTeam, 
          awayTeam, 
          currentMinute, 
          currentHomeScore,
          currentAwayScore
      );

      const pastEvents = simulation.timeline.filter(e => e.minute <= currentMinute);
      const newTimeline = [...pastEvents, ...remainingSimulation.timeline];
      
      const pastScorers = simulation.scorers.filter(s => s.time <= currentMinute);
      const newScorers = [...pastScorers, ...remainingSimulation.scorers];

      setSimulation({
          ...remainingSimulation,
          timeline: newTimeline,
          scorers: newScorers
      });

      setShowTacticsModal(false);
  };

  if (!simulation) return <div>جاري التجهيز...</div>;

  const isHomeUser = match.homeTeamId === fixedUserTeam.id;
  const homeTeam = isHomeUser ? fixedUserTeam : fixedOpponent;
  const awayTeam = isHomeUser ? fixedOpponent : fixedUserTeam;

  // Weather Icon
  const WeatherIcon = () => {
      switch(match.weather) {
          case 'RAIN': return <div className="flex items-center gap-1 text-blue-300"><CloudRain size={14}/> ممطر</div>;
          case 'SNOW': return <div className="flex items-center gap-1 text-slate-200"><CloudSnow size={14}/> ثلج</div>;
          case 'HEAT': return <div className="flex items-center gap-1 text-orange-400"><ThermometerSun size={14}/> حار</div>;
          default: return <div className="flex items-center gap-1 text-yellow-300"><Sun size={14}/> مشمس</div>;
      }
  }

  return (
    <div className="flex flex-col h-full space-y-4 relative">
       
       {/* Tactics Modal Overlay */}
       {showTacticsModal && (
           <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 rounded-3xl animate-in fade-in">
               <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl">
                   <div className="flex justify-between items-center mb-6 border-b pb-4">
                       <h3 className="text-xl font-bold flex items-center gap-2">
                           <Settings className="text-indigo-600" /> تغيير التكتيك
                       </h3>
                       <button onClick={() => setShowTacticsModal(false)} className="text-slate-400 hover:text-slate-600">إغلاق</button>
                   </div>
                   
                   <div className="space-y-6">
                       {/* Tactic Style */}
                       <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2">أسلوب اللعب</label>
                           <div className="grid grid-cols-3 gap-2">
                               {['Balanced', 'Attacking', 'Defensive', 'Possession', 'Counter Attack', 'High Press'].map(s => (
                                   <button 
                                      key={s}
                                      onClick={() => setPendingStyle(s as TacticStyle)}
                                      className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all
                                        ${pendingStyle === s ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105' : 'bg-slate-50 border-slate-200 text-slate-600'}
                                      `}
                                   >
                                       {s}
                                   </button>
                               ))}
                           </div>
                       </div>

                       {/* Attack Focus */}
                       <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Target size={16}/> التركيز الهجومي</label>
                           <div className="flex bg-slate-100 p-1 rounded-xl">
                               <button onClick={() => setPendingFocus('WINGS')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${pendingFocus === 'WINGS' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>أطراف</button>
                               <button onClick={() => setPendingFocus('MIXED')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${pendingFocus === 'MIXED' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>متنوع</button>
                               <button onClick={() => setPendingFocus('CENTER')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${pendingFocus === 'CENTER' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>عمق</button>
                           </div>
                       </div>

                       {/* Passing Style */}
                       <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><ArrowRightLeft size={16}/> نوع التمريرات</label>
                           <div className="flex bg-slate-100 p-1 rounded-xl">
                               <button onClick={() => setPendingPassing('SHORT')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${pendingPassing === 'SHORT' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>قصير</button>
                               <button onClick={() => setPendingPassing('MIXED')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${pendingPassing === 'MIXED' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>متنوع</button>
                               <button onClick={() => setPendingPassing('LONG')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${pendingPassing === 'LONG' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>طويل</button>
                           </div>
                       </div>
                   </div>

                   <button 
                       onClick={handleApplyTactics}
                       className="w-full mt-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                   >
                       تطبيق التغييرات (إعادة المحاكاة)
                   </button>
               </div>
           </div>
       )}

       {/* Scoreboard */}
       <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
           
           {/* Home */}
           <div className="flex flex-col items-center z-10 w-1/3">
               <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg mb-2 ${homeTeam.color} ring-4 ring-slate-800`}>
                   {homeTeam.logoCode}
               </div>
               <h2 className="font-bold text-lg">{homeTeam.name}</h2>
           </div>

           {/* Score & Time */}
           <div className="flex flex-col items-center z-10 w-1/3">
                <div className="bg-black/40 px-6 py-2 rounded-lg backdrop-blur-sm border border-white/10 mb-2">
                    <span className="text-4xl font-black font-mono tracking-widest">
                        {currentHomeScore} - {currentAwayScore}
                    </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold bg-white/10 px-3 py-1 rounded-full border border-white/10">
                    <div className="flex items-center gap-1 text-emerald-300 font-mono">
                        <Clock size={12} /> <span>{currentMinute}'</span>
                    </div>
                    <div className="w-px h-3 bg-white/20"></div>
                    <WeatherIcon />
                </div>
                {isPlaying && <div className="text-[10px] text-slate-400 animate-pulse mt-1">مباشر</div>}
           </div>

           {/* Away */}
           <div className="flex flex-col items-center z-10 w-1/3">
               <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg mb-2 ${awayTeam.color} ring-4 ring-slate-800`}>
                   {awayTeam.logoCode}
               </div>
               <h2 className="font-bold text-lg">{awayTeam.name}</h2>
           </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
           
           {/* Left: Pitch / Visuals */}
           <div className="lg:col-span-2 bg-emerald-600 rounded-2xl shadow-inner border-4 border-emerald-800 relative overflow-hidden flex items-center justify-center min-h-[400px]">
                {/* Field Markings */}
                <div className="absolute inset-4 border-2 border-white/60 rounded-sm"></div>
                <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/60 -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white/60 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                
                {/* Dynamic Event Visualizer */}
                <div className="relative z-10 text-center">
                    {logs.length > 0 && (
                        <div key={logs[logs.length-1].minute} className="animate-in zoom-in duration-300">
                             <div className={`px-6 py-3 rounded-full text-lg font-bold shadow-2xl backdrop-blur-md text-white
                                ${logs[logs.length-1].type === 'GOAL' ? 'bg-emerald-600/90' : 
                                  logs[logs.length-1].type === 'INJURY' ? 'bg-red-600/90' : 'bg-black/60'}
                             `}>
                                 {logs[logs.length-1].text}
                             </div>
                        </div>
                    )}
                </div>
           </div>

           {/* Right: Commentary & Controls */}
           <div className="flex flex-col gap-4">
               
               {/* Stats Box */}
               <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                   <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><Activity size={16}/> إحصائيات مباشرة</h3>
                   
                   <div className="space-y-3 text-xs">
                       <div>
                           <div className="flex justify-between mb-1">
                               <span>{homeTeam.name}</span>
                               <span className="font-bold text-slate-500">الاستحواذ</span>
                               <span>{awayTeam.name}</span>
                           </div>
                           <div className="flex h-2 rounded-full overflow-hidden bg-slate-100">
                               <div className="bg-indigo-500" style={{width: `${simulation.stats.homePossession}%`}}></div>
                               <div className="bg-red-500" style={{width: `${simulation.stats.awayPossession}%`}}></div>
                           </div>
                           <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                               <span>{simulation.stats.homePossession}%</span>
                               <span>{simulation.stats.awayPossession}%</span>
                           </div>
                       </div>
                   </div>
               </div>

               {/* Commentary Log */}
               <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-64 lg:h-auto">
                   <div className="p-3 bg-slate-50 border-b font-bold text-slate-700 text-sm">شريط الأحداث</div>
                   <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-slate-50/50">
                       {logs.map((log, idx) => (
                           <div key={idx} className={`text-xs p-2 rounded border ${
                               log.type === 'GOAL' ? 'bg-emerald-100 border-emerald-200 text-emerald-800 font-bold' :
                               log.type === 'YELLOW_CARD' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                               log.type === 'INJURY' ? 'bg-red-50 border-red-200 text-red-700 font-bold' :
                               'bg-white border-slate-100 text-slate-600'
                           }`}>
                               <span className="font-mono font-bold text-slate-400 ml-2">{log.minute}'</span>
                               {log.type === 'INJURY' && <AlertTriangle size={12} className="inline ml-1" />}
                               {log.text}
                           </div>
                       ))}
                   </div>
               </div>

               {/* Controls */}
               <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
                   <div className="flex items-center justify-between">
                       <div className="flex gap-2">
                           {!isPlaying && currentMinute < 90 && (
                               <button onClick={() => setIsPlaying(true)} className="p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 shadow-lg transition-transform hover:scale-105">
                                   <Play fill="currentColor" />
                               </button>
                           )}
                           {isPlaying && (
                               <button onClick={() => setIsPlaying(false)} className="p-3 bg-slate-200 text-slate-700 rounded-full hover:bg-slate-300">
                                   <Pause fill="currentColor" />
                               </button>
                           )}
                       </div>

                       <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                           {[1, 5, 20].map(s => (
                               <button 
                                 key={s}
                                 onClick={() => setSpeed(s)} 
                                 className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${speed === s ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}
                               >
                                 {s}x
                               </button>
                           ))}
                       </div>

                       {currentMinute >= 90 ? (
                           <button onClick={handleFinish} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 animate-pulse">
                               إنهاء
                           </button>
                       ) : (
                           <button onClick={() => { setCurrentMinute(90); setIsPlaying(false); }} className="p-2 text-slate-400 hover:text-slate-600" title="تخطي للنهاية">
                               <SkipForward size={20} />
                           </button>
                       )}
                   </div>

                   {currentMinute < 90 && (
                       <button 
                           onClick={() => { setIsPlaying(false); setShowTacticsModal(true); }}
                           className="w-full py-2 border-2 border-indigo-100 text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 flex items-center justify-center gap-2"
                       >
                           <Settings size={16} /> تغيير التكتيك
                       </button>
                   )}
               </div>
           </div>
       </div>
    </div>
  );
};

export default MatchView;
