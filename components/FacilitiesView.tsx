

import React, { useState } from 'react';
import { Team } from '../types';
import { calculateWeeklyFinances } from '../services/engine';
import { Building, ShoppingBag, Utensils, TrendingUp, ArrowUpCircle, Coins, Lightbulb, UserCheck, Accessibility, Ticket, Shirt, Coffee, Truck, Users } from 'lucide-react';

interface Props {
  team: Team;
  onUpgradeFacility: (category: 'stadium' | 'store' | 'hospitality', subType: string, cost: number) => void;
}

const FacilitiesView: React.FC<Props> = ({ team, onUpgradeFacility }) => {
  const [activeTab, setActiveTab] = useState<'stadium' | 'store' | 'hospitality'>('stadium');
  const { facilities } = team;
  const { meta } = calculateWeeklyFinances(team);

  // Description shows what the NEXT level brings dynamically
  const getUpgradeBenefit = (type: string, currentLevel: number) => {
      const next = currentLevel + 1;
      
      // Explicitly showing the gain for the next level
      if(type === 'pitchLevel') {
          if(next <= 3) return "Next Level: Better turf reduces injuries by 5%";
          if(next <= 5) return "Next Level: Modern irrigation system reduces injuries by 10%";
          if(next <= 8) return "Next Level: Hybrid turf reduces injuries by 20%";
          return "Next Level: Best grass in the world (maximum protection)";
      }
      if(type === 'lightingLevel') {
          return `Next Level: Improved lighting increases TV broadcast income`;
      }
      if(type === 'seatsLevel') {
          return `Next Level: Add 8,000 new seats to the stadium (extra capacity)`;
      }
      if(type === 'parkingLevel') {
          return `Next Level: Expand parking to accommodate 6,000 more cars`;
      }
      if(type === 'shirtSalesLevel') {
          return `Next Level: More points of sale (income +${(next * 0.15).toFixed(2)}M)`;
      }
      if(type === 'souvenirsLevel') {
          return `Next Level: New products (income +${(next * 0.08).toFixed(2)}M)`;
      }
      if(type === 'restaurantLevel') {
          return `Next Level: Luxury menu (high hospitality income)`;
      }
      if(type === 'foodTrucksLevel') {
          return `Next Level: Additional trucks (match day income)`;
      }
      if(type === 'coffeeShopLevel') {
          return `Next Level: New coffee shop branches (continuous income)`;
      }
      if(type === 'toiletsLevel') {
        return `Next Level: Improved facilities increase fan satisfaction`;
      }

      return "The next level will add general improvements to increase facility efficiency.";
  };

  // Generic Sub-Upgrade Card
  const UpgradeCard = ({ title, level, subType, icon: Icon, benefit, baseCost, colorClass }: any) => {
    const cost = level * baseCost; // Base cost multiplier
    const canAfford = team.budget >= cost;
    const isMax = (subType === 'lightingLevel' && level >= 3) || level >= 10;
    
    // Maintenance Calc
    const currentMaint = (level * 0.05).toFixed(2);
    const nextMaint = ((level+1) * 0.05).toFixed(2);

    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
          <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass} bg-opacity-10 text-opacity-100`}>
                  <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
              </div>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded">Lv.{level}</span>
          </div>

          <h3 className="font-bold text-slate-800 mb-1">{title}</h3>
          
          {/* Dynamic description of NEXT level */}
          <p className="text-xs text-slate-500 mb-4 min-h-[40px] leading-snug">
              {isMax ? "Maximum development level reached." : getUpgradeBenefit(subType, level)}
          </p>
          
          <div className="bg-slate-50 p-2 rounded mb-3 text-[10px] text-slate-500">
             <div className="flex justify-between">
                 <span>Current Maint.:</span>
                 <span className="font-bold">{currentMaint}M</span>
             </div>
             {!isMax && (
                 <div className="flex justify-between text-orange-600">
                     <span>After Upgrade:</span>
                     <span className="font-bold">{nextMaint}M</span>
                 </div>
             )}
          </div>

          <div className="mt-auto space-y-3">
              <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1.5 rounded border border-emerald-100 flex items-center gap-1">
                  <TrendingUp size={12}/> {benefit}
              </div>

              <button
                  onClick={() => onUpgradeFacility(activeTab, subType, cost)}
                  disabled={!canAfford || isMax}
                  className={`w-full py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all
                  ${isMax 
                      ? 'bg-emerald-500 text-white cursor-default'
                      : canAfford 
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                  `}
              >
                  {isMax ? 'MAX' : (
                      <>
                        <ArrowUpCircle size={14} />
                        Upgrade ({cost}M)
                      </>
                  )}
              </button>
          </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                  <h1 className="text-3xl font-bold mb-2">Club Facilities</h1>
                  <p className="text-slate-300 max-w-xl text-sm">
                      Upgrade your facilities to increase income and reduce player injuries.
                  </p>
                  <div className="mt-4 flex items-center gap-4">
                      {/* Added Attendance to Header */}
                      <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10 flex items-center gap-2">
                          <Users size={16} className="text-emerald-400"/>
                          <span className="text-xs">Last Match Attendance:</span>
                          <span className="font-bold">{meta.attendance.toLocaleString()}</span>
                      </div>
                      <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10 flex items-center gap-2">
                          <Ticket size={16} className="text-emerald-400"/>
                          <span className="text-xs">Stadium Capacity:</span>
                          <span className="font-bold">{meta.capacity.toLocaleString()}</span>
                      </div>
                  </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Coins className="w-6 h-6 text-white" />
                  </div>
                  <div>
                      <div className="text-xs text-slate-300">Budget</div>
                      <div className="text-2xl font-bold">{team.budget.toFixed(1)}M</div>
                  </div>
              </div>
          </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('stadium')}
            className={`px-6 py-3 rounded-t-xl font-bold text-sm transition-all flex items-center gap-2
              ${activeTab === 'stadium' ? 'bg-white border-x border-t border-slate-200 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}
            `}
          >
            <Building size={16} /> Main Stadium
          </button>
          <button 
            onClick={() => setActiveTab('store')}
            className={`px-6 py-3 rounded-t-xl font-bold text-sm transition-all flex items-center gap-2
              ${activeTab === 'store' ? 'bg-white border-x border-t border-slate-200 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}
            `}
          >
            <ShoppingBag size={16} /> Club Store
          </button>
          <button 
            onClick={() => setActiveTab('hospitality')}
            className={`px-6 py-3 rounded-t-xl font-bold text-sm transition-all flex items-center gap-2
              ${activeTab === 'hospitality' ? 'bg-white border-x border-t border-slate-200 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}
            `}
          >
            <Utensils size={16} /> Hospitality
          </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-b-xl rounded-tr-xl border border-t-0 border-slate-200 p-6 shadow-sm min-h-[400px]">
          
          {activeTab === 'stadium' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <UpgradeCard 
                      title="Seats & Stands" level={facilities.stadium.seatsLevel} subType="seatsLevel" baseCost={5}
                      icon={Ticket} colorClass="bg-blue-500"
                      benefit="+ Major ticket income boost"
                  />
                  <UpgradeCard 
                      title="Pitch Quality" level={facilities.stadium.pitchLevel} subType="pitchLevel" baseCost={4}
                      icon={Accessibility} colorClass="bg-emerald-500"
                      benefit="- Player injury rate"
                  />
                  <UpgradeCard 
                      title="Floodlights" level={facilities.stadium.lightingLevel} subType="lightingLevel" baseCost={3}
                      icon={Lightbulb} colorClass="bg-yellow-500"
                      benefit="+ TV broadcast revenue"
                  />
                  <UpgradeCard 
                      title="Parking & Access" level={facilities.stadium.parkingLevel} subType="parkingLevel" baseCost={2}
                      icon={Truck} colorClass="bg-slate-500"
                      benefit="+ Fan attendance (slight)"
                  />
                  <UpgradeCard 
                      title="Public Toilets" level={facilities.stadium.toiletsLevel} subType="toiletsLevel" baseCost={1}
                      icon={UserCheck} colorClass="bg-cyan-500"
                      benefit="+ Fan satisfaction (stabilizes income)"
                  />
              </div>
          )}

          {activeTab === 'store' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <UpgradeCard 
                      title="Official Shirt Sales" level={facilities.store.shirtSalesLevel} subType="shirtSalesLevel" baseCost={3}
                      icon={Shirt} colorClass="bg-indigo-500"
                      benefit="+ High income from sales"
                  />
                  <UpgradeCard 
                      title="Souvenirs & Gifts" level={facilities.store.souvenirsLevel} subType="souvenirsLevel" baseCost={2}
                      icon={ShoppingBag} colorClass="bg-pink-500"
                      benefit="+ Medium continuous income"
                  />
              </div>
          )}

          {activeTab === 'hospitality' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <UpgradeCard 
                      title="Main Restaurant" level={facilities.hospitality.restaurantLevel} subType="restaurantLevel" baseCost={4}
                      icon={Utensils} colorClass="bg-orange-500"
                      benefit="+ High hospitality income (VIP)"
                  />
                  <UpgradeCard 
                      title="Food Trucks" level={facilities.hospitality.foodTrucksLevel} subType="foodTrucksLevel" baseCost={2}
                      icon={Truck} colorClass="bg-red-500"
                      benefit="+ Quick match day income"
                  />
                  <UpgradeCard 
                      title="Coffee Shop" level={facilities.hospitality.coffeeShopLevel} subType="coffeeShopLevel" baseCost={1.5}
                      icon={Coffee} colorClass="bg-amber-700"
                      benefit="+ Small additional income"
                  />
              </div>
          )}

      </div>
    </div>
  );
};

export default FacilitiesView;