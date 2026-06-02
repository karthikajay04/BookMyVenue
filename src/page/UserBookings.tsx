import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ArrowRight, 
  Info, 
  Star, 
  Trash2,
  Phone,
  Mail,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CreditCard
} from 'lucide-react';
import Navbar from '@/components/Navbar';

// ============================================================================
// --- TYPES & INTERFACES ---
// ============================================================================

export interface Booking {
  id: string;
  venueId: string;
  venueTitle: string;
  venueLocation: string;
  venueImage: string;
  startDate: string;
  endDate: string;
  guests: number;
  totalPrice: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  bookingDate: string;
  paymentStatus: string;
  hostName: string;
  hostPhone: string;
  hostMail: string;
  checkInInstructions: string;
}

export interface PlaceCardProps {
  images?: string[];
  tags?: string[];
  rating?: number;
  title: string;
  dateRange: string;
  hostType?: string;
  isTopRated?: boolean;
  description: string;
  pricePerNight?: number;
  capacity: number;
  eventTypes?: string[];
  className?: string;
  onClick?: () => void;
}

<Navbar/>



// ============================================================================
// --- FILE: src/components/ui/PlaceCard.tsx ---
// ============================================================================
export function PlaceCard({
  images = [],
  tags = [],
  rating = 4.8,
  title,
  dateRange,
  hostType = "Verified Elite Host",
  isTopRated = false,
  description,
  capacity,
  className = "",
  onClick
}: PlaceCardProps): React.JSX.Element {
  const [activeImgIndex, setActiveImgIndex] = useState<number>(0);

  const nextImage = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    if (images.length <= 1) return;
    setActiveImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    if (images.length <= 1) return;
    setActiveImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div 
      onClick={onClick}
      className={`group relative rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl transition-all duration-500 hover:border-[#c5a059]/40 cursor-pointer ${className}`}
    >
      {/* Visual media gallery wrapper */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={images[activeImgIndex]} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600";
          }}
        />

        {/* Carousel controls if multi-image */}
        {images.length > 1 && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              type="button"
              onClick={prevImage}
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm border border-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              type="button"
              onClick={nextImage}
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm border border-white/10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Overlay Tags */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start gap-2">
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag, i) => (
              <span 
                key={i} 
                className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase text-[#c5a059] border border-[#c5a059]/20"
              >
                {tag}
              </span>
            ))}
          </div>
          {isTopRated && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#c5a059] text-black text-[10px] font-extrabold tracking-wider uppercase shadow-lg shadow-[#c5a059]/10">
              <Sparkles className="w-3 h-3 fill-black" /> Top Choice
            </span>
          )}
        </div>

        {/* Backdrop bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      {/* Details Container */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono font-bold">
            {hostType}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-[#c5a059] fill-[#c5a059]" />
            <span className="text-xs font-semibold text-white">{rating}</span>
          </div>
        </div>

        <h3 className="text-lg sm:text-xl font-semibold text-white tracking-tight group-hover:text-[#c5a059] transition-colors mb-2">
          {title}
        </h3>

        <p className="text-xs text-white/50 line-clamp-2 leading-relaxed mb-4">
          {description}
        </p>

        <div className="flex items-center justify-between text-xs text-white/80 border-t border-white/5 pt-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>{dateRange}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Cap: {capacity}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// --- DATA: Initial Bookings ---
// ============================================================================
const initialBookings: Booking[] = [
  {
    id: "BKG-8402",
    venueId: "1",
    venueTitle: "The Grand Pavilion",
    venueLocation: "Beverly Hills, CA",
    venueImage: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200",
    startDate: "2026-06-18",
    endDate: "2026-06-20",
    guests: 85,
    totalPrice: 4200,
    status: "upcoming",
    bookingDate: "2026-05-15",
    paymentStatus: "paid",
    hostName: "Eleanor Vance",
    hostPhone: "+1 (555) 234-5678",
    hostMail: "vance@grandpavilion.com",
    checkInInstructions: "Check-in begins at 2:00 PM. Access details will be sent directly by host Eleanor Vance."
  },
  {
    id: "BKG-3109",
    venueId: "3",
    venueTitle: "Mirage Desert Oasis",
    venueLocation: "Palm Springs, CA",
    venueImage: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=1200",
    startDate: "2026-07-04",
    endDate: "2026-07-05",
    guests: 8,
    totalPrice: 1850,
    status: "upcoming",
    bookingDate: "2026-05-20",
    paymentStatus: "paid",
    hostName: "Julian Sands",
    hostPhone: "+1 (555) 987-6543",
    hostMail: "reservations@miragedesert.com",
    checkInInstructions: "Gate code is #2026. Follow the sand path to the main villa. Private host will meet you on-site."
  },
  {
    id: "BKG-7721",
    venueId: "2",
    venueTitle: "Aetheria Glass Chapel",
    venueLocation: "Big Sur, CA",
    venueImage: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80&w=1200",
    startDate: "2026-04-12",
    endDate: "2026-04-13",
    guests: 45,
    totalPrice: 3100,
    status: "completed",
    bookingDate: "2026-02-10",
    paymentStatus: "paid",
    hostName: "Clara Redwood",
    hostPhone: "+1 (555) 456-7890",
    hostMail: "events@aetheriachapel.org",
    checkInInstructions: "Completed reservation. Thank you for booking with us."
  },
  {
    id: "BKG-1102",
    venueId: "4",
    venueTitle: "The Obsidian Loft",
    venueLocation: "Downtown Los Angeles, CA",
    venueImage: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=1200",
    startDate: "2026-01-15",
    endDate: "2026-01-16",
    guests: 120,
    totalPrice: 5500,
    status: "cancelled",
    bookingDate: "2025-12-01",
    paymentStatus: "refunded",
    hostName: "Marcus Thorne",
    hostPhone: "+1 (555) 111-2222",
    hostMail: "marcus@obsidianloft.io",
    checkInInstructions: "Booking cancelled and refunded."
  }
];

// ============================================================================
// --- FILE: src/pages/Bookings.tsx (Main Dashboard) ---
// ============================================================================
export default function Bookings(): React.JSX.Element {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  
  // Custom dialog state handlers
  const [ticketModalBooking, setTicketModalBooking] = useState<Booking | null>(null);
  const [cancelTargetBooking, setCancelTargetBooking] = useState<Booking | null>(null);
  const [reviewTargetBooking, setReviewTargetBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string>('');

  // Auto-dismiss toast alert
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => {
        setSuccessToast('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  const handleConfirmCancel = (): void => {
    if (!cancelTargetBooking) return;
    
    setBookings((prev) => 
      prev.map((b) => 
        b.id === cancelTargetBooking.id 
          ? { ...b, status: 'cancelled', paymentStatus: 'refunded' } 
          : b
      )
    );
    
    setSuccessToast(`Successfully cancelled booking ${cancelTargetBooking.id}. Refund process initiated.`);
    setCancelTargetBooking(null);
  };

  const handlePublishReview = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!reviewTargetBooking) return;

    setSuccessToast(`Review published successfully for ${reviewTargetBooking.venueTitle}! Thank you for your feedback.`);
    setReviewTargetBooking(null);
    setReviewRating(5);
    setReviewText('');
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDateString = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDueDateString = (dateStr: string): string => {
    // Calculates exactly 1 day before check-in arrival
    const d = new Date(dateStr);
    d.setDate(d.getDate() - 1);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    
    <section
      className="relative w-full min-h-screen text-white pt-10 pb-24 overflow-y-auto font-sans"
      style={{
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/crissxcross.png")',
        backgroundColor: '#0a0a0c'
      }}
    >
      {/* Call custom self-contained premium Navbar */}
      <Navbar />

      {/* Backdrop Gradients matching Venues Page */}
      <div className="absolute top-0 left-0 right-0 h-56 bg-gradient-to-b from-[#0a0a0c]/90 via-[#0a0a0c]/40 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-[#0a0a0c]/95 via-[#0a0a0c]/30 to-transparent pointer-events-none z-10" />

      {/* Main Container */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24">
        
        {/* Toast Alert Banner */}
        {successToast && (
          <div className="fixed bottom-6 right-6 z-50 max-w-md bg-zinc-900/95 border-l-4 border-[#c5a059] text-white p-4 rounded-r-xl shadow-2xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 backdrop-blur-md">
            <CheckCircle2 className="w-5 h-5 text-[#c5a059] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Action Confirmed</p>
              <p className="text-xs text-white/70 mt-1">{successToast}</p>
            </div>
            <button 
              type="button"
              onClick={() => setSuccessToast('')} 
              className="text-white/40 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Title and Subtitle */}
        <div className="text-center mb-16">
          <h1
            className="font-normal leading-[0.95] text-white text-[2.5rem] sm:text-5xl md:text-6xl tracking-tight"
            style={{ 
              fontFamily: "'Neue Haas Grotesk Display Pro 55 Roman', 'Neue Haas Grotesk Text Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif", 
              letterSpacing: '-0.035em' 
            }}
          >
            My <span className="text-[#c5a059]">Bookings</span>
          </h1>
          <p className="mt-4 sm:mt-6 text-white/70 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            Manage your booked stays, examine payment plans, and review completed host experiences.
          </p>
        </div>

        {/* Bookings List mapping to PlaceCard */}
        <div className="space-y-12">
          {bookings.map((booking) => {
            const isUpcoming = booking.status === 'upcoming';
            const isCompleted = booking.status === 'completed';
            const isCancelled = booking.status === 'cancelled';

            return (
              <div 
                key={booking.id}
                className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl transition-all duration-300 hover:border-[#c5a059]/20"
              >
                {/* Embedded Native Card Component */}
                <PlaceCard
                  images={[booking.venueImage]}
                  tags={[
                    booking.status.toUpperCase(),
                    `${booking.guests} Guests Maximum`
                  ]}
                  rating={4.9}
                  title={booking.venueTitle}
                  dateRange={`${formatDateString(booking.startDate)} to ${formatDateString(booking.endDate)}`}
                  hostType="Verified Elite Host"
                  isTopRated={isUpcoming}
                  description={booking.checkInInstructions}
                  pricePerNight={Math.round(booking.totalPrice / 2)}
                  capacity={booking.guests}
                  eventTypes={['Celebration', 'Gatherative']}
                  className="border-none bg-transparent shadow-none hover:border-transparent p-0"
                />

                {/* Unified Booking Action Bar under the Card */}
                <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                  {/* Status Indicator */}
                  <div className="flex flex-col gap-1">
                    <div className="text-xs">
                      {isUpcoming && (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          
                          
                        </div>
                      )}
                      {isCompleted && (
                        <span className="text-white/40 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a059]" /> Hope you enjoyed your stay!
                        </span>
                      )}
                      {isCancelled && (
                        <span className="text-red-400/80 flex items-center gap-1.5 font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Stay Cancelled & Refund Processed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Booking Specific Interaction Button Matrix */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Active reservation interactions */}
                    {isUpcoming && (
                      <>
                        <button
                          type="button"
                          onClick={() => setCancelTargetBooking(booking)}
                          className="px-5 py-2.5 text-xs font-semibold tracking-wider text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full border border-red-500/20 transition-all duration-300 active:scale-[0.98]"
                        >
                          Cancel Stay
                        </button>
                        <button
                          type="button"
                          onClick={() => setTicketModalBooking(booking)}
                          className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold tracking-wider bg-[#c5a059] text-black hover:bg-[#ebd5a7] rounded-full shadow-lg transition-all duration-300 active:scale-[0.98]"
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Payment Details
                        </button>
                      </>
                    )}

                    {/* Past reservation interactions */}
                    {isCompleted && (
                      <>
                        <button
                          type="button"
                          onClick={() => setTicketModalBooking(booking)}
                          className="px-5 py-2.5 text-xs font-semibold text-white/70 hover:text-white border border-white/10 hover:border-white/20 rounded-full transition-all"
                        >
                          Receipt
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewTargetBooking(booking)}
                          className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold tracking-wider bg-[#c5a059] text-black hover:bg-[#ebd5a7] rounded-full shadow-lg transition-all duration-300 active:scale-[0.98]"
                        >
                          <Star className="w-3.5 h-3.5" /> Write Review
                        </button>
                      </>
                    )}

                    {/* Cancelled reservation option */}
                    {isCancelled && (
                      <button
                        type="button"
                        onClick={() => {
                          setSuccessToast("Re-booking slot coordinates for " + booking.venueTitle + "...");
                        }}
                        className="px-6 py-2.5 text-xs font-semibold text-[#c5a059] border border-[#c5a059]/30 hover:bg-[#c5a059]/10 rounded-full transition-all"
                      >
                        Rebook Venue
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {bookings.length === 0 && (
            <div className="text-center py-24 bg-black/20 border border-white/5 rounded-3xl max-w-2xl mx-auto">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Info className="w-6 h-6 text-[#c5a059]/60" />
              </div>
              <h3 className="text-lg font-medium text-white mb-1">No bookings found</h3>
              <p className="text-sm text-white/40 max-w-xs mx-auto">
                You currently don't have any bookings listed under your account.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL DIALOGS ================= */}

      {/* 1. Payment Details Modal */}
      {ticketModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setTicketModalBooking(null)} />
          
          {/* Modal Box */}
          <div className="relative bg-[#0d0d11] border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#13131a]">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#c5a059] font-mono">Invoice Summary</span>
                <h4 className="text-lg font-semibold text-white mt-1">{ticketModalBooking.venueTitle}</h4>
              </div>
              <button 
                type="button"
                onClick={() => setTicketModalBooking(null)}
                className="text-white/40 hover:text-white transition-colors text-xl p-1"
              >
                ✕
              </button>
            </div>

            {/* Receipt & Payments Breakdown Content */}
            <div className="p-6 space-y-6">
              {/* Payment Split Timeline Progress View */}
              <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5 space-y-4">
                

                <div className="pt-3 border-t border-white/5 flex justify-between items-center text-sm">
                  <span className="text-white/60 font-medium">Total Agreed Cost</span>
                  <span className="text-base font-bold text-white">{formatPrice(ticketModalBooking.totalPrice)}</span>
                </div>
              </div>

              {/* Booking Dates Breakdown */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/50">Address Location</span>
                  <span className="text-white font-medium">{ticketModalBooking.venueLocation}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/50">Scheduled Arrival</span>
                  <span className="text-white font-medium">{formatDateString(ticketModalBooking.startDate)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/50">Scheduled Departure</span>
                  <span className="text-white font-medium">{formatDateString(ticketModalBooking.endDate)}</span>
                </div>
              </div>

              {/* Host Contact Panel */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-2">
                <p className="text-xs text-[#c5a059] uppercase tracking-wider font-semibold mb-2">Host Contact Details</p>
                <div className="text-sm font-semibold">{ticketModalBooking.hostName}</div>
                <div className="flex flex-col gap-1 mt-1 text-xs text-white/60">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-white/40" /> {ticketModalBooking.hostPhone}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-white/40" /> {ticketModalBooking.hostMail}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 text-xs text-white/50 leading-relaxed bg-[#0a0a0c]/20 p-2.5 rounded-lg">
                  <strong>Access Policy: </strong> {ticketModalBooking.checkInInstructions}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-6 bg-[#13131a] border-t border-white/5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(ticketModalBooking.id);
                  setSuccessToast("Booking verification key copied to clipboard!");
                  setTicketModalBooking(null);
                }}
                className="flex-1 py-3 text-xs font-semibold tracking-wider text-center text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/5"
              >
                Copy Reference ID
              </button>
              <button
                type="button"
                onClick={() => setTicketModalBooking(null)}
                className="flex-1 py-3 text-xs font-semibold tracking-wider text-center text-black bg-[#c5a059] hover:bg-[#ebd5a7] rounded-full transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Cancel Confirmation Modal */}
      {cancelTargetBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setCancelTargetBooking(null)} />
          
          <div className="relative bg-[#0d0d11] border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white">Cancel Lease Agreement?</h4>
                <p className="text-xs text-white/60">
                  You are requesting to cancel the reservation for <strong className="text-white">{cancelTargetBooking.venueTitle}</strong> starting {new Date(cancelTargetBooking.startDate).toLocaleDateString()}.
                </p>
              </div>

              {/* Cancellation Warning Terms */}
              <div className="bg-[#1a1113] border border-red-500/10 rounded-2xl p-4 text-left text-xs text-red-200 space-y-1">
                <p className="font-semibold text-red-400">Cancellation Policy & Terms:</p>
                <ul className="list-disc pl-4 space-y-1 text-red-200/80">
                  <li>Your 30% upfront deposit will be refunded to your original payment method in 3-5 business days.</li>
                  <li>This cancellation cannot be undone. Host slots will release instantly.</li>
                </ul>
              </div>
            </div>

            <div className="p-6 bg-[#13131a] border-t border-white/5 flex gap-3">
              <button
                type="button"
                onClick={() => setCancelTargetBooking(null)}
                className="flex-1 py-3 text-xs font-semibold tracking-wider text-center text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/5"
              >
                Keep Stay
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 py-3 text-xs font-semibold tracking-wider text-center text-white bg-red-500 hover:bg-red-600 rounded-full transition-colors"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Leave Venue Feedback Review Modal */}
      {reviewTargetBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setReviewTargetBooking(null)} />
          
          <div className="relative bg-[#0d0d11] border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#13131a]">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#c5a059] font-mono">Feedback System</span>
                <h4 className="text-lg font-semibold text-white mt-1">Review Your Experience</h4>
              </div>
              <button 
                type="button"
                onClick={() => setReviewTargetBooking(null)}
                className="text-white/40 hover:text-white transition-colors text-xl p-1"
              >
                ✕
              </button>
            </div>

            {/* Review form */}
            <form onSubmit={handlePublishReview}>
              <div className="p-6 space-y-5">
                <div className="text-center bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-xs text-white/50 mb-1">YOUR REVIEWED VENUE</p>
                  <p className="font-semibold text-white text-base">{reviewTargetBooking.venueTitle}</p>
                  <p className="text-[11px] text-[#c5a059] mt-0.5">{reviewTargetBooking.venueLocation}</p>
                </div>

                {/* Star rating selector */}
                <div className="space-y-2">
                  <label className="text-xs text-white/50 block font-medium">Over Rating Score</label>
                  <div className="flex items-center justify-center gap-3 py-2">
                    {[1, 2, 3, 4, 5].map((starValue) => {
                      const isHighlighted = starValue <= reviewRating;
                      return (
                        <button
                          key={starValue}
                          type="button"
                          onClick={() => setReviewRating(starValue)}
                          className="p-1 focus:outline-none transform hover:scale-125 transition-transform"
                        >
                          <Star 
                            className={`w-8 h-8 transition-colors ${
                              isHighlighted 
                                ? 'fill-[#c5a059] text-[#c5a059] drop-shadow-[0_0_6px_rgba(197,160,89,0.3)]' 
                                : 'text-white/20 hover:text-white/50'
                            }`} 
                          />
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-center text-xs text-[#c5a059] font-semibold mt-1">
                    {reviewRating === 5 && "Outstanding Experience"}
                    {reviewRating === 4 && "Great, Loved It"}
                    {reviewRating === 3 && "Average Experience"}
                    {reviewRating === 2 && "Some Elements Needed Improvements"}
                    {reviewRating === 1 && "Poor / Unsatisfactory"}
                  </p>
                </div>

                {/* Review Text Area */}
                <div className="space-y-1.5">
                  <label className="text-xs text-white/50 block font-medium">Write feedback review details</label>
                  <textarea
                    required
                    value={reviewText}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReviewText(e.target.value)}
                    placeholder="Tell us what you loved! Detail your review about hosting, decoration layout, amenities accuracy, and general security..."
                    rows={4}
                    className="w-full text-sm p-4 bg-[#0a0a0c] border border-white/10 rounded-2xl text-white placeholder-white/25 focus:outline-none focus:border-[#c5a059] transition-colors"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-6 bg-[#13131a] border-t border-white/5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setReviewTargetBooking(null)}
                  className="flex-1 py-3 text-xs font-semibold tracking-wider text-center text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/5"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-semibold tracking-wider text-center text-black bg-[#c5a059] hover:bg-[#ebd5a7] rounded-full transition-colors shadow-lg"
                >
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
}