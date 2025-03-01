'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import AuthOverlay from '@/components/auth/AuthOverlay';

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
          <div className="w-16 h-16 border-4 border-slate-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading your groups...</p>
        </div>
      </div>
    );
  }
  
  const groupsContent = (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Create Group Button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Travel Groups</h1>
          <Button asChild>
            <Link href="/groups/create">
            Create New Group
          </Link>
          </Button>
        </div>
        
        {/* My Groups Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Groups I'm In</h2>
          
          {MY_GROUPS.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MY_GROUPS.map((group) => (
                <Link href={`/groups/${group.id}`} key={group.id} className="block">
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <div className="h-40 bg-slate-200"></div>
                    <CardHeader className="p-4 pb-0">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-slate-900">{group.name}</h3>
                        {group.isAdmin && (
                          <span className="bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded">
                            Admin
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <p className="text-slate-900 mb-2">{group.destination}</p>
                      <p className="text-slate-700 text-sm mb-3">
                        {new Date(group.startDate).toLocaleDateString()} - {new Date(group.endDate).toLocaleDateString()}
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between items-center">
                      <span className="text-slate-700 text-sm">
                          {group.memberCount}/{group.maxMembers} members
                        </span>
                      <span className="text-slate-800 text-sm font-medium">View details →</span>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CardContent className="pt-6">
                <h3 className="text-xl font-medium text-slate-900 mb-2">You're not in any groups yet</h3>
                <p className="text-slate-700 mb-6">Join a group or create your own to start connecting with fellow travelers</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild>
                    <Link href="/explore">
                Explore Groups
              </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/groups/create">
                Create a Group
              </Link>
                  </Button>
            </div>
              </CardContent>
            </Card>
          )}
        </section>
        
        {/* Pending Requests Section */}
        {PENDING_GROUPS.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Pending Requests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PENDING_GROUPS.map((group) => (
                <Card key={group.id} className="h-full">
                  <div className="h-40 bg-slate-200"></div>
                  <CardHeader className="p-4 pb-0">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-slate-900">{group.name}</h3>
                      <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">
                        Pending
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <p className="text-slate-900 mb-2">{group.destination}</p>
                    <p className="text-slate-700 text-sm mb-3">
                      {new Date(group.startDate).toLocaleDateString()} - {new Date(group.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-slate-700 text-sm mb-3">
                      Requested on {new Date(group.requestDate).toLocaleDateString()}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button variant="ghost" className="text-red-600 hover:text-red-800 hover:bg-red-50 p-0 h-auto">
                        Cancel Request
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        )}
        
        {/* Recommended Groups Section */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {RECOMMENDED_GROUPS.map((group) => (
              <Link href={`/groups/${group.id}`} key={group.id} className="block">
                <Card className="h-full hover:shadow-md transition-shadow">
                  <div className="h-40 bg-slate-200"></div>
                  <CardHeader className="p-4 pb-0">
                    <h3 className="text-xl font-bold text-slate-900">{group.name}</h3>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <p className="text-slate-900 mb-2">{group.destination}</p>
                    <p className="text-slate-700 text-sm mb-3">
                      {new Date(group.startDate).toLocaleDateString()} - {new Date(group.endDate).toLocaleDateString()}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between items-center">
                    <span className="text-slate-700 text-sm">
                        {group.memberCount}/{group.maxMembers} members
                      </span>
                    <span className="text-slate-800 text-sm font-medium">View details →</span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
  
  return <AuthOverlay>{groupsContent}</AuthOverlay>;
} 