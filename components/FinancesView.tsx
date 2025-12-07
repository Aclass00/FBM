
import React from 'react';
import { Team, Sponsor } from '../types';
import { calculateWeeklyFinances } from '../services/engine';
import { DollarSign, TrendingUp, TrendingDown, Handshake, CheckCircle, Receipt, Wallet, ArrowUpRight, ArrowDownRight, Building2, ShoppingBag, Utensils, Users, Target, Trophy, Lock, XCircle, AlertCircle, Ticket, UserCheck, Star, StarHalf, Banknote } from 'lucide-react';

interface Props {
  team: Team;
  availableSponsors: Sponsor[];
  onSignSponsor: (sponsor: Sponsor) => void;
}

const FinancesView: React.FC<Props> = ({ team, availableSponsors, onSignSponsor }) => {
  
  // By default, this calculates a projected "Home Match" financial report
  const finances = calculateWeeklyFinances(team);
  const { income, expenses, netProfit, meta } = finances;

  const BreakdownItem = ({ label, value, icon: Icon, colorClass, subText }: any) => (
    <div className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50 last:border-0">
       <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClass} bg-opacity-10`}>
             <Icon size={16} className={colorClass.replace('bg-', 'text-')} />
          </div>
          <div>
              <div className="text-sm font-medium text-slate-700">{label}</div>
              {subText && <div className="text-[10px] text-slate-400">{subText}</div>}
          </div>
       </div>
       <span className="font-bold text-slate-800">{value.toFixed(2)}M</span>
    </div>
  );

  const translateObjective = (obj: string) => {
      switch(obj) {
          case 'WIN_LEAGUE': return 'Win The League';
          case 'TOP_4': return 'Finish in Top 4';
          case 'TOP_8': return 'Top Half Finish';
          case 'AVOID_RELEGATION': return 'Avoid Relegation';
          default: return obj;
      }
  }

  // Determine Missing Requirements Count
  const countMissing = (team: Team, sponsor: Sponsor) => {
      let missing = 0;
      const f = team.facilities;
      const r = sponsor.requirements;
      if (f.stadium.seatsLevel < r.minSeatsLevel) missing++;
      if (f.stadium.parkingLevel < r.minParkingLevel) missing++;
      if (f.stadium.toiletsLevel < r.minToiletsLevel) missing++;
      if (f.store.shirtSalesLevel < r.minStoreLevel) missing++;
      if (f.hospitality.restaurantLevel < r.minHospitalityLevel) missing++;
      return missing;
  };

  const RequirementRow = ({ label, current, required }: { label: string, current: number, required: number }) => {
      const met = current >= required;
      return (
          <div className="flex justify-between items-center text-[10px] mb-1">
              <span className="text-slate-500">{label}</span>
              <div className="flex items-center gap-1">
                  <span className={`font-mono ${met ? 'text-emerald-600' : 'text-red-500'}`}>
                      {current}/{required}
                  </span>
                  {met ? <CheckCircle size={10} className="text-emerald-500"/> : <XCircle size={10} className="text-red-500"/>}
              </div>
          </div>
      );
  };

  // Logic to select 3 Display Sponsors
  const displaySponsors = React.useMemo(() => {
      const available = availableSponsors.filter(s => countMissing(team, s) === 0).sort((a,b) => b.weeklyIncome - a.weeklyIncome);
      const close = availableSponsors.filter(s => { const m = countMissing(team, s); return m > 0 && m <= 2; }).sort((a,b) => a.weeklyIncome - b.weeklyIncome); // Easiest of the hard ones
      const far = availableSponsors.filter(s => countMissing(team, s) > 2).sort((a,b) => a.weeklyIncome - b.weeklyIncome);

      const bestAvailable = available[0];
      const bestClose = close[0]; 
      const dream = far[0]; 

      // Fallbacks if lists empty
      const list = [];
      if (bestAvailable) list.push({...bestAvailable, status: 'AVAILABLE'});
      if (bestClose) list.push({...bestClose, status: 'CLOSE'});
      if (dream) list.push({...dream, status: 'LOCKED'});
      
      return list;
  }, [availableSponsors, team]);

  return (
    <div className="space-y-8">
      
      {/* Top Section: Main Budget */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
           
           <div className="relative z-10">
             <div className="flex items-center gap-3 mb-2 text-slate-300">
               <Wallet className="w-6 h-6" />
               <span className="text-lg font-medium">Club Coffers (Budget)</span>
             </div>
             <div className="text-5xl font-bold tracking-tight text-white flex items-baseline gap-2">
               {team.budget.toFixed(2)}
               <span className="text-2xl text-emerald-400">M</span>
             </div>
           </div>

           <div className="flex gap-4 relative z-10">
              <div className={`px-6 py-4 rounded-2xl border backdrop-blur-md flex flex-col items-center min-w-[140px]
                ${netProfit >= 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}
              `}>
                  <span className="text-xs text-slate-300 mb-1">Projected Net Income</span>
                  <div className={`text-2xl font-bold flex items-center gap-1 ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                     {netProfit >= 0 ? <ArrowUpRight size={20}/> : <ArrowDownRight size={20}/>}
                     {Math.abs(netProfit).toFixed(2)}M
                  </div>
              </div>
           </div>
      </div>

      {/* Ticket & Attendance Mini-Dashboard */}
      <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
             <div className="text-xs text-slate-400 font-bold mb-1 flex items-center gap-1"><Ticket size={12}/> Ticket Price</div>
             <div className="text-xl font-black text-indigo-600">${meta.ticketPrice}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
             <div className="text-xs text-slate-400 font-bold mb-1 flex items-center gap-1"><UserCheck size={12}/> Projected Attendance</div>
             <div className="text-xl font-black text-slate-800">{meta.attendance.toLocaleString()}</div>
             <div className="text-[10px] text-slate-400">out of {meta.capacity.toLocaleString()}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
             <div className="text-xs text-slate-400 font-bold mb-1 flex items-center gap-1"><Building2 size={12}/> Fill Rate</div>
             <div className="text-xl font-black text-emerald-600">{Math.round((meta.attendance / meta.capacity) * 100)}%</div>
          </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         
         {/* Income Column */}
         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="text-emerald-600" /> Income Sources (Projected)
                 </h3>
                 <span className="text-emerald-600 font-bold bg-emerald-100 px-3 py-1 rounded-full text-xs">
                    + {income.total.toFixed(2)}M
                 </span>
             </div>
             <div className="p-4">
                 <BreakdownItem label="Ticket Sales (Stadium)" subText="Only on home match days" value={income.stadium} icon={Building2} colorClass="bg-blue-500 text-blue-600" />
                 <BreakdownItem label="Merchandise Sales" value={income.store} icon={ShoppingBag} colorClass="bg-indigo-500 text-indigo-600" />
                 <BreakdownItem label="Hospitality" subText="Only on home match days" value={income.hospitality} icon={Utensils} colorClass="bg-amber-500 text-amber-600" />
                 <BreakdownItem label="Sponsorships" value={income.sponsor} icon={Handshake} colorClass="bg-purple-500 text-purple-600" />
                 
                 <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
                     <div className="text-xs font-bold text-slate-500 mb-2">Match Bonuses (not included in projection)</div>
                     <div className="flex justify-between items-center bg-slate-50 p-2 rounded text-xs">
                         <div className="flex items-center gap-2 text-emerald-600"><Banknote size={14}/> On Win</div>
                         <span className="font-bold text-slate-800">0.35M</span>
                     </div>
                     <div className="flex justify-between items-center bg-slate-50 p-2 rounded text-xs mt-1">
                         <div className="flex items-center gap-2 text-yellow-600"><Banknote size={14}/> On Draw</div>
                         <span className="font-bold text-slate-800">0.10M</span>
                     </div>
                 </div>
             </div>
         </div>

         {/* Expenses Column */}
         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-fit">
             <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <TrendingDown className="text-red-500" /> Weekly Expenses
                 </h3>
                 <span className="text-red-500 font-bold bg-red-100 px-3 py-1 rounded-full text-xs">
                    - {expenses.total.toFixed(2)}M
                 </span>
             </div>
             <div className="p-4">
                 <BreakdownItem label="Player Wages" value={expenses.wages} icon={Users} colorClass="bg-red-500 text-red-600" />
                 <BreakdownItem label="Facilities & Staff" value={expenses.maintenance} icon={Receipt} colorClass="bg-orange-500 text-orange-600" />
             </div>
         </div>

      </div>


      {/* Sponsors Section */}
      <div className="pt-4">
         <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <Handshake className="text-indigo-600" />
               {team.sponsor ? 'Current Sponsorship Deal' : 'Available Sponsorship Deals'}
            </h2>
            <div className="h-px bg-slate-200 flex-1"></div>
         </div>

         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {team.sponsor ? (
               <div className="p-8 flex flex-col items-center text-center bg-gradient-to-br from-indigo-50 via-white to-white relative">
                  <div className="absolute top-0 right-0 p-4">
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <CheckCircle size={14}/> Active Deal
                      </span>
                  </div>
                  
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-md mb-4 text-3xl font-bold text-indigo-600 border border-indigo-100">
                     {team.sponsor.name[0]}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-800 mb-1">{team.sponsor.name}</h3>
                  <p className="text-slate-500 text-sm mb-6 max-w-md">{team.sponsor.description}</p>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl">
                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-xs text-slate-400 mb-1">Weekly Income</div>
                        <div className="text-2xl font-bold text-emerald-600">{team.sponsor.weeklyIncome.toFixed(1)}M</div>
                     </div>
                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm opacity-70">
                        <div className="text-xs text-slate-400 mb-1">Signing Bonus</div>
                        <div className="text-xl font-bold text-slate-700">{team.sponsor.signingBonus.toFixed(1)}M</div>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-xl border border-indigo-100 shadow-sm ring-1 ring-indigo-50">
                        <div className="text-xs text-indigo-400 mb-1 font-bold flex items-center gap-1"><Target size={12}/> Season Objective</div>
                        <div className="text-sm font-bold text-indigo-800">{translateObjective(team.sponsor.objective)}</div>
                     </div>
                     <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 shadow-sm ring-1 ring-yellow-50">
                        <div className="text-xs text-yellow-600 mb-1 font-bold flex items-center gap-1"><Trophy size={12}/> Objective Bonus</div>
                        <div className="text-xl font-bold text-yellow-700">{team.sponsor.endSeasonBonus}M</div>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {displaySponsors.map(sponsor => {
                        const missing = countMissing(team, sponsor);
                        const isAvailable = sponsor.status === 'AVAILABLE';
                        const isClose = sponsor.status === 'CLOSE';
                        const isLocked = sponsor.status === 'LOCKED';

                        return (
                            <div key={sponsor.id} className={`p-6 rounded-2xl border-2 flex flex-col h-full transition-all ${
                                isAvailable ? 'border-emerald-200 bg-emerald-50' :
                                isClose ? 'border-yellow-200 bg-yellow-50' :
                                'border-slate-200 bg-slate-50 opacity-80'
                            }`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-lg">{sponsor.name}</h4>
                                        <p className="text-xs text-slate-500">{sponsor.description}</p>
                                    </div>
                                    {isAvailable && <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Available</span>}
                                    {isClose && <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Close ({missing} missing)</span>}
                                    {isLocked && <span className="text-xs font-bold bg-slate-200 text-slate-500 px-2 py-1 rounded flex items-center gap-1"><Lock size={12}/> Locked</span>}
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm my-4">
                                    <div className="bg-white p-2 rounded text-center border">
                                        <div className="text-[10px] text-slate-400">Weekly Income</div>
                                        <div className="font-bold text-emerald-600">{sponsor.weeklyIncome}M</div>
                                    </div>
                                    <div className="bg-white p-2 rounded text-center border">
                                        <div className="text-[10px] text-slate-400">Season Bonus</div>
                                        <div className="font-bold text-yellow-600">{sponsor.endSeasonBonus}M</div>
                                    </div>
                                </div>

                                <div className="bg-white p-3 rounded-lg border mb-4">
                                    <div className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1"><Target size={12}/> Season Objective</div>
                                    <div className="font-bold text-indigo-700 text-sm">{translateObjective(sponsor.objective)}</div>
                                </div>

                                {isClose && (
                                    <div className="bg-yellow-50 border-t border-yellow-200 -mx-6 px-6 pt-4 mt-auto">
                                        <h5 className="text-xs font-bold text-yellow-800 mb-2">Missing Requirements:</h5>
                                        <div className="space-y-1">
                                            {team.facilities.stadium.seatsLevel < sponsor.requirements.minSeatsLevel && <RequirementRow label="Seats Level" current={team.facilities.stadium.seatsLevel} required={sponsor.requirements.minSeatsLevel}/>}
                                            {team.facilities.stadium.parkingLevel < sponsor.requirements.minParkingLevel && <RequirementRow label="Parking Level" current={team.facilities.stadium.parkingLevel} required={sponsor.requirements.minParkingLevel}/>}
                                            {team.facilities.stadium.toiletsLevel < sponsor.requirements.minToiletsLevel && <RequirementRow label="Toilets Level" current={team.facilities.stadium.toiletsLevel} required={sponsor.requirements.minToiletsLevel}/>}
                                            {team.facilities.store.shirtSalesLevel < sponsor.requirements.minStoreLevel && <RequirementRow label="Store Level" current={team.facilities.store.shirtSalesLevel} required={sponsor.requirements.minStoreLevel}/>}
                                            {team.facilities.hospitality.restaurantLevel < sponsor.requirements.minHospitalityLevel && <RequirementRow label="Hospitality Level" current={team.facilities.hospitality.restaurantLevel} required={sponsor.requirements.minHospitalityLevel}/>}
                                        </div>
                                    </div>
                                )}
                                
                                {isLocked && (
                                     <div className="bg-slate-100 border-t border-slate-200 -mx-6 px-6 pt-4 mt-auto">
                                        <p className="text-xs text-slate-500 text-center">Your club reputation is not high enough for this sponsor yet.</p>
                                     </div>
                                )}

                                <div className="mt-auto">
                                    <button 
                                        onClick={() => onSignSponsor(sponsor)}
                                        disabled={!isAvailable}
                                        className={`w-full py-2 rounded-lg font-bold text-sm transition-colors shadow-sm
                                            ${isAvailable ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                                        `}
                                    >
                                        {isAvailable ? 'Sign Contract' : 'Unavailable'}
                                    </button>
                                </div>
                            </div>
                        );
                     })}
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default FinancesView;
