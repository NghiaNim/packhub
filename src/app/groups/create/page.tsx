'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Mock data for popular destinations
const POPULAR_DESTINATIONS = [
  'Bali, Indonesia',
  'Barcelona, Spain',
  'Tokyo, Japan',
  'New York, USA',
  'Bangkok, Thailand',
  'Paris, France',
  'London, UK',
  'Rome, Italy',
  'Sydney, Australia',
  'Cape Town, South Africa'
];

type AccommodationType = 'not_decided' | 'hostel' | 'hotel' | 'airbnb' | 'other';
type DateType = 'fixed' | 'flexible';

export default function CreateGroup() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [filteredDestinations, setFilteredDestinations] = useState(POPULAR_DESTINATIONS);
  const [generatingItinerary, setGeneratingItinerary] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    dateType: 'fixed' as DateType,
    startDate: '',
    endDate: '',
    flexibleMonth: '',
    flexibleYear: '',
    maxMembers: 6,
    description: '',
    accommodationType: 'not_decided' as AccommodationType,
    accommodationDetails: '',
    accommodationConfirmed: false,
    accommodationProof: null as File | null,
    activities: '',
    requiresApproval: true,
    itinerary: ''
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({
        ...prev,
        accommodationProof: e.target.files![0]
      }));
    }
  };
  
  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      destination: value
    }));
    
    // Filter destinations based on input
    if (value.trim() === '') {
      setFilteredDestinations(POPULAR_DESTINATIONS);
    } else {
      const filtered = POPULAR_DESTINATIONS.filter(
        dest => dest.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDestinations(filtered);
    }
    
    setShowDestinationDropdown(true);
  };
  
  const handleDestinationSelect = (selected: string) => {
    setFormData(prev => ({
      ...prev,
      destination: selected
    }));
    setShowDestinationDropdown(false);
  };
  
  const generateItinerary = async () => {
    if (!formData.destination) {
      setError('Please enter a destination to generate an itinerary');
      return;
    }
    
    setGeneratingItinerary(true);
    
    try {
      // In a real app, this would call the Gemini API
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let sampleItinerary = '';
      
      if (formData.destination.includes('Bali')) {
        sampleItinerary = `Day 1: Arrival in Bali, check-in, welcome dinner in Seminyak\nDay 2: Explore Ubud - Monkey Forest, Rice Terraces, and local markets\nDay 3: Visit Uluwatu Temple and enjoy sunset at Jimbaran Bay\nDay 4: Beach day at Kuta, optional surfing lessons\nDay 5: Day trip to Nusa Penida - Kelingking Beach and Angel's Billabong\nDay 6: Cultural day - Balinese cooking class and traditional dance performance\nDay 7: Free day for shopping or optional activities\nDay 8: Departure`;
      } else if (formData.destination.includes('Tokyo')) {
        sampleItinerary = `Day 1: Arrival in Tokyo, check-in, evening walk in Shinjuku\nDay 2: Explore Shibuya and Harajuku - Shibuya Crossing, Meiji Shrine, Takeshita Street\nDay 3: Traditional Tokyo - Asakusa, Senso-ji Temple, Tokyo Skytree\nDay 4: Modern Tokyo - Akihabara, Tokyo Station, Imperial Palace Gardens\nDay 5: Day trip to Hakone or Kamakura\nDay 6: Shopping and food tour in Ginza and Tokyo Station area\nDay 7: Free day for museums or optional activities\nDay 8: Departure`;
      } else if (formData.destination.includes('Barcelona')) {
        sampleItinerary = `Day 1: Arrival in Barcelona, check-in, evening tapas tour\nDay 2: Explore Gothic Quarter and La Rambla\nDay 3: Gaudi day - Sagrada Familia and Park Güell\nDay 4: Beach day at Barceloneta, evening at Port Olimpic\nDay 5: Montjuïc and Poble Espanyol\nDay 6: Day trip to Montserrat\nDay 7: Shopping and relaxation, farewell dinner\nDay 8: Departure`;
      } else {
        sampleItinerary = `Day 1: Arrival in ${formData.destination.split(',')[0]}, check-in, orientation walk\nDay 2: City exploration - main attractions and landmarks\nDay 3: Cultural activities and local cuisine\nDay 4: Nature or outdoor activities nearby\nDay 5: Optional day trip to surrounding areas\nDay 6: Free day for shopping or personal interests\nDay 7: Final explorations and farewell dinner\nDay 8: Departure`;
      }
      
      setFormData(prev => ({
        ...prev,
        itinerary: sampleItinerary
      }));
      
    } catch (error) {
      console.error('Error generating itinerary:', error);
      setError('Failed to generate itinerary. Please try again.');
    } finally {
      setGeneratingItinerary(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Validate form
      if (!formData.name || !formData.destination) {
        throw new Error('Group name and destination are required');
      }
      
      if (formData.dateType === 'fixed' && (!formData.startDate || !formData.endDate)) {
        throw new Error('Please select both start and end dates');
      }
      
      if (formData.dateType === 'flexible' && (!formData.flexibleMonth || !formData.flexibleYear)) {
        throw new Error('Please select both month and year for flexible dates');
      }
      
      // In a real app, this would send data to the API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful creation
      setSuccess(true);
      
      // Redirect to the new group page after a delay
      setTimeout(() => {
        router.push('/groups/1'); // In a real app, this would be the ID of the newly created group
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to create group. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Group Created!</h2>
          <p className="text-gray-600 mb-6">Your travel group has been successfully created. Redirecting you to the group page...</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Create a Travel Group</h1>
          
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                {error}
              </div>
            )}
            
            {/* Basic Information */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name*
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div className="relative">
                  <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
                    Destination*
                  </label>
                  <input
                    type="text"
                    id="destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handleDestinationChange}
                    onFocus={() => setShowDestinationDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDestinationDropdown(false), 200)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                  
                  {/* Destination Dropdown */}
                  {showDestinationDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredDestinations.length > 0 ? (
                        filteredDestinations.map((dest, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onMouseDown={() => handleDestinationSelect(dest)}
                          >
                            {dest}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500">No destinations found</div>
                      )}
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Tell others about your travel plans, what you're looking for in travel companions, etc."
                  />
                </div>
                
                <div>
                  <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Number of Members
                  </label>
                  <select
                    id="maxMembers"
                    name="maxMembers"
                    value={formData.maxMembers}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {[2, 3, 4, 5, 6, 8, 10, 12, 15, 20].map((num) => (
                      <option key={num} value={num}>
                        {num} members
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requiresApproval"
                    name="requiresApproval"
                    checked={formData.requiresApproval}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requiresApproval" className="ml-2 block text-sm text-gray-700">
                    Require approval for new members
                  </label>
                </div>
              </div>
            </div>
            
            {/* Dates */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Travel Dates</h2>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="dateTypeFixed"
                      name="dateType"
                      value="fixed"
                      checked={formData.dateType === 'fixed'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="dateTypeFixed" className="ml-2 block text-sm text-gray-700">
                      Fixed Dates
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="dateTypeFlexible"
                      name="dateType"
                      value="flexible"
                      checked={formData.dateType === 'flexible'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="dateTypeFlexible" className="ml-2 block text-sm text-gray-700">
                      Flexible Dates
                    </label>
                  </div>
                </div>
                
                {formData.dateType === 'fixed' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="flexibleMonth" className="block text-sm font-medium text-gray-700 mb-1">
                        Month
                      </label>
                      <select
                        id="flexibleMonth"
                        name="flexibleMonth"
                        value={formData.flexibleMonth}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select month</option>
                        <option value="01">January</option>
                        <option value="02">February</option>
                        <option value="03">March</option>
                        <option value="04">April</option>
                        <option value="05">May</option>
                        <option value="06">June</option>
                        <option value="07">July</option>
                        <option value="08">August</option>
                        <option value="09">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="flexibleYear" className="block text-sm font-medium text-gray-700 mb-1">
                        Year
                      </label>
                      <select
                        id="flexibleYear"
                        name="flexibleYear"
                        value={formData.flexibleYear}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select year</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Accommodation */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Accommodation</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="accommodationType" className="block text-sm font-medium text-gray-700 mb-1">
                    Accommodation Type
                  </label>
                  <select
                    id="accommodationType"
                    name="accommodationType"
                    value={formData.accommodationType}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="not_decided">Not decided yet</option>
                    <option value="hostel">Hostel</option>
                    <option value="hotel">Hotel</option>
                    <option value="airbnb">Airbnb / Vacation Rental</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                {formData.accommodationType !== 'not_decided' && (
                  <>
                    <div>
                      <label htmlFor="accommodationDetails" className="block text-sm font-medium text-gray-700 mb-1">
                        Accommodation Details
                      </label>
                      <textarea
                        id="accommodationDetails"
                        name="accommodationDetails"
                        value={formData.accommodationDetails}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Provide details about the accommodation, location, cost sharing, etc."
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="accommodationConfirmed"
                        name="accommodationConfirmed"
                        checked={formData.accommodationConfirmed}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="accommodationConfirmed" className="ml-2 block text-sm text-gray-700">
                        I have already booked this accommodation
                      </label>
                    </div>
                    
                    {formData.accommodationConfirmed && (
                      <div>
                        <label htmlFor="accommodationProof" className="block text-sm font-medium text-gray-700 mb-1">
                          Upload Booking Confirmation (optional)
                        </label>
                        <input
                          type="file"
                          id="accommodationProof"
                          name="accommodationProof"
                          onChange={handleFileChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Accepted formats: PDF, JPG, PNG (max 5MB)
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* Activities */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Activities</h2>
              <div>
                <label htmlFor="activities" className="block text-sm font-medium text-gray-700 mb-1">
                  Planned Activities
                </label>
                <textarea
                  id="activities"
                  name="activities"
                  value={formData.activities}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="List activities you're interested in doing (e.g., hiking, museums, food tours)"
                />
              </div>
            </div>
            
            {/* Itinerary */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Tentative Itinerary</h2>
                <button
                  type="button"
                  onClick={generateItinerary}
                  disabled={generatingItinerary}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
                >
                  {generatingItinerary ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
              <div>
                <textarea
                  id="itinerary"
                  name="itinerary"
                  value={formData.itinerary}
                  onChange={handleInputChange}
                  rows={8}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Outline a day-by-day itinerary or use the 'Generate with AI' button to create one automatically based on your destination"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is a tentative itinerary and can be adjusted based on group preferences.
                </p>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <Link
                href="/groups"
                className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
              >
                {isLoading ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 