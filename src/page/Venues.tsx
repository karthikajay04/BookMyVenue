import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Navbar from '../component/Navbar';
import { PlaceCard } from '@/components/ui/card-22';

// Sample data for exactly two venues
const sampleVenues = [
  {
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop',
    ],
    tags: ['Los Angeles', '100 Guests', 'Luxury'],
    location: 'Los Angeles',
    capacity: 100,
    rating: 4.9,
    title: 'The Glass Pavilion',
    dateRange: 'Jun 12 - 18',
    hostType: 'Superhost',
    isTopRated: true,
    description: 'An architectural masterpiece featuring 360-degree glass walls, high ceilings, and stunning garden views.',
    pricePerNight: 450,
  },
  {
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
    ],
    tags: ['Miami', '10 Guests', 'Ocean View'],
    location: 'Miami',
    capacity: 10,
    rating: 4.8,
    title: 'Sunset Bay Villa',
    dateRange: 'Jul 20 - 25',
    hostType: 'Exclusive Agency',
    isTopRated: false,
    description: 'A luxurious beachfront villa perfect for intimate weddings, corporate retreats, or elite gatherings.',
    pricePerNight: 720,
  },
];

// Storing drop-down options details in a module-level variable
const locationOptions = [
  { value: 'All', label: 'All Locations' },
  { value: 'Los Angeles', label: 'Los Angeles' },
  { value: 'Miami', label: 'Miami' },
];

const capacityOptions = [
  { value: 'All', label: 'Any Capacity' },
  { value: '10', label: 'Intimate (Up to 10)' },
  { value: '100', label: 'Medium (Up to 100)' },
  { value: '1000', label: 'Large (1000+)' },
];

export default function Venues() {
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [selectedCapacity, setSelectedCapacity] = useState<string>('All');
  const [capacityDropdownOpen, setCapacityDropdownOpen] = useState<boolean>(false);

  // Filter venues based on selected location and capacity state
  const filteredVenues = sampleVenues.filter((venue) => {
    const matchesLocation = selectedLocation === 'All' || venue.location === selectedLocation;

    let matchesCapacity = true;
    if (selectedCapacity === '10') {
      matchesCapacity = venue.capacity <= 10;
    } else if (selectedCapacity === '100') {
      matchesCapacity = venue.capacity > 10 && venue.capacity <= 100;
    } else if (selectedCapacity === '1000') {
      matchesCapacity = venue.capacity >= 1000;
    }

    return matchesLocation && matchesCapacity;
  });

  const activeLocationOption = locationOptions.find((opt) => opt.value === selectedLocation) || locationOptions[0];
  const activeCapacityOption = capacityOptions.find((opt) => opt.value === selectedCapacity) || capacityOptions[0];

  return (
    <section
      className="relative w-full min-h-screen text-white pb-16 overflow-y-auto"
      style={{
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/crissxcross.png")',
        backgroundColor: '#0a0a0c'
      }}
    >
      {/* Navigation */}
      <Navbar />

      {/* Gradients */}
      <div className="absolute top-0 left-0 right-0 h-56 bg-gradient-to-b from-[#0a0a0c]/90 via-[#0a0a0c]/40 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-[#0a0a0c]/95 via-[#0a0a0c]/30 to-transparent pointer-events-none z-10" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center pt-32 sm:pt-40 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">

        {/* Title and Subtitle */}
        <div className="text-center mb-10 sm:mb-12">
          <h1
            className="font-normal leading-[0.95] text-white text-[2.5rem] sm:text-5xl md:text-6xl max-w-4xl tracking-tight"
            style={{ fontFamily: "'Neue Haas Grotesk Display Pro 55 Roman', 'Neue Haas Grotesk Text Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: '-0.035em' }}
          >
            Event{' '}
            <span className="text-[#c5a059]">
              Venues
            </span>
          </h1>
          <p className="mt-4 sm:mt-6 text-white/70 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            Discover handpicked, beautiful locations perfect for your next event, wedding, or celebration.
          </p>
        </div>

        {/* Filter Dropdowns Container */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-16 z-30">

          {/* Location Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setDropdownOpen((prev) => !prev);
                setCapacityDropdownOpen(false);
              }}
              className="flex items-center justify-between gap-4 px-6 py-3 min-w-[220px] bg-black/60 hover:bg-black/80 border border-white/10 rounded-full text-white text-sm font-semibold shadow-md transition-all duration-300 active:scale-[0.98]"
              aria-label="Filter locations dropdown"
              aria-expanded={dropdownOpen}
            >
              <span>{activeLocationOption.label}</span>
              <ChevronDown className={`w-4 h-4 text-[#c5a059] transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-20 bg-transparent" onClick={() => setDropdownOpen(false)} />
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d0d11]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                  {locationOptions.map((option) => {
                    const isActive = selectedLocation === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedLocation(option.value);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-5 py-3 text-sm transition-colors duration-200 ${isActive
                          ? 'bg-[#c5a059] text-white font-semibold'
                          : 'text-white/80 hover:text-white hover:bg-white/5'
                          }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Capacity Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setCapacityDropdownOpen((prev) => !prev);
                setDropdownOpen(false);
              }}
              className="flex items-center justify-between gap-4 px-6 py-3 min-w-[220px] bg-black/60 hover:bg-black/80 border border-white/10 rounded-full text-white text-sm font-semibold shadow-md transition-all duration-300 active:scale-[0.98]"
              aria-label="Filter capacities dropdown"
              aria-expanded={capacityDropdownOpen}
            >
              <span>{activeCapacityOption.label}</span>
              <ChevronDown className={`w-4 h-4 text-[#c5a059] transition-transform duration-300 ${capacityDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>

            {capacityDropdownOpen && (
              <>
                <div className="fixed inset-0 z-20 bg-transparent" onClick={() => setCapacityDropdownOpen(false)} />
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d0d11]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                  {capacityOptions.map((option) => {
                    const isActive = selectedCapacity === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedCapacity(option.value);
                          setCapacityDropdownOpen(false);
                        }}
                        className={`w-full text-left px-5 py-3 text-sm transition-colors duration-200 ${isActive
                          ? 'bg-[#c5a059] text-white font-semibold'
                          : 'text-white/80 hover:text-white hover:bg-white/5'
                          }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Venue Grid (Filtered Venues) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center w-full max-w-4xl pb-12">
          {filteredVenues.map((venue, idx) => (
            <PlaceCard
              key={idx}
              images={venue.images}
              tags={venue.tags}
              rating={venue.rating}
              title={venue.title}
              dateRange={venue.dateRange}
              hostType={venue.hostType}
              isTopRated={venue.isTopRated}
              description={venue.description}
              pricePerNight={venue.pricePerNight}
              className="border-white/10 bg-black/40 backdrop-blur-md shadow-2xl hover:border-[#c5a059]/40"
            />
          ))}
          {filteredVenues.length === 0 && (
            <div className="col-span-1 md:col-span-2 text-center text-white/50 py-12">
              No venues match your location and capacity criteria.
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
