import React, { useState, useEffect } from 'react';
import { ViewState } from './types.ts';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import SquadView from './components/SquadView.tsx';
import LeagueTable from './components/LeagueTable.tsx';
import TacticsView from './components/TacticsView.tsx';
import TrainingView from './components/TrainingView.tsx';
import TransferMarket from './components/TransferMarket.tsx';
import FacilitiesView from './components/FacilitiesView.tsx';
import FinancesView from './components/FinancesView.tsx';
import AcademyView from './components/AcademyView.tsx';
import TeamStats from './components/TeamStats.tsx';
import MatchView from './components/MatchView.tsx';
import OptionsView from './components/OptionsView.tsx';
import TeamDetailView from './components/TeamDetailView.tsx';
import Onboarding from './components/Onboarding.tsx';
import AuthScreen from './components/AuthScreen.tsx';
import ScenarioModal from './components/ScenarioModal.tsx';
import GameOverModal from './components/GameOverModal.tsx';
import { useGameEngine } from './hooks/useGameEngine.ts';
import { useAuth, ADMIN_EMAIL } from './hooks/useAuth.ts';
import { getNextMatchTime } from './services/scheduler.ts';
import { Zap, Play, Gamepad2, RefreshCw, Menu } from 'lucide-react';
import { ToastProvider, useToast } from './components/ToastSystem.tsx';

