"use client";

import { useState } from "react";
import HeroInput from "@/components/HeroInput";
import ItineraryPanel from "@/components/ItineraryPanel";
import MapPanel from "@/components/MapPanel";
import PlaceModal from "@/components/PlaceModal";
import { TripResponse, Place } from "@/types";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
    const [tripData, setTripData] = useState<TripResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

    const handleGenerate = async (data: any) => {
        setIsLoading(true);
        setTripData(null);
        try {
            const response = await fetch("http://localhost:5000/api/trip", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await response.json();

            if (result.error) {
                alert(result.message || result.error);
                return;
            }

            setTripData(result.trip);
        } catch (error) {
            console.error("Error generating trip:", error);
            alert("Failed to generate trip. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="h-screen bg-slate-50 flex overflow-hidden">
            <AnimatePresence mode="wait">
                {!tripData && !isLoading ? (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="w-full flex items-center justify-center p-4 md:p-8 overflow-y-auto"
                    >
                        <HeroInput onGenerate={handleGenerate} isLoading={isLoading} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col md:flex-row h-full w-full"
                    >
                        {/* Left Side: Itinerary */}
                        <div className="w-full md:w-[450px] h-[50vh] md:h-full z-10 glass border-r border-slate-200/50 flex flex-col shadow-2xl overflow-hidden">
                            <ItineraryPanel
                                data={tripData}
                                isLoading={isLoading}
                                onReset={() => setTripData(null)}
                                onPlaceClick={setSelectedPlace}
                            />
                        </div>

                        {/* Right Side: Map */}
                        <div className="flex-1 h-[50vh] md:h-full relative">
                            <MapPanel
                                itinerary={tripData?.days || []}
                                isLoading={isLoading}
                                onPlaceClick={setSelectedPlace}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <PlaceModal
                place={selectedPlace}
                onClose={() => setSelectedPlace(null)}
            />
        </main>
    );
}

