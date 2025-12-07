import React from 'react';
import { LayoutDashboard, Users, Trophy, CalendarDays, GraduationCap, Building2, Briefcase, Dumbbell, Activity, Coins, Settings, PlayCircle } from 'lucide-react';
import { ViewState } from '../types.ts';

interface Props {
  view: ViewState;
  setView: (v: ViewState) => void;
  teamName: string;
  teamLogo: string;
  teamColor: string;
  managerName?: string;
  customLogoUrl?: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<Props> = ({ view, setView, teamName, teamLogo, teamColor, managerName, customLogoUrl, isOpen, setIsOpen }) => {
  
  const NavItem = ({ id, label, icon: Icon }: { id: ViewState, label: string, icon: any }) => (
    <button
      onClick={() => {
        setView(id);
        setIsOpen(false); // Close sidebar on mobile after navigation
      }}
      className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-200 border-l-4
        ${view === id 
          ? 'bg-slate-800 text-white border-indigo-500' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-transparent'}
      `}
    >
      <Icon className={`w-5 h-5 ${view === id ? 'text-indigo-400' : ''}`} />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`w-64 bg-slate-900 h-screen flex flex-col shadow-xl z-40 transition-transform duration-300 ease-in-out fixed lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand / Team Info */}
        <div className="p-8 pb-4 border-b border-slate-800">
          <div className={`w-16 h-16 rounded-full ${teamColor} text-white flex items-center justify-center text-xl font-bold shadow-lg mb-4 mx-auto ring-4 ring-slate-800 overflow-hidden`}>
            {customLogoUrl ? (
               <img src={customLogoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
               teamLogo
            )}
          </div>
          <h1 className="text-white text-center font-bold text-lg truncate">{teamName}</h1>
          <div className="text-slate-500 text-center text-xs mt-1">{managerName || 'Team Manager'}</div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <NavItem id="dashboard" label="Overview" icon={LayoutDashboard} />
          <NavItem id="squad" label="Squad" icon={Users} />
          <NavItem id="tactics" label="Tactics" icon={Activity} />
          <NavItem id="training" label="Training Center" icon={Dumbbell} />
          <NavItem id="fixtures" label="Fixtures" icon={CalendarDays} />
          <NavItem id="match" label="Match Day" icon={PlayCircle} />
          
          <NavItem id="league" label="League Table" icon={Trophy} />
          <NavItem id="academy" label="Academy" icon={GraduationCap} />
          <NavItem id="transfers" label="Transfer Market" icon={Briefcase} />
          <NavItem id="facilities" label="Facilities" icon={Building2} />
          <NavItem id="finances" label="Finances" icon={Coins} />
          <NavItem id="options" label="Options" icon={Settings} />
        </nav>

        {/* Footer */}
        <div className="p-6 text-center text-slate-600 text-xs border-t border-slate-800">
          Football Manager Sim v2.0
        </div>
      </aside>
    </>
  );
};

export default Sidebar;