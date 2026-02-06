// Type definitions for the Smart Travel Planner

export interface Place {
    name: string;
    placeId: string;
    lat: number;
    lng: number;
    type: string;
    rating: number;
    userRatingsTotal: number;
    priceLevel: number;
    photo: string;
    address: string;
    openingHours?: string[];
    website?: string;
    phone?: string;
}

export interface DayItinerary {
    day: number;
    places: Place[];
    routePolyline?: string;
}

export interface TripResponse {
    trip: {
        destination: string;
        destinationLat: number;
        destinationLng: number;
        days: DayItinerary[];
    };
}

export interface TripRequest {
    destination: string;
    days: number;
    budget: 'low' | 'medium' | 'luxury';
    interests: string[];
}

export interface PlaceSearchResult {
    name: string;
    place_id: string;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
    rating?: number;
    user_ratings_total?: number;
    price_level?: number;
    photos?: { photo_reference: string }[];
    vicinity?: string;
    formatted_address?: string;
    types?: string[];
}
