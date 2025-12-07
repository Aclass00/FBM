
import React, { useState } from 'react';
import { Settings, Moon, Sun, Upload, Check, Type, RotateCcw, UserCog, Mail, Lock, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Team, User } from '../types';

interface Props {
    team: Team;
    user?: User | null;
    onUpdateTeamInfo: (name: string, manager: string, logoUrl: string) => void;
    onReset: () => void;
    isDark: boolean;
    onToggleTheme: () => void;
    onDeleteAccount: () => void;
    onCancelDelete: () => void;
    onUpdatePassword: (old: string, newP: string) => boolean;
}

const OptionsView: React.FC<Props> = ({ 
    team, user, onUpdateTeamInfo, onReset, isDark, onToggleTheme, 
    onDeleteAccount, onCancelDelete, onUpdatePassword 
}) => {
    const [name, setName] = useState(team.name);
    const [manager, setManager] = useState(team.managerName || '');
    const [logoUrl, setLogoUrl] = useState(team.customLogoUrl || '');
    
    // Password Change State
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [passMsg, setPassMsg] = useState('');

    const handleSaveInfo = () => {
        onUpdateTeamInfo(name, manager, logoUrl);
    };

    const handlePasswordChange = () => {
        if (onUpdatePassword(oldPass, newPass)) {
            setPassMsg('تم تغيير كلمة المرور بنجاح');
            setOldPass('');
            setNewPass('');
        } else {
            setPassMsg('كلمة المرور القديمة غير صحيحة');
        }
    };

    const LOGO_PRESETS = [
        "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/1200px-FC_Barcelona_%28crest%29.svg.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/1200px-Manchester_United_FC_crest.svg.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Al-Nassr_FC_Logo.svg/1200px-Al-Nassr_FC_Logo.svg.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/f/fa/Al-Hilal_Saudi_Football_Club_Logo.svg/1200px-Al-Hilal_Saudi_Football_Club_Logo.svg.png"
    ];

    const isScheduledForDeletion = !!user?.deletionScheduledAt;

    return (
        <div className="space-y-6 max-w-3xl mx-auto pb-10">
             
             {/* 1. Appearance */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Settings className="text-slate-400" /> إعدادات المظهر
                </h2>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-700 text-sm">الوضع الليلي</h3>
                        <p className="text-xs text-slate-500">تغيير مظهر اللعبة بين الفاتح والداكن</p>
                    </div>
                    <button 
                        onClick={onToggleTheme}
                        className={`p-2 rounded-full transition-all flex items-center gap-2 px-4 border
                          ${isDark ? 'bg-slate-800 text-white border-slate-700' : 'bg-orange-50 text-orange-600 border-orange-200'}
                        `}
                    >
                        {isDark ? <Moon size={18} /> : <Sun size={18} />}
                        <span className="text-sm font-bold">{isDark ? 'ليلي' : 'نهاري'}</span>
                    </button>
                </div>
             </div>

             {/* 2. Team Info */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Type size={18} className="text-indigo-600" /> بيانات الفريق
                </h2>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">اسم الفريق</label>
                            <input 
                                type="text" value={name} onChange={e => setName(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">اسم المدرب</label>
                            <input 
                                type="text" value={manager} onChange={e => setManager(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">شعار النادي (رابط صورة)</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Upload size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                                <input 
                                    type="text" value={logoUrl} onChange={e => setLogoUrl(e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                    className="w-full pr-10 pl-3 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none dir-ltr text-left"
                                />
                            </div>
                            {logoUrl && (
                                <div className="w-12 h-12 rounded-lg border border-slate-200 p-1 bg-white shrink-0">
                                    <img src={logoUrl} alt="Preview" className="w-full h-full object-contain" />
                                </div>
                            )}
                        </div>
                        
                        {/* Presets */}
                        <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                            {LOGO_PRESETS.map((url, i) => (
                                <button key={i} onClick={() => setLogoUrl(url)} className="w-8 h-8 rounded-full border border-slate-200 hover:border-indigo-500 p-1 bg-white shrink-0 transition-all">
                                    <img src={url} className="w-full h-full object-contain" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <button onClick={handleSaveInfo} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 mt-2 transition-colors">
                        <Check size={18} /> حفظ التعديلات
                    </button>
                </div>
             </div>

             {/* 3. Account Settings */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <UserCog size={18} className="text-slate-600" /> إدارة الحساب
                </h2>

                <div className="space-y-6">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="p-2 bg-white rounded-full text-slate-500"><Mail size={18}/></div>
                        <div>
                            <div className="text-xs text-slate-400 font-bold">البريد الإلكتروني المسجل</div>
                            <div className="font-bold text-slate-800 dir-ltr text-left">{user?.email || 'Guest'}</div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                        <h3 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2"><Lock size={14}/> تغيير كلمة المرور</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                            <input type="password" placeholder="كلمة المرور الحالية" value={oldPass} onChange={e => setOldPass(e.target.value)} className="p-2 border rounded-lg text-sm" />
                            <input type="password" placeholder="كلمة المرور الجديدة" value={newPass} onChange={e => setNewPass(e.target.value)} className="p-2 border rounded-lg text-sm" />
                        </div>
                        {passMsg && <div className="text-xs font-bold text-indigo-600 mb-2">{passMsg}</div>}
                        <button onClick={handlePasswordChange} disabled={!oldPass || !newPass} className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg disabled:opacity-50">تحديث كلمة المرور</button>
                    </div>
                </div>
             </div>

             {/* 4. Danger Zone */}
             <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                <h2 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
                    <ShieldAlert size={18} /> منطقة الخطر
                </h2>

                {isScheduledForDeletion ? (
                    <div className="bg-white p-4 rounded-xl border border-red-200 text-center">
                        <div className="flex justify-center text-red-500 mb-2"><AlertTriangle size={32}/></div>
                        <h3 className="font-bold text-red-700 mb-1">الحساب مجدول للحذف</h3>
                        <p className="text-sm text-slate-600 mb-4">سيتم حذف بياناتك نهائياً خلال أقل من 24 ساعة.</p>
                        <button onClick={onCancelDelete} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700">
                            إلغاء الحذف واستعادة الحساب
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-red-600/80">عند طلب حذف الحساب، سيتم منحك مهلة 24 ساعة للتراجع قبل إزالة البيانات نهائياً.</p>
                        <button onClick={onDeleteAccount} className="w-full py-3 border-2 border-red-200 text-red-600 hover:bg-red-100 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                            <RotateCcw size={18} /> طلب حذف الحساب
                        </button>
                    </div>
                )}
             </div>
        </div>
    );
};

export default OptionsView;
