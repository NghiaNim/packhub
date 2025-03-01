import Link from 'next/link';
import SearchBar from '@/components/SearchBar';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-800 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Connect with Fellow Travelers
            </h1>
            <p className="text-xl text-white">
              Find travel companions, join groups, and explore the world together
            </p>
          </div>
          
          {/* Search Component */}
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 max-w-5xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* Featured Destinations */}
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Popular Destinations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Bali, Indonesia', 'Barcelona, Spain', 'Tokyo, Japan'].map((destination) => (
              <div key={destination} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-black">{destination}</h3>
                  <p className="text-black mb-4">Join travelers exploring this destination</p>
                  <Link href={`/search?destination=${encodeURIComponent(destination)}`} 
                    className="text-indigo-600 font-medium hover:text-indigo-800">
                    Find groups →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Search for a destination',
                description: 'Enter where you want to go and when you plan to travel'
              },
              {
                title: 'Find travel groups',
                description: 'Browse groups of travelers with similar plans and interests'
              },
              {
                title: 'Connect and travel together',
                description: 'Join a group, chat with members, and plan your adventure'
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-bold">{index + 1}</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-black">{step.title}</h3>
                <p className="text-black">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
