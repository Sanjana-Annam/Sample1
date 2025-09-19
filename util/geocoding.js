// util/geocoding.js
const fetch = require('node-fetch'); // for Node <18. For Node 18+, remove this

async function geocodeAddress(address) {
  try {
    if (!address || address.trim() === '') return null;

    const params = new URLSearchParams({
      q: address.trim(),
      format: 'json',
      limit: '1'
    });

    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
    console.log('[Geocode] Fetching:', url);

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Sample1App/1.0 (https://github.com/Sanjana-Annam/Sample1)", 
        "Accept-Language": "en"
      }
    });

    if (!res.ok) {
      console.error('[Geocode] HTTP error:', res.status, await res.text());
      return null;
    }

    const data = await res.json();
    if (!data || data.length === 0) {
      console.warn('[Geocode] No results for address:', address);
      return null;
    }

    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon)
    };
  } catch (err) {
    console.error('[Geocode] Error:', err);
    return null;
  }
}

module.exports = geocodeAddress;
