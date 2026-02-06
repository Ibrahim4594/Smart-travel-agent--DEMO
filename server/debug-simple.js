const dotenv = require('dotenv');
dotenv.config();

async function testSimple() {
    const key = process.env.GOOGLE_API_KEY;
    console.log('Testing Paris with key:', key ? key.substring(0, 5) + '...' : 'NONE');

    // Standard Places API
    const standardUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Paris&inputtype=textquery&fields=geometry&key=${key}`;

    try {
        const res = await fetch(standardUrl);
        const data = await res.json();
        console.log('Standard Places API Status:', data.status);
        if (data.status !== 'OK') console.log('Message:', data.error_message);
    } catch (e) {
        console.log('Standard Places FAILED:', e.message);
    }

    // New Places API
    const newUrl = `https://places.googleapis.com/v1/places:searchText`;
    try {
        const res = await fetch(newUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': key || '',
                'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location'
            },
            body: JSON.stringify({ textQuery: 'Paris' })
        });
        const data = await res.json();
        if (data.places && data.places.length > 0) {
            console.log('New Places API: SUCCESS');
        } else {
            console.log('New Places API Status:', data.error ? data.error.status : 'NO RESULTS');
            if (data.error) console.log('Message:', data.error.message);
        }
    } catch (e) {
        console.log('New Places FAILED:', e.message);
    }
}

testSimple();
