const DIRECTIONS_API_BASE = 'https://maps.googleapis.com/maps/api/directions/json';

/**
 * Get polyline points between multiple locations
 */
export async function getDirections(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    waypoints: { lat: number; lng: number }[] = []
): Promise<string | null> {
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    try {
        const waypointString = waypoints
            .map((w) => `${w.lat},${w.lng}`)
            .join('|');

        const params = new URLSearchParams({
            origin: `${origin.lat},${origin.lng}`,
            destination: `${destination.lat},${destination.lng}`,
            key: GOOGLE_API_KEY!,
            mode: 'driving',
        });

        if (waypointString) {
            params.append('waypoints', waypointString);
        }

        const response = await fetch(`${DIRECTIONS_API_BASE}?${params}`);
        const data = (await response.json()) as any;

        if (data.status !== 'OK' || !data.routes?.[0]) {
            console.error('Directions API error:', data.status);
            return null;
        }

        // Return the encoded polyline for the entire route
        return data.routes[0].overview_polyline.points;
    } catch (error) {
        console.error('Error getting directions:', error);
        return null;
    }
}
