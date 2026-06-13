import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, Users, Car, Check, ShieldAlert, Utensils,
  Maximize2, Calendar, Star, Sparkles, Phone, Mail, ArrowRight, CheckCircle, Info
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getVenues } from '../data/venuesData';
import { cn } from '@/lib/utils';

export default function VenueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  
  const [bookingStep, setBookingStep] = useState<'idle' | 'date-selection' | 'payment' | 'success'>('idle');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoadingVenue, setIsLoadingVenue] = useState(true);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Renter contact details
  const [renterName, setRenterName] = useState('');
  const [renterPhone, setRenterPhone] = useState('');
  const [renterEmail, setRenterEmail] = useState('');

  // Date limit helpers for web bookings (only allowed within 30 days)
  const todayStr = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const getBookingDatesError = () => {
    if (!checkIn || !checkOut) return '';
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const limit = new Date(today);
    limit.setDate(today.getDate() + 30);
    limit.setHours(23, 59, 59, 999);

    if (start < today) {
      return 'Check-in date cannot be in the past.';
    }
    if (end < start) {
      return 'Check-out date must be after check-in date.';
    }
    if (start > limit || end > limit) {
      const formattedLimit = limit.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `Website bookings are only available for dates within the next 30 days (up to ${formattedLimit}). For future dates, please contact the venue owner for an offline booking.`;
    }
    return '';
  };

  const bookingDatesError = getBookingDatesError();

  // Pre-fill user details from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        setRenterName(userObj.name || '');
        setRenterEmail(userObj.email || '');
      } catch (e) {
        console.error('Failed to parse user details for booking pre-fill:', e);
      }
    }
  }, []);

  // Fetch the requested venue dynamically
  useEffect(() => {
    const fetchVenue = async () => {
      try {
        setIsLoadingVenue(true);
        const response = await fetch(`http://localhost:5000/api/venues/${id}`);
        if (response.ok) {
          const data = await response.json();
          setVenue(data);
        } else {
          const localVenues = getVenues();
          const localVenue = localVenues.find((v) => v.id === id);
          setVenue(localVenue || null);
        }
      } catch (err) {
        console.error('Failed to fetch venue details from backend, falling back:', err);
        const localVenues = getVenues();
        const localVenue = localVenues.find((v) => v.id === id);
        setVenue(localVenue || null);
      } finally {
        setIsLoadingVenue(false);
      }
    };
    
    if (id) {
      fetchVenue();
    }
  }, [id]);

  // Scroll to top on mount or when id changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoadingVenue) {
    return (
      <section className="relative w-full min-h-screen text-white bg-[#0a0a0c] flex flex-col items-center justify-center p-6">
        <Navbar />
        <div className="text-center space-y-4 max-w-md">
          <div className="w-12 h-12 border-4 border-[#c5a059] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading venue details...</h2>
        </div>
      </section>
    );
  }

  if (!venue) {
    return (
      <section className="relative w-full min-h-screen text-white bg-[#0a0a0c] flex flex-col items-center justify-center p-6">
        <Navbar />
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-3xl font-bold">Venue Not Found</h2>
          <p className="text-white/60 text-sm">
            We couldn't find the location you were looking for. It may have been unlisted or moved.
          </p>
          <Link to="/venues">
            <Button className="bg-[#c5a059] hover:bg-[#b08e4d] text-black font-semibold rounded-full mt-4">
              Return to Venues
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  const basePrice = venue.pricePerNight;
  const serviceFee = Math.round(basePrice * 0.15);
  const totalPrice = basePrice + serviceFee;

  const handleBook = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) {
      // Redirect to login page and redirect back on success
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setBookingStep('date-selection');
  };

  const handleAuthorizePayment = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!renterName || !renterPhone || !renterEmail) {
      setBookingError('Please enter your name, phone number, and email address.');
      return;
    }

    try {
      setIsSubmittingBooking(true);
      setBookingError('');

      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          venueId: venue.id,
          startDate: checkIn,
          endDate: checkOut,
          guests: venue.capacity, // default to venue capacity
          totalPrice: totalPrice,
          renterName,
          renterPhone,
          renterEmail
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete booking');
      }

      setBookingStep('success');
    } catch (err: any) {
      console.error('Booking error:', err);
      setBookingError(err.message || 'An error occurred during booking checkout. Please try again.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return (
    <section
      className="relative w-full min-h-screen text-white pb-20 overflow-y-auto"
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

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40">

        {/* Back Link */}
        <button
          onClick={() => navigate('/venues')}
          className="group flex items-center gap-2 text-white/50 hover:text-[#c5a059] text-sm font-semibold transition-all mb-8 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/5 hover:border-[#c5a059]/20"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Venues
        </button>

        {/* Title Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              {venue.title}
            </h1>

          </div>


        </div>

        {/* Widescreen Cinematic Visual Showcase */}
        <div className="flex flex-col gap-4 mb-12 w-full">

          {/* Big Image Display */}
          <div className="relative h-[320px] sm:h-[500px] md:h-[550px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group w-full">
            <img
              src={venue.images[activeImageIdx]}
              alt={`${venue.title} main view`}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-101"
            />



            {/* Photo Indicator */}
            <div className="absolute bottom-5 right-5 bg-black/70 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-xs text-white/80 border border-white/10">
              Photo {activeImageIdx + 1} of {venue.images.length}
            </div>
          </div>

          {/* Thumbnail Selectors */}
          <div className="flex gap-3 overflow-x-auto pb-1.5 custom-scrollbar">
            {venue.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={cn(
                  "relative flex-shrink-0 w-24 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-200 active:scale-95",
                  activeImageIdx === idx
                    ? "border-[#c5a059] scale-[1.03] shadow-lg shadow-[#c5a059]/10"
                    : "border-white/10 hover:border-white/30"
                )}
              >
                <img src={img} alt="thumbnail selector" className="w-full h-full object-cover" />
                {activeImageIdx !== idx && (
                  <div className="absolute inset-0 bg-black/40 transition-opacity hover:opacity-0" />
                )}
              </button>
            ))}
          </div>

        </div>

        {/* Detailed Information & Booking Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Left Column: Consolidated Detailed Info (8-cols) */}
          <div className="lg:col-span-8 space-y-8">

            {/* Main Info Box */}
            <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-10">

              {/* Section 1: Overview */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#c5a059] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
                  <Info className="w-4 h-4" /> Overview
                </h3>

                {/* Inline specifications row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-white/5 text-sm text-white/70">
                  <div className="flex items-center gap-2 bg-white/[0.01] border border-white/5 p-3 rounded-2xl">
                    <Users className="w-4 h-4 text-[#c5a059]" />
                    <span><strong>Max Capacity:</strong> {venue.capacity} Guests</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/[0.01] border border-white/5 p-3 rounded-2xl">
                    <Maximize2 className="w-4 h-4 text-[#c5a059]" />
                    <span><strong>Space Area:</strong> {venue.squareFeet.toLocaleString()} sq ft</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/[0.01] border border-white/5 p-3 rounded-2xl">
                    <MapPin className="w-4 h-4 text-[#c5a059]" />
                    <span><strong>Location:</strong> {venue.location}</span>
                  </div>
                </div>

                <p className="text-base text-white/80 leading-relaxed font-light pt-2">
                  {venue.description}
                </p>
                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Perfect For</h4>
                  <div className="flex flex-wrap gap-2">
                    {venue.eventTypes.map((type) => (
                      <Badge
                        key={type}
                        className="bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/20 hover:bg-[#c5a059]/20 text-xs font-medium py-1.5 px-4 rounded-full"
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 2: Amenities */}
              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-bold text-[#c5a059] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
                  <Sparkles className="w-4 h-4" /> Amenities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {venue.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-4 shadow-sm hover:border-white/10 transition-colors">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30">
                        <Check className="w-4 h-4 text-[#c5a059]" />
                      </div>
                      <span className="text-sm text-white/80">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Location & Parking */}
              <div className="space-y-6 pt-4">
                <h3 className="text-sm font-bold text-[#c5a059] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
                  <MapPin className="w-4 h-4" /> Location & Parking
                </h3>

                <div className="space-y-4 pt-1">
                  <div>
                    <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Street Address</h4>
                    <p className="text-sm sm:text-base text-white/90 bg-white/[0.02] border border-white/5 rounded-2xl p-4 font-light leading-relaxed">
                      {venue.fullAddress}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-[#c5a059]" /> Parking Accommodations
                    </h4>
                    <p className="text-sm text-white/70 leading-relaxed bg-white/[0.02] border border-white/5 rounded-2xl p-4 font-light">
                      {venue.parking}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 4: Catering & Rules */}
              <div className="space-y-6 pt-4">
                <h3 className="text-sm font-bold text-[#c5a059] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
                  <ShieldAlert className="w-4 h-4" /> Policies & Guidelines
                </h3>

                <div className="space-y-4 pt-1">
                  <div>
                    <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Utensils className="w-4 h-4 text-[#c5a059]" /> Food & Catering Policy
                    </h4>
                    <p className="text-sm text-white/80 leading-relaxed bg-white/[0.02] border border-white/5 rounded-2xl p-4 font-light">
                      {venue.catering}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">House Rules</h4>
                    <ul className="space-y-3">
                      {venue.rules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-white/70 font-light leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] mt-2 flex-shrink-0" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 5: Availability & Calendar (NEW!) */}
              <div className="space-y-6 pt-4">
                <h3 className="text-sm font-bold text-[#c5a059] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
                  <Calendar className="w-4 h-4" /> Availability & Booked Dates
                </h3>

                <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-base font-bold text-white">
                        {venue.id === '1' ? 'June 2026' : 'July 2026'}
                      </h4>
                      <p className="text-xs text-white/50 mt-1">
                        Official active booking calendar schedules for {venue.title}
                      </p>
                    </div>

                    {/* Calendar Legend */}
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-white/[0.03] border border-white/10 flex-shrink-0" />
                        <span className="text-white/40">Booked</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059] shadow-md shadow-[#c5a059]/20 flex-shrink-0" />
                        <span className="text-white font-semibold">Available</span>
                      </div>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="max-w-md mx-auto">
                    {/* Days of Week Header */}
                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-white/40 mb-3 uppercase tracking-wider">
                      <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-2">
                      {/* Empty slots for month start offset */}
                      {Array.from({ length: venue.id === '1' ? 1 : 3 }).map((_, idx) => (
                        <div key={`empty-${idx}`} className="aspect-square" />
                      ))}

                      {/* Days list */}
                      {Array.from({ length: venue.id === '1' ? 30 : 31 }).map((_, idx) => {
                        const day = idx + 1;
                        const isAvailable = venue.id === '1'
                          ? (day >= 12 && day <= 18)
                          : (day >= 20 && day <= 25);

                        return (
                          <div
                            key={`day-${day}`}
                            className={cn(
                              "aspect-square flex flex-col items-center justify-center text-xs rounded-xl transition-all duration-200",
                              isAvailable
                                ? "bg-[#c5a059] text-black font-bold shadow-md shadow-[#c5a059]/10 cursor-pointer hover:scale-105 active:scale-95"
                                : "bg-white/[0.01] border border-white/5 text-white/30"
                            )}
                          >
                            <span>{day}</span>
                            {isAvailable && (
                              <span className="w-1 h-1 rounded-full bg-black mt-0.5" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Calendar details footer */}
                  <p className="text-xs text-white/50 text-center font-light leading-relaxed pt-2 border-t border-white/5">
                    This location has an active booking rate of <span className="text-white font-semibold">${venue.pricePerNight}/day</span> during the available window. Dates highlighted in <span className="text-[#c5a059] font-semibold">gold</span> are open for instant booking inquiries.
                  </p>
                </div>
              </div>

            </div>

            {/* Quick Contact Card */}
            <div className="bg-white/[0.02] border border-white/5 p-6 sm:p-8 rounded-3xl backdrop-blur-md shadow-lg">
              <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Dedicated Host Support</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-white/80 font-medium">
                <div className="flex items-center gap-3 bg-black/30 border border-white/5 p-4 rounded-2xl">
                  <Phone className="w-4 h-4 text-[#c5a059]" />
                  <span>+1 (800) 555-8368</span>
                </div>
                <div className="flex items-center gap-3 bg-black/30 border border-white/5 p-4 rounded-2xl overflow-hidden">
                  <Mail className="w-4 h-4 text-[#c5a059] flex-shrink-0" />
                  <span className="truncate">booking@{venue.title.toLowerCase().replace(/\s+/g, '')}.com</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Booking Widget (4-cols) */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <AnimatePresence mode="wait">
  {/* STEP 1: INITIAL RATE SHOWCASE */}
  {bookingStep === 'idle' && (
    <motion.div
      key="idle-booking"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="bg-[#0e0e12]/95 border border-white/10 p-6 rounded-3xl shadow-2xl backdrop-blur-md space-y-6"
    >
      <div>
        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Standard Daily Rate</span>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-4xl font-bold text-white">${venue.pricePerNight}</span>
          <span className="text-sm text-white/50 font-medium">/ day</span>
        </div>
      </div>

      <hr className="border-white/10" />

      {/* Calculations */}
      <div className="space-y-3.5">
        <div className="flex justify-between text-sm text-white/70">
          <span className="font-light">Base booking rate</span>
          <span className="font-semibold text-white">${basePrice}</span>
        </div>
        <div className="flex justify-between text-sm text-white/70">
          <span className="font-light">Service & cleaning fee (15%)</span>
          <span className="font-semibold text-white">${serviceFee}</span>
        </div>
        <hr className="border-white/10 border-dashed" />
        <div className="flex justify-between text-base">
          <span className="font-medium text-white/90">Total (1 Day)</span>
          <span className="text-lg font-bold text-[#c5a059]">${totalPrice}</span>
        </div>
      </div>

      <Button
        onClick={handleBook}
        className="w-full group bg-[#c5a059] hover:bg-[#b08e4d] text-black font-semibold rounded-2xl h-12 shadow-lg shadow-[#c5a059]/10 border border-[#c5a059]/10 transition-all flex items-center justify-center gap-2 active:scale-98"
      >
        Confirm Booking Inquiry
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Button>

      <p className="text-[10px] text-center text-white/30 leading-relaxed font-light">
        No charges will be placed yet. Host reviews all booking requests within 12 hours.
      </p>
    </motion.div>
  )}

  {/* STEP 2: DATE SELECTION MATRIX */}
  {bookingStep === 'date-selection' && (
    <motion.div
      key="date-selection-booking"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="bg-[#0e0e12]/95 border border-white/10 p-6 rounded-3xl shadow-2xl backdrop-blur-md space-y-5"
    >
      <div className="space-y-1">
        <h4 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#c5a059]" /> Select Dates
        </h4>
        <p className="text-xs text-white/40">Choose your execution windows for {venue.title}</p>
      </div>

      <hr className="border-white/10" />

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block">Check-In Date</label>
          <input 
            type="date" 
            value={checkIn}
            min={todayStr}
            max={maxDateStr}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c5a059]/50 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block">Check-Out Date</label>
          <input 
            type="date" 
            value={checkOut}
            min={checkIn || todayStr}
            max={maxDateStr}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c5a059]/50 transition-colors"
          />
        </div>
      </div>

      {bookingDatesError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-3.5 leading-relaxed font-light">
          {bookingDatesError}
        </div>
      )}

      <div className="bg-[#c5a059]/5 border border-[#c5a059]/10 text-white/70 text-[11px] rounded-xl p-3 flex items-start gap-2 leading-relaxed">
        <Info className="w-4 h-4 text-[#c5a059] flex-shrink-0 mt-0.5" />
        <span>
          <strong>Booking Window Limit:</strong> Only bookings scheduled within the next 30 days are accepted online. Other bookings can be arranged offline by contacting the host.
        </span>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={() => setBookingStep('idle')}
          className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 text-xs font-medium h-11"
        >
          Back
        </Button>
        <Button
          disabled={!checkIn || !checkOut || !!bookingDatesError}
          onClick={() => setBookingStep('payment')}
          className="flex-1 bg-[#c5a059] hover:bg-[#b08e4d] disabled:opacity-40 disabled:hover:bg-[#c5a059] text-black font-semibold rounded-xl text-xs h-11 transition-all"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  )}

  {/* STEP 3: PREMIUM PAYMENT INTERFACE */}
  {bookingStep === 'payment' && (
    <motion.div
      key="payment-booking"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="bg-[#0e0e12]/95 border border-white/10 p-6 rounded-3xl shadow-2xl backdrop-blur-md space-y-5"
    >
      <div className="space-y-1">
        <h4 className="text-lg font-bold text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-[#c5a059]" /> Secure Checkout
        </h4>
        <p className="text-xs text-white/40">Provide authorization guarantees</p>
      </div>

      <hr className="border-white/10" />

      <div className="space-y-3">
        {/* Renter Contact details */}
        <div className="space-y-1">
          <label className="text-[10px] text-white/40 uppercase tracking-widest block">Your Full Name *</label>
          <input 
            type="text" 
            value={renterName}
            onChange={(e) => setRenterName(e.target.value)}
            placeholder="John Doe"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]/50 transition-colors"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] text-white/40 uppercase tracking-widest block">Phone Number *</label>
            <input 
              type="tel" 
              value={renterPhone}
              onChange={(e) => setRenterPhone(e.target.value)}
              placeholder="e.g. +1 555-0199"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#c5a059]/50 transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-white/40 uppercase tracking-widest block">Email Address *</label>
            <input 
              type="email" 
              value={renterEmail}
              onChange={(e) => setRenterEmail(e.target.value)}
              placeholder="e.g. john@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#c5a059]/50 transition-colors"
            />
          </div>
        </div>

        <hr className="border-white/10 my-2" />

        <div className="space-y-1">
          <label className="text-[10px] text-white/40 uppercase tracking-widest block">Cardholder Name</label>
          <input 
            type="text" 
            placeholder="John Doe"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]/50"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-white/40 uppercase tracking-widest block">Card Number</label>
          <input 
            type="text" 
            placeholder="0000 0000 0000 0000"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]/50"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] text-white/40 uppercase tracking-widest block">Expiration</label>
            <input type="text" placeholder="MM/YY" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#c5a059]/50" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-white/40 uppercase tracking-widest block">CVC</label>
            <input type="text" placeholder="123" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#c5a059]/50" />
          </div>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex justify-between items-center text-xs">
        <span className="text-white/60">Final Authorization amount:</span>
        <span className="font-bold text-[#c5a059] text-sm">${totalPrice}</span>
      </div>

      {bookingError && (
        <p className="text-red-500 text-xs font-semibold text-center mt-1">
          {bookingError}
        </p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <Button
          disabled={isSubmittingBooking}
          onClick={() => setBookingStep('date-selection')}
          className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 text-xs font-medium h-11"
        >
          Back
        </Button>
        <Button
          disabled={isSubmittingBooking || !renterName || !renterPhone || !renterEmail}
          onClick={handleAuthorizePayment}
          className="flex-1 bg-[#c5a059] hover:bg-[#b08e4d] disabled:opacity-40 disabled:hover:bg-[#c5a059] text-black font-semibold rounded-xl text-xs h-11 flex items-center justify-center gap-2"
        >
          {isSubmittingBooking ? (
            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            'Authorize Card'
          )}
        </Button>
      </div>
    </motion.div>
  )}

  {/* STEP 4: SUCCESS RECEIPT SUMMARY */}
  {bookingStep === 'success' && (
    <motion.div
      key="success-booking"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-[#c5a059]/10 border border-[#c5a059]/25 p-6 rounded-3xl text-center flex flex-col items-center justify-center space-y-4 shadow-2xl backdrop-blur-md"
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/30 shadow-inner">
        <CheckCircle className="w-7 h-7 text-[#c5a059] animate-pulse" />
      </div>
      <div>
        <h4 className="text-lg font-bold text-white">Inquiry Submitted!</h4>
        <p className="text-xs text-[#c5a059] font-medium mt-1">
          Our coordinator has received your request.
        </p>
      </div>
      <p className="text-xs text-white/70 leading-relaxed font-light max-w-xs">
        A personalized offer and final invoice will be emailed directly to you from <span className="underline font-normal text-white">booking@{venue.title.toLowerCase().replace(/\s+/g, '')}.com</span> to finalize the itinerary.
      </p>
      <Button
        onClick={() => {
          setBookingStep('idle');
          setCheckIn('');
          setCheckOut('');
        }}
        className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl py-2 h-10 text-xs font-semibold"
      >
        Back to Rate Details
      </Button>
    </motion.div>
  )}
</AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
