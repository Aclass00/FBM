import React, { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

interface Props {
    onLogin: (email: string, pass: string) => Promise<boolean>;
    onRegister: (email: string, pass: string) => Promise<boolean>;
    onDevLogin: () => Promise<boolean>;
}

const AuthScreen: React.FC<Props> = ({ onLogin, onRegister, onDevLogin }) => {
    const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        if (!email || !password) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        try {
            if (mode === 'LOGIN') {
                const success = await onLogin(email, password);
                if (!success) setError('Incorrect email or password');
            } else {
                const success = await onRegister(email, password);
                if (!success) {
                    setError('An error occurred during registration. The email might already be in use.');
                }
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDevLogin = async () => {
        setIsLoading(true);
        await onDevLogin();
        setIsLoading(false);
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1510563800743-aed236490d08?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-900"></div>

            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-slate-800 mb-2">Football Manager</h1>
                    <p className="text-slate-500 text-sm">
                        {mode === 'LOGIN' ? 'Welcome back, Manager!' : 'Start your managerial career now'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input 
                                type="email" 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white"
                                placeholder="coach@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input 
                                type="password" 
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/30 transition-all mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            mode === 'LOGIN' ? <><LogIn size={20}/> Login</> : <><UserPlus size={20}/> Create Account</>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center space-y-4">
                    <button 
                        onClick={() => { setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN'); setError(''); }}
                        className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        {mode === 'LOGIN' 
                            ? "Don't have an account? Register now" 
                            : 'Already have an account? Log in'}
                    </button>
                    
                    {/* Developer Login Button */}
                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink mx-4 text-xs text-slate-400">OR</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                    </div>
                    <button 
                        onClick={handleDevLogin}
                        disabled={isLoading}
                        className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-yellow-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <Zap size={16} /> Quick Login (Dev)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;