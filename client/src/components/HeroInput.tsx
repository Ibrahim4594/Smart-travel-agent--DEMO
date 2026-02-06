"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, DollarSign, Tag, Send, Plane, Compass, Map as MapIcon, Star } from "lucide-react";

interface HeroInputProps {
    onGenerate: (data: any) => void;
    isLoading: boolean;
}

const INTERESTS = [
    { id: "food", label: "Gourmet", icon: "🍱" },
    { id: "history", label: "Culture", icon: "🏛️" },
    { id: "nature", label: "Outdoor", icon: "🏔️" },
    { id: "shopping", label: "Luxury", icon: "💎" },
    { id: "art", label: "Creative", icon: "🎨" },
    { id: "nightlife", label: "Nightlife", icon: "🌃" },
];

const BUDGETS = [
    { id: "low", label: "Eco", desc: "Budget friendly" },
    { id: "medium", label: "Standard", desc: "Premium comfort" },
    { id: "luxury", label: "Elite", desc: "Luxury travel" },
];

export default function HeroInput({ onGenerate, isLoading }: HeroInputProps) {
    const [destination, setDestination] = useState("");
    const [days, setDays] = useState(3);
    const [budget, setBudget] = useState("medium");
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

    const toggleInterest = (id: string) => {
        setSelectedInterests((prev: string[]) =>
            prev.includes(id) ? prev.filter((i: string) => i !== id) : [...prev, id]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate({ destination, days, budget, interests: selectedInterests });
    };

    return (
        <div className="w-full max-w-5xl flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
            {/* Left Side: Visual/Hero */}
            <div className="md:w-[40%] bg-gradient-premium p-12 text-white flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] opacity-10 rotate-12">
                    <Plane size={300} strokeWidth={0.5} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-8 bg-white/10 backdrop-blur-md w-fit px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                        <Compass size={14} className="text-white" />
                        Next-Gen Explorer
                    </div>
                    <h1 className="text-5xl font-black mb-4 leading-[1.1]">
                        AI Driven <br /> <span className="text-white/70 tracking-tight">Travel.</span>
                    </h1>
                    <p className="text-white/80 text-lg leading-relaxed max-w-[280px]">
                        The enterprise standard in personalized itinerary design.
                    </p>
                </div>

                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-4 group cursor-default">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                            <MapIcon size={20} />
                        </div>
                        <div>
                            <div className="font-bold text-sm">Perfect Clusters</div>
                            <div className="text-white/60 text-xs">AI-optimized routing.</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group cursor-default">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                            <Star size={20} />
                        </div>
                        <div>
                            <div className="font-bold text-sm">Top Tier Rankings</div>
                            <div className="text-white/60 text-xs">Weighted review analysis.</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 p-8 md:p-12">
                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="space-y-8">
                        {/* Destination & Days */}
                        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Destination</label>
                                <div className="relative">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-500" size={20} />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Paris, Tokyo, Mars..."
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl font-bold text-slate-800 dark:text-white outline-none focus:ring-2 ring-primary-500 transition-all border border-slate-100 dark:border-slate-800"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</label>
                                <div className="relative">
                                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-500" size={20} />
                                    <input
                                        type="number"
                                        min="1"
                                        max="14"
                                        required
                                        value={days}
                                        onChange={(e) => setDays(parseInt(e.target.value))}
                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl font-bold text-slate-800 dark:text-white outline-none focus:ring-2 ring-primary-500 transition-all border border-slate-100 dark:border-slate-800"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Budget Selection */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expediture Class</label>
                            <div className="grid grid-cols-3 gap-4">
                                {BUDGETS.map((b) => (
                                    <button
                                        key={b.id}
                                        type="button"
                                        onClick={() => setBudget(b.id)}
                                        className={`p-4 rounded-2xl border transition-all text-center group ${budget === b.id
                                            ? "border-primary-500 bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                                            : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 hover:border-primary-200"
                                            }`}
                                    >
                                        <div className="font-bold text-sm">{b.label}</div>
                                        <div className={`text-[10px] ${budget === b.id ? "text-white/70" : "text-slate-400"}`}>{b.desc.split(' ')[0]}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Interests Tags */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Activity Focus</label>
                            <div className="flex flex-wrap gap-3">
                                {INTERESTS.map((interest) => (
                                    <button
                                        key={interest.id}
                                        type="button"
                                        onClick={() => toggleInterest(interest.id)}
                                        className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 border ${selectedInterests.includes(interest.id)
                                            ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg"
                                            : "bg-white dark:bg-slate-950/30 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300"
                                            }`}
                                    >
                                        <span>{interest.icon}</span>
                                        {interest.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !destination}
                        className="w-full py-6 bg-gradient-premium text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40 transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Send size={18} />
                                Initialize Generation
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

