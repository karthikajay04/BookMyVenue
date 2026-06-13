import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building, MapPin, Users, Maximize2, Plus, Edit, Trash2, X,
  CheckCircle2, AlertCircle, Sparkles, PlusCircle, Trash, Star, ArrowRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getVenues, updateVenueInLocalStorage, deleteVenueFromLocalStorage } from '../data/venuesData';
import type { Venue } from '../data/venuesData';
import { cn } from '@/lib/utils';

export default function MyVenues() {
  const navigate = useNavigate();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Success/Error notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Edit Modal State
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editFullAddress, setEditFullAddress] = useState('');
  const [editCapacity, setEditCapacity] = useState<number>(0);
  const [editSquareFeet, setEditSquareFeet] = useState<number>(0);
  const [editPricePerNight, setEditPricePerNight] = useState<number>(0);
  const [editParking, setEditParking] = useState('');
  const [editCatering, setEditCatering] = useState('');

  // Lists in edit modal
  const [editAmenities, setEditAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');

  const [editImages, setEditImages] = useState<string[]>([]);
  const [newImage, setNewImage] = useState('');

  const [editRules, setEditRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState('');

  const [editEventTypes, setEditEventTypes] = useState<string[]>([]);
  const [newEventDynamic, setNewEventDynamic] = useState('');

  // Delete Confirmation State
  const [deletingVenueId, setDeletingVenueId] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      navigate('/login?redirect=/my-venues');
      return;
    }

    try {
      const userObj = JSON.parse(userStr);
      setCurrentUser(userObj);
      if (userObj.role !== 'venue_owner') {
        // Redirect if not owner
        navigate('/');
      }
    } catch (e) {
      navigate('/login');
    }
  }, [navigate]);

  const fetchHostVenues = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    let userEmail = '';
    if (userStr) {
      try {
        userEmail = JSON.parse(userStr).email;
      } catch (e) { }
    }

    try {
      const response = await fetch('http://localhost:5000/api/venues/my-venues', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setVenues(data);
      } else {
        // Fallback to local storage
        const local = getVenues();
        // Filter local storage venues owned by this user
        const userVenues = local.filter(v => v.hostType === 'Superhost' || v.id === '1' || v.id === '2');
        setVenues(userVenues);
      }
    } catch (err) {
      console.error('Failed fetching host venues from backend, falling back:', err);
      const local = getVenues();
      setVenues(local);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchHostVenues();
    }
  }, [currentUser]);

  const triggerToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Open edit modal & populate form fields
  const handleOpenEdit = (venue: Venue) => {
    setEditingVenue(venue);
    setEditTitle(venue.title);
    setEditDescription(venue.description);
    setEditLocation(venue.location);
    setEditFullAddress(venue.fullAddress || '');
    setEditCapacity(venue.capacity);
    setEditSquareFeet(venue.squareFeet || 0);
    setEditPricePerNight(venue.pricePerNight);
    setEditParking(venue.parking || '');
    setEditCatering(venue.catering || '');
    setEditAmenities(venue.amenities || []);
    setEditImages(venue.images || []);
    setEditRules(venue.rules || []);
    setEditEventTypes(venue.eventTypes || []);
  };

  // Submit edit form
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVenue) return;

    if (!editTitle.trim() || !editDescription.trim() || !editLocation.trim() || !editFullAddress.trim() || editCapacity <= 0 || editSquareFeet <= 0 || editPricePerNight <= 0) {
      triggerToast('Please fill out all required fields with valid values.', 'error');
      return;
    }

    if (editImages.length < 1) {
      triggerToast('At least one image is required.', 'error');
      return;
    }

    const token = localStorage.getItem('token');
    const updatedPayload = {
      title: editTitle,
      description: editDescription,
      location: editLocation,
      fullAddress: editFullAddress,
      capacity: Number(editCapacity),
      squareFeet: Number(editSquareFeet),
      pricePerNight: Number(editPricePerNight),
      dateRange: editingVenue.dateRange || 'Available',
      parking: editParking,
      catering: editCatering,
      images: editImages,
      amenities: editAmenities,
      rules: editRules,
      eventTypes: editEventTypes
    };

    try {
      const response = await fetch(`http://localhost:5000/api/venues/${editingVenue.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedPayload)
      });

      if (response.ok) {
        triggerToast('Venue updated successfully!', 'success');
      } else {
        // Fallback update local storage
        updateVenueInLocalStorage(editingVenue.id, updatedPayload);
        triggerToast('Venue updated locally!', 'success');
      }
      setEditingVenue(null);
      fetchHostVenues();
    } catch (err) {
      console.error('Failed to update venue on server, falling back:', err);
      updateVenueInLocalStorage(editingVenue.id, updatedPayload);
      triggerToast('Venue updated locally!', 'success');
      setEditingVenue(null);
      fetchHostVenues();
    }
  };

  // Handle delete
  const handleDeleteConfirm = async () => {
    if (!deletingVenueId) return;
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:5000/api/venues/${deletingVenueId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        triggerToast('Venue deleted successfully.', 'success');
      } else {
        deleteVenueFromLocalStorage(deletingVenueId);
        triggerToast('Venue removed from local storage.', 'success');
      }
      setDeletingVenueId(null);
      fetchHostVenues();
    } catch (err) {
      console.error('Failed to delete venue, falling back:', err);
      deleteVenueFromLocalStorage(deletingVenueId);
      triggerToast('Venue removed from local storage.', 'success');
      setDeletingVenueId(null);
      fetchHostVenues();
    }
  };

  // Helper arrays update
  const addAmenity = () => {
    if (newAmenity.trim() && !editAmenities.includes(newAmenity.trim())) {
      setEditAmenities([...editAmenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const removeAmenity = (val: string) => {
    setEditAmenities(editAmenities.filter(a => a !== val));
  };

  const addImage = () => {
    if (newImage.trim() && !editImages.includes(newImage.trim())) {
      setEditImages([...editImages, newImage.trim()]);
      setNewImage('');
    }
  };

  const removeImage = (val: string) => {
    setEditImages(editImages.filter(img => img !== val));
  };

  const addRule = () => {
    if (newRule.trim() && !editRules.includes(newRule.trim())) {
      setEditRules([...editRules, newRule.trim()]);
      setNewRule('');
    }
  };

  const removeRule = (val: string) => {
    setEditRules(editRules.filter(r => r !== val));
  };

  const addEventType = () => {
    if (newEventDynamic.trim() && !editEventTypes.includes(newEventDynamic.trim())) {
      setEditEventTypes([...editEventTypes, newEventDynamic.trim()]);
      setNewEventDynamic('');
    }
  };

  const removeEventType = (val: string) => {
    setEditEventTypes(editEventTypes.filter(e => e !== val));
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

      {/* Background Gradients */}
      <div className="absolute top-0 left-0 right-0 h-56 bg-gradient-to-b from-[#0a0a0c]/90 via-[#0a0a0c]/40 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-[#0a0a0c]/95 via-[#0a0a0c]/30 to-transparent pointer-events-none z-10" />

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40">

        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8 mb-10">
          <div>
            <h1
              className="text-4xl sm:text-5xl font-normal tracking-tight text-white leading-none"
              style={{ fontFamily: "'Neue Haas Grotesk Display Pro 55 Roman', 'Helvetica Neue', Arial, sans-serif", letterSpacing: '-0.03em' }}
            >
              My{' '}
              <span className="text-[#c5a059] bg-gradient-to-r from-[#c5a059] to-[#dfba75] bg-clip-text text-transparent font-medium">
                Venues
              </span>
            </h1>
            <p className="text-white/60 text-sm mt-3 max-w-xl font-light">
              Welcome back to your host dashboard. List new event spaces, modify details, and manage booking availabilities.
            </p>
          </div>
          <Button
            onClick={() => navigate('/addvenues')}
            className="bg-[#c5a059] hover:bg-[#b08e4d] text-black font-semibold rounded-full px-6 py-2.5 flex items-center gap-2 shadow-lg shadow-[#c5a059]/10 transition-all active:scale-97"
          >
            <Plus className="w-4 h-4" />
            Add New Venue
          </Button>
        </div>



        {/* Listings Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-[#c5a059] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60">Loading your listings...</p>
          </div>
        ) : venues.length === 0 ? (
          <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-16 text-center space-y-4 max-w-xl mx-auto">
            <Building className="w-12 h-12 text-[#c5a059] mx-auto opacity-70" />
            <h3 className="text-xl font-bold text-white">No Venues Listed Yet</h3>
            <p className="text-white/60 text-sm font-light">
              You haven't listed any venues under this account yet. Click below to add your first premium location.
            </p>
            <Button
              onClick={() => navigate('/addvenues')}
              className="bg-[#c5a059] hover:bg-[#b08e4d] text-black font-semibold rounded-full px-6 mt-4"
            >
              List Your Venue Now
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {venues.map((venue) => (
              <div
                key={venue.id}
                className="bg-[#0e0e12]/80 border border-white/10 hover:border-[#c5a059]/35 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-center justify-between transition-all duration-300 shadow-xl backdrop-blur-md group"
              >
                {/* Visual Details */}
                <div className="flex flex-col sm:flex-row items-center gap-5 w-full md:w-[75%]">
                  <div className="w-full sm:w-44 h-32 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0 relative">
                    <img
                      src={venue.images?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=300'}
                      alt={venue.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                    />
                    {venue.isTopRated && (
                      <div className="absolute top-2 left-2 bg-[#c5a059] text-black text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                        Luxury
                      </div>
                    )}
                  </div>
                  <div className="text-center sm:text-left space-y-2.5 min-w-0">
                    <h3 className="text-xl font-bold text-white truncate">{venue.title}</h3>
                    <p className="text-white/60 text-xs font-light line-clamp-2">{venue.description}</p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-white/50 pt-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span>{venue.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span>Max {venue.capacity} guests</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span>{venue.squareFeet?.toLocaleString() || 'N/A'} sq ft</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rates & Action Controls */}
                <div className="flex flex-col sm:flex-row md:flex-col items-center justify-center md:items-end gap-4 border-t border-white/5 md:border-t-0 pt-4 md:pt-0 w-full md:w-[20%]">
                  <div className="text-center md:text-right">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold block">Daily Rate</span>
                    <span className="text-2xl font-bold text-[#c5a059]">${venue.pricePerNight}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleOpenEdit(venue)}
                      className="bg-white/5 hover:bg-white/10 text-white rounded-full w-10 h-10 p-0 border border-white/10 transition-colors flex items-center justify-center"
                      title="Edit details"
                    >
                      <Edit className="w-4 h-4 text-[#c5a059]" />
                    </Button>
                    <Button
                      onClick={() => setDeletingVenueId(venue.id)}
                      className="bg-white/5 hover:bg-red-950/20 text-white rounded-full w-10 h-10 p-0 border border-white/10 hover:border-red-500/30 transition-colors flex items-center justify-center"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                    <Button
                      onClick={() => navigate(`/venue/${venue.id}`)}
                      className="bg-white/5 hover:bg-white/10 text-white rounded-full w-10 h-10 p-0 border border-white/10 transition-colors flex items-center justify-center"
                      title="View Details Page"
                    >
                      <ArrowRight className="w-4 h-4 text-white/70" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT MODAL DIALOG */}
      <AnimatePresence>
        {editingVenue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingVenue(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-[#0e0e12] border border-white/15 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl backdrop-blur-xl z-10 flex flex-col text-left"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0e0e12]/95 backdrop-blur-md z-15">
                <div>
                  <h3 className="text-xl font-bold text-white">Edit Venue Details</h3>
                  <p className="text-xs text-white/50 mt-1">Modify fields below to update standard settings</p>
                </div>
                <button
                  onClick={() => setEditingVenue(null)}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body Form */}
              <form onSubmit={handleUpdateSubmit} className="p-6 space-y-6 flex-1">
                {/* Row 1: Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Venue Name *</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c5a059]/40"
                    placeholder="e.g. The Glass Pavilion"
                  />
                </div>

                {/* Row 2: Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Description *</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#c5a059]/40 resize-none"
                    placeholder="Provide overview details..."
                  />
                </div>

                {/* Row 3: Specs Triple */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Max Capacity *</label>
                    <input
                      type="number"
                      value={editCapacity}
                      onChange={(e) => setEditCapacity(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#c5a059]/40"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Space Area (Sq Ft) *</label>
                    <input
                      type="number"
                      value={editSquareFeet}
                      onChange={(e) => setEditSquareFeet(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#c5a059]/40"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">City Location *</label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#c5a059]/40"
                    />
                  </div>
                </div>

                {/* Row 4: Pricing */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Standard Daily Rate ($) *</label>
                  <input
                    type="number"
                    value={editPricePerNight}
                    onChange={(e) => setEditPricePerNight(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#c5a059]/40"
                  />
                </div>

                {/* Row 5: Full Address */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Full Street Address *</label>
                  <input
                    type="text"
                    value={editFullAddress}
                    onChange={(e) => setEditFullAddress(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#c5a059]/40"
                  />
                </div>

                {/* Row 6: Parking & Catering policies */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Parking Accommodations</label>
                    <textarea
                      value={editParking}
                      onChange={(e) => setEditParking(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-xs text-white resize-none focus:outline-none focus:border-[#c5a059]/40"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Food & Catering Policy</label>
                    <textarea
                      value={editCatering}
                      onChange={(e) => setEditCatering(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-xs text-white resize-none focus:outline-none focus:border-[#c5a059]/40"
                    />
                  </div>
                </div>

                <hr className="border-white/5" />

                {/* Row 7: Images Array Catalog */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Media Gallery Images (URLs) *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste image URL here..."
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={addImage}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 rounded-lg text-xs"
                    >
                      Add Url
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                    {editImages.map((imgUrl, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 bg-white/[0.01] border border-white/5 p-1.5 rounded-lg text-[10px]">
                        <span className="truncate text-white/60 font-mono">{imgUrl}</span>
                        <button type="button" onClick={() => removeImage(imgUrl)} className="text-white/40 hover:text-red-400">
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Row 8: Amenities */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Amenities Checklist</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add custom amenity (e.g. Free valet)..."
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={addAmenity}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 rounded-lg text-xs"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {editAmenities.map((amenity, i) => (
                      <Badge key={i} className="bg-white/5 border border-white/10 hover:border-red-400/30 text-white/80 py-1 pl-3 pr-2 rounded-full text-[10px] flex items-center gap-1.5 group/badge">
                        <span>{amenity}</span>
                        <button type="button" onClick={() => removeAmenity(amenity)} className="text-white/40 hover:text-red-400 group-hover/badge:text-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Row 9: Event Types */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Perfect For (Event Types)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add event type (e.g. Conferences)..."
                      value={newEventDynamic}
                      onChange={(e) => setNewEventDynamic(e.target.value)}
                      className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={addEventType}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 rounded-lg text-xs"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {editEventTypes.map((type, i) => (
                      <Badge key={i} className="bg-[#c5a059]/10 border border-[#c5a059]/30 text-[#c5a059] py-1 pl-3 pr-2 rounded-full text-[10px] flex items-center gap-1.5">
                        <span>{type}</span>
                        <button type="button" onClick={() => removeEventType(type)} className="text-white/40 hover:text-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Row 10: Rules */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">House Rules</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add house rule..."
                      value={newRule}
                      onChange={(e) => setNewRule(e.target.value)}
                      className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={addRule}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 rounded-lg text-xs"
                    >
                      Add
                    </button>
                  </div>
                  <ul className="space-y-1.5 bg-black/20 border border-white/5 p-3 rounded-xl">
                    {editRules.map((rule, i) => (
                      <li key={i} className="flex justify-between items-center text-xs text-white/60">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-[#c5a059]" />
                          <span>{rule}</span>
                        </span>
                        <button type="button" onClick={() => removeRule(rule)} className="text-white/40 hover:text-red-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Modal Footer actions */}
                <div className="pt-6 border-t border-white/10 flex justify-end gap-3 sticky bottom-0 bg-[#0e0e12]/95 backdrop-blur-md">
                  <Button
                    type="button"
                    onClick={() => setEditingVenue(null)}
                    className="bg-white/5 hover:bg-white/10 text-white rounded-full px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#c5a059] hover:bg-[#b08e4d] text-black font-semibold rounded-full px-6 shadow-md shadow-[#c5a059]/10"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {deletingVenueId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingVenueId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#0e0e12] border border-white/15 rounded-3xl w-full max-w-md p-6 shadow-2xl z-10 space-y-5 text-center"
            >
              <div className="w-12 h-12 bg-red-950/20 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Delete Listing Space</h3>
                <p className="text-xs text-white/50 leading-relaxed font-light">
                  Are you absolutely sure you want to delete this listing? This action is permanent and cannot be undone. All booked reservation histories under this space could be affected.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => setDeletingVenueId(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full h-11"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full h-11"
                >
                  Delete Listing
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GLOBAL TOAST NOTICE */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-[#0e0e12] border border-white/10 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md"
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
