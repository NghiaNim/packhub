'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Mock user data (would come from API in real app)
const MOCK_USER = {
  id: '1',
  fullName: 'Luu Pham',
  username: 'luupham',
  email: 'ntn6039@nyu.edu',
  dateOfBirth: '',
  gender: '',
  bio: '',
  phoneNumber: '',
  emergencyContact: {
    name: '',
    relationship: '',
    phoneNumber: ''
  },
  travelPreferences: {
    accommodationTypes: ['Hostel', 'Budget Hotel'],
    travelStyles: ['Backpacking', 'Cultural'],
    languages: ['English']
  },
  pastTrips: [
    {
      id: '101',
      destination: 'Barcelona, Spain',
      date: '2023-05-10',
      duration: '7 days'
    }
  ],
  upcomingTrips: [
    {
      id: '201',
      destination: 'Tokyo, Japan',
      date: '2024-07-15',
      groupId: '2'
    }
  ]
};

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(MOCK_USER);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(MOCK_USER);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API fetch
    const fetchUserData = () => {
      // In a real app, this would fetch user data from API
      setTimeout(() => {
        setUser(MOCK_USER);
        setEditedUser(MOCK_USER);
        setIsLoading(false);
      }, 500);
    };
    
    fetchUserData();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setEditedUser(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev] as object,
          [field]: value
        }
      }));
    } else {
      setEditedUser(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSaveProfile = async () => {
    setIsLoading(true);
    
    try {
      // In a real app, this would send updated data to API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update local state
      setUser(editedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading && !isEditing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
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
              <span className="text-gray-400 text-xl">LP</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-black">{user.fullName}</h1>
              <p className="text-gray-600 mb-1">@{user.username}</p>
              <p className="text-gray-600">{user.email}</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
        
        {isEditing ? (
          /* Edit Profile Form */
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">Edit Profile</h2>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={editedUser.fullName}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={editedUser.username}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={editedUser.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={editedUser.gender}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={editedUser.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Tell others about yourself..."
                    />
                  </div>
                </div>
              </div>
              
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editedUser.email}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={editedUser.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
              
              {/* Emergency Contact */}
              <div>
                <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="emergencyContact.name"
                      value={editedUser.emergencyContact.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship
                    </label>
                    <input
                      type="text"
                      name="emergencyContact.relationship"
                      value={editedUser.emergencyContact.relationship}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="emergencyContact.phoneNumber"
                      value={editedUser.emergencyContact.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditedUser(user);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Profile View */
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-black mb-6">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  <div>
                    <h3 className="text-sm font-medium text-black mb-1">Full Name</h3>
                    <p className="text-black font-medium">{user.fullName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-black mb-1">Username</h3>
                    <p className="text-black font-medium">@{user.username}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-black mb-1">Date of Birth</h3>
                    <p className="text-black">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-black mb-1">Gender</h3>
                    <p className="text-black">{user.gender || 'Not provided'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-black mb-1">Bio</h3>
                    <p className="text-black">{user.bio || 'No bio provided'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-black mb-6">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  <div>
                    <h3 className="text-sm font-medium text-black mb-1">Email</h3>
                    <p className="text-black font-medium">{user.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-black mb-1">Phone Number</h3>
                    <p className="text-black">{user.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Emergency Contact */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-black mb-6">Emergency Contact</h2>
                {user.emergencyContact.name ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-black mb-1">Name</h3>
                      <p className="text-black font-medium">{user.emergencyContact.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-black mb-1">Relationship</h3>
                      <p className="text-black">{user.emergencyContact.relationship}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-black mb-1">Phone Number</h3>
                      <p className="text-black">{user.emergencyContact.phoneNumber}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-black">No emergency contact provided</p>
                )}
              </div>
            </div>
            
            {/* Travel Preferences */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-black mb-6">Travel Preferences</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-black mb-1">Accommodation Types</h3>
                    {user.travelPreferences.accommodationTypes.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {user.travelPreferences.accommodationTypes.map((type, index) => (
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
                    {user.travelPreferences.travelStyles.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {user.travelPreferences.travelStyles.map((style, index) => (
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
                    {user.travelPreferences.languages.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {user.travelPreferences.languages.map((language, index) => (
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
            
            {/* Trips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upcoming Trips */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4 text-black">Upcoming Trips</h2>
                  {user.upcomingTrips.length > 0 ? (
                    <div className="space-y-4">
                      {user.upcomingTrips.map((trip, index) => (
                        <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                          <Link href={`/groups/${trip.groupId}`} className="block hover:bg-gray-50 p-2 -mx-2 rounded">
                            <h3 className="font-medium text-black">{trip.destination}</h3>
                            <p className="text-sm text-black">
                              {new Date(trip.date).toLocaleDateString()}
                            </p>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-black">No upcoming trips</p>
                  )}
                </div>
              </div>
              
              {/* Past Trips */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4 text-black">Past Trips</h2>
                  {user.pastTrips.length > 0 ? (
                    <div className="space-y-4">
                      {user.pastTrips.map((trip, index) => (
                        <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                          <Link href={`/past-trips/${trip.id}`} className="block hover:bg-gray-50 p-2 -mx-2 rounded">
                            <h3 className="font-medium text-black">{trip.destination}</h3>
                            <p className="text-sm text-black">
                              {new Date(trip.date).toLocaleDateString()} • {trip.duration}
                            </p>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-black">No past trips</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 