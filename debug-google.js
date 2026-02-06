const dotenv = require('dotenv');
const path = require('path');

// Load .env from the server directory
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

async function testGeocode() {
    const key = process.env.GOOGLE_API_KEY;
    const destination = 'Paris';

    console.log('Using API Key:', key ? key.substring(0, 5) + '...' : 'UNDEFINED');

    const params = new URLSearchParams({
        input: destination,
        inputtype: 'textquery',
        fields: 'geometry',
        key: key
    });

    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${params}`;
    console.log('Request URL:', url.replace(key, 'REDACTED'));

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('Response Status:', data.status);
        console.log('Full Response:', JSON.stringify(data, null, 2));

        if (data.status === 'OK') {
            console.log('Location Found:', data.candidates[0].geometry.location);
        } else {
            console.log('Error Message:', data.error_message || 'None');
        }
    } catch (err) {
        console.error('Fetch failed:', err);
    }
}

testGeocode();
