/**
 * Utility functions for fetching city data from the GeoDB Cities API
 */

// Define the city interface
export interface City {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  region?: string;
  regionCode?: string;
  latitude: number;
  longitude: number;
  population?: number;
}

// Cache for city search results to reduce API calls
const citySearchCache: Record<string, { cities: City[], timestamp: number }> = {};
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Search for cities by name prefix
 * @param namePrefix The prefix to search for
 * @param limit The maximum number of results to return (default: 10)
 * @returns A promise that resolves to an array of cities
 */
export async function searchCities(namePrefix: string, limit: number = 10): Promise<City[]> {
  // Don't search for very short queries
  if (namePrefix.length < 2) {
    return [];
  }
  
  // Check cache first
  const cacheKey = `${namePrefix.toLowerCase()}_${limit}`;
  const cachedResult = citySearchCache[cacheKey];
  
  if (cachedResult && (Date.now() - cachedResult.timestamp < CACHE_EXPIRY)) {
    return cachedResult.cities;
  }
  
  try {
    // Replace with your actual RapidAPI key
    const apiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '';
    
    if (!apiKey) {
      console.warn('RapidAPI key not found. Please set NEXT_PUBLIC_RAPIDAPI_KEY in your environment variables.');
      return [];
    }
    
    const response = await fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(namePrefix)}&limit=${limit}&sort=-population`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GeoDB Cities API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform the API response to our City interface
    const cities: City[] = data.data.map((city: any) => ({
      id: city.id,
      name: city.name,
      country: city.country,
      countryCode: city.countryCode,
      region: city.region,
      regionCode: city.regionCode,
      latitude: city.latitude,
      longitude: city.longitude,
      population: city.population
    }));
    
    // Cache the results
    citySearchCache[cacheKey] = {
      cities,
      timestamp: Date.now()
    };
    
    return cities;
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
}

/**
 * Get a formatted display string for a city
 * @param city The city object
 * @returns A formatted string like "Paris, France"
 */
export function getCityDisplayString(city: City): string {
  return `${city.name}, ${city.country}`;
} 