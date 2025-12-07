import React from 'react';
import { AlertOctagon, RefreshCcw } from 'lucide-react';

interface Props {
  onRestart: () => void;
}

const GameOverModal: React.FC<Props> = ({ onRestart }) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-500">
        <div className="w-full max-w-lg bg-slate-900 border border-red-900/50 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <AlertOctagon size={48} />
                </div>

                <h1 className="text-4xl font-black text-white mb-2">You Have Been Fired!</h1>
                <h2 className="text-xl font-bold text-red-500 mb-6">GAME OVER</h2>

                <p className="text-slate-400 mb-8 leading-relaxed">
                    The club's board has decided to terminate your contract due to
                    <strong className="text-white mx-1">financial bankruptcy</strong> 
                    and a continued budget deficit for 3 consecutive seasons.
                    <br/><br/>
                    The club has been liquidated, and all achievements and upgrades have been lost.
                </p>

                <button 
                    onClick={onRestart}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transition-all hover:scale-105"
                >
                    <RefreshCcw size={20} />
                    New Game (From Scratch)
                </button>
            </div>
        </div>
    </div>
  );
};

export default GameOverModal;