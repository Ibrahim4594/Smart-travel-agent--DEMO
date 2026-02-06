import { Place, PlaceSearchResult } from '../types';

const PLACES_API_BASE = 'https://maps.googleapis.com/maps/api/place';

/**
 * Search for places near a location based on type and preferences
 */
export async function searchPlaces(
    lat: number,
    lng: number,
    type: string,
    keyword?: string,
    minPrice?: number,
    maxPrice?: number
): Promise<Place[]> {
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    try {
        const params = new URLSearchParams({
            location: `${lat},${lng}`,
            radius: '5000',
            type: type,
            key: GOOGLE_API_KEY!,
        });

        if (keyword) {
            params.append('keyword', keyword);
        }
        if (minPrice !== undefined) {
            params.append('minprice', minPrice.toString());
        }
        if (maxPrice !== undefined) {
            params.append('maxprice', maxPrice.toString());
        }

        const response = await fetch(
            `${PLACES_API_BASE}/nearbysearch/json?${params}`
        );
        const data = (await response.json()) as any;

        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            console.error('Places API error:', data.status, data.error_message || '');
            console.log('Full response from Standard Places API:', JSON.stringify(data, null, 2));

            // Try New Places API as fallback
            console.log('Attempting fallback to Places API (New) for search...');
            try {
                const newRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': GOOGLE_API_KEY!,
                        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.types,places.photos,places.internationalPhoneNumber,places.websiteUri'
                    },
                    body: JSON.stringify({
                        textQuery: keyword ? `${keyword} in ${type}` : type,
                        pageSize: 20,
                        locationBias: {
                            circle: {
                                center: { latitude: lat, longitude: lng },
                                radius: 5000.0
                            }
                        }
                    })
                });
                const newData = (await newRes.json()) as any;
                if (newRes.status !== 200) {
                    console.error('Places API (New) error status:', newRes.status);
                    console.log('Full response from Places API (New):', JSON.stringify(newData, null, 2));
                    return [];
                }

                if (newData.places && newData.places.length > 0) {
                    return newData.places.map((p: any) => ({
                        name: p.displayName?.text || 'Unknown',
                        placeId: p.id,
                        lat: p.location.latitude,
                        lng: p.location.longitude,
                        type: p.types?.[0] || type,
                        rating: p.rating || 0,
                        userRatingsTotal: p.userRatingCount || 0,
                        priceLevel: p.priceLevel === 'PRICE_LEVEL_INEXPENSIVE' ? 1 : p.priceLevel === 'PRICE_LEVEL_MODERATE' ? 2 : p.priceLevel === 'PRICE_LEVEL_EXPENSIVE' ? 3 : 0,
                        photo: p.photos?.[0]?.name
                            ? `https://places.googleapis.com/v1/${p.photos[0].name}/media?maxHeightPx=800&maxWidthPx=800&key=${GOOGLE_API_KEY}`
                            : '/placeholder-image.jpg',
                        address: p.formattedAddress || '',
                        phone: p.internationalPhoneNumber,
                        website: p.websiteUri
                    }));
                }
            } catch (newErr) {
                console.error('Places API (New) search fallback failed:', newErr);
            }

            return [];
        }

        return (data.results || []).slice(0, 10).map((place: PlaceSearchResult) => ({
            name: place.name,
            placeId: place.place_id,
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
            type: place.types?.[0] || type,
            rating: place.rating || 0,
            userRatingsTotal: place.user_ratings_total || 0,
            priceLevel: place.price_level || 0,
            photo: place.photos?.[0]?.photo_reference
                ? getPhotoUrl(place.photos[0].photo_reference)
                : '/placeholder-image.jpg',
            address: place.vicinity || place.formatted_address || '',
        }));
    } catch (error) {
        console.error('Error searching places:', error);
        return [];
    }
}

/**
 * Get coordinates for a destination using Geocoding API
 */
