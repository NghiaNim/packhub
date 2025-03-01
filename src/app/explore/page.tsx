'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Mock data for popular destinations
const POPULAR_DESTINATIONS = [
  {
    id: '1',
    name: 'Bali, Indonesia',
    description: 'Tropical paradise with beaches, temples, and vibrant culture',
    imageUrl: '/placeholder.jpg',
    groupCount: 12
  },
  {
    id: '2',
    name: 'Barcelona, Spain',
    description: 'Stunning architecture, Mediterranean beaches, and lively atmosphere',
    imageUrl: '/placeholder.jpg',
    groupCount: 8
  },
  {
    id: '3',
    name: 'Tokyo, Japan',
    description: 'Blend of ultramodern and traditional, with temples, skyscrapers, and pop culture',
    imageUrl: '/placeholder.jpg',
    groupCount: 10
  },
  {
    id: '4',
    name: 'New York, USA',
    description: 'Iconic skyline, diverse neighborhoods, and cultural attractions',
    imageUrl: '/placeholder.jpg',
    groupCount: 7
  },
  {
    id: '5',
    name: 'Bangkok, Thailand',
    description: 'Vibrant street life, ornate shrines, and a gateway to Southeast Asia',
    imageUrl: '/placeholder.jpg',
    groupCount: 9
  },
  {
    id: '6',
    name: 'Paris, France',
    description: 'City of lights with iconic landmarks, art, and cuisine',
    imageUrl: '/placeholder.jpg',
    groupCount: 11
  }
];

// Define types for group data
type Group = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  maxMembers: number;
};

// Define type for featured groups object with index signature
type FeaturedGroupsType = {
  [key: string]: Group[];
};

// Mock data for featured groups
const FEATURED_GROUPS: FeaturedGroupsType = {
  'Bali, Indonesia': [
    {
      id: '101',
      name: 'Bali Beach Explorers',
      startDate: '2024-06-10',
      endDate: '2024-06-20',
      memberCount: 4,
      maxMembers: 8
    },
    {
      id: '102',
      name: 'Ubud Cultural Immersion',
      startDate: '2024-07-05',
      endDate: '2024-07-15',
      memberCount: 3,
      maxMembers: 6
    }
  ],
  'Barcelona, Spain': [
    {
      id: '201',
      name: 'Barcelona Architecture Tour',
      startDate: '2024-05-20',
      endDate: '2024-05-30',
      memberCount: 5,
      maxMembers: 10
    },
    {
      id: '202',
      name: 'Costa Brava Beach Hopping',
      startDate: '2024-06-15',
      endDate: '2024-06-25',
      memberCount: 4,
      maxMembers: 8
    }
  ],
  'Tokyo, Japan': [
    {
      id: '301',
      name: 'Tokyo Adventure',
      startDate: '2024-07-15',
      endDate: '2024-07-25',
      memberCount: 3,
      maxMembers: 6
    },
    {
      id: '302',
      name: 'Japan Rail Pass Journey',
      startDate: '2024-08-10',
      endDate: '2024-08-24',
      memberCount: 2,
      maxMembers: 5
    }
  ]
};

export default function Explore() {
  const router = useRouter();
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [featuredGroups, setFeaturedGroups] = useState<Group[]>([]);
  
  useEffect(() => {
    // Set initial featured groups to the first destination's groups
    if (POPULAR_DESTINATIONS.length > 0 && !selectedDestination) {
      const firstDestination = POPULAR_DESTINATIONS[0].name;
      setSelectedDestination(firstDestination);
      setFeaturedGroups(FEATURED_GROUPS[firstDestination] || []);
    }
  }, []);
  
  useEffect(() => {
    // Update featured groups when selected destination changes
    if (selectedDestination) {
      setFeaturedGroups(FEATURED_GROUPS[selectedDestination] || []);
    }
  }, [selectedDestination]);
  
  const handleDestinationSelect = (destination: string) => {
    setSelectedDestination(destination);
  };
  
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-blue-600 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white text-center mb-2">
            Explore Popular Destinations
          </h1>
          <p className="text-xl text-white text-center">
            Discover amazing places and connect with fellow travelers
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Popular Destinations Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">Popular Destinations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {POPULAR_DESTINATIONS.map((destination) => (
              <div 
                key={destination.id}
                className={`bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer transition-transform hover:shadow-md ${
                  selectedDestination === destination.name ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleDestinationSelect(destination.name)}
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-black">{destination.name}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {destination.groupCount} groups
                    </span>
                  </div>
                  <p className="text-black mb-4">{destination.description}</p>
                  <Link 
                    href={`/search?destination=${encodeURIComponent(destination.name)}`}
                    className="text-blue-600 font-medium hover:text-blue-800"
                  >
                    Find groups →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Featured Groups for Selected Destination */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">
              {selectedDestination ? `Groups in ${selectedDestination}` : 'Featured Groups'}
            </h2>
            <Link 
              href={selectedDestination ? `/search?destination=${encodeURIComponent(selectedDestination)}` : '/search'}
              className="text-blue-600 font-medium hover:text-blue-800"
            >
              View all →
            </Link>
          </div>
          
          {featuredGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredGroups.map((group) => (
                <Link href={`/groups/${group.id}`} key={group.id}>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-40 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-black">{group.name}</h3>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {group.memberCount}/{group.maxMembers}
                        </span>
                      </div>
                      <p className="text-black text-sm mb-3">
                        {new Date(group.startDate).toLocaleDateString()} - {new Date(group.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-xl font-medium text-black mb-2">No groups found for this destination</h3>
              <p className="text-black mb-6">Be the first to create a travel group!</p>
              <Link 
                href="/groups/create" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md"
              >
                Create a Group
              </Link>
            </div>
          )}
        </section>
        
        {/* Travel Inspiration */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-black mb-6">Travel Inspiration</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-black mb-4">Why Travel with Others?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-black mb-2">Shared Experiences</h4>
                <p className="text-black">Create memories and forge friendships that last a lifetime</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-black mb-2">Cost Sharing</h4>
                <p className="text-black">Split accommodation, transportation, and activity costs</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="font-bold text-black mb-2">Safety in Numbers</h4>
                <p className="text-black">Travel more confidently with companions watching your back</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 