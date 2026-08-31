const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

let geocodingClient = null;
if (
  process.env.MAPBOX_ACCESS_TOKEN &&
  process.env.MAPBOX_ACCESS_TOKEN.startsWith("pk.") &&
  !process.env.MAPBOX_ACCESS_TOKEN.includes("your_mapbox")
) {
  try {
    geocodingClient = mbxGeocoding({
      accessToken: process.env.MAPBOX_ACCESS_TOKEN,
    });
  } catch (err) {
    console.warn("Mapbox client init warning:", err.message);
  }
}

async function geocodeAddress(address) {
  try {
    if (!geocodingClient) {
      // Default fallback coordinates (e.g. New Delhi, India) when Mapbox is not configured
      return {
        latitude: 28.6139,
        longitude: 77.2090,
        placeName: address || "Delhi, India",
      };
    }
    const response = await geocodingClient
      .forwardGeocode({
        query: address,
        limit: 1,
      })
      .send();
    const match = response.body.features[0];
    if (!match) {
      return {
        latitude: 28.6139,
        longitude: 77.2090,
        placeName: address,
      };
    }
    return {
      latitude: match.center[1],
      longitude: match.center[0],
      placeName: match.place_name,
    };
  } catch (err) {
    console.warn("Geocoding failed, using fallback coordinates:", err.message);
    return {
      latitude: 28.6139,
      longitude: 77.2090,
      placeName: address || "Default Location",
    };
  }
}

module.exports = geocodeAddress;