export async function geocodeDestination(
    destination: string
): Promise<{ lat: number; lng: number } | null> {
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    try {
        // Using Find Place from Text (part of Places API) instead of Geocoding API
        // as it's more likely to be enabled for a "Places" project.
        const params = new URLSearchParams({
            input: destination,
            inputtype: 'textquery',
            fields: 'geometry',
            key: GOOGLE_API_KEY!,
        });

        const response = await fetch(
            `${PLACES_API_BASE}/findplacefromtext/json?${params}`
        );
        const data = (await response.json()) as any;

        if (data.status !== 'OK' || !data.candidates?.[0]) {
            console.error('Destination search error (Places):', data.status, data.error_message || '');
            console.log('Full response from Places API (findplace):', JSON.stringify(data, null, 2));

            // Fallback to Geocoding API if findplace fails
            console.log('Attempting fallback to Geocoding API...');
            const geoParams = new URLSearchParams({
                address: destination,
                key: GOOGLE_API_KEY!,
            });
            const geoResponse = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${geoParams}`);
            const geoData = (await geoResponse.json()) as any;

            if (geoData.status === 'OK' && geoData.results?.[0]) {
                return {
                    lat: geoData.results[0].geometry.location.lat,
                    lng: geoData.results[0].geometry.location.lng,
                };
            }

            console.error('Geocoding fallback error:', geoData.status, geoData.error_message || '');
            console.log('Full response from Geocoding API:', JSON.stringify(geoData, null, 2));

            // Final fallback to Places API (New) V1
            console.log('Attempting final fallback to Places API (New)...');
            try {
                const newRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': GOOGLE_API_KEY!,
                        'X-Goog-FieldMask': 'places.location,places.displayName'
                    },
                    body: JSON.stringify({ textQuery: destination })
                });
                const newData = (await newRes.json()) as any;
                if (newData.places && newData.places.length > 0) {
                    return {
                        lat: newData.places[0].location.latitude,
                        lng: newData.places[0].location.longitude,
                    };
                }
                console.error('Places API (New) fallback failed:', newData.error || 'No results');
            } catch (newErr) {
                console.error('Places API (New) fetch error:', newErr);
            }

            return null;
        }

        return {
            lat: data.candidates[0].geometry.location.lat,
            lng: data.candidates[0].geometry.location.lng,
        };
    } catch (error) {
        console.error('Error searching destination:', error);
        return null;
    }
}

/**
 * Get place details including opening hours and website
 */
export async function getPlaceDetails(
    placeId: string
): Promise<{ openingHours?: string[]; website?: string } | null> {
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    try {
        const params = new URLSearchParams({
            place_id: placeId,
            fields: 'opening_hours,website',
            key: GOOGLE_API_KEY!,
        });

        const response = await fetch(
            `${PLACES_API_BASE}/details/json?${params}`
        );
        const data = (await response.json()) as any;

        if (data.status !== 'OK') {
            return null;
        }

        return {
            openingHours: data.result?.opening_hours?.weekday_text,
            website: data.result?.website,
        };
    } catch (error) {
        console.error('Error getting place details:', error);
        return null;
    }
}

/**
 * Generate photo URL from photo reference
 */
export function getPhotoUrl(photoReference: string, maxWidth = 400): string {
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    return `${PLACES_API_BASE}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_API_KEY}`;
}

/**
 * Get place types for different activities
 */
export function getPlaceTypesForInterest(interest: string): string[] {
    const mapping: Record<string, string[]> = {
        food: ['restaurant', 'cafe', 'bakery', 'bar'],
        history: ['museum', 'church', 'hindu_temple', 'mosque', 'synagogue'],
        nature: ['park', 'zoo', 'aquarium', 'natural_feature'],
        shopping: ['shopping_mall', 'clothing_store', 'jewelry_store', 'store'],
        art: ['art_gallery', 'museum'],
        nightlife: ['night_club', 'bar', 'casino'],
        adventure: ['amusement_park', 'stadium', 'gym'],
    };
    return mapping[interest.toLowerCase()] || ['tourist_attraction'];
}
