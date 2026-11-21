/**
 * Mock implementation of the cities API for testing purposes
 */

import { City } from "./cities-api";

// Sample city data for testing
const mockCities: City[] = [
  {
    id: 1,
    name: "Paris",
    country: "France",
    countryCode: "FR",
    region: "Île-de-France",
    regionCode: "IDF",
    latitude: 48.8566,
    longitude: 2.3522,
    population: 2148271
  },
  {
    id: 2,
    name: "London",
    country: "United Kingdom",
    countryCode: "GB",
    region: "England",
    regionCode: "ENG",
    latitude: 51.5074,
    longitude: -0.1278,
    population: 8982000
  },
  {
    id: 3,
    name: "New York",
    country: "United States",
    countryCode: "US",
    region: "New York",
    regionCode: "NY",
    latitude: 40.7128,
    longitude: -74.0060,
    population: 8419000
  },
  {
    id: 4,
    name: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    region: "Tokyo",
    regionCode: "TK",
    latitude: 35.6762,
    longitude: 139.6503,
    population: 13960000
  },
  {
    id: 5,
    name: "Sydney",
    country: "Australia",
    countryCode: "AU",
    region: "New South Wales",
    regionCode: "NSW",
    latitude: -33.8688,
    longitude: 151.2093,
    population: 5312000
  },
  {
    id: 6,
    name: "Berlin",
    country: "Germany",
    countryCode: "DE",
    region: "Berlin",
    regionCode: "BE",
    latitude: 52.5200,
    longitude: 13.4050,
    population: 3670000
  },
  {
    id: 7,
    name: "Barcelona",
    country: "Spain",
    countryCode: "ES",
    region: "Catalonia",
    regionCode: "CT",
    latitude: 41.3851,
    longitude: 2.1734,
    population: 1620000
  },
  {
    id: 8,
    name: "Rome",
    country: "Italy",
    countryCode: "IT",
    region: "Lazio",
    regionCode: "LZ",
    latitude: 41.9028,
    longitude: 12.4964,
    population: 2873000
  },
  {
    id: 9,
    name: "Amsterdam",
    country: "Netherlands",
    countryCode: "NL",
    region: "North Holland",
    regionCode: "NH",
    latitude: 52.3676,
    longitude: 4.9041,
    population: 872680
  },
  {
    id: 10,
    name: "Bangkok",
    country: "Thailand",
    countryCode: "TH",
    region: "Bangkok",
    regionCode: "BK",
    latitude: 13.7563,
    longitude: 100.5018,
    population: 8281000
  }
];

/**
 * Mock implementation of searchCities that filters the mock data
 * @param namePrefix The prefix to search for
 * @param limit The maximum number of results to return
 * @returns A promise that resolves to an array of cities
 */
export async function mockSearchCities(namePrefix: string, limit: number = 10): Promise<City[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Filter cities based on the name prefix (case insensitive)
  const normalizedPrefix = namePrefix.toLowerCase();
  
  return mockCities
    .filter(city => 
      city.name.toLowerCase().includes(normalizedPrefix) || 
      city.country.toLowerCase().includes(normalizedPrefix)
    )
    .slice(0, limit);
}

/**
 * Get a formatted display string for a city
 * @param city The city object
 * @returns A formatted string like "Paris, France"
 */
export function getCityDisplayString(city: City): string {
  return `${city.name}, ${city.country}`;
} 