// Internal App Component
const GameApp: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar state for mobile
  const { addToast } = useToast();

  // 1. Auth Hook
  const { user, authLoading, login, register, logout, devLogin, requestDeleteAccount, cancelDeleteAccount, updatePassword } = useAuth({ addToast });

  // 2. Game Engine Hook
  const engine = useGameEngine(addToast);

  // --- DEVELOPER MODE AUTO-INIT ---
  useEffect(() => {
      // Check if the logged-in user is the Admin/Developer
      if (user?.email === ADMIN_EMAIL) {
          // Enable God Mode automatically
          if (!engine.isGodMode) {
              engine.setIsGodMode(true);
              addToast("Welcome, Developer! God Mode has been enabled.", "success");
          }

          // If no save exists, create one automatically
          if (!engine.hasSave) {
              engine.initializeNewGame({
                  managerName: 'Developer',
                  teamName: 'Dev FC',
                  color: 'bg-slate-900',
                  leagueType: 'SAUDI' // This can be changed to any default league
              });
          }
      }
  }, [user, engine.hasSave, engine.isGodMode]);

  // --- GAME OVER LISTENER ---
  useEffect(() => {
      const handleGameOver = () => setIsGameOver(true);
      window.addEventListener('GAME_OVER', handleGameOver);
      return () => window.removeEventListener('GAME_OVER', handleGameOver);
  }, []);

  const handleRestart = () => {
      setIsGameOver(false);
      engine.handleResetGame();
  };

  // --- RENDERING LOGIC ---

  if (authLoading) {
      return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
  }

  // A. Not Logged In -> Show Auth Screen
  if (!user) {
      return <AuthScreen onLogin={login} onRegister={register} onDevLogin={devLogin} />;
  }

  // B. Logged In BUT No Game Save -> Show Onboarding
  if (!engine.hasSave) {
      return <Onboarding onComplete={engine.initializeNewGame} />;
  }

  // C. Logged In AND Game Exists -> Show Game Dashboard
  const {
      isLoaded, teams, matches, news, currentWeek, userTeam, userTeamId,
      availableSponsors, availableScouts, campaignStartTime, isGodMode, setIsGodMode,
      handleForcePlay, handleMatchComplete, handleResetGame, handleUpdateLineup,
      handleUpdateTactics, handleSetDrill, handleUnlockDrill, handleUpgradeFacility,
      handleBuyPlayer, handleSignSponsor, handlePromotePlayer, handleHireScout,
      handleFireScout, handleAssignScout, handleSpawnYouth, handleUpdateTeamInfo,
      handleUpdateSetPieceTakers, theme, toggleTheme,
      activeScenario, handleScenarioDecision, handleCloseScenario
  } = engine;

  if (!isLoaded) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Data...</div>;
  if (!userTeam) return <div className="min-h-screen flex items-center justify-center">Error loading team</div>;

  const nextMatch = matches.find(m => (m.homeTeamId === userTeamId || m.awayTeamId === userTeamId) && !m.played);
  const opponent = nextMatch ? teams.find(t => t.id === (nextMatch.homeTeamId === userTeamId ? nextMatch.awayTeamId : nextMatch.homeTeamId)) : undefined;
  const lastMatch = matches.slice().reverse().find(m => (m.homeTeamId === userTeamId || m.awayTeamId === userTeamId) && m.played);
  const position = [...teams].sort((a, b) => b.points - a.points).findIndex(t => t.id === userTeamId) + 1;
  const nextMatchTime = getNextMatchTime(campaignStartTime, currentWeek + 1);
  const isDark = theme === 'dark';

  const handleViewTeam = (teamId: string) => {
      setSelectedTeamId(teamId);
      setView('team_detail');
  };

  return (
    <div className={`flex h-screen bg-slate-100 font-sans transition-colors duration-200 ${isDark ? 'dark bg-slate-900' : ''}`}>
      
      {/* Game Over Modal */}
      {isGameOver && <GameOverModal onRestart={handleRestart} />}

      <Sidebar 
        view={view} 
        setView={setView} 
        teamName={userTeam.name} 
        teamLogo={userTeam.logoCode}
        teamColor={userTeam.color}
        managerName={userTeam.managerName}
        customLogoUrl={userTeam.customLogoUrl}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 relative">
        
        {/* Scenario Modal */}
        {activeScenario && !isGameOver && (
            <ScenarioModal 
                scenario={activeScenario}
                onDecision={handleScenarioDecision}
                onClose={handleCloseScenario}
            />
        )}

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-2">
               <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 lg:hidden">
                   <Menu size={24} />
               </button>
               <h1 className="text-xl sm:text-2xl font-bold text-slate-800 hidden sm:block dark:text-white">Dashboard</h1>
           </div>
           <div className="flex items-center gap-3">
              {isGodMode && (
                <div className="hidden sm:flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-lg border border-yellow-200 animate-pulse">
                   <Zap size={16} fill="currentColor" />
                   <span className="text-xs font-bold">Dev Mode Active</span>
                </div>
              )}
              {isGodMode && nextMatch && (
                  <button onClick={handleForcePlay} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2">
                    <Play size={16} fill="currentColor" /> <span className="hidden sm:inline">Simulate</span>
                  </button>
              )}
              {isGodMode && (
                  <button onClick={() => window.location.reload()} className="p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shadow-sm transition-colors" title="Reload Page">
                     <RefreshCw size={20} />
                  </button>
              )}
              {/* Only show God Mode toggle if user is ADMIN */}
              {user.email === ADMIN_EMAIL && (
                  <button onClick={() => setIsGodMode(!isGodMode)} className={`p-2 rounded-lg transition-colors ${isGodMode ? 'bg-slate-800 text-yellow-400' : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shadow-sm'}`}>
                     <Zap size={20} />
                  </button>
              )}
           </div>
        </div>

        {view === 'dashboard' && <Dashboard myTeam={userTeam} nextMatch={nextMatch} opponent={opponent} leaguePosition={position} news={news} lastMatchResult={lastMatch} teams={teams} nextMatchTime={nextMatchTime} onNavigate={setView} />}
        {view === 'squad' && <SquadView players={userTeam.players} teamName={userTeam.name} onSetDrill={handleSetDrill} userTeamId={userTeamId} />}
        {view === 'league' && <div className="space-y-6"><LeagueTable teams={teams} onTeamClick={handleViewTeam} /></div>}
        {view === 'team_detail' && selectedTeamId && <TeamDetailView team={teams.find(t => t.id === selectedTeamId) || userTeam} allTeams={teams} matches={matches} onBack={() => setView('league')} onBuyPlayer={handleBuyPlayer} userBudget={userTeam.budget} userTeamId={userTeamId} />}
        {view === 'tactics' && <TacticsView players={userTeam.players} lineup={userTeam.lineup} formation={userTeam.formation} tacticStyle={userTeam.tacticStyle} attackFocus={userTeam.attackFocus} passingStyle={userTeam.passingStyle} onUpdateTactics={handleUpdateTactics} onUpdateLineup={handleUpdateLineup} teamName={userTeam.name} setPieceTakers={userTeam.setPieceTakers} onUpdateSetPieceTakers={handleUpdateSetPieceTakers} />}
        {view === 'training' && <TrainingView team={userTeam} onUpgradeFacility={() => handleUpgradeFacility('academy', undefined, 10 * userTeam.facilities.academyLevel)} onSetDrill={handleSetDrill} onUnlockDrill={handleUnlockDrill} />}
        {view === 'transfers' && <TransferMarket teams={teams} userTeamId={userTeamId} onBuyPlayer={handleBuyPlayer} userBudget={userTeam.budget} />}
        {view === 'facilities' && <FacilitiesView team={userTeam} onUpgradeFacility={handleUpgradeFacility} />}
        {view === 'finances' && <FinancesView team={userTeam} availableSponsors={availableSponsors} onSignSponsor={handleSignSponsor} />}
        {view === 'academy' && <AcademyView youthPlayers={userTeam.youthPlayers} onPromote={handlePromotePlayer} onScout={handleAssignScout} onHireScout={handleHireScout} onFireScout={handleFireScout} onSpawn={handleSpawnYouth} canSpawn={userTeam.lastAcademySpawnWeek < currentWeek} availableScouts={availableScouts} myScouts={userTeam.scouts} teamName={userTeam.name} academyLevel={userTeam.facilities.academyLevel} scoutingLevel={userTeam.facilities.scoutingNetworkLevel} onUpgrade={handleUpgradeFacility} onSetDrill={handleSetDrill} userTeamId={userTeamId} />}
        {view === 'fixtures' && <div className="space-y-6"><TeamStats team={userTeam} matches={matches} teams={teams} campaignStartTime={campaignStartTime} /></div>}
        {view === 'match' && (
            <>
            {nextMatch && opponent ? (
                <MatchView userTeam={userTeam} opponent={opponent} match={nextMatch} onMatchComplete={(result) => { handleMatchComplete(nextMatch.id, result); setView('dashboard'); }} />
            ) : (
                <div className="flex flex-col items-center justify-center h-[400px] bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                    <Gamepad2 className="w-16 h-16 text-slate-300 mb-4" />
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">No remaining matches</h2>
                </div>
            )}
            </>
        )}
        {view === 'options' && (
            <OptionsView 
               team={userTeam}
               user={user}
               onUpdateTeamInfo={handleUpdateTeamInfo}
               onReset={handleResetGame}
               isDark={isDark}
               onToggleTheme={toggleTheme}
               onDeleteAccount={requestDeleteAccount}
               onCancelDelete={cancelDeleteAccount}
               onUpdatePassword={updatePassword}
            />
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
    return (
        <ToastProvider>
            <GameApp />
        </ToastProvider>
    );
};

export default App;