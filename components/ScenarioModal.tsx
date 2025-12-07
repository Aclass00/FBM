import React, { useState } from 'react';
import { Scenario, ScenarioResult } from '../types.ts';
import { AlertTriangle, CheckCircle2, XCircle, ShieldAlert, ArrowRight } from 'lucide-react';

interface Props {
  scenario: Scenario;
  onDecision: (optionId: string) => Promise<ScenarioResult>;
  onClose: () => void; // Called after result is shown
}

const ScenarioModal: React.FC<Props> = ({ scenario, onDecision, onClose }) => {
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOptionClick = async (optionId: string) => {
    setLoading(true);
    const res = await onDecision(optionId);
    setResult(res);
    setLoading(false);
  };

  const getRiskColor = (risk: string) => {
      switch(risk) {
          case 'LOW': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
          case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
          case 'HIGH': return 'bg-red-100 text-red-700 border-red-200';
          default: return 'bg-slate-100 text-slate-700';
      }
  };

  const getRiskLabel = (risk: string) => {
      switch(risk) {
          case 'LOW': return 'Low Risk';
          case 'MEDIUM': return 'Medium Risk';
          case 'HIGH': return 'High Risk';
          default: return '';
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 relative">
            
            {/* Header */}
            <div className="bg-slate-900 p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 flex items-center gap-3 mb-2">
                    <ShieldAlert className="text-yellow-400" />
                    <span className="text-xs font-bold text-yellow-400 tracking-wider uppercase">Managerial Decision Required</span>
                </div>
                <h2 className="text-2xl font-bold relative z-10">{scenario.title}</h2>
            </div>

            {/* Body */}
            <div className="p-6">
                {!result ? (
                    <>
                        <p className="text-slate-600 text-lg leading-relaxed mb-8">
                            {scenario.description}
                        </p>

                        <div className="space-y-3">
                            {scenario.options.map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => handleOptionClick(option.id)}
                                    disabled={loading}
                                    className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group relative overflow-hidden"
                                >
                                    <div className="flex justify-between items-start mb-1 relative z-10">
                                        <span className="font-bold text-slate-800 text-lg group-hover:text-indigo-700 transition-colors">{option.label}</span>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getRiskColor(option.riskLevel)}`}>
                                            {getRiskLabel(option.riskLevel)}
                                        </span>
                                    </div>
                                    {option.description && (
                                        <p className="text-sm text-slate-500 relative z-10">{option.description}</p>
                                    )}
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-4 animate-in zoom-in duration-300">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 
                            ${result.success ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}
                        `}>
                            {result.success ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
                        </div>
                        
                        <h3 className={`text-2xl font-black mb-2 ${result.success ? 'text-emerald-700' : 'text-red-700'}`}>
                            {result.success ? 'Positive Outcome!' : 'Negative Outcome'}
                        </h3>
                        
                        <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                            {result.message}
                        </p>

                        <button 
                            onClick={onClose}
                            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                        >
                            Continue <ArrowRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default ScenarioModal;