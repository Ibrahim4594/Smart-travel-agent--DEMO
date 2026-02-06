import { TripResponse, DayItinerary, Place } from "@/types";
import { MapPin, Star, Globe, ArrowLeft, Info, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface ItineraryPanelProps {
    data: TripResponse | null;
    isLoading: boolean;
    onReset: () => void;
    onPlaceClick: (place: Place) => void;
}

export default function ItineraryPanel({ data, isLoading, onReset, onPlaceClick }: ItineraryPanelProps) {
    if (isLoading) {
        return <ItinerarySkeleton />;
    }

    if (!data) return null;

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-20">
                <button
                    onClick={onReset}
                    className="flex items-center text-xs font-bold uppercase tracking-widest text-primary-600 hover:text-primary-700 mb-4 transition-all group"
                >
                    <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> New Trip
                </button>
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {data.destination}
                        </h2>
                        <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm">
                            <Calendar size={14} />
                            <span>{data.days.length} Days Itinerary</span>
                        </div>
                    </div>
                    <div className="p-3 bg-primary-600 rounded-2xl text-white shadow-lg shadow-primary-500/30">
                        <Globe size={24} />
                    </div>
                </div>
            </div>

            {/* Days List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-12 hide-scrollbar">
                {data.days.map((day, idx) => (
                    <motion.div
                        key={day.day}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-black text-lg shadow-xl">
                                {day.day}
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-wider dark:text-white">Day {day.day}</h3>
                        </div>

                        <div className="space-y-4">
                            {day.places.map((place, pIdx) => (
                                <PlaceCard
                                    key={`${place.placeId}-${pIdx}`}
                                    place={place}
                                    index={pIdx}
                                    onClick={() => onPlaceClick(place)}
                                />
                            ))}
                        </div>
                    </motion.div>
                ))}

                {/* Footer Spacer */}
                <div className="h-20" />
            </div>
        </div>
    );
}

function PlaceCard({ place, index, onClick }: { place: Place; index: number; onClick: () => void }) {
    const timeLabels = ["Morning", "Afternoon", "Evening"];
    const colors = ["bg-amber-500", "bg-sky-500", "bg-indigo-600"];

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="group relative bg-white dark:bg-slate-800/50 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-900/50 transition-all duration-300 shadow-sm hover:shadow-xl cursor-pointer"
            onClick={onClick}
        >
            <div className="flex h-32">
                {/* Photo Section */}
                <div className="w-32 h-full relative overflow-hidden shrink-0">
                    <img
                        src={place.photo}
                        alt={place.name}
                        className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                </div>

                {/* Content Section */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${colors[index % 3]}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {timeLabels[index] || "Discover"}
                            </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary-600 transition-colors">
                            {place.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1">
                            <div className="flex items-center text-xs font-bold text-amber-500">
                                <Star size={10} fill="currentColor" className="mr-0.5" />
                                {place.rating}
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">({place.userRatingsTotal} reviews)</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-bold">
                        <div className="flex items-center text-slate-400">
                            <MapPin size={10} className="mr-1" />
                            <span className="line-clamp-1">{place.address.split(',')[0]}</span>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-primary-600 flex items-center gap-0.5">
                            Details <Info size={10} />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function ItinerarySkeleton() {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 p-6 space-y-12 animate-pulse">
            <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl mb-8" />
            {[1, 2].map((i) => (
                <div key={i} className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800" />
                        <div className="h-6 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                    </div>
                    <div className="space-y-4">
                        {[1, 2].map((j) => (
                            <div key={j} className="h-32 bg-slate-50 dark:bg-slate-800/30 rounded-3xl" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

