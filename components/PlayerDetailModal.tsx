

import React, { useState, useEffect } from 'react';
import { Player, DrillType } from '../types';
import { X, Activity, Target, History, PlusSquare, Dumbbell, User, FileText, Star, TrendingUp, Award, ShoppingCart, Send, AlertTriangle, CheckCircle2, XCircle, Medal } from 'lucide-react';
import { NegotiationResult } from '../hooks/useTransferSystem';

interface Props {
  player: Player;
  onClose: () => void;
  onSetDrill?: (drill: DrillType, playerIds: string[]) => void;
  initialTab?: 'stats' | 'reports';
  isOwnPlayer?: boolean;
  onNegotiate?: (amount: number) => Promise<NegotiationResult>;
  userBudget?: number;
}

const PlayerDetailModal: React.FC<Props> = ({ player, onClose, onSetDrill, initialTab = 'stats', isOwnPlayer = false, onNegotiate, userBudget }) => {
    const [activeTab, setActiveTab] = useState<'stats' | 'reports' | 'awards'>(initialTab);
    
    // Negotiation States
    const [offerAmount, setOfferAmount] = useState<number>(Math.ceil(player.value)); 
    const [negotiationStatus, setNegotiationStatus] = useState<'IDLE' | 'LOADING' | 'COUNTER' | 'REJECTED' | 'SUCCESS'>('IDLE');
    const [statusMessage, setStatusMessage] = useState('');
    const [counterPrice, setCounterPrice] = useState(0);

    useEffect(() => {
        setActiveTab(initialTab);
        setOfferAmount(Math.ceil(player.value));
        setNegotiationStatus('IDLE');
    }, [initialTab, player.id]);

    if (!player) return null;
    const isKnown = isOwnPlayer || player.isScouted;
    const { attributes, reports } = player;
    const isPeak = player.rating >= player.potential;

    const getRatingColor = (rating: number) => {
        if (rating >= 85) return 'text-emerald-600';
        if (rating >= 75) return 'text-blue-600';
        if (rating >= 65) return 'text-yellow-600';
        return 'text-slate-500';
    };

    const getPosColor = (pos: string) => {
        if (pos === 'GK') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        if (['CB', 'LB', 'RB'].includes(pos)) return 'bg-blue-100 text-blue-700 border-blue-200';
        if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(pos)) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        return 'bg-red-100 text-red-700 border-red-200';
    };

    const handleDrillChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if(onSetDrill) {
            onSetDrill(e.target.value as DrillType, [player.id]);
        }
    };

    const submitOffer = async (amount: number) => {
        if (onNegotiate) {
            setNegotiationStatus('LOADING');
            const result = await onNegotiate(amount);
            
            if (result.status === 'ACCEPTED') {
                setNegotiationStatus('SUCCESS');
                setTimeout(onClose, 2000);
            } else if (result.status === 'REJECTED') {
                setNegotiationStatus('REJECTED');
                setStatusMessage(result.reason);
            } else if (result.status === 'COUNTER_OFFER') {
                setNegotiationStatus('COUNTER');
                setCounterPrice(result.counterPrice);
            }
        }
    };

    // Fog of War Stat Bar
    const StatBar = ({ label, value }: { label: string, value: number }) => {
       if (!isKnown) {
           const min = Math.max(1, Math.floor(value - 5));
           const max = Math.min(99, Math.ceil(value + 5));
           return (
             <div className="flex items-center gap-2 text-xs mb-1.5 opacity-70">
                <span className="w-32 text-slate-500 truncate">{label}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden relative">
                    <div className="h-full bg-slate-300 w-full animate-pulse opacity-30"></div>
                </div>
                <span className="w-12 text-right font-bold text-slate-400 text-[10px]">{min}-{max}</span>
             </div>
           );
       }
       const intVal = Math.floor(value);
       const decimal = value % 1;
       let color = 'bg-slate-300';
       if(intVal >= 80) color = 'bg-emerald-500';
       else if(intVal >= 70) color = 'bg-blue-500';
       else if(intVal >= 60) color = 'bg-yellow-500';

       return (
         <div className="flex items-center gap-2 text-xs mb-1.5 group relative" title={`التقدم للنقطة التالية: ${(decimal*100).toFixed(0)}%`}>
           <span className="w-32 text-slate-600 truncate">{label}</span>
           <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden relative">
             <div className={`h-full ${color}`} style={{width: `${Math.min(100, intVal)}%`}}></div>
           </div>
           <span className="w-8 text-right font-bold text-slate-800 flex items-center justify-end gap-1">
               {intVal}
           </span>
         </div>
       )
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
         <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 p-6 border-b border-slate-100 flex justify-between items-center shadow-sm">
               <div className="flex items-center gap-4">
                 <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-bold bg-slate-100 border-2 border-slate-100`}>
                   <div className={isKnown ? getRatingColor(player.rating) : 'text-slate-400'}>
                       {isKnown ? player.rating : '?'}
                   </div>
                 </div>
                 <div>
                   <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                       {player.name}
                       {isPeak && isKnown && (
                           <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                               <Award size={10} /> وصل للذروة
                           </span>
                       )}
                   </h2>
                   <div className="flex flex-wrap gap-2 items-center mt-1">
                     <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getPosColor(player.position)} flex items-center gap-1`}>
                         <span className="font-bold">{player.position}</span>
                     </span>
                     <span className="text-slate-500 text-sm">{player.nationality} • {player.age} سنة</span>
                     {player.injuryWeeks > 0 && (
                        <span className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold border border-red-200">
                           <PlusSquare size={12} fill="currentColor" className="text-red-500" /> مصاب
                        </span>
                     )}
                   </div>
                 </div>
               </div>
               <div className="flex gap-2">
                   <button onClick={() => setActiveTab('stats')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'stats' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-100 text-slate-600'}`}>
                       الإحصائيات
                   </button>
                   {!isOwnPlayer && (
                       <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-100 text-slate-600'}`}>
                           تقارير الكشافة
                       </button>
                   )}
                   <button onClick={() => setActiveTab('awards')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'awards' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-100 text-slate-600'}`}>
                       الإنجازات
                   </button>
                   <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="text-slate-400" /></button>
               </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {activeTab === 'stats' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                        {/* Column 1: Drill + Info + BUY BUTTON */}
                        <div className="space-y-6">
                            
                            {!isKnown && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-xs font-bold flex items-center gap-2">
                                    <Activity size={16} /> الإحصائيات غير دقيقة لأن اللاعب لم يتم كشفه بعد.
                                </div>
                            )}

                            {/* --- NEGOTIATION SECTION --- */}
                            {onNegotiate && userBudget !== undefined && !isOwnPlayer && (
                                <div className="bg-white rounded-xl border border-indigo-200 shadow-lg overflow-hidden relative">
                                    <div className="bg-gradient-to-r from-indigo-50 to-white p-3 border-b border-indigo-100">
                                        <h3 className="font-bold text-indigo-800 flex items-center gap-2">
                                            <ShoppingCart size={16} /> مفاوضات الشراء
                                        </h3>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        
                                        {/* Status: IDLE (Enter Amount) */}
                                        {negotiationStatus === 'IDLE' && (
                                            <>
                                                <div className="flex justify-between text-sm items-center">
                                                    <span className="text-slate-500">القيمة السوقية:</span>
                                                    <span className="font-bold text-slate-800">{player.value}M</span>
                                                </div>
                                                <div className="flex justify-between text-xs items-center">
                                                    <span className="text-slate-400">ميزانيتك:</span>
                                                    <span className="font-bold text-emerald-600">{userBudget.toFixed(1)}M</span>
                                                </div>
                                                
                                                <div className="mt-2">
                                                    <label className="text-xs font-bold text-slate-600 mb-1 block">قيمة العرض (مليون)</label>
                                                    <div className="relative">
                                                        <input 
                                                            type="number" 
                                                            className="w-full p-2 pr-2 pl-12 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-center font-bold text-slate-800"
                                                            value={offerAmount}
                                                            onChange={(e) => setOfferAmount(parseFloat(e.target.value))}
                                                            step={0.5}
                                                        />
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">M</span>
                                                    </div>
                                                </div>

                                                <button 
                                                    onClick={() => submitOffer(offerAmount)} 
                                                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
                                                >
                                                    <Send size={16} /> إرسال العرض
                                                </button>
                                                <p className="text-[10px] text-center text-slate-400 mt-1">سيتم الرد على العرض خلال لحظات...</p>
                                            </>
                                        )}

                                        {/* Status: LOADING */}
                                        {negotiationStatus === 'LOADING' && (
                                            <div className="py-6 flex flex-col items-center justify-center text-center">
                                                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                                                <p className="text-sm font-bold text-slate-600">جاري التفاوض مع النادي...</p>
                                                <p className="text-xs text-slate-400">يرجى الانتظار</p>
                                            </div>
                                        )}

                                        {/* Status: REJECTED */}
                                        {negotiationStatus === 'REJECTED' && (
                                            <div className="py-4 text-center">
                                                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                                    <XCircle size={24} />
                                                </div>
                                                <h4 className="font-bold text-red-700 mb-1">تم رفض العرض</h4>
                                                <p className="text-xs text-slate-600 mb-4">{statusMessage}</p>
                                                <button onClick={() => setNegotiationStatus('IDLE')} className="text-xs font-bold text-slate-500 hover:text-slate-800 underline">
                                                    تقديم عرض جديد
                                                </button>
                                            </div>
                                        )}

                                        {/* Status: COUNTER OFFER */}
                                        {negotiationStatus === 'COUNTER' && (
                                            <div className="py-2 text-center">
                                                <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                                    <AlertTriangle size={20} />
                                                </div>
                                                <h4 className="font-bold text-slate-800 mb-1">عرض مضاد</h4>
                                                <p className="text-xs text-slate-600 mb-3">
                                                    رفض النادي عرضك ({offerAmount}M) ويطلب مبلغاً قدره:
                                                </p>
                                                <div className="text-2xl font-black text-indigo-600 mb-4">{counterPrice}M</div>
                                                
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button 
                                                        onClick={() => setNegotiationStatus('IDLE')} 
                                                        className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold"
                                                    >
                                                        رفض
                                                    </button>
                                                    <button 
                                                        onClick={() => submitOffer(counterPrice)} 
                                                        className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                                                    >
                                                        موافق ({counterPrice}M)
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Status: SUCCESS */}
                                        {negotiationStatus === 'SUCCESS' && (
                                            <div className="py-6 flex flex-col items-center justify-center text-center">
                                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-in zoom-in">
                                                    <CheckCircle2 size={28} />
                                                </div>
                                                <h4 className="font-bold text-emerald-700 mb-1">تمت الصفقة بنجاح!</h4>
                                                <p className="text-xs text-slate-500">مبروك! اللاعب انضم لفريقك.</p>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            )}

                            {/* Training Dropdown (Only for own player) */}
                            {onSetDrill && isOwnPlayer && (
                                <div className="bg-indigo-600 text-white p-4 rounded-xl border border-indigo-700 shadow-md">
                                    <h3 className="font-bold text-indigo-100 mb-2 flex items-center gap-2"><Dumbbell size={16}/> البرنامج التدريبي</h3>
                                    <div className="relative">
                                        <select 
                                            className="w-full p-2.5 rounded-lg border-0 bg-white text-indigo-900 text-sm font-bold focus:ring-2 focus:ring-indigo-300 outline-none cursor-pointer"
                                            onChange={handleDrillChange}
                                            defaultValue=""
                                        >
                                            <option value="" disabled className="text-gray-400">اختر برنامج تدريبي...</option>
                                            <optgroup label="أساسي">
                                                <option value="FITNESS_POWER">لياقة بدنية (قوة)</option>
                                                <option value="FITNESS_MOVEMENT">لياقة (رشاقة وسرعة)</option>
                                                <option value="DEFENDING">دفاع</option>
                                                <option value="ATTACKING">هجوم</option>
                                                <option value="TECHNICAL_PASSING">تمرير</option>
                                                <option value="TECHNICAL_CONTROL">تحكم</option>
                                                <option value="SET_PIECES">كرات ثابتة</option>
                                                <option value="GK">حراسة مرمى</option>
                                            </optgroup>
                                            <optgroup label="متقدم">
                                                <option value="COMBO_OFFENSIVE_UNIT">وحدة هجومية</option>
                                                <option value="COMBO_DEFENSIVE_UNIT">وحدة دفاعية</option>
                                                <option value="COMBO_WING_PLAY">اللعب على الأطراف</option>
                                                <option value="COMBO_MIDFIELD_CONTROL">سيطرة وسط</option>
                                                <option value="COMBO_HIGH_PRESS">ضغط عالي</option>
                                                <option value="COMBO_COUNTER_ATTACK">هجوم مرتد</option>
                                                <option value="COMBO_AERIAL">كرات هوائية</option>
                                                <option value="COMBO_TOTAL_FOOTBALL">كرة شاملة</option>
                                            </optgroup>
                                        </select>
                                    </div>
                                    <p className="text-[10px] text-indigo-200 mt-2 opacity-80">سيتم تطبيق التدريب تلقائياً في المحاكاة القادمة.</p>
                                </div>
                            )}

                            {/* Career Stats */}
                            <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500 blur-3xl opacity-20 rounded-full translate-x-1/2 -translate-y-1/2"></div>
                                <h3 className="font-bold text-indigo-200 mb-3 flex items-center gap-2"><History size={16}/> مسيرة اللاعب</h3>
                                <div className="space-y-3 relative z-10">
                                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                        <span className="text-sm text-slate-300">مباريات لعبها</span>
                                        <span className="text-lg font-bold">{player.careerMatches + player.matchesPlayed}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                        <span className="text-sm text-slate-300">أهداف مسجلة</span>
                                        <span className="text-lg font-bold text-emerald-400">{player.careerGoals + player.goals}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-300">صناعة أهداف</span>
                                        <span className="text-lg font-bold text-blue-400">{player.careerAssists + player.assists}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Value Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-slate-50 rounded-lg">
                                    <div className="text-xs text-slate-500">القيمة السوقية</div>
                                    <div className="font-bold text-emerald-600 text-lg">{player.value}M</div>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-lg">
                                    <div className="text-xs text-slate-500">الراتب الأسبوعي</div>
                                    <div className="font-bold text-slate-800 text-lg">{player.wage}k</div>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Physical & Mental */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-slate-900 mb-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2"><Activity size={16}/> القدرات البدنية</div>
                                    {isKnown && <div className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">التقييم الكلي: <span className="text-slate-900 font-bold">{player.rating}</span></div>}
                                </h3>
                                <StatBar label="التسارع" value={attributes.acceleration} />
                                <StatBar label="سرعة الجري" value={attributes.sprintSpeed} />
                                <StatBar label="الرشاقة" value={attributes.agility} />
                                <StatBar label="التوازن" value={attributes.balance} />
                                <StatBar label="القوة البدنية" value={attributes.strength} />
                                <StatBar label="اللياقة" value={attributes.stamina} />
                                <StatBar label="القفز" value={attributes.jumping} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-3">الذهنية</h3>
                                <StatBar label="رد الفعل" value={attributes.reactions} />
                                <StatBar label="الرؤية" value={attributes.vision} />
                                <StatBar label="قطع الكرات" value={attributes.interceptions} />
                                <StatBar label="الوعي الدفاعي" value={attributes.defensiveAwareness} />
                            </div>
                        </div>

                        {/* Column 3: Technical & GK */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><Target size={16}/> المهارات الفنية</h3>
                                <StatBar label="التحكم بالكرة" value={attributes.ballControl} />
                                <StatBar label="المراوغة" value={attributes.dribbling} />
                                <StatBar label="التمرير القصير" value={attributes.shortPassing} />
                                <StatBar label="التمرير الطويل" value={attributes.longPassing} />
                                <StatBar label="الإنهاء" value={attributes.finishing} />
                                <StatBar label="التسديد البعيد" value={attributes.longShots} />
                                <StatBar label="قوة التسديد" value={attributes.shotPower} />
                                <StatBar label="الرأسيات" value={attributes.headingAccuracy} />
                                <StatBar label="الركلات الحرة" value={attributes.freeKickAccuracy} />
                                <StatBar label="ركلات الجزاء" value={attributes.penalties} />
                                <div className="my-2 h-px bg-slate-100"></div>
                                <StatBar label="استخلاص وقوفاً" value={attributes.standingTackle} />
                                <StatBar label="استخلاص انزلاقاً" value={attributes.slidingTackle} />
                            </div>
                        </div>
                    </div>
                )} 
                
                {activeTab === 'reports' && (
                    <div className="space-y-6">
                        {reports && reports.length > 0 ? (
                            reports.slice().reverse().map((report, idx) => (
                                <div key={idx} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                    <div className="flex justify-between items-start mb-4 border-b border-slate-200 pb-3">
                                        <div>
                                            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                <User className="w-4 h-4 text-indigo-600"/>
                                                الكشاف: {report.scoutName}
                                            </h4>
                                            <span className="text-xs text-slate-500">{new Date(report.date).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border shadow-sm">
                                            <span className="text-xs font-bold text-slate-500">تقييم الكشاف</span>
                                            <span className="font-black text-lg text-indigo-600">{report.ratingGiven}/10</span>
                                        </div>
                                    </div>
                                    
                                    <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed mb-4">
                                        <p>{report.text}</p>
                                    </div>

                                    <div className="flex gap-4 items-center bg-white p-3 rounded-lg border border-slate-200">
                                        <div className="flex-1 border-l border-slate-100 pl-4">
                                            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><TrendingUp size={12}/> الإمكانيات المتوقعة</div>
                                            <div className="font-bold text-lg text-slate-800">
                                                {report.potentialRange}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Star size={12}/> التوصية</div>
                                            <div className={`font-bold text-sm px-2 py-1 rounded w-fit
                                                ${report.recommendation === 'SIGN' ? 'bg-emerald-100 text-emerald-700' : 
                                                  report.recommendation === 'WATCH' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}
                                            `}>
                                                {report.recommendation === 'SIGN' ? 'توقيع فوري' : report.recommendation === 'WATCH' ? 'مراقبة' : 'تجاهل'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                <p className="text-slate-500 font-medium">لا توجد تقارير كشافة لهذا اللاعب بعد.</p>
                                <p className="text-xs text-slate-400 mt-1">قم بتعيين كشاف من الأكاديمية للحصول على تقرير مفصل.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'awards' && (
                    <div className="space-y-6">
                        {player.awards && player.awards.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {player.awards.map((award) => (
                                    <div key={award.id} className="bg-white border rounded-xl p-4 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition-all">
                                        <div className={`absolute top-0 right-0 w-16 h-16 opacity-10 rounded-bl-full
                                            ${award.type === 'GOLD' ? 'bg-yellow-500' : award.type === 'SILVER' ? 'bg-slate-400' : 'bg-amber-700'}
                                        `}></div>
                                        
                                        <div className={`p-3 rounded-full flex items-center justify-center border-2 shadow-inner
                                            ${award.type === 'GOLD' ? 'bg-yellow-50 border-yellow-400 text-yellow-600' : 
                                              award.type === 'SILVER' ? 'bg-slate-100 border-slate-300 text-slate-500' : 
                                              'bg-amber-50 border-amber-600 text-amber-700'}
                                        `}>
                                            <Medal size={24} />
                                        </div>
                                        
                                        <div>
                                            <div className="text-[10px] text-slate-400 font-bold mb-0.5">موسم {award.season}</div>
                                            <h4 className="font-bold text-slate-800">{award.title}</h4>
                                            <div className="text-xs text-slate-500 mt-1">{
                                                award.type === 'GOLD' ? 'المركز الأول' : award.type === 'SILVER' ? 'المركز الثاني' : 'المركز الثالث'
                                            }</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                <Award className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                <p className="text-slate-500 font-medium">لم يحصل اللاعب على أي جوائز فردية بعد.</p>
                                <p className="text-xs text-slate-400 mt-1">الجوائز تمنح في نهاية كل موسم.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
         </div>
      </div>
    );
};

export default PlayerDetailModal;
