import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { motion } from 'framer-motion';
import { PlusCircle, ArrowLeft, CheckCircle2, AlertCircle, Bus, MapPin, IndianRupee, Clock, Shield } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        bus_type: '',
        from_city: '',
        to_city: '',
        startTime: '',
        totalSeats: 40,
        price: 1000,
        amenities: 'AC,WiFi,Charging Points',
        duration: '6',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const busTypes = [
        'Volvo 9000 Multi-Axle',
        'Bharat Benz Sleeper',
        'Mercedes Multi-Axle',
        'Scania Multi-Axle',
        'Ashok Leyland Sleeper',
    ];

    const cities = [
        'Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Indore', 'Kanpur', 'Gwalior',
        'Jaipur', 'Lucknow', 'Agra', 'Ahmedabad', 'Surat', 'Nagpur', 'Bhopal',
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.bus_type || !formData.from_city || !formData.to_city || !formData.startTime || formData.totalSeats < 1) {
            setError('Please fill all required fields');
            return;
        }

        if (formData.from_city === formData.to_city) {
            setError('From and To cities cannot be the same');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await api.createBus({
                name: formData.name,
                startTime: formData.startTime,
                totalSeats: formData.totalSeats,
                bus_type: formData.bus_type,
                from_city: formData.from_city,
                to_city: formData.to_city,
                price: formData.price,
                amenities: formData.amenities,
            });

            setSuccess(true);
            setFormData({
                name: '',
                bus_type: '',
                from_city: '',
                to_city: '',
                startTime: '',
                totalSeats: 40,
                price: 1000,
                amenities: 'AC,WiFi,Charging Points',
                duration: '6',
            });

            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create bus');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 py-8 px-4 text-slate-100">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="bg-slate-900/80 backdrop-blur rounded-xl border border-slate-800 p-6 mb-6 shadow-xl">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
                        >
                            <ArrowLeft size={24} className="text-slate-400 group-hover:text-white" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <Shield className="text-indigo-500" size={24} />
                                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                            </div>
                            <p className="text-slate-400 mt-1">Create new premium bus routes</p>
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-emerald-900/20 border border-emerald-500/50 rounded-lg flex items-center gap-3 backdrop-blur-md"
                    >
                        <CheckCircle2 className="text-emerald-400" />
                        <span className="text-emerald-300 font-medium">Bus created successfully! Redirecting...</span>
                    </motion.div>
                )}

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-3 backdrop-blur-md"
                    >
                        <AlertCircle className="text-red-400" />
                        <span className="text-red-300 font-medium">{error}</span>
                    </motion.div>
                )}

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 rounded-xl shadow-xl border border-slate-800 p-8"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Bus Name */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                                <Bus size={14} className="inline mr-2" />
                                Bus Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="e.g., Electro Glide Express"
                            />
                        </div>

                        {/* Bus Type */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                                Bus Type *
                            </label>
                            <select
                                value={formData.bus_type}
                                onChange={(e) => setFormData({ ...formData, bus_type: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                            >
                                <option value="">Select Bus Type</option>
                                {busTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Route - From & To */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                                    <MapPin size={14} className="inline mr-2" />
                                    From City *
                                </label>
                                <select
                                    value={formData.from_city}
                                    onChange={(e) => setFormData({ ...formData, from_city: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                >
                                    <option value="">Select City</option>
                                    {cities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                                    <MapPin size={14} className="inline mr-2" />
                                    To City *
                                </label>
                                <select
                                    value={formData.to_city}
                                    onChange={(e) => setFormData({ ...formData, to_city: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                >
                                    <option value="">Select City</option>
                                    {cities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Departure Date & Time */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                                Departure Date & Time *
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all [color-scheme:dark]"
                            />
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                                <Clock size={14} className="inline mr-2" />
                                Journey Duration (hours)
                            </label>
                            <input
                                type="number"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                min="1"
                                max="48"
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="6"
                            />
                            <p className="text-xs text-slate-500 mt-2">Estimated travel time</p>
                        </div>

                        {/* Total Seats & Price */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                                    Total Seats *
                                </label>
                                <input
                                    type="number"
                                    value={formData.totalSeats}
                                    onChange={(e) => setFormData({ ...formData, totalSeats: Number(e.target.value) })}
                                    min="1"
                                    max="100"
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                />
                                <p className="text-xs text-slate-500 mt-2">Recommended: 36-50 seats</p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                                    <IndianRupee size={14} className="inline mr-2" />
                                    Price per Seat *
                                </label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    min="100"
                                    max="10000"
                                    step="50"
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Amenities */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                                Amenities (comma-separated)
                            </label>
                            <input
                                type="text"
                                value={formData.amenities}
                                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="AC,WiFi,Charging Points,Water Bottle,Blankets"
                            />
                            <p className="text-xs text-slate-500 mt-2">Example: AC,WiFi,Charging Points,Meals,Entertainment</p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 flex items-center justify-center gap-3"
                        >
                            <PlusCircle size={24} />
                            {loading ? 'Creating...' : 'Create Bus Trip'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;
