import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Bus } from '../types';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ArrowRight, Star, Shield, Clock, Wifi, Zap, Coffee, Search, Filter, SortAsc } from 'lucide-react';

const HomePage: React.FC = () => {
    const [buses, setBuses] = useState<Bus[]>([]);
    const [filteredBuses, setFilteredBuses] = useState<Bus[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Filter states
    const [filters, setFilters] = useState({
        fromCity: '',
        toCity: '',
        date: '',
        busType: '',
    });

    const [sortBy, setSortBy] = useState<string>('price_low');

    useEffect(() => {
        loadBuses();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [buses, filters, sortBy]);

    const loadBuses = async () => {
        try {
            const data = await api.getBuses();
            setBuses(data);
        } catch (error) {
            console.error('Failed to load buses', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...buses];

        if (filters.fromCity) {
            result = result.filter(bus =>
                bus.from_city?.toLowerCase().includes(filters.fromCity.toLowerCase())
            );
        }

        if (filters.toCity) {
            result = result.filter(bus =>
                bus.to_city?.toLowerCase().includes(filters.toCity.toLowerCase())
            );
        }

        if (filters.date) {
            result = result.filter(bus => {
                const busDate = new Date(bus.start_time).toISOString().split('T')[0];
                return busDate === filters.date;
            });
        }

        if (filters.busType) {
            result = result.filter(bus =>
                bus.bus_type?.toLowerCase().includes(filters.busType.toLowerCase())
            );
        }

        // Sorting Logic
        if (sortBy === 'price_low') {
            result.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortBy === 'price_high') {
            result.sort((a, b) => (b.price || 0) - (a.price || 0));
        } else if (sortBy === 'time_early') {
            result.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
        }

        setFilteredBuses(result);
    };

    const clearFilters = () => {
        setFilters({
            fromCity: '',
            toCity: '',
            date: '',
            busType: '',
        });
        setSortBy('price_low');
    };

    const getAmenityIcon = (amenity: string) => {
        const icons: Record<string, any> = {
            'WiFi': Wifi,
            'AC': Zap,
            'Charging': Zap,
            'Snacks': Coffee,
            'Meals': Coffee,
        };
        return icons[amenity] || Star;
    };

    // Static data for dropdowns to ensure they are never empty
    const popularCities = [
        'Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad',
        'Jaipur', 'Ahmedabad', 'Surat', 'Indore', 'Bhopal', 'Lucknow',
        'Kanpur', 'Nagpur', 'Goa', 'Chandigarh', 'Kolkata', 'Visakhapatnam'
    ];

    const popularBusTypes = [
        'AC Seater', 'AC Sleeper', 'Non-AC Seater', 'Non-AC Sleeper',
        'Volvo Multi-Axle', 'Scania Multi-Axle', 'Mercedes Benz', 'Electric AC',
        'Bharat Benz Sleeper', 'Volvo 9000 Multi-Axle'
    ];

    // Get unique cities and bus types for filter dropdowns (merge static + dynamic)
    const cities = Array.from(new Set([
        ...popularCities,
        ...buses.flatMap(b => [b.from_city, b.to_city])
    ].filter(Boolean))).sort();

    const busTypes = Array.from(new Set([
        ...popularBusTypes,
        ...buses.map(b => b.bus_type)
    ].filter(Boolean))).sort();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500 border-indigo-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-indigo-900 via-slate-900 to-black overflow-hidden border-b border-indigo-500/20">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.3) 1px, transparent 0)`,
                        backgroundSize: '30px 30px'
                    }}></div>
                </div>

                <div className="container mx-auto px-6 py-16 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400">
                                Buzz-Book
                            </span>
                        </h1>
                        <p className="text-xl text-slate-400 mb-8 font-light">
                            Experience the future of travel with premium, high-speed, and ultra-comfortable bus services.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8 -mt-8 relative z-10">
                {/* Search Filter Section - Glass Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-indigo-500/20 p-6 mb-12 ring-1 ring-white/10"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-500/20 p-2 rounded-lg">
                                <Search className="text-indigo-400" size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-white">Find Your Trip</h2>
                        </div>

                        {/* Sorting Control */}
                        <div className="flex items-center gap-2">
                            <SortAsc size={16} className="text-slate-400" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-slate-800 border-none text-slate-200 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 px-3 py-1 cursor-pointer"
                            >
                                <option value="price_low">Price: Low to High</option>
                                <option value="price_high">Price: High to Low</option>
                                <option value="time_early">Earliest Departure</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Custom Select Wrapper */}
                        <div className="relative group">
                            <MapPin className="absolute left-3 top-3 text-indigo-400 z-10" size={16} />
                            <select
                                value={filters.fromCity}
                                onChange={(e) => setFilters({ ...filters, fromCity: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-700"
                            >
                                <option value="">From City</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative group">
                            <MapPin className="absolute left-3 top-3 text-violet-400 z-10" size={16} />
                            <select
                                value={filters.toCity}
                                onChange={(e) => setFilters({ ...filters, toCity: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-700"
                            >
                                <option value="">To City</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative group">
                            <Calendar className="absolute left-3 top-3 text-indigo-400 z-10" size={16} />
                            <input
                                type="date"
                                value={filters.date}
                                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all cursor-pointer hover:bg-slate-700 [color-scheme:dark]"
                            />
                        </div>

                        <div className="relative group">
                            <Filter className="absolute left-3 top-3 text-violet-400 z-10" size={16} />
                            <select
                                value={filters.busType}
                                onChange={(e) => setFilters({ ...filters, busType: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-700"
                            >
                                <option value="">All Types</option>
                                {busTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={clearFilters}
                            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl border border-slate-700 transition-all active:scale-95"
                        >
                            Reset
                        </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-sm text-slate-400">
                        <span>
                            <Zap size={14} className="inline mr-1 text-yellow-400" />
                            Instant Booking
                        </span>
                        <span>
                            Found <span className="font-bold text-white">{filteredBuses.length}</span> results
                        </span>
                    </div>
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {[
                        { icon: Shield, title: 'Secure Travel', desc: 'Verified partners & tracking', color: 'indigo' },
                        { icon: Clock, title: 'Punctual', desc: 'On-time guarantee', color: 'violet' },
                        { icon: Star, title: 'Premium Comfort', desc: 'Luxury sleepers & AC', color: 'emerald' },
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:bg-slate-800/80 transition-all hover:border-indigo-500/30 group"
                        >
                            <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-${feature.color}-500/10 group-hover:scale-110 transition-transform`}>
                                <feature.icon className={`text-${feature.color}-400`} size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                            <p className="text-sm text-slate-400">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Bus Cards Grid */}
                <div className="mb-12">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-8 bg-indigo-500 rounded-full"></span>
                        Available Routes
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBuses.map((bus, index) => {
                            const amenities = bus.amenities?.split(',') || [];
                            return (
                                <motion.div
                                    key={bus.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => navigate(`/booking/${bus.id}`)}
                                    className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all cursor-pointer group relative"
                                >
                                    {/* Image Header */}
                                    <div className="h-40 bg-gradient-to-br from-indigo-900 to-slate-900 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700"></div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>

                                        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur px-3 py-1 rounded-full border border-slate-700">
                                            <div className="flex items-center gap-2 text-xs font-semibold">
                                                <span className="text-white">{bus.from_city}</span>
                                                <ArrowRight size={12} className="text-indigo-400" />
                                                <span className="text-white">{bus.to_city}</span>
                                            </div>
                                        </div>

                                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                            <div>
                                                <span className="text-xs font-bold text-indigo-400 bg-indigo-900/30 border border-indigo-500/30 px-2 py-1 rounded mb-1 inline-block">
                                                    {bus.bus_type}
                                                </span>
                                                <h3 className="text-xl font-bold text-white drop-shadow-lg truncate w-48">{bus.name}</h3>
                                            </div>
                                            <div className="bg-yellow-500 text-black font-bold text-xs px-2 py-1 rounded flex items-center gap-1">
                                                4.8 <Star size={10} fill="black" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-slate-300">
                                                    <Clock size={14} className="text-indigo-400" />
                                                    <span className="text-sm font-medium">
                                                        {new Date(bus.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-slate-500 ml-6">
                                                    {new Date(bus.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-white">₹{bus.price}</div>
                                                <div className="text-xs text-slate-500">per seat</div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                                            {amenities.slice(0, 3).map((amenity, i) => {
                                                const Icon = getAmenityIcon(amenity.trim());
                                                return (
                                                    <div key={i} className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-md text-xs text-slate-300 whitespace-nowrap border border-slate-700">
                                                        <Icon size={10} className="text-indigo-400" />
                                                        <span>{amenity.trim()}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Users size={16} className="text-emerald-500" />
                                                <span className={`${(bus.available_seats || 0) < 10 ? 'text-red-400' : 'text-slate-300'}`}>
                                                    {bus.available_seats || bus.total_seats} seats left
                                                </span>
                                            </div>

                                            <button className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors group-hover:scale-105 active:scale-95">
                                                <ArrowRight size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Hover Beam Effect */}
                                    <div className="absolute inset-x-0 h-px bottom-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {filteredBuses.length === 0 && (
                        <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
                            <Search size={48} className="mx-auto text-slate-700 mb-4" />
                            <p className="text-slate-400 text-xl font-semibold">No buses found</p>
                            <p className="text-slate-500 mt-2">Adjust your filters to see more results</p>
                            <button
                                onClick={clearFilters}
                                className="mt-4 px-6 py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
