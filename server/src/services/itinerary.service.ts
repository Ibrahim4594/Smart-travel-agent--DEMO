import { TripRequest, DayItinerary, Place } from '../types';
import {
    searchPlaces,
    geocodeDestination,
    getPlaceTypesForInterest,
} from './places.service';
import { getDirections } from './directions.service';

interface Trip {
    destination: string;
    destinationLat: number;
    destinationLng: number;
    days: DayItinerary[];
}

/**
 * Generate a complete trip itinerary
 */
export async function generateItinerary(request: TripRequest): Promise<Trip> {
    const { destination, days, budget, interests } = request;

    // Get destination coordinates
    const coords = await geocodeDestination(destination);
    if (!coords) {
        throw new Error(`Could not find location: ${destination}`);
    }

    console.log(`📍 Found ${destination} at ${coords.lat}, ${coords.lng}`);

    // Determine price range based on budget
    const priceRange = getPriceRange(budget);

    // Generate itinerary for each day
    const dayItineraries: DayItinerary[] = [];

    for (let day = 1; day <= days; day++) {
        console.log(`📅 Generating Day ${day}...`);
        const places = await generateDayPlan(coords, interests, priceRange, day);

        // Get route for the day if there are multiple places
        let routePolyline = '';
        if (places.length > 1) {
            const origin = { lat: places[0].lat, lng: places[0].lng };
            const destination = { lat: places[places.length - 1].lat, lng: places[places.length - 1].lng };
            const waypoints = places.slice(1, -1).map(p => ({ lat: p.lat, lng: p.lng }));

            const polyline = await getDirections(origin, destination, waypoints);
            if (polyline) routePolyline = polyline;
        }

        dayItineraries.push({
            day,
            places,
            routePolyline,
        });
    }

    return {
        destination,
        destinationLat: coords.lat,
        destinationLng: coords.lng,
        days: dayItineraries,
    };
}

/**
 * Generate a single day's plan with morning, afternoon, and evening activities
 */
async function generateDayPlan(
    coords: { lat: number; lng: number },
    interests: string[],
    priceRange: { min: number; max: number },
    dayNumber: number
): Promise<Place[]> {
    const places: Place[] = [];
    const usedPlaceIds = new Set<string>();

    // Morning: Tourist attraction or activity based on interests
    const morningTypes = interests.length > 0
        ? getPlaceTypesForInterest(interests[dayNumber % interests.length] || interests[0])
        : ['tourist_attraction', 'museum'];

    const morningPlaces = await searchPlaces(
        coords.lat,
        coords.lng,
        morningTypes[0],
        undefined,
        priceRange.min,
        priceRange.max
    );

    const morningPlace = selectBestPlace(morningPlaces, usedPlaceIds);
    if (morningPlace) {
        places.push({ ...morningPlace, type: 'morning_activity' });
        usedPlaceIds.add(morningPlace.placeId);
    }

    // Afternoon: Landmark, park, or secondary interest - Cluster around morning spot
    const afternoonInterest = interests[(dayNumber + 1) % Math.max(interests.length, 1)] || 'nature';
    const afternoonTypes = getPlaceTypesForInterest(afternoonInterest);

    const afternoonPlaces = await searchPlaces(
        coords.lat,
        coords.lng,
        afternoonTypes[0] || 'point_of_interest',
        undefined,
        priceRange.min,
        priceRange.max
    );

    const afternoonPlace = selectBestPlace(
        afternoonPlaces,
        usedPlaceIds,
        morningPlace ? { lat: morningPlace.lat, lng: morningPlace.lng } : undefined
    );

    if (afternoonPlace) {
        places.push({ ...afternoonPlace, type: 'afternoon_activity' });
        usedPlaceIds.add(afternoonPlace.placeId);
    }

    // Evening: Restaurant or cafe - Cluster around afternoon spot
    const eveningPlaces = await searchPlaces(
        coords.lat,
        coords.lng,
        'restaurant',
        interests.includes('food') ? 'fine dining' : undefined,
        priceRange.min,
        priceRange.max
    );

    const eveningPlace = selectBestPlace(
        eveningPlaces,
        usedPlaceIds,
        afternoonPlace ? { lat: afternoonPlace.lat, lng: afternoonPlace.lng } : undefined
    );

    if (eveningPlace) {
        places.push({ ...eveningPlace, type: 'evening_dining' });
        usedPlaceIds.add(eveningPlace.placeId);
    }

    return places;
}

/**
 * Select the best place from a list, optionally considering proximity to a reference point
 */
function selectBestPlace(
    places: Place[],
    usedIds: Set<string>,
    referenceCoords?: { lat: number; lng: number }
): Place | null {
    // Calculate a weighted score for each place: (Rating * 0.7) + (log10(Reviews) * 0.3)
    // Also apply a proximity penalty if referenceCoords is provided
    const scoredPlaces = places
        .filter((p) => !usedIds.has(p.placeId))
        .map((p) => {
            const score = (p.rating * 0.7) + (Math.log10(p.userRatingsTotal + 1) * 0.3);

            let proximityBoost = 0;
            if (referenceCoords) {
                const distance = calculateDistance(
                    referenceCoords.lat,
                    referenceCoords.lng,
                    p.lat,
                    p.lng
                );
                // Boost places closer to the reference point (inverse distance)
                // Normalize distance roughly to 0.1-1.0 range for common city distances
                proximityBoost = 1 / (distance + 1);
            }

            return {
                place: p,
                finalScore: score + (proximityBoost * 2) // Proximity is highly valued for routing
            };
        })
        .sort((a, b) => b.finalScore - a.finalScore);

    return scoredPlaces[0]?.place || null;
}

/**
 * Simple Haversine distance calculation (approximate)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Get price range based on budget type
 */
function getPriceRange(budget: 'low' | 'medium' | 'luxury'): { min: number; max: number } {
    switch (budget) {
        case 'low':
            return { min: 0, max: 1 };
        case 'medium':
            return { min: 1, max: 2 };
        case 'luxury':
            return { min: 2, max: 4 };
        default:
            return { min: 0, max: 4 };
    }
}
