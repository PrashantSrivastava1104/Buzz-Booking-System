import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User, AlertCircle, ArrowRight, Zap } from 'lucide-react';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login, signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(name, email, password);
            }
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-700 p-8 rounded-2xl shadow-2xl relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="bg-indigo-600/20 p-3 rounded-full w-fit mx-auto mb-4 backdrop-blur-sm border border-indigo-500/30">
                        <Zap size={32} className="text-indigo-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        {isLogin ? 'Welcome Back' : 'Join Buzz-Book'}
                    </h1>
                    <p className="text-slate-400 mt-2">
                        {isLogin ? 'Enter your details to access your account' : 'Start your premium travel journey today'}
                    </p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl flex items-center gap-3"
                    >
                        <AlertCircle className="text-red-400" size={20} />
                        <span className="text-sm text-red-300">{error}</span>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3.5 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="John Doe"
                                    required={!isLogin}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? (
                            'Processing...'
                        ) : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-slate-700/50">
                    <p className="text-slate-400 mb-4">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                    </p>
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors hover:underline"
                    >
                        {isLogin ? 'Create Account' : 'Login to Account'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
