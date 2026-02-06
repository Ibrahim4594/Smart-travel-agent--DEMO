"use client";

import { useEffect, useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker, Polyline } from "@react-google-maps/api";
import { DayItinerary, Place } from "@/types";

interface MapPanelProps {
    itinerary: DayItinerary[];
    isLoading: boolean;
    onPlaceClick: (place: Place) => void;
}

const containerStyle = {
    width: "100%",
    height: "100%",
};

const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    styles: [
        {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
        },
        {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#e9e9e9" }, { lightness: 17 }],
        },
        {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }, { lightness: 20 }],
        }
    ],
};

const DAY_COLORS = [
    "#3b82f6", // primary-500
    "#8b5cf6", // accent-500
    "#10b981", // emerald-500
    "#f59e0b", // amber-500
    "#ef4444", // red-500
];

export default function MapPanel({ itinerary, isLoading, onPlaceClick }: MapPanelProps) {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "", // Use env var if available
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map: google.maps.Map) {
        setMap(null);
    }, []);

    // Center map when itinerary changes
    useEffect(() => {
        if (map && itinerary.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            let hasPoints = false;
            itinerary.forEach((day) => {
                day.places.forEach((place) => {
                    bounds.extend({ lat: place.lat, lng: place.lng });
                    hasPoints = true;
                });
            });
            if (hasPoints) {
                map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 } as google.maps.Padding);
            }
        }
    }, [map, itinerary]);

    if (!isLoaded) return <div className="h-full w-full bg-slate-100 flex items-center justify-center">Loading Map...</div>;

    const center = itinerary.length > 0 && itinerary[0].places.length > 0
        ? { lat: itinerary[0].places[0].lat, lng: itinerary[0].places[0].lng }
        : { lat: 0, lng: 0 };

    return (
        <div className="h-full w-full relative">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={12}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={mapOptions}
            >
                {itinerary.map((day, dayIdx) => (
                    <div key={`day-${day.day}`}>
                        {day.places.map((place, placeIdx) => (
                            <Marker
                                key={`${day.day}-${place.placeId}-${placeIdx}`}
                                position={{ lat: place.lat, lng: place.lng }}
                                label={{
                                    text: `${day.day}`,
                                    color: "white",
                                    fontWeight: "900",
                                    fontSize: "12px"
                                }}
                                icon={{
                                    path: "M 0,-10 C -5.523,0 -10,4.477 -10,10 C -10,15.523 -5.523,20 0,20 C 5.523,20 10,15.523 10,10 C 10,4.477 5.523,0 0,-10 Z",
                                    fillColor: DAY_COLORS[dayIdx % DAY_COLORS.length],
                                    fillOpacity: 1,
                                    strokeWeight: 2,
                                    strokeColor: "#ffffff",
                                    scale: 1,
                                    anchor: new window.google.maps.Point(0, 0),
                                    labelOrigin: new window.google.maps.Point(0, 5)
                                }}
                                onClick={() => onPlaceClick(place)}
                            />
                        ))}

                        {day.routePolyline && (
                            <Polyline
                                path={decodePolyline(day.routePolyline)}
                                options={{
                                    strokeColor: DAY_COLORS[dayIdx % DAY_COLORS.length],
                                    strokeOpacity: 0.5,
                                    strokeWeight: 5,
                                    geodesic: true,
                                }}
                            />
                        )}
                    </div>
                ))}
            </GoogleMap>
        </div>
    );
}


/**
 * Utility to decode Google's polyline algorithm
 */
function decodePolyline(encoded: string) {
    if (!encoded) return [];
    const poly = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
        let b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        poly.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }
    return poly;
}
