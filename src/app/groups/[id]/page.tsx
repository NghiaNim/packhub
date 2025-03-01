'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Mock data for a single group (would be fetched from API in real app)
const MOCK_GROUPS = [
  {
    id: '1',
    name: 'Bali Beach Explorers',
    destination: 'Bali, Indonesia',
    startDate: '2024-06-10',
    endDate: '2024-06-20',
    description: 'A group of backpackers exploring the beautiful beaches of Bali. We plan to visit multiple beaches, try local food, and experience the culture. All experience levels welcome!',
    memberCount: 4,
    maxMembers: 8,
    requiresApproval: false,
    creator: {
      id: '101',
      name: 'Alex Johnson',
      image: '/placeholder.jpg'
    },
    accommodation: 'Shared hostel in Kuta',
    activities: ['Surfing', 'Temple visits', 'Hiking', 'Local cuisine tasting'],
    members: [
      { id: '101', name: 'Alex Johnson', image: '/placeholder.jpg', role: 'Creator' },
      { id: '201', name: 'Emma Wilson', image: '/placeholder.jpg', role: 'Member' },
      { id: '202', name: 'David Lee', image: '/placeholder.jpg', role: 'Member' },
      { id: '203', name: 'Sophia Chen', image: '/placeholder.jpg', role: 'Member' }
    ],
    itinerary: [
      { day: 1, date: '2024-06-10', activities: ['Arrival', 'Check-in', 'Welcome dinner'] },
      { day: 2, date: '2024-06-11', activities: ['Kuta Beach', 'Surfing lessons', 'Sunset drinks'] },
      { day: 3, date: '2024-06-12', activities: ['Uluwatu Temple', 'Padang Padang Beach', 'Seafood dinner'] }
    ]
  },
  {
    id: '2',
    name: 'Tokyo Adventure',
    destination: 'Tokyo, Japan',
    startDate: '2024-07-15',
    endDate: '2024-07-25',
    description: 'Exploring Tokyo\'s culture, food, and nightlife. We\'ll visit popular attractions, try authentic Japanese cuisine, and experience the vibrant city life. Some knowledge of Japanese would be helpful but not required.',
    memberCount: 3,
    maxMembers: 6,
    requiresApproval: true,
    creator: {
      id: '102',
      name: 'Mika Tanaka',
      image: '/placeholder.jpg'
    },
    accommodation: 'Airbnb in Shinjuku',
    activities: ['Food tours', 'Shopping', 'Museum visits', 'Karaoke nights'],
    members: [
      { id: '102', name: 'Mika Tanaka', image: '/placeholder.jpg', role: 'Creator' },
      { id: '204', name: 'Ryan Smith', image: '/placeholder.jpg', role: 'Member' },
      { id: '205', name: 'Olivia Brown', image: '/placeholder.jpg', role: 'Member' }
    ],
    itinerary: [
      { day: 1, date: '2024-07-15', activities: ['Arrival', 'Check-in', 'Shinjuku exploration'] },
      { day: 2, date: '2024-07-16', activities: ['Tsukiji Fish Market', 'Harajuku shopping', 'Shibuya crossing'] },
      { day: 3, date: '2024-07-17', activities: ['Tokyo Skytree', 'Asakusa Temple', 'Akihabara district'] }
    ]
  }
];

export default function GroupDetail() {
  const params = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
    };
    
    // Simulate API fetch
    const fetchGroup = () => {
      const foundGroup = MOCK_GROUPS.find(g => g.id === params.id);
      
      if (foundGroup) {
        setGroup(foundGroup);
      }
      
      setLoading(false);
    };
    
    checkAuth();
    fetchGroup();
    
    // Add listener for auth changes
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [params.id]);
  
  const handleJoinGroup = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else {
      // In a real app, this would send a request to join the group
      setRequestSent(true);
      alert('Request to join group sent!');
    }
  };
  
  const handleLogin = () => {
    // Redirect to login page with return URL
    router.push(`/login?redirect=/groups/${params.id}`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">Loading group details...</p>
        </div>
      </div>
    );
  }
  
  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Group Not Found</h1>
          <p className="text-black mb-6">The travel group you're looking for doesn't exist.</p>
          <Link 
            href="/search" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md"
          >
            Browse Groups
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Group header */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-black">{group.name}</h1>
              <p className="text-black mb-1">{group.destination}</p>
              <p className="text-sm text-black">
                {new Date(group.startDate).toLocaleDateString()} - {new Date(group.endDate).toLocaleDateString()}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={handleJoinGroup}
                className={`${
                  requestSent 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700' 
                } text-white font-bold py-2 px-6 rounded-md`}
                disabled={group.memberCount >= group.maxMembers || requestSent}
              >
                {group.memberCount >= group.maxMembers 
                  ? 'Group Full' 
                  : requestSent 
                    ? 'Pending Invitation' 
                    : 'Join Group'}
              </button>
              {group.requiresApproval && (
                <p className="text-xs text-black mt-1 text-center">Requires approval from creator</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Group content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-black">About This Group</h2>
              <p className="text-black mb-4">{group.description}</p>
              
              <h3 className="font-bold text-lg mt-6 mb-2 text-black">Activities</h3>
              <div className="flex flex-wrap gap-2">
                {group.activities.map((activity: string, index: number) => (
                  <span 
                    key={index} 
                    className="bg-gray-100 text-black px-3 py-1 rounded-full text-sm"
                  >
                    {activity}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Itinerary */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-black">Tentative Itinerary</h2>
              {group.itinerary.map((day: any, index: number) => (
                <div key={index} className="mb-4 pb-4 border-b border-gray-200 last:border-0">
                  <h3 className="font-bold mb-2 text-black">
                    Day {day.day}: {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </h3>
                  <ul className="list-disc list-inside text-black">
                    {day.activities.map((activity: string, actIndex: number) => (
                      <li key={actIndex}>{activity}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="text-sm text-black mt-4">
                This is a tentative itinerary and may change based on group preferences and local conditions.
              </p>
            </div>
          </div>
          
          {/* Sidebar */}
          <div>
            {/* Accommodation */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-black">Accommodation</h2>
              <p className="text-black">{group.accommodation}</p>
            </div>
            
            {/* Group members */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-black">Members</h2>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {group.memberCount}/{group.maxMembers}
                </span>
              </div>
              
              <div className="space-y-4">
                {group.members.map((member: any) => (
                  <div key={member.id} className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium text-black">{member.name}</p>
                      <p className="text-xs text-black">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-black">Login Required</h2>
            <p className="text-black mb-6">
              You need to be logged in to join this group. Please log in or create an account.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowLoginModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 