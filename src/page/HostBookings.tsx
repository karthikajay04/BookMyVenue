import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Users, CheckCircle2, Clock, XCircle, Info,
  DollarSign, Mail, Phone, ChevronRight, User, AlertCircle, RefreshCw
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface HostBooking {
  id: string;
  venueId: string;
  venueTitle: string;
  venueLocation: string;
  venueImage: string;
  startDate: string;
  endDate: string;
  guests: number;
  totalPrice: number;
  status: 'upcoming' | 'completed' | 'cancelled' | 'offline';
  bookingDate: string;
  paymentStatus: string;
  renterName: string;
  renterEmail: string;
  hostName: string;
  hostMail: string;
  checkInInstructions: string;
  bookingType?: string;
}

// Mock Fallback Host Bookings for offline simulation
const mockHostBookings: HostBooking[] = [
  {
    id: "BKG-9921",
    venueId: "1",
    venueTitle: "The Glass Pavilion",
    venueLocation: "Los Angeles, CA",
    venueImage: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=400",
    startDate: "2026-06-12",
    endDate: "2026-06-15",
    guests: 75,
    totalPrice: 1552.5,
    status: "upcoming",
    bookingDate: "2026-06-01",
    paymentStatus: "paid",
    renterName: "Sarah Jenkins",
    renterEmail: "sarah.j@creativeagency.com",
    hostName: "Host Account",
    hostMail: "owner@bookmyvenue.com",
    checkInInstructions: "Gate code is #1209. Please meet coordinator Michael at the entrance. AV check starts at 10 AM."
  },
  {
    id: "BKG-4820",
    venueId: "1",
    venueTitle: "The Glass Pavilion",
    venueLocation: "Los Angeles, CA",
    venueImage: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=400",
    startDate: "2026-06-25",
    endDate: "2026-06-28",
    guests: 90,
    totalPrice: 2070.0,
    status: "upcoming",
    bookingDate: "2026-06-03",
    paymentStatus: "paid",
    renterName: "David Miller",
    renterEmail: "d.miller@techcorps.org",
    hostName: "Host Account",
    hostMail: "owner@bookmyvenue.com",
    checkInInstructions: "Check-in instructions: Enter via main lobby valet desk. Secure entry code: #4550."
  },
  {
    id: "BKG-7712",
    venueId: "2",
    venueTitle: "Sunset Bay Villa",
    venueLocation: "Miami, FL",
    venueImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=400",
    startDate: "2026-05-10",
    endDate: "2026-05-12",
    guests: 8,
    totalPrice: 1656.0,
    status: "completed",
    bookingDate: "2026-04-15",
    paymentStatus: "paid",
    renterName: "Elena Rostova",
    renterEmail: "elena@rostov.design",
    hostName: "Host Account",
    hostMail: "owner@bookmyvenue.com",
    checkInInstructions: "Completed stay. Guest left location in excellent condition."
  },
  {
    id: "BKG-3301",
    venueId: "1",
    venueTitle: "The Glass Pavilion",
    venueLocation: "Los Angeles, CA",
    venueImage: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=400",
    startDate: "2026-04-01",
    endDate: "2026-04-03",
    guests: 60,
    totalPrice: 1035.0,
    status: "cancelled",
    bookingDate: "2026-03-20",
    paymentStatus: "refunded",
    renterName: "Robert Dow",
    renterEmail: "robert@dowassociates.com",
    hostName: "Host Account",
    hostMail: "owner@bookmyvenue.com",
    checkInInstructions: "Booking cancelled and refunded."
  }
];

