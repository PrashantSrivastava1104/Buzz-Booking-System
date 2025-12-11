import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogIn, LogOut, User, Zap } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();
    const { user, logout, isAuthenticated } = useAuth();

    return (
        <nav className="bg-slate-900/80 backdrop-blur-md border-b border-indigo-500/20 text-white sticky top-0 z-50 transition-all duration-300">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="bg-indigo-600/20 p-2 rounded-lg group-hover:bg-indigo-600/40 transition-all duration-300">
                            <Zap size={28} className="text-indigo-400 group-hover:text-indigo-300" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                                Buzz-Book
                            </h1>
                            <p className="text-xs text-slate-400">Premium Travel Experience</p>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${location.pathname === '/'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'text-slate-300 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Home
                        </Link>
                        <Link
                            to="/admin"
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${location.pathname === '/admin'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'text-slate-300 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Shield size={18} />
                            Admin
                        </Link>

                        {/* User Section */}
                        {isAuthenticated ? (
                            <div className="flex items-center gap-3 border-l border-slate-700 pl-4 ml-2">
                                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg">
                                    <User size={18} className="text-indigo-400" />
                                    <span className="font-medium text-sm text-slate-200">{user?.name}</span>
                                    {user?.isGuest && <span className="text-xs bg-indigo-900/50 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded">Guest</span>}
                                </div>
                                <button
                                    onClick={logout}
                                    className="px-3 py-2 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-lg transition-all flex items-center gap-2"
                                    title="Logout"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 flex items-center gap-2"
                            >
                                <LogIn size={18} />
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
