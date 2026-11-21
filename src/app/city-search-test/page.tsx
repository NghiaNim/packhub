"use client";

import { useState } from "react";
import { City } from "@/lib/cities-api";
import { MockCitySearch } from "@/components/ui/mock-city-search";

export default function CitySearchTestPage() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">City Search Component Test</h1>
      
      <div className="max-w-md mb-10">
        <h2 className="text-lg font-semibold mb-2">Mock City Search:</h2>
        <MockCitySearch 
          onSelect={setSelectedCity}
          selectedCity={selectedCity}
          placeholder="Search for a city..."
        />
      </div>
      
      {selectedCity && (
        <div className="mt-8 p-4 border rounded-md">
          <h2 className="text-lg font-semibold mb-2">Selected City:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(selectedCity, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
        <ul className="list-disc pl-5">
          <li>Click on the search field to open the dropdown</li>
          <li>Type at least 2 characters to start searching</li>
          <li>Select a city from the results</li>
          <li>The selected city details will appear below</li>
          <li>Try searching for: "new", "lon", "par", etc.</li>
        </ul>
      </div>
    </div>
  );
} 