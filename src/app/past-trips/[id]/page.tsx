'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Mock past trip data (would be fetched from API)
const MOCK_PAST_TRIPS = [
  {
    id: '101',
    destination: 'Barcelona, Spain',
    date: '2023-05-10',
    endDate: '2023-05-17',
    duration: '7 days',
    groupName: 'Barcelona Explorers',
    description: 'A week-long exploration of Barcelona\'s architecture, beaches, and cuisine.',
    photos: ['/placeholder1.jpg', '/placeholder2.jpg', '/placeholder3.jpg'],
    accommodation: 'Mixed hostel in Gothic Quarter',
    members: [
      { id: '201', name: 'Luu Pham', image: '/placeholder.jpg', role: 'Member' },
      { id: '202', name: 'Sarah Johnson', image: '/placeholder.jpg', role: 'Creator' },
      { id: '203', name: 'Carlos Rodriguez', image: '/placeholder.jpg', role: 'Member' }
    ],
    highlights: [
      'Visited Sagrada Familia',
      'Beach day at Barceloneta',
      'Tapas tour in El Born',
      'Day trip to Montserrat'
    ],
    reviews: [
      {
        id: '301',
        author: 'Sarah Johnson',
        rating: 5,
        text: 'Luu was a fantastic travel companion! Always on time and brought great energy to the group.',
        date: '2023-05-20'
      },
      {
        id: '302',
        author: 'Carlos Rodriguez',
        rating: 4,
        text: 'Great trip partner. Very knowledgeable about the local cuisine and helped us find amazing restaurants.',
        date: '2023-05-19'
      }
    ]
  }
];

export default function PastTripDetail() {
  const params = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API fetch
    const fetchTrip = () => {
      setTimeout(() => {
        const foundTrip = MOCK_PAST_TRIPS.find(t => t.id === params.id);
        
        if (foundTrip) {
          setTrip(foundTrip);
        }
        
        setLoading(false);
      }, 500);
    };
    
    fetchTrip();
  }, [params.id]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">Loading trip details...</p>
        </div>
      </div>
    );
  }
  
  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-black">Trip Not Found</h1>
          <p className="text-black mb-6">The past trip you're looking for doesn't exist.</p>
          <Link 
            href="/profile" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md"
          >
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }
  
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg 
          key={i}
          className={`h-5 w-5 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Trip Header */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-black">{trip.destination}</h1>
              <p className="text-black mb-1">{trip.groupName}</p>
              <p className="text-sm text-black">
                {new Date(trip.date).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()} • {trip.duration}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                href="/profile"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md"
              >
                Back to Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Trip Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-black">Trip Overview</h2>
              <p className="text-black mb-6">{trip.description}</p>
              
              <h3 className="font-bold text-lg mt-6 mb-2 text-black">Trip Highlights</h3>
              <ul className="list-disc list-inside text-black mb-6">
                {trip.highlights.map((highlight: string, index: number) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
              
              {/* Photo Gallery (placeholders) */}
              <h3 className="font-bold text-lg mb-3 text-black">Photos</h3>
              <div className="grid grid-cols-3 gap-3">
                {trip.photos.map((photo: string, index: number) => (
                  <div key={index} className="h-24 bg-gray-200 rounded-md"></div>
                ))}
              </div>
            </div>
            
            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-black">Traveler Reviews</h2>
              
              {trip.reviews.length > 0 ? (
                <div className="space-y-6">
                  {trip.reviews.map((review: any) => (
                    <div key={review.id} className="pb-6 border-b border-gray-200 last:border-0">
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                        <div>
                          <p className="font-medium text-black">{review.author}</p>
                          <p className="text-xs text-black">{new Date(review.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex mb-2">
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-black">{review.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-black">No reviews yet.</p>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div>
            {/* Accommodation */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-black">Accommodation</h2>
              <p className="text-black">{trip.accommodation}</p>
            </div>
            
            {/* Travel Group */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-black">Travel Group</h2>
              
              <div className="space-y-4">
                {trip.members.map((member: any) => (
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
    </div>
  );
} 