export default function HostBookings(): React.JSX.Element {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<HostBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'completed' | 'offline' | 'cancelled'>('all');

  // Interactive detail overlay
  const [selectedBooking, setSelectedBooking] = useState<HostBooking | null>(null);

  // Cancel stay confirmation dialog
  const [cancelBookingTarget, setCancelBookingTarget] = useState<HostBooking | null>(null);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login?redirect=/bookings');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        // Fallback mock values
        setBookings(mockHostBookings);
      }
    } catch (err) {
      console.error('Failed fetching host bookings from API, using fallback:', err);
      setBookings(mockHostBookings);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [navigate]);

  const triggerToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Payout cancel action
  const handleConfirmCancel = async () => {
    if (!cancelBookingTarget) return;
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${cancelBookingTarget.id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        triggerToast(`Booking ${cancelBookingTarget.id} has been cancelled successfully.`, 'success');
      } else {
        // Mock fallback cancel action
        setBookings(prev => prev.map(b => b.id === cancelBookingTarget.id ? { ...b, status: 'cancelled', paymentStatus: 'refunded' } : b));
        triggerToast(`Booking ${cancelBookingTarget.id} updated locally to cancelled.`, 'success');
      }
      setCancelBookingTarget(null);
      fetchBookings();
    } catch (err) {
      console.error('Failed cancelling booking:', err);
      setBookings(prev => prev.map(b => b.id === cancelBookingTarget.id ? { ...b, status: 'cancelled', paymentStatus: 'refunded' } : b));
      triggerToast(`Booking ${cancelBookingTarget.id} updated locally to cancelled.`, 'success');
      setCancelBookingTarget(null);
      fetchBookings();
    }
  };

  // Filter bookings based on selected status tab
  const filteredBookings = bookings.filter((b) => {
    if (activeFilter === 'all') return true;
    return b.status === activeFilter;
  });

  // Calculate Metrics
  const activeBookings = bookings.filter(b => b.status !== 'cancelled');
  const totalEarnings = activeBookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const upcomingCount = bookings.filter(b => b.status === 'upcoming').length;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatBookingRange = (start: string, end: string, bookingType?: string): string => {
    if (bookingType === 'hours') {
      const startDateObj = new Date(start);
      const endDateObj = new Date(end);

      const datePart = startDateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      const startHourStr = startDateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      const endHourStr = endDateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      return `${datePart}, ${startHourStr} - ${endHourStr}`;
    }

    const s = new Date(start);
    const e = new Date(end);
    return `${formatDate(start)} to ${formatDate(end)}`;
  };

  const getDurationText = (start: string, end: string, bookingType?: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    if (bookingType === 'hours') {
      const diffHours = Math.round(diffTime / (1000 * 60 * 60));
      return `${diffHours} ${diffHours === 1 ? 'Hour' : 'Hours'}`;
    } else {
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const nights = diffDays || 1;
      return `${nights} ${nights === 1 ? 'Night' : 'Nights'}`;
    }
  };

  return (
    <section
      className="relative w-full min-h-screen text-white pb-20 overflow-y-auto"
      style={{
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
        backgroundColor: '#0a0a0c'
      }}
    >
      <Navbar />

      {/* Gradients */}
      <div className="absolute top-0 left-0 right-0 h-56 bg-gradient-to-b from-[#0a0a0c]/90 via-[#0a0a0c]/40 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-[#0a0a0c]/95 via-[#0a0a0c]/30 to-transparent pointer-events-none z-10" />

      {/* Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40">

        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-8 mb-10">
          <div>
            <h1
              className="text-4xl sm:text-5xl font-normal tracking-tight text-white leading-none"
              style={{ fontFamily: "'Neue Haas Grotesk Display Pro 55 Roman', 'Helvetica Neue', Arial, sans-serif", letterSpacing: '-0.03em' }}
            >
              Lease{' '}
              <span className="text-[#c5a059] bg-gradient-to-r from-[#c5a059] to-[#dfba75] bg-clip-text text-transparent font-medium">
                Reservations
              </span>
            </h1>
            <p className="text-white/60 text-sm mt-3 max-w-xl font-light">
              Track customer check-ins, oversee reservation finances, and handle client inquiries.
            </p>
          </div>
          <Button
            onClick={fetchBookings}
            className="bg-white/5 hover:bg-white/10 text-white rounded-full border border-white/15 px-4 h-10 flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>



        {/* Filters and Tab Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4 mb-8">
          <div className="flex gap-1 bg-white/5 border border-white/10 p-1 rounded-full">
            {(['all', 'upcoming', 'completed', 'offline', 'cancelled'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={cn(
                  "px-5 py-1.5 text-xs font-semibold rounded-full capitalize transition-all",
                  activeFilter === tab
                    ? "bg-[#c5a059] text-black shadow-md shadow-[#c5a059]/15"
                    : "text-white/60 hover:text-white"
                )}
              >
                {tab === 'all' ? 'All Bookings' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Reservations Render */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-[#c5a059] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60">Retrieving reservation matrix...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-16 text-center space-y-4 max-w-md mx-auto">
            <Calendar className="w-12 h-12 text-[#c5a059] mx-auto opacity-70" />
            <h3 className="text-lg font-bold text-white">No Reservations Found</h3>
            <p className="text-white/60 text-xs font-light">
              No booking listings correspond to the selected status tab under your hosted spaces.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => {
              const isUpcoming = booking.status === 'upcoming';
              const isCompleted = booking.status === 'completed';
              const isCancelled = booking.status === 'cancelled';
              const durationText = getDurationText(booking.startDate, booking.endDate, booking.bookingType);

              return (
                <div
                  key={booking.id}
                  className={cn(
                    "bg-[#0e0e12]/80 border hover:border-[#c5a059]/35 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-center justify-between transition-all duration-300 shadow-xl backdrop-blur-md group",
                    isCancelled ? "border-white/5 opacity-70" : "border-white/10"
                  )}
                >
                  {/* Left Column: Venue Image & Stay Details */}
                  <div className="flex flex-col sm:flex-row items-center gap-5 w-full md:w-[75%]">
                    <div className="w-full sm:w-36 h-28 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0 relative">
                      <img
                        src={booking.venueImage || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=300'}
                        alt={booking.venueTitle}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                      />
                      <div className="absolute top-2 left-2">
                        {isUpcoming && (
                          <Badge className="bg-emerald-500 text-black border-none text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                            Upcoming
                          </Badge>
                        )}
                        {isCompleted && (
                          <Badge className="bg-white/20 text-white border-none text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                            Completed
                          </Badge>
                        )}
                        {isCancelled && (
                          <Badge className="bg-red-500 text-white border-none text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                            Cancelled
                          </Badge>
                        )}
                        {booking.status === 'offline' && (
                          <Badge className="bg-amber-500 text-black border-none text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                            Offline Lock
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-center sm:text-left space-y-2 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono font-bold">{booking.id}</span>
                        <span className="text-white/30">•</span>
                        <span className="text-[10px] text-[#c5a059] font-semibold">{booking.venueTitle}</span>
                      </div>

                      <h3 className="text-xl font-bold text-white truncate">
                        {booking.bookingType === 'hours' ? (
                          formatBookingRange(booking.startDate, booking.endDate, booking.bookingType)
                        ) : (
                          <>
                            {formatDate(booking.startDate)} <span className="text-xs text-white/40 font-light font-sans mx-1">to</span> {formatDate(booking.endDate)}
                          </>
                        )}
                      </h3>

                      <p className="text-[11px] text-white/50 font-light">
                        Duration: <span className="text-white font-semibold">{durationText}</span>
                      </p>

                      {/* Renter Contact details */}
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1.5 border-t border-white/5 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-white/70">
                          <User className="w-3.5 h-3.5 text-[#c5a059]" />
                          <span className="font-medium">{booking.renterName || 'Offline Date Block'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-white/50">
                          <Mail className="w-3.5 h-3.5 text-white/40" />
                          <span className="truncate max-w-[200px]">{booking.renterEmail || 'N/A (Offline)'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-white/50">
                          <Users className="w-3.5 h-3.5 text-white/40" />
                          <span>{booking.guests || 0} Guests</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Cost and Operations */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-center justify-center md:items-end gap-4 border-t border-white/5 md:border-t-0 pt-4 md:pt-0 w-full md:w-[22%]">
                    <div className="text-center md:text-right">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold block">Payout Amount</span>
                      <span className={cn(
                        "text-xl font-bold block",
                        isCancelled ? "text-white/40 line-through" : "text-[#c5a059]"
                      )}>₹{booking.totalPrice.toLocaleString()}</span>
                      <span className="text-[9px] text-white/30 uppercase tracking-widest font-mono block mt-0.5">{booking.paymentStatus}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedBooking(booking)}
                        className="bg-white/5 hover:bg-white/10 text-white rounded-full text-xs font-semibold px-4 h-9 border border-white/10 transition-all flex items-center justify-center gap-1.5"
                      >
                        Details
                        <ChevronRight className="w-3 h-3 text-white/60" />
                      </Button>

                      {(isUpcoming || booking.status === 'offline') && (
                        <Button
                          onClick={() => setCancelBookingTarget(booking)}
                          className="bg-white/5 hover:bg-red-950/25 text-red-400 hover:text-red-300 rounded-full w-9 h-9 p-0 border border-white/10 hover:border-red-500/20 transition-colors flex items-center justify-center"
                          title={booking.status === 'offline' ? "Unlock Dates" : "Cancel Stay"}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DETAIL MODAL DRAWER */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[#0d0d11] border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden text-left"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#13131a]">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-[#c5a059] font-mono font-bold">Lease Receipt</span>
                  <h4 className="text-lg font-bold text-white mt-1">{selectedBooking.venueTitle}</h4>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">

                {/* Visual info card */}
                <div className="bg-[#13131a] border border-white/5 p-4 rounded-2xl flex items-center gap-4">
                  <img src={selectedBooking.venueImage} className="w-16 h-16 rounded-lg object-cover border border-white/10" alt="Venue view" />
                  <div>
                    <h5 className="font-semibold text-white text-sm">{selectedBooking.venueTitle}</h5>
                    <div className="flex items-center gap-1 text-white/50 text-xs mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span>{selectedBooking.venueLocation}</span>
                    </div>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/40">Booking ID</span>
                    <span className="font-mono text-white font-semibold">{selectedBooking.id}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/40">Check-In</span>
                    <span className="text-white font-medium">
                      {selectedBooking.bookingType === 'hours'
                        ? new Date(selectedBooking.startDate).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
                        : formatDate(selectedBooking.startDate)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/40">Check-Out</span>
                    <span className="text-white font-medium">
                      {selectedBooking.bookingType === 'hours'
                        ? new Date(selectedBooking.endDate).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
                        : formatDate(selectedBooking.endDate)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/40">Guests Count</span>
                    <span className="text-white font-semibold">{selectedBooking.guests} Guests</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/40">Booking Date</span>
                    <span className="text-white font-medium">{formatDate(selectedBooking.bookingDate)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/40">Payout Status</span>
                    <span className="text-white font-bold capitalize">{selectedBooking.paymentStatus}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-white/40 font-medium">Total Payout Cost</span>
                    <span className="text-sm font-bold text-[#c5a059]">₹{selectedBooking.totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Renter Contact details */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3">
                  <p className="text-[10px] text-[#c5a059] uppercase tracking-widest font-bold">Renter Contact Details</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#c5a059] flex items-center justify-center text-black font-bold text-xs uppercase">
                      {(selectedBooking.renterName || 'O').charAt(0)}
                    </div>
                    <div>
                      <h6 className="font-semibold text-white text-xs">{selectedBooking.renterName || 'Offline Date Block'}</h6>
                      {selectedBooking.renterEmail ? (
                        <a href={`mailto:${selectedBooking.renterEmail}`} className="text-[11px] text-white/50 hover:underline">{selectedBooking.renterEmail}</a>
                      ) : (
                        <span className="text-[11px] text-white/30">N/A (Offline Block)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Check in access guidelines */}
                {selectedBooking.checkInInstructions && (
                  <div className="bg-yellow-950/10 border border-[#c5a059]/15 rounded-2xl p-4">
                    <p className="text-[10px] text-[#c5a059] uppercase tracking-widest font-bold mb-1.5">Check-In instructions Sent</p>
                    <p className="text-xs text-white/70 leading-relaxed font-light">{selectedBooking.checkInInstructions}</p>
                  </div>
                )}

              </div>

              {/* Modal footer */}
              <div className="p-6 bg-[#13131a] border-t border-white/5 flex gap-3">
                <a
                  href={`mailto:${selectedBooking.renterEmail}?subject=Regarding your booking ${selectedBooking.id} at ${selectedBooking.venueTitle}`}
                  className="flex-1 py-2.5 text-xs font-semibold text-center text-white bg-white/5 hover:bg-white/10 rounded-full border border-white/15 transition-all flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email Renter
                </a>
                <Button
                  onClick={() => setSelectedBooking(null)}
                  className="flex-1 bg-[#c5a059] hover:bg-[#b08e4d] text-black font-semibold rounded-full h-10 transition-all text-xs"
                >
                  Done
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CANCELLATION WARNING DIALOG */}
      <AnimatePresence>
        {cancelBookingTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCancelBookingTarget(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#0d0d11] border border-white/10 w-full max-w-md p-6 rounded-3xl shadow-2xl z-10 space-y-5 text-center"
            >
              <div className="w-12 h-12 bg-red-950/20 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">
                  {cancelBookingTarget.status === 'offline' ? 'Unlock Venue Dates?' : 'Cancel Guest Reservation?'}
                </h3>
                <p className="text-xs text-white/50 leading-relaxed font-light">
                  {cancelBookingTarget.status === 'offline' ? (
                    <>Are you sure you want to unlock the offline date block at <strong className="text-white">{cancelBookingTarget.venueTitle}</strong>?</>
                  ) : (
                    <>Are you sure you want to cancel the reservation for <strong className="text-white">{cancelBookingTarget.renterName}</strong> at {cancelBookingTarget.venueTitle}?</>
                  )}
                </p>
                <p className="text-[10px] text-red-400/80 bg-red-950/10 border border-red-500/10 p-2.5 rounded-lg font-light leading-normal">
                  {cancelBookingTarget.status === 'offline' ? (
                    <>This action is permanent and will unlock the dates on your calendar, allowing new online rentals.</>
                  ) : (
                    <>The deposit amount of <strong>₹{cancelBookingTarget.totalPrice.toLocaleString()}</strong> will be refunded to the client. This action is permanent and frees up calendar dates.</>
                  )}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => setCancelBookingTarget(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full h-11 text-xs"
                >
                  {cancelBookingTarget.status === 'offline' ? 'Keep Blocked' : 'Keep Booking'}
                </Button>
                <Button
                  onClick={handleConfirmCancel}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full h-11 text-xs"
                >
                  {cancelBookingTarget.status === 'offline' ? 'Unlock Dates' : 'Cancel Booking'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST SUCCESS ALERT */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-[#0e0e12] border border-white/10 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5"
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            )}
            <span className="text-xs font-medium text-white/90">{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
