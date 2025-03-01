'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

// Months array for calendar
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Days of week
const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const SearchBar = () => {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [travelers, setTravelers] = useState('1 traveler');
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [filteredDestinations, setFilteredDestinations] = useState(POPULAR_DESTINATIONS);
  
  // Calendar states
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [nextMonth, setNextMonth] = useState(currentMonth === 11 ? 0 : currentMonth + 1);
  const [nextMonthYear, setNextMonthYear] = useState(currentMonth === 11 ? currentYear + 1 : currentYear);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [dateFlexibility, setDateFlexibility] = useState('exact');
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  
  // Refs
  const calendarRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  
  // Tabs for different search types
  const [activeTab, setActiveTab] = useState('groups');
  
  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node) && 
          dateInputRef.current && !dateInputRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Update next month when current month changes
  useEffect(() => {
    if (currentMonth === 11) {
      setNextMonth(0);
      setNextMonthYear(currentYear + 1);
    } else {
      setNextMonth(currentMonth + 1);
      setNextMonthYear(currentYear);
    }
  }, [currentMonth, currentYear]);

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestination(value);
    
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
    setDestination(selected);
    setShowDestinationDropdown(false);
  };
  
  // Format date to display in input
  const formatDateRange = () => {
    if (!startDate && !endDate) return '';
    
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    
    if (startDate && !endDate) {
      return startDate.toLocaleDateString('en-US', options);
    }
    
    if (startDate && endDate) {
      const start = startDate.toLocaleDateString('en-US', options);
      const end = endDate.toLocaleDateString('en-US', options);
      return `${start} - ${end}`;
    }
    
    return '';
  };

  // Calendar navigation
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Generate days for a month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Handle date selection
  const handleDateClick = (day: number, month: number, year: number) => {
    const selectedDate = new Date(year, month, day);
    
    if (!startDate || (startDate && endDate) || selectedDate < startDate) {
      // Start a new selection
      setStartDate(selectedDate);
      setEndDate(null);
    } else if (startDate && !endDate && selectedDate > startDate) {
      // Complete the selection
      setEndDate(selectedDate);
      setShowCalendar(false);
    }
  };

  // Handle date hover for range preview
  const handleDateHover = (day: number, month: number, year: number) => {
    if (startDate && !endDate) {
      setHoverDate(new Date(year, month, day));
    }
  };

  // Check if date is within selected range
  const isInRange = (day: number, month: number, year: number) => {
    if (!startDate) return false;
    
    const date = new Date(year, month, day);
    
    if (endDate) {
      return date > startDate && date < endDate;
    }
    
    if (hoverDate && date > startDate && date <= hoverDate) {
      return true;
    }
    
    return false;
  };

  // Check if date is start or end of range
  const isStartOrEndDate = (day: number, month: number, year: number) => {
    if (!startDate) return false;
    
    const date = new Date(year, month, day);
    const isStart = date.getDate() === startDate.getDate() && 
                   date.getMonth() === startDate.getMonth() && 
                   date.getFullYear() === startDate.getFullYear();
                   
    const isEnd = endDate && 
                 date.getDate() === endDate.getDate() && 
                 date.getMonth() === endDate.getMonth() && 
                 date.getFullYear() === endDate.getFullYear();
                 
    return isStart || isEnd;
  };

  // Render calendar month
  const renderCalendarMonth = (year: number, month: number) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = isStartOrEndDate(day, month, year);
      const inRange = isInRange(day, month, year);
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
      
      days.push(
        <div 
          key={`day-${day}`}
          className={`h-10 w-10 flex items-center justify-center rounded-full cursor-pointer
            ${isSelected ? 'bg-blue-600 text-white' : 'text-black'}
            ${inRange ? 'bg-blue-100 text-blue-800' : ''}
            ${isPast && !isSelected ? 'text-gray-700' : 'hover:bg-gray-100'}
            ${isToday && !isSelected && !inRange ? 'border border-blue-600' : ''}
          `}
          onClick={() => !isPast && handleDateClick(day, month, year)}
          onMouseEnter={() => handleDateHover(day, month, year)}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format dates for URL
    let datesParam = '';
    if (startDate) {
      const startStr = startDate.toISOString().split('T')[0];
      if (endDate) {
        const endStr = endDate.toISOString().split('T')[0];
        datesParam = `${startStr},${endStr},${dateFlexibility}`;
      } else {
        datesParam = startStr;
      }
    }
    
    // Navigate to search results page with query parameters
    router.push(`/search?destination=${encodeURIComponent(destination)}&dates=${encodeURIComponent(datesParam)}&travelers=${encodeURIComponent(travelers)}`);
  };
  
  return (
    <div className="bg-white p-6 border border-gray-200 rounded-lg">
      {/* Search Tabs */}
      <div className="flex border-b mb-4">
        {['Groups', 'Stays', 'Flights', 'Cars', 'Things to do'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium ${
              activeTab === tab.toLowerCase() 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-black hover:text-blue-600'
            }`}
            onClick={() => setActiveTab(tab.toLowerCase())}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {/* Search Form */}
      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Destination */}
          <div className="md:col-span-2 relative">
            <label htmlFor="destination" className="block text-sm font-medium text-black mb-1">
              Where to?
            </label>
            <input
              type="text"
              id="destination"
              placeholder="Enter a destination"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
              value={destination}
              onChange={handleDestinationChange}
              onFocus={() => setShowDestinationDropdown(true)}
              onBlur={() => setTimeout(() => setShowDestinationDropdown(false), 200)}
              required
            />
            
            {/* Destination Dropdown */}
            {showDestinationDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-md max-h-60 overflow-auto">
                {filteredDestinations.length > 0 ? (
                  filteredDestinations.map((dest, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
                      onMouseDown={() => handleDestinationSelect(dest)}
                    >
                      {dest}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-black">No destinations found</div>
                )}
              </div>
            )}
          </div>
          
          {/* Dates */}
          <div className="relative">
            <label htmlFor="dates" className="block text-sm font-medium text-black mb-1">
              Dates
            </label>
            <input
              ref={dateInputRef}
              type="text"
              id="dates"
              placeholder="Select dates"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black cursor-pointer"
              value={formatDateRange()}
              onClick={() => setShowCalendar(!showCalendar)}
              readOnly
            />
            
            {/* Calendar Dropdown */}
            {showCalendar && (
              <div 
                ref={calendarRef}
                className="absolute z-20 mt-1 bg-white border border-gray-300 rounded-md shadow-md p-4 left-0 w-[600px] max-w-[calc(100vw-2rem)]"
              >
                {/* Calendar Header */}
                <div className="flex justify-between mb-4 items-center">
                  <div>
                    <button
                      type="button"
                      className="inline-flex p-1 text-black hover:bg-gray-100 rounded-full"
                      onClick={() => setShowCalendar(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      className="tab-selector"
                      onClick={() => setDateFlexibility('exact')}
                    >
                      Calendar
                    </button>
                    <button
                      type="button"
                      className="tab-selector"
                      onClick={() => setDateFlexibility('flexible')}
                    >
                      Flexible dates
                    </button>
                  </div>
                </div>
                
                {/* Date Range Display */}
                {startDate && (
                  <div className="text-lg font-bold text-center mb-4 text-black">
                    {startDate && !endDate && 'Select end date'}
                    {startDate && endDate && formatDateRange()}
                  </div>
                )}
                
                {/* Calendar Grid */}
                <div className="flex justify-between space-x-4">
                  <div className="w-1/2">
                    <div className="flex justify-between items-center mb-2">
                      <button
                        type="button"
                        className="p-1 rounded-full hover:bg-gray-100"
                        onClick={goToPreviousMonth}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <div className="text-lg font-semibold text-black">
                        {MONTHS[currentMonth]} {currentYear}
                      </div>
                      <div className="w-5"></div> {/* Empty space for alignment */}
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {DAYS_OF_WEEK.map((day, index) => (
                        <div key={index} className="h-8 flex items-center justify-center text-sm font-medium text-black">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {renderCalendarMonth(currentYear, currentMonth)}
                    </div>
                  </div>
                  
                  <div className="w-1/2">
                    <div className="flex justify-between items-center mb-2">
                      <div className="w-5"></div> {/* Empty space for alignment */}
                      <div className="text-lg font-semibold text-black">
                        {MONTHS[nextMonth]} {nextMonthYear}
                      </div>
                      <button
                        type="button"
                        className="p-1 rounded-full hover:bg-gray-100"
                        onClick={goToNextMonth}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {DAYS_OF_WEEK.map((day, index) => (
                        <div key={index} className="h-8 flex items-center justify-center text-sm font-medium text-black">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {renderCalendarMonth(nextMonthYear, nextMonth)}
                    </div>
                  </div>
                </div>
                
                {/* Date Flexibility Options */}
                {startDate && endDate && (
                  <div className="mt-6 border-t pt-4">
                    <div className="text-sm font-medium text-black mb-2">Flexible with dates?</div>
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      <button
                        type="button"
                        onClick={() => setDateFlexibility('exact')}
                        className={`px-4 py-2 rounded-full border ${
                          dateFlexibility === 'exact' 
                            ? 'border-blue-600 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        } text-sm text-black whitespace-nowrap`}
                      >
                        Exact dates
                      </button>
                      <button
                        type="button"
                        onClick={() => setDateFlexibility('plus-minus-1')}
                        className={`px-4 py-2 rounded-full border ${
                          dateFlexibility === 'plus-minus-1' 
                            ? 'border-blue-600 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        } text-sm text-black whitespace-nowrap`}
                      >
                        ± 1 day
                      </button>
                      <button
                        type="button"
                        onClick={() => setDateFlexibility('plus-minus-2')}
                        className={`px-4 py-2 rounded-full border ${
                          dateFlexibility === 'plus-minus-2' 
                            ? 'border-blue-600 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        } text-sm text-black whitespace-nowrap`}
                      >
                        ± 2 days
                      </button>
                      <button
                        type="button"
                        onClick={() => setDateFlexibility('plus-minus-3')}
                        className={`px-4 py-2 rounded-full border ${
                          dateFlexibility === 'plus-minus-3' 
                            ? 'border-blue-600 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        } text-sm text-black whitespace-nowrap`}
                      >
                        ± 3 days
                      </button>
                      <button
                        type="button"
                        onClick={() => setDateFlexibility('plus-minus-7')}
                        className={`px-4 py-2 rounded-full border ${
                          dateFlexibility === 'plus-minus-7' 
                            ? 'border-blue-600 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        } text-sm text-black whitespace-nowrap`}
                      >
                        ± 7 days
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Done Button */}
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCalendar(false)}
                    className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Travelers */}
          <div>
            <label htmlFor="travelers" className="block text-sm font-medium text-black mb-1">
              Travelers
            </label>
            <select
              id="travelers"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
              value={travelers}
              onChange={(e) => setTravelers(e.target.value)}
            >
              <option value="1 traveler">1 traveler</option>
              <option value="2 travelers">2 travelers</option>
              <option value="3 travelers">3 travelers</option>
              <option value="4 travelers">4 travelers</option>
              <option value="5+ travelers">5+ travelers</option>
            </select>
          </div>
        </div>
        
        {/* Search Button */}
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar; 