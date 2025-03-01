'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Mock data for user's groups
const MY_GROUPS = [
  {
    id: '1',
    name: 'Tokyo Adventure',
    destination: 'Tokyo, Japan',
    startDate: '2024-07-15',
    endDate: '2024-07-25',
    memberCount: 4,
    maxMembers: 6,
    imageUrl: '/placeholder.jpg',
    isAdmin: true
  },
  {
    id: '2',
    name: 'Barcelona Summer',
    destination: 'Barcelona, Spain',
    startDate: '2024-06-10',
    endDate: '2024-06-20',
    memberCount: 3,
    maxMembers: 5,
    imageUrl: '/placeholder.jpg',
    isAdmin: false
  }
];

// Mock data for pending group requests
const PENDING_GROUPS = [
  {
    id: '3',
    name: 'Bali Beach Explorers',
    destination: 'Bali, Indonesia',
    startDate: '2024-08-05',
    endDate: '2024-08-15',
    memberCount: 4,
    maxMembers: 8,
    imageUrl: '/placeholder.jpg',
    requestDate: '2024-03-10'
  }
];

// Mock data for recommended groups
const RECOMMENDED_GROUPS = [
  {
    id: '4',
    name: 'Paris Art Tour',
    destination: 'Paris, France',
    startDate: '2024-09-10',
    endDate: '2024-09-20',
    memberCount: 3,
    maxMembers: 6,
    imageUrl: '/placeholder.jpg'
  },
  {
    id: '5',
    name: 'New York City Exploration',
    destination: 'New York, USA',
    startDate: '2024-10-05',
    endDate: '2024-10-15',
    memberCount: 2,
    maxMembers: 4,
    imageUrl: '/placeholder.jpg'
  }
];

export default function Groups() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API fetch
    const fetchGroups = () => {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };
    
    fetchGroups();
  }, []);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">Loading your groups...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Create Group Button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">My Travel Groups</h1>
          <Link 
            href="/groups/create" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded"
          >
            Create New Group
          </Link>
        </div>
        
        {/* My Groups Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-4">Groups I'm In</h2>
          
          {MY_GROUPS.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MY_GROUPS.map((group) => (
                <Link href={`/groups/${group.id}`} key={group.id}>
                  <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-40 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-black">{group.name}</h3>
                        {group.isAdmin && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-black mb-2">{group.destination}</p>
                      <p className="text-black text-sm mb-3">
                        {new Date(group.startDate).toLocaleDateString()} - {new Date(group.endDate).toLocaleDateString()}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-black text-sm">
                          {group.memberCount}/{group.maxMembers} members
                        </span>
                        <span className="text-blue-600 text-sm font-medium">View details →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-xl font-medium text-black mb-2">You're not in any groups yet</h3>
              <p className="text-black mb-6">Join a group or create your own to start connecting with fellow travelers</p>
              <Link 
                href="/explore" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded mr-4"
              >
                Explore Groups
              </Link>
              <Link 
                href="/groups/create" 
                className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-6 rounded"
              >
                Create a Group
              </Link>
            </div>
          )}
        </section>
        
        {/* Pending Requests Section */}
        {PENDING_GROUPS.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">Pending Requests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PENDING_GROUPS.map((group) => (
                <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="h-40 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-black">{group.name}</h3>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        Pending
                      </span>
                    </div>
                    <p className="text-black mb-2">{group.destination}</p>
                    <p className="text-black text-sm mb-3">
                      {new Date(group.startDate).toLocaleDateString()} - {new Date(group.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-black text-sm mb-3">
                      Requested on {new Date(group.requestDate).toLocaleDateString()}
                    </p>
                    <div className="flex space-x-2">
                      <button className="text-red-600 text-sm font-medium hover:text-red-800">
                        Cancel Request
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Recommended Groups Section */}
        <section>
          <h2 className="text-2xl font-bold text-black mb-4">Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {RECOMMENDED_GROUPS.map((group) => (
              <Link href={`/groups/${group.id}`} key={group.id}>
                <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-40 bg-gray-200"></div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-black mb-2">{group.name}</h3>
                    <p className="text-black mb-2">{group.destination}</p>
                    <p className="text-black text-sm mb-3">
                      {new Date(group.startDate).toLocaleDateString()} - {new Date(group.endDate).toLocaleDateString()}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-black text-sm">
                        {group.memberCount}/{group.maxMembers} members
                      </span>
                      <span className="text-blue-600 text-sm font-medium">View details →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
} 