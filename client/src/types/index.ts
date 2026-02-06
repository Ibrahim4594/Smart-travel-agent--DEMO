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
    phone?: string;
    website?: string;
}

export interface DayItinerary {
    day: number;
    places: Place[];
    routePolyline?: string;
}

export interface TripResponse {
    destination: string;
    destinationLat: number;
    destinationLng: number;
    days: DayItinerary[];
}

