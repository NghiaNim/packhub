'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check authentication status on component mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        try {
          const storedUser = localStorage.getItem('userData');
          if (storedUser) {
            setUserData(JSON.parse(storedUser));
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          // If there's an error, clear the potentially corrupted data
          localStorage.removeItem('userData');
          setIsLoggedIn(false);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
    };

    // Check auth immediately on mount
    checkAuth();
    
    // Setup event listener to detect localStorage changes
    window.addEventListener('storage', checkAuth);
    
    // Setup an interval to periodically check auth state
    const interval = setInterval(checkAuth, 1000);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      clearInterval(interval);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleSignOut = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserData(null);
    setIsProfileDropdownOpen(false);
    
    // Create and dispatch a storage event to notify other components
    window.dispatchEvent(new Event('storage'));
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold text-blue-600">PackHub</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`${
                  isActive('/') 
                    ? 'border-blue-500 text-black' 
                    : 'border-transparent text-black hover:border-gray-300'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Home
              </Link>
              <Link
                href="/explore"
                className={`${
                  isActive('/explore') 
                    ? 'border-blue-500 text-black' 
                    : 'border-transparent text-black hover:border-gray-300'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Explore
              </Link>
              <Link
                href="/groups"
                className={`${
                  isActive('/groups') || pathname?.startsWith('/groups/') 
                    ? 'border-blue-500 text-black' 
                    : 'border-transparent text-black hover:border-gray-300'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Groups
              </Link>
              <Link
                href="/messages"
                className={`${
                  isActive('/messages') 
                    ? 'border-blue-500 text-black' 
                    : 'border-transparent text-black hover:border-gray-300'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Messages
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isLoggedIn && userData ? (
              <div className="ml-3 relative" ref={dropdownRef}>
                <div>
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center space-x-2 text-black focus:outline-none"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <span className="text-sm font-medium">
                        {userData.name ? `${userData.name.charAt(0)}${userData.name.split(' ')[1]?.charAt(0) || ''}` : 'U'}
                      </span>
                    </div>
                    <span className="font-medium">{userData.name || 'User'}</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                
                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                      >
                        Your Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                      >
                        Settings
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-black hover:bg-gray-100 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className={`${
                isActive('/') 
                  ? 'bg-blue-50 border-blue-500 text-blue-700' 
                  : 'border-transparent text-black hover:bg-gray-50 hover:border-gray-300'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              Home
            </Link>
            <Link
              href="/explore"
              className={`${
                isActive('/explore') 
                  ? 'bg-blue-50 border-blue-500 text-blue-700' 
                  : 'border-transparent text-black hover:bg-gray-50 hover:border-gray-300'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              Explore
            </Link>
            <Link
              href="/groups"
              className={`${
                isActive('/groups') || pathname?.startsWith('/groups/')
                  ? 'bg-blue-50 border-blue-500 text-blue-700' 
                  : 'border-transparent text-black hover:bg-gray-50 hover:border-gray-300'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              Groups
            </Link>
            <Link
              href="/messages"
              className={`${
                isActive('/messages') 
                  ? 'bg-blue-50 border-blue-500 text-blue-700' 
                  : 'border-transparent text-black hover:bg-gray-50 hover:border-gray-300'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              Messages
            </Link>
          </div>
          {isLoggedIn && userData ? (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <span className="text-sm font-medium">
                      {userData.name ? `${userData.name.charAt(0)}${userData.name.split(' ')[1]?.charAt(0) || ''}` : 'U'}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-black">{userData.name || 'User'}</div>
                  <div className="text-sm font-medium text-black">{userData.email || ''}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-base font-medium text-black hover:bg-gray-100"
                >
                  Your Profile
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-base font-medium text-black hover:bg-gray-100"
                >
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-black hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="space-y-1 px-4">
                <Link
                  href="/login"
                  className="block text-base font-medium text-blue-600 hover:bg-gray-100 rounded-md py-2"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="block text-base font-medium text-blue-600 hover:bg-gray-100 rounded-md py-2"
                >
                  Sign up
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar; 