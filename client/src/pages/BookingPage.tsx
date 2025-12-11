import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { BusWithSeats, Seat } from '../types';
import { useBooking } from '../context/BookingContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, AlertCircle, Calendar, MapPin, Mail, Phone, IndianRupee, Users, Utensils, Zap, Loader2, ArrowRight } from 'lucide-react';

interface PassengerDetail {
    seatNumber: number;
    name: string;
    age: string;
    gender: 'Male' | 'Female' | '';
    meal: 'Veg' | 'Non-Veg' | 'No Meal';
}

const BookingPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { selectedSeats, toggleSeat, clearSelection } = useBooking();

    const [bus, setBus] = useState<BusWithSeats | null>(null);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Contact Details
    const [contactDetails, setContactDetails] = useState({
        email: user?.email || '',
        phone: '',
    });

    // Passenger Details (with gender and meal)
    const [passengers, setPassengers] = useState<PassengerDetail[]>([]);

    useEffect(() => {
        loadBusDetails();
    }, [id]);

    // Update passengers array when selected seats change
    useEffect(() => {
        if (bus) {
            const newPassengers = selectedSeats.map(seatId => {
                const seat = bus.seats.find(s => s.id === seatId);
                const existing = passengers.find(p => p.seatNumber === seat?.seat_number);
                return {
                    seatNumber: seat?.seat_number || 0,
                    name: existing?.name || '',
                    age: existing?.age || '',
                    gender: (existing?.gender || '') as 'Male' | 'Female' | '',
                    meal: existing?.meal || 'No Meal',
                };
            });
            setPassengers(newPassengers);
        }
    }, [selectedSeats, bus]);

    // Update email from auth
    useEffect(() => {
        if (user && !user.isGuest) {
            setContactDetails(prev => ({ ...prev, email: user.email }));
        }
    }, [user]);

    const loadBusDetails = async () => {
        try {
            setLoading(true);
            const data = await api.getBusDetails(Number(id));
            setBus(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        if (!bus) return 0;
        const basePrice = selectedSeats.length * (bus.price || 0);
        const mealPrice = passengers.filter(p => p.meal !== 'No Meal').length * 100; // ₹100 per meal
        return basePrice + mealPrice;
    };

    const updatePassenger = (seatNumber: number, field: keyof PassengerDetail, value: string) => {
        setPassengers(prev =>
            prev.map(p =>
                p.seatNumber === seatNumber ? { ...p, [field]: value } : p
            )
        );
    };

    const handleSeatToggle = (seat: Seat) => {
        if (seat.status !== 'AVAILABLE') return;

        // If trying to select a women-only seat
        if (seat.is_women_only && !selectedSeats.includes(seat.id)) {
            const allPassengersFemale = passengers.every(p => !p.gender || p.gender === 'Female');
            if (!allPassengersFemale && passengers.length > 0) {
                setError('Women-only seats can only be booked for female passengers. Please select female gender for all passengers.');
                return;
            }
        }

        toggleSeat(seat.id);
        setError(null);
    };

    const handleBooking = async () => {
        if (selectedSeats.length === 0) {
            setError('Please select at least one seat');
            return;
        }

        // Validate all passenger details
        const invalidPassengers = passengers.filter(p => !p.name || !p.age || !p.gender);
        if (invalidPassengers.length > 0) {
            setError('Please fill in name, age, and gender for all passengers');
            return;
        }

        // Validate women-only seats
        const womenOnlySeats = bus?.seats.filter(s => selectedSeats.includes(s.id) && s.is_women_only);
        if (womenOnlySeats && womenOnlySeats.length > 0) {
            const nonFemalePassengers = passengers.filter(p => p.gender !== 'Female');
            if (nonFemalePassengers.length > 0) {
                setError('Women-only seats can only be booked for female passengers');
                return;
            }
        }

        // Validate ages
        const invalidAges = passengers.filter(p => parseInt(p.age) < 1 || parseInt(p.age) > 120);
        if (invalidAges.length > 0) {
            setError('Please enter valid ages (1-120)');
            return;
        }

        if (!contactDetails.email || !contactDetails.phone) {
            setError('Please provide contact email and phone number');
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(contactDetails.email)) {
            setError('Please enter a valid email address');
            return;
        }

        if (!/^\d{10}$/.test(contactDetails.phone)) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        try {
            setBooking(true);
            setError(null);
            await api.createBooking(Number(id), selectedSeats, passengers);
            setSuccess(true);
            await loadBusDetails(); // Refresh to show booked seats immediately
            clearSelection();

            setContactDetails({ email: user?.email || '', phone: '' });
            setPassengers([]);

            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err: any) {
            if (err.response?.data?.error?.includes('not available')) {
                setError('⚠️ Seats were just booked by another user. Please select different seats.');
            } else {
                setError(err.response?.data?.error || 'Booking failed');
            }
            loadBusDetails();
            clearSelection();
        } finally {
            setBooking(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500 w-12 h-12" />
            </div>
        );
    }

    if (!bus) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <p className="text-slate-500 text-xl">Bus not found</p>
                <button
                    onClick={() => navigate('/')}
                    className="ml-4 text-indigo-400 hover:text-indigo-300 underline"
                >
                    Go Home
                </button>
            </div>
        );
    }

    const totalPrice = calculateTotal();
    const mealCount = passengers.filter(p => p.meal !== 'No Meal').length;

    return (
        <div className="min-h-screen bg-slate-950 py-8 px-4 text-slate-100">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-slate-900/80 backdrop-blur rounded-xl border border-slate-800 p-6 mb-8 shadow-2xl">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/')}
                            className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all group border border-slate-700"
                        >
                            <ArrowLeft size={24} className="text-slate-400 group-hover:text-white" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white mb-2">{bus.name}</h1>
                            <div className="flex items-center gap-6 text-sm text-slate-400">
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-indigo-400" />
                                    <span className="font-medium text-slate-200">{bus.from_city}</span>
                                    <span className="text-slate-600">→</span>
                                    <span className="font-medium text-slate-200">{bus.to_city}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-indigo-400" />
                                    {new Date(bus.start_time).toLocaleString()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Zap size={16} className="text-yellow-400" />
                                    {bus.bus_type}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                {success && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-6 p-4 bg-emerald-900/20 border border-emerald-500/50 rounded-lg flex items-center gap-3 backdrop-blur-md"
                    >
                        <CheckCircle2 className="text-emerald-400" />
                        <div>
                            <span className="text-emerald-300 font-bold text-lg">Booking confirmed!</span>
                            <p className="text-sm text-emerald-400/80 mt-1">Tickets have been sent to {contactDetails.email}</p>
                        </div>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-3 backdrop-blur-md"
                    >
                        <AlertCircle className="text-red-400" />
                        <span className="text-red-300 font-medium">{error}</span>
                    </motion.div>
                )}

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left - Seat Selection */}
                    <div className="lg:col-span-2">
                        <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-8 mb-6 relative overflow-hidden">
                            {/* Ambient background glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -z-10"></div>

                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <span className="w-1 h-8 bg-indigo-500 rounded-full"></span>
                                Select Your Seats
                            </h2>

                            {/* Driver */}
                            <div className="mb-8 flex justify-end px-12">
                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 border border-slate-700 shadow-inner">
                                    <img src="https://cdn-icons-png.flaticon.com/512/5351/5351194.png" className="w-8 h-8 opacity-50 grayscale" alt="steering" />
                                </div>
                            </div>

                            {/* Seats Grid */}
                            <div className="grid grid-cols-4 gap-4 max-w-sm mx-auto mb-10">
                                {bus.seats.map((seat) => (
                                    <SeatButton
                                        key={seat.id}
                                        seat={seat}
                                        isSelected={selectedSeats.includes(seat.id)}
                                        onToggle={() => handleSeatToggle(seat)}
                                    />
                                ))}
                            </div>

                            {/* Legend */}
                            <div className="flex gap-6 justify-center flex-wrap border-t border-slate-800 pt-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-slate-800 border border-slate-600 rounded-lg shadow-sm"></div>
                                    <span className="text-slate-400">Available</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-pink-900/40 border border-pink-500/50 rounded-lg shadow-inner"></div>
                                    <span className="text-pink-300">Women Only</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.5)] rounded-lg"></div>
                                    <span className="text-indigo-300 font-bold">Selected</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-slate-800 opacity-50 cursor-not-allowed rounded-lg"></div>
                                    <span className="text-slate-600">Booked</span>
                                </div>
                            </div>
                        </div>

                        {/* Passenger Details */}
                        <AnimatePresence>
                            {selectedSeats.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-8"
                                >
                                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                        <Users size={24} className="text-indigo-400" />
                                        Passenger Details
                                    </h2>

                                    <div className="space-y-6">
                                        {passengers.map((passenger) => (
                                            <div key={passenger.seatNumber} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white shadow-lg ${bus.seats.find(s => s.seat_number === passenger.seatNumber)?.is_women_only
                                                        ? 'bg-pink-600 shadow-pink-500/30'
                                                        : 'bg-indigo-600 shadow-indigo-500/30'
                                                        }`}>
                                                        {passenger.seatNumber}
                                                    </div>
                                                    <span className="font-semibold text-slate-200">
                                                        Seat {passenger.seatNumber}
                                                        {bus.seats.find(s => s.seat_number === passenger.seatNumber)?.is_women_only && (
                                                            <span className="ml-2 text-xs bg-pink-900/30 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded-full">Women Only</span>
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Name</label>
                                                        <input
                                                            type="text"
                                                            value={passenger.name}
                                                            onChange={(e) => updatePassenger(passenger.seatNumber, 'name', e.target.value)}
                                                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                                            placeholder="Enter full name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Age</label>
                                                        <input
                                                            type="number"
                                                            value={passenger.age}
                                                            onChange={(e) => updatePassenger(passenger.seatNumber, 'age', e.target.value)}
                                                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                                            placeholder="Age"
                                                            min="1"
                                                            max="120"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Gender</label>
                                                        <select
                                                            value={passenger.gender}
                                                            onChange={(e) => updatePassenger(passenger.seatNumber, 'gender', e.target.value)}
                                                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                                        >
                                                            <option value="">Select Gender</option>
                                                            <option value="Male">Male</option>
                                                            <option value="Female">Female</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                                                            <Utensils size={12} className="inline mr-1" />
                                                            Add Meal (+₹100)
                                                        </label>
                                                        <select
                                                            value={passenger.meal}
                                                            onChange={(e) => updatePassenger(passenger.seatNumber, 'meal', e.target.value)}
                                                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                                        >
                                                            <option value="No Meal">No Meal</option>
                                                            <option value="Veg">Veg Meal</option>
                                                            <option value="Non-Veg">Non-Veg Meal</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right - Contact & Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-white mb-6">Contact & Payment</h2>

                            <div className="space-y-5 mb-8">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3 top-3.5 text-slate-500" />
                                        <input
                                            type="email"
                                            value={contactDetails.email}
                                            onChange={(e) => setContactDetails({ ...contactDetails, email: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                            placeholder="john@example.com"
                                            disabled={!!user && !user.isGuest}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <Phone size={16} className="absolute left-3 top-3.5 text-slate-500" />
                                        <input
                                            type="tel"
                                            value={contactDetails.phone}
                                            onChange={(e) => setContactDetails({ ...contactDetails, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                            placeholder="9876543210"
                                            maxLength={10}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="border-t border-slate-800 pt-6 mb-6">
                                <h3 className="font-bold text-slate-200 mb-4">Fare Breakdown</h3>

                                <div className="space-y-3 text-sm mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Seats ({passengers.length})</span>
                                        <span className="font-medium text-slate-200">₹{(bus.price || 0) * passengers.length}</span>
                                    </div>
                                    {mealCount > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Meals ({mealCount})</span>
                                            <span className="font-medium text-slate-200">₹{mealCount * 100}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Tax & Fees</span>
                                        <span className="font-medium text-slate-200">₹0</span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-indigo-900/40 to-violet-900/40 border border-indigo-500/20 rounded-xl p-4 mb-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-indigo-200">Total Payable</span>
                                        <div className="flex items-center gap-1">
                                            <IndianRupee size={20} className="text-indigo-400" />
                                            <span className="text-3xl font-bold text-indigo-400">{totalPrice}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleBooking}
                                disabled={
                                    selectedSeats.length === 0 ||
                                    booking ||
                                    passengers.some(p => !p.name || !p.age || !p.gender) ||
                                    !contactDetails.email ||
                                    !contactDetails.phone
                                }
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 flex items-center justify-center gap-2"
                            >
                                {booking ? (
                                    <>
                                        <Loader2 className="animate-spin" /> Processing...
                                    </>
                                ) : (
                                    <>
                                        Confirm Booking <ArrowRight size={20} />
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-slate-500 text-center mt-4">
                                Secure Payment • Instant Ticket
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Seat Button Component
const SeatButton: React.FC<{
    seat: Seat;
    isSelected: boolean;
    onToggle: () => void;
}> = ({ seat, isSelected, onToggle }) => {
    const isBooked = seat.status === 'BOOKED';
    const isWomenOnly = seat.is_women_only === 1;
    const isBookedByFemale = seat.booked_by_gender === 'Female';

    let seatClass = "bg-slate-800 text-slate-400 border border-slate-600 hover:bg-slate-700 hover:border-slate-500"; // Available

    if (isBooked) {
        if (isBookedByFemale) {
            seatClass = "bg-pink-900/20 text-pink-700 border border-pink-900/30 cursor-not-allowed opacity-50";
        } else {
            seatClass = "bg-slate-800 text-slate-600 cursor-not-allowed opacity-30";
        }
    } else if (isSelected) {
        seatClass = "bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.6)] border-transparent scale-105 z-10 Ring-2 ring-indigo-400/50";
    } else if (isWomenOnly) {
        seatClass = "bg-pink-900/20 text-pink-400 border border-pink-500/30 hover:bg-pink-900/40 hover:border-pink-500/50";
    }

    return (
        <motion.button
            whileHover={!isBooked ? { scale: 1.1 } : {}}
            whileTap={!isBooked ? { scale: 0.95 } : {}}
            onClick={() => !isBooked && onToggle()}
            disabled={isBooked}
            className={`
                h-14 rounded-xl font-bold text-sm transition-all duration-300 relative
                ${seatClass}
            `}
        >
            {seat.seat_number}
            {/* Glow effect for selected */}
            {isSelected && <div className="absolute inset-0 bg-indigo-400/20 blur-md rounded-xl"></div>}
        </motion.button>
    );
};

export default BookingPage;
