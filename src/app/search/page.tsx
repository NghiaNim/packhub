'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import AuthOverlay from '@/components/auth/AuthOverlay';

// Mock data for travel groups
const MOCK_GROUPS = [
  {
    id: '1',
    name: 'Bali Beach Explorers',
    destination: 'Bali, Indonesia',
    startDate: '2024-06-10',
    endDate: '2024-06-20',
    description: 'A group of backpackers exploring the beautiful beaches of Bali.',
    memberCount: 4,
    maxMembers: 8,
    requiresApproval: false,
    creator: {
      id: '101',
      name: 'Alex Johnson',
      image: '/placeholder.jpg'
    },
    accommodation: 'Shared hostel in Kuta',
    activities: ['Surfing', 'Temple visits', 'Hiking']
  },
  {
    id: '2',
    name: 'Tokyo Adventure',
    destination: 'Tokyo, Japan',
    startDate: '2024-07-15',
    endDate: '2024-07-25',
    description: 'Exploring Tokyo\'s culture, food, and nightlife.',
    memberCount: 3,
    maxMembers: 6,
    requiresApproval: true,
    creator: {
      id: '102',
      name: 'Mika Tanaka',
      image: '/placeholder.jpg'
    },
    accommodation: 'Airbnb in Shinjuku',
    activities: ['Food tours', 'Shopping', 'Museum visits']
  },
  {
    id: '3',
    name: 'Barcelona City Tour',
    destination: 'Barcelona, Spain',
    startDate: '2024-05-20',
    endDate: '2024-05-30',
    description: 'Exploring the architecture and beaches of Barcelona.',
    memberCount: 5,
    maxMembers: 10,
    requiresApproval: false,
    creator: {
      id: '103',
      name: 'Carlos Rodriguez',
      image: '/placeholder.jpg'
    },
    accommodation: 'Hostel near La Rambla',
    activities: ['Sagrada Familia', 'Beach days', 'Tapas tours']
  },
  {
    id: '4',
    name: 'Thailand Island Hopping',
    destination: 'Phuket, Thailand',
    startDate: '2024-08-05',
    endDate: '2024-08-15',
    description: 'Island hopping adventure in southern Thailand.',
    memberCount: 6,
    maxMembers: 12,
    requiresApproval: true,
    creator: {
      id: '104',
      name: 'Sarah Williams',
      image: '/placeholder.jpg'
    },
    accommodation: 'Mix of hostels and beach bungalows',
    activities: ['Snorkeling', 'Boat tours', 'Beach parties']
  },
  {
    id: '5',
    name: 'New York City Explorers',
    destination: 'New York, USA',
    startDate: '2024-09-10',
    endDate: '2024-09-17',
    description: 'Exploring the Big Apple together.',
    memberCount: 4,
    maxMembers: 8,
    requiresApproval: false,
    creator: {
      id: '105',
      name: 'Michael Brown',
      image: '/placeholder.jpg'
    },
    accommodation: 'Shared Airbnb in Manhattan',
    activities: ['Broadway shows', 'Museum visits', 'Central Park']
  }
];

export default function SearchResults() {
  const searchParams = useSearchParams();
  const destination = searchParams.get('destination') || '';
  const dates = searchParams.get('dates') || '';
  const travelers = searchParams.get('travelers') || '';
  
  const [filteredGroups, setFilteredGroups] = useState(MOCK_GROUPS);
  
  // Filter groups based on search parameters
  useEffect(() => {
    if (!destination) {
      setFilteredGroups(MOCK_GROUPS);
      return;
    }
    
    const filtered = MOCK_GROUPS.filter(group => 
      group.destination.toLowerCase().includes(destination.toLowerCase())
    );
    
    setFilteredGroups(filtered);
  }, [destination]);
  
  const searchContent = (
    <div className="min-h-screen bg-slate-50">
      {/* Search bar at the top */}
      <div className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4">
          <SearchBar />
        </div>
      </div>
      
      {/* Search results */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2 text-slate-900">
            {filteredGroups.length > 0 
              ? `Travel groups in ${destination || 'all destinations'}`
              : 'No travel groups found'}
          </h1>
          <p className="text-slate-700">
            {dates && `Dates: ${dates}`}
            {dates && travelers && ' • '}
            {travelers && `${travelers}`}
          </p>
        </div>
        
        {/* Groups list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map(group => (
            <Link href={`/groups/${group.id}`} key={group.id} className="block">
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-40 bg-slate-200"></div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-slate-900">{group.name}</h2>
                    <Badge variant="outline" className="bg-slate-100">
                      {group.memberCount}/{group.maxMembers} members
                    </Badge>
                  </div>
                  <p className="text-slate-900 mb-2">{group.destination}</p>
                  <p className="text-sm text-slate-700 mb-3">
                    {new Date(group.startDate).toLocaleDateString()} - {new Date(group.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-slate-700 mb-4 line-clamp-2">{group.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="w-8 h-8 mr-2">
                        <AvatarImage src={group.creator.image} />
                        <AvatarFallback className="bg-slate-200 text-slate-700">
                          {group.creator.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-slate-700">{group.creator.name}</span>
                    </div>
                    {group.requiresApproval && (
                      <span className="text-xs text-slate-600">Approval required</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        
        {/* No results message */}
        {filteredGroups.length === 0 && (
          <Card className="text-center py-12 px-6">
            <CardContent className="pt-6">
              <h3 className="text-xl font-medium mb-2 text-slate-900">No travel groups found for this destination</h3>
              <p className="text-slate-700 mb-6">Try searching for a different destination or create your own group!</p>
              <Button asChild>
                <Link href="/groups/create">Create a Group</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
  
  return <AuthOverlay>{searchContent}</AuthOverlay>;
} 