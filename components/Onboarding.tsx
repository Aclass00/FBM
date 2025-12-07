import React, { useState } from 'react';
import { User, Shield, CheckCircle2, Trophy, Globe } from 'lucide-react';
import { LeagueType } from '../types.ts';

interface Props {
  onComplete: (details: { managerName: string; teamName: string; color: string; leagueType: LeagueType }) => void;
}

const COLORS = [
  'bg-red-500', 'bg-blue-600', 'bg-green-600', 'bg-yellow-500', 
  'bg-purple-600', 'bg-indigo-600', 'bg-orange-500', 'bg-teal-600',
  'bg-cyan-600', 'bg-rose-600', 'bg-sky-500', 'bg-emerald-500',
  'bg-violet-600', 'bg-fuchsia-600', 'bg-lime-600', 'bg-amber-600'
];

const LEAGUES: {id: LeagueType, name: string, flag: string}[] = [
    { id: 'SAUDI', name: 'Saudi League', flag: '🇸🇦' },
    { id: 'ENGLISH', name: 'English League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 'SPANISH', name: 'Spanish League', flag: '🇪🇸' },
    { id: 'GENERIC', name: 'Virtual League', flag: '🌍' },
];

const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [managerName, setManagerName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[1]); 
  const [selectedLeague, setSelectedLeague] = useState<LeagueType>('SAUDI');

  const handleNext = () => {
    if (step === 1 && managerName.trim()) setStep(2);
    else if (step === 2 && teamName.trim()) setStep(3);
    else if (step === 3) setStep(4);
  };

  const handleFinish = () => {
    onComplete({ managerName, teamName, color: selectedColor, leagueType: selectedLeague });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://images.unsplash.com/photo-1522778119026-d647f0565c6a?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600 blur-[120px] opacity-20 rounded-full"></div>

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden">
        <div className="h-2 bg-slate-100 flex">
           <div className={`h-full bg-indigo-600 transition-all duration-500`} style={{width: `${(step/4)*100}%`}}></div>
        </div>

        <div className="p-8">
           
           {/* Step 1: Manager Name */}
           {step === 1 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                <div className="text-center">
                   <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                     <User size={32} />
                   </div>
                   <h1 className="text-2xl font-bold text-slate-800">Manager Details</h1>
                   <p className="text-slate-500 mt-2">What name will the fans be chanting?</p>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Manager Name</label>
                  <input 
                    type="text" 
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="e.g., José Mourinho"
                    className="w-full p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-lg text-center font-bold"
                    autoFocus
                  />
                </div>

                <button onClick={handleNext} disabled={!managerName.trim()} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  Next
                </button>
             </div>
           )}

           {/* Step 2: Team Name */}
           {step === 2 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                <div className="text-center">
                   <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Shield size={32} />
                   </div>
                   <h1 className="text-2xl font-bold text-slate-800">Club Foundation</h1>
                   <p className="text-slate-500 mt-2">Choose a name for your own team.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Team Name</label>
                  <input 
                    type="text" 
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g., Kingdom Falcons"
                    className="w-full p-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-lg text-center font-bold"
                    autoFocus
                  />
                </div>

                <button onClick={handleNext} disabled={!teamName.trim()} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  Next
                </button>
             </div>
           )}

           {/* Step 3: League Selection */}
           {step === 3 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                <div className="text-center">
                   <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Globe size={32} />
                   </div>
                   <h1 className="text-2xl font-bold text-slate-800">Choose Competition</h1>
                   <p className="text-slate-500 mt-2">In which league do you want to start your journey?</p>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                    {LEAGUES.map(league => (
                        <button 
                            key={league.id}
                            onClick={() => setSelectedLeague(league.id)}
                            className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all
                                ${selectedLeague === league.id 
                                    ? 'border-blue-600 bg-blue-50 shadow-md' 
                                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}
                            `}
                        >
                            <span className="font-bold text-slate-800">{league.name}</span>
                            <span className="text-2xl">{league.flag}</span>
                        </button>
                    ))}
                </div>

                <button onClick={handleNext} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all mt-2">
                  Next
                </button>
             </div>
           )}

           {/* Step 4: Colors & Finish */}
           {step === 4 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                <div className="text-center">
                   <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Trophy size={32} />
                   </div>
                   <h1 className="text-2xl font-bold text-slate-800">Team Colors</h1>
                   <p className="text-slate-500 mt-2">The color that will represent you on the pitch.</p>
                </div>

                <div className="flex justify-center mb-4">
                   <div className={`w-24 h-24 rounded-2xl ${selectedColor} flex items-center justify-center shadow-xl ring-4 ring-offset-2 ring-slate-100 transition-colors duration-300`}>
                      <span className="text-white font-bold text-3xl">
                        {teamName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                   </div>
                </div>
                
                <div className="grid grid-cols-4 gap-3">
                   {COLORS.map(color => (
                     <button
                       key={color}
                       onClick={() => setSelectedColor(color)}
                       className={`w-full aspect-square rounded-lg ${color} hover:scale-110 transition-transform ${selectedColor === color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110 shadow-lg' : ''}`}
                     />
                   ))}
                </div>

                <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-500 mt-4 text-center">
                    Your team will be created with level 1 facilities to ensure fair competition.
                </div>

                <button 
                  onClick={handleFinish}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <CheckCircle2 />
                  Start Season
                </button>
             </div>
           )}

        </div>
      </div>
    </div>
  );
};

export default Onboarding;