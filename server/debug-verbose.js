const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function testVerbose() {
    const key = process.env.GOOGLE_API_KEY;
    const destination = 'Paris';

    console.log('--- VERBOSE DIAGNOSTIC ---');
    console.log('Key:', key ? key.substring(0, 5) + '...' : 'MISSING');

    const urls = [
        { name: 'Places (Standard)', url: `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${destination}&inputtype=textquery&fields=geometry&key=${key}` },
        { name: 'Geocoding', url: `https://maps.googleapis.com/maps/api/geocode/json?address=${destination}&key=${key}` },
        { name: 'Places (New)', url: `https://places.googleapis.com/v1/places:searchText` } // Needs different auth, just checking name for now
    ];

    for (const item of urls) {
        try {
            console.log(`Testing ${item.name}...`);
            if (item.name === 'Places (New)') {
                // Simple fetch to see if we get a 403 or something else
                const res = await fetch(item.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key!, 'X-Goog-FieldMask': 'places.displayName' },
                    body: JSON.stringify({ textQuery: destination })
                });
                const data = await res.json();
                console.log(`   ${item.name} Status:`, data.error ? data.error.status : 'OK');
                if (data.error) console.log(`   Error:`, data.error.message);
            } else {
                const res = await fetch(item.url);
                const data = await res.json();
                console.log(`   ${item.name} Status:`, data.status);
                if (data.status !== 'OK') console.log(`   Error:`, data.error_message || 'No message');
            }
        } catch (e) {
            console.log(`   ${item.name} FAILED:`, e.message);
        }
    }
}

testVerbose();
