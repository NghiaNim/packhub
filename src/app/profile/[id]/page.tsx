'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle, User, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock user data (would come from API in real app)
const MOCK_USERS = [
  {
    id: 'user-1',
    fullName: 'Jane Smith',
    username: 'janesmith',
    email: 'jane.smith@example.com',
    bio: 'Passionate traveler and photographer. Love exploring new cultures and meeting fellow backpackers!',
    travelPreferences: {
      accommodationTypes: ['Hostel', 'Camping'],
      travelStyles: ['Backpacking', 'Adventure', 'Photography'],
      languages: ['English', 'Spanish']
    },
    upcomingTrips: [
      {
        id: '201',
        destination: 'Bali, Indonesia',
        date: '2024-08-15',
        groupId: '1'
      }
    ]
  },
  {
    id: 'user-2',
    fullName: 'Alex Johnson',
    username: 'alexj',
    email: 'alex.johnson@example.com',
    bio: 'Budget traveler seeking authentic experiences. Always up for hiking and street food adventures.',
    travelPreferences: {
      accommodationTypes: ['Hostel', 'Budget Hotel'],
      travelStyles: ['Cultural', 'Food Tourism'],
      languages: ['English', 'French']
    },
    upcomingTrips: [
      {
        id: '202',
        destination: 'Tokyo, Japan',
        date: '2024-07-20',
        groupId: '2'
      }
    ]
  }
];

export default function UserProfile() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
      return loggedIn;
    };
    
    // Simulate API fetch
    const fetchUserData = async () => {
      setIsLoading(true);
      
      if (!checkAuth()) {
        setIsLoading(false);
        return;
      }
      
      // In a real app, this would fetch user data from API
      try {
        const response = await fetch(`http://localhost:8000/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('User not found');
          } else {
            setError('Failed to load user profile');
          }
          setIsLoading(false);
          return;
        }
        
        const userData = await response.json();
        setUser(userData);
        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
    
    // Add listener for auth changes
    window.addEventListener('storage', () => {
      if (checkAuth()) {
        fetchUserData();
      }
    });
    
    return () => {
      window.removeEventListener('storage', () => {
        checkAuth();
      });
    };
  }, [userId]);
  
  const handleMessage = () => {
    router.push(`/messages/${userId}`);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-md">
          <div className="text-blue-600 mb-4">
            <User size={48} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view user profiles on BackpackerConnect.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href={`/login?redirect=/profile/${userId}`} 
              passHref
            >
              <Button variant="primary">Log In</Button>
            </Link>
            <Link 
              href="/register" 
              passHref
            >
              <Button variant="outline">Sign Up</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-md">
          <div className="text-red-500 mb-4">
            <User size={48} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-6">The user profile you're looking for doesn't exist or may have been removed.</p>
          <Button
            onClick={() => router.push('/groups')}
            variant="primary"
          >
            Explore Groups
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-400 text-xl">
                {user.fullName.split(' ').map((name: string) => name[0]).join('')}
              </span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-black">{user.fullName}</h1>
              <p className="text-gray-600 mb-1">@{user.username}</p>
            </div>
            <Button
              onClick={handleMessage}
              className="flex items-center gap-2"
            >
              <MessageCircle size={18} />
              Message
            </Button>
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="space-y-6">
          {/* Bio */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-black mb-4">About</h2>
              <p className="text-black">{user.bio || 'No bio provided'}</p>
            </div>
          </div>
          
          {/* Travel Preferences */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-black mb-6">Travel Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-black mb-1">Accommodation Types</h3>
                  {user.travelPreferences?.accommodationTypes?.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.travelPreferences.accommodationTypes.map((type: string, index: number) => (
                        <span key={index} className="bg-gray-100 text-black px-2 py-1 rounded-full text-sm">
                          {type}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-black">Not specified</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-black mb-1">Travel Styles</h3>
                  {user.travelPreferences?.travelStyles?.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.travelPreferences.travelStyles.map((style: string, index: number) => (
                        <span key={index} className="bg-gray-100 text-black px-2 py-1 rounded-full text-sm">
                          {style}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-black">Not specified</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-black mb-1">Languages</h3>
                  {user.travelPreferences?.languages?.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.travelPreferences.languages.map((language: string, index: number) => (
                        <span key={index} className="bg-gray-100 text-black px-2 py-1 rounded-full text-sm">
                          {language}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-black">Not specified</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Upcoming Trips */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-black">Upcoming Trips</h2>
              {user.upcomingTrips && user.upcomingTrips.length > 0 ? (
                <div className="space-y-4">
                  {user.upcomingTrips.map((trip: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3 border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                      <MapPin className="text-blue-600 mt-1 flex-shrink-0" size={18} />
                      <div>
                        <Link 
                          href={`/groups/${trip.groupId}`} 
                          className="block hover:underline text-blue-600 font-medium"
                        >
                          {trip.destination}
                        </Link>
                        <p className="text-sm text-black mt-1">
                          {new Date(trip.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-black">No upcoming trips</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 