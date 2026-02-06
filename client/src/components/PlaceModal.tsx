"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Globe, Phone, MapPin, Star, Clock, ExternalLink } from "lucide-react";
import { Place } from "@/types";
import Image from "next/image";

interface PlaceModalProps {
    place: Place | null;
    onClose: () => void;
}

export default function PlaceModal({ place, onClose }: PlaceModalProps) {
    if (!place) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Image */}
                    <div className="relative h-64 w-full">
                        <Image
                            src={place.photo}
                            alt={place.name}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <div className="absolute bottom-6 left-6 right-6">
                            <h2 className="text-3xl font-bold text-white mb-2">{place.name}</h2>
                            <div className="flex items-center gap-4 text-white/90">
                                <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-lg backdrop-blur-md">
                                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm font-semibold">{place.rating}</span>
                                    <span className="text-xs opacity-70">({place.userRatingsTotal})</span>
                                </div>
                                <div className="text-sm opacity-80">{place.type.replace(/_/g, " ")}</div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-primary-600">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Address</div>
                                        <p className="text-sm dark:text-slate-300">{place.address}</p>
                                    </div>
                                </div>

                                {place.phone && (
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-accent-50 dark:bg-accent-900/30 rounded-lg text-accent-600">
                                            <Phone size={18} />
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Phone</div>
                                            <p className="text-sm dark:text-slate-300">{place.phone}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                {place.website && (
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                                            <Globe size={18} />
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Website</div>
                                            <a
                                                href={place.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                                            >
                                                Visit Website <ExternalLink size={12} />
                                            </a>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600">
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Opening Hours</div>
                                        <p className="text-sm dark:text-slate-300 italic">Available on website</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 active:scale-95"
                            >
                                Return to Itinerary
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
