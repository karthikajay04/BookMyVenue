import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Users, Car, Check, ShieldAlert, Utensils, Maximize2,
    Calendar, Star, Sparkles, Plus, Trash2, Eye, FileText, Settings,
    CheckCircle2, ArrowLeft, BadgeAlert, PlusCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { addVenue } from '../data/venuesData';
import type { Venue } from '../data/venuesData';
import { cn } from '@/lib/utils';

// Preset amenities to select from
const PRESET_AMENITIES = [
    'High-speed Wi-Fi',
    'Professional Sound System',
    'Bridal Suite',
    'Full AC & Heating',
    'Ambient LED Lighting',
    'Outdoor Garden Area',
    'Stage & Podium'
];

// Preset event types to select from
const PRESET_EVENT_TYPES = [
    'Weddings',
    'Corporate Galas',
    'Cocktail Receptions',
    'Art Exhibitions'
];

// High-quality mock Unsplash images to offer as quick selections
const MOCK_IMAGES = [
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop',
];

export default function AddVenue() {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState<'form' | 'success'>('form');
    const [newVenueId, setNewVenueId] = useState<string>('');

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState(''); // Town / city name
    const [fullAddress, setFullAddress] = useState(''); // Full location
    const [capacity, setCapacity] = useState<number>(0);
    const [squareFeet, setSquareFeet] = useState<number>(0);
    const [pricePerNight, setPricePerNight] = useState<number>(0);
    const [dateRange, setDateRange] = useState('Jun 12 - 18');
    const [hostType, setHostType] = useState('Superhost');
    const [rating] = useState<number>(4.9);
    const [isTopRated, setIsTopRated] = useState(true);

    // Lists/Arrays
    const [imageUrls, setImageUrls] = useState<string[]>([
        MOCK_IMAGES[0],
        MOCK_IMAGES[1],
        MOCK_IMAGES[2]
    ]);
    const [customImageUrl, setCustomImageUrl] = useState('');

    const [selectedAmenities, setSelectedAmenities] = useState<string[]>(PRESET_AMENITIES);
    const [customAmenity, setCustomAmenity] = useState('');

    const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(PRESET_EVENT_TYPES);
    const [customEventType, setCustomEventType] = useState('');

    const [catering, setCatering] = useState('In-house gourmet catering available (fully custom menu arrangements), outside licensed & insured caterers allowed upon approval.');
    const [parking, setParking] = useState('Valet parking available for up to 80 cars, underground secure parking garage with 120 dedicated slots, and multiple active EV charging stations.');

    const [rules, setRules] = useState<string[]>([
        'Music must transition to indoor after 11 PM',
        'No confetti, glitter, or open flames permitted',
        'Licensed and certified bartenders required for any alcohol service'
    ]);
    const [newRule, setNewRule] = useState('');

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Pricing calculations
    const basePrice = pricePerNight || 0;
    const serviceFee = Math.round(basePrice * 0.15);
    const totalPrice = basePrice + serviceFee;

    // Add / remove images
    const handleAddImage = () => {
        if (!customImageUrl.trim()) return;
        if (!imageUrls.includes(customImageUrl.trim())) {
            setImageUrls([...imageUrls, customImageUrl.trim()]);
        }
        setCustomImageUrl('');
        setErrors(prev => ({ ...prev, images: '' }));
    };

    const handleRemoveImage = (index: number) => {
        const updated = imageUrls.filter((_, idx) => idx !== index);
        setImageUrls(updated);
    };

    // Amenities helpers
    const toggleAmenity = (amenity: string) => {
        if (selectedAmenities.includes(amenity)) {
            setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
        } else {
            setSelectedAmenities([...selectedAmenities, amenity]);
        }
    };

    const handleAddCustomAmenity = () => {
        if (!customAmenity.trim()) return;
        if (!selectedAmenities.includes(customAmenity.trim())) {
            setSelectedAmenities([...selectedAmenities, customAmenity.trim()]);
        }
        setCustomAmenity('');
    };

    // Event types helpers
    const toggleEventType = (type: string) => {
        if (selectedEventTypes.includes(type)) {
            setSelectedEventTypes(selectedEventTypes.filter(t => t !== type));
        } else {
            setSelectedEventTypes([...selectedEventTypes, type]);
        }
    };

    const handleAddCustomEventType = () => {
        if (!customEventType.trim()) return;
        if (!selectedEventTypes.includes(customEventType.trim())) {
            setSelectedEventTypes([...selectedEventTypes, customEventType.trim()]);
        }
        setCustomEventType('');
    };

    // House rules helpers
    const handleAddRule = () => {
        if (!newRule.trim()) return;
        setRules([...rules, newRule.trim()]);
        setNewRule('');
    };

    const handleRemoveRule = (index: number) => {
        setRules(rules.filter((_, idx) => idx !== index));
    };

    // Validation
    const validateForm = () => {
        const tempErrors: Record<string, string> = {};
        if (!title.trim()) tempErrors.title = 'Title is required.';
        if (!description.trim()) tempErrors.description = 'Description is required.';
        if (!fullAddress.trim()) tempErrors.fullAddress = 'Full Location / Street Address is required.';
        if (!location.trim()) tempErrors.location = 'Town Name is required.';
        if (capacity <= 0) tempErrors.capacity = 'Capacity must be greater than zero.';
        if (squareFeet <= 0) tempErrors.squareFeet = 'Space Area must be greater than zero.';
        if (pricePerNight <= 0) tempErrors.pricePerNight = 'Daily Rate must be greater than zero.';
        if (imageUrls.length < 3) tempErrors.images = 'A minimum of three images is required to list a venue.';

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    // Form submit handler
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        const generatedId = Date.now().toString();

        // Create Tags list
        const tags = [
            location,
            `${capacity} Guests`,
            isTopRated ? 'Luxury' : 'Handpicked'
        ];

        const newVenue: Venue = {
            id: generatedId,
            images: imageUrls,
            tags,
            location,
            capacity,
            rating,
            title,
            dateRange,
            hostType,
            isTopRated,
            description,
            pricePerNight,
            fullAddress,
            parking,
            amenities: selectedAmenities,
            squareFeet,
            catering,
            rules,
            eventTypes: selectedEventTypes
        };

        // Add to localStorage
        addVenue(newVenue);
        setNewVenueId(generatedId);
        setActiveStep('success');
    };

    // Preset quick fields fill helper (auto-fills exactly with user's example details)
    const handleQuickFill = () => {
        setTitle('The Glass Pavilion');
        setDescription('An architectural masterpiece featuring 360-degree glass walls, high ceilings, and stunning garden views.');
        setLocation('Los Angeles');
        setFullAddress('10450 Wilshire Blvd, Los Angeles, CA 90024');
        setCapacity(100);
        setSquareFeet(8500);
        setPricePerNight(450);
        setDateRange('Jun 12 - 18');
        setHostType('Superhost');
        setIsTopRated(true);
        setImageUrls([
            'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop'
        ]);
        setSelectedAmenities([
            'High-speed Wi-Fi',
            'Professional Sound System',
            'Bridal Suite',
            'Full AC & Heating',
            'Ambient LED Lighting',
            'Outdoor Garden Area',
            'Stage & Podium'
        ]);
        setSelectedEventTypes([
            'Weddings',
            'Corporate Galas',
            'Cocktail Receptions',
            'Art Exhibitions'
        ]);
        setCatering('In-house gourmet catering available (fully custom menu arrangements), outside licensed & insured caterers allowed upon approval.');
        setParking('Valet parking available for up to 80 cars, underground secure parking garage with 120 dedicated slots, and multiple active EV charging stations.');
        setRules([
            'Music must transition to indoor after 11 PM',
            'No confetti, glitter, or open flames permitted',
            'Licensed and certified bartenders required for any alcohol service'
        ]);
        setErrors({});
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

            {/* Main Content */}
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40">

                <AnimatePresence mode="wait">
                    {activeStep === 'form' ? (
                        <motion.div
                            key="form-view"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-8"
                        >

                            {/* Header Title Block */}
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
                                <div>
                                    <h1
                                        className="font-normal leading-[0.95] text-white text-[2.2rem] sm:text-[3rem] tracking-tight"
                                        style={{ fontFamily: "'Neue Haas Grotesk Display Pro 55 Roman', 'Neue Haas Grotesk Text Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: '-0.035em' }}
                                    >
                                        List New{' '}
                                        <span className="text-[#c5a059] bg-gradient-to-r from-[#c5a059] to-[#dfba75] bg-clip-text text-transparent font-medium">
                                            Venue
                                        </span>
                                    </h1>
                                    <p className="mt-2 text-white/60 text-xs sm:text-sm max-w-xl">
                                        Fill out all details required for listing a new venue.
                                    </p>
                                </div>
                            </div>

                            {/* Form Layout */}
                            <form onSubmit={handleSubmit} className="w-full flex flex-col lg:flex-row gap-8 items-start justify-between">

                                {/* Inputs Column */}
                                <div className="w-full lg:w-[58%] space-y-6 bg-[#0e0e12]/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl text-left">

                                    {/* Step 1: Venue Title & Overview */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-[#c5a059] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
                                            <FileText className="w-4 h-4" /> Overview & Details
                                        </h3>

                                        {/* Venue Title */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Venue Name *</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. The Glass Pavilion"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className={cn(
                                                    "w-full px-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c5a059]/40 transition-all",
                                                    errors.title && "border-red-500/50 focus:border-red-500"
                                                )}
                                            />
                                            {errors.title && (
                                                <span className="text-[10px] text-red-400 flex items-center gap-1"><BadgeAlert className="w-3 h-3" /> {errors.title}</span>
                                            )}
                                        </div>

                                        {/* Description overview */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Two Line Description Overview *</label>
                                            <textarea
                                                placeholder="e.g. An architectural masterpiece featuring 360-degree glass walls, high ceilings, and stunning garden views."
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                rows={3}
                                                className={cn(
                                                    "w-full px-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c5a059]/40 transition-all resize-none",
                                                    errors.description && "border-red-500/50 focus:border-red-500"
                                                )}
                                            />
                                            {errors.description && (
                                                <span className="text-[10px] text-red-400 flex items-center gap-1"><BadgeAlert className="w-3 h-3" /> {errors.description}</span>
                                            )}
                                        </div>

                                        {/* Specs Triple Flex: Capacity, SqFt, City */}
                                        <div className="flex flex-col sm:flex-row gap-4 w-full">

                                            <div className="flex-1 min-w-0 space-y-1">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Max Capacity *</label>
                                                <input
                                                    type="number"
                                                    placeholder="e.g. 100"
                                                    value={capacity === 0 ? '' : capacity}
                                                    onChange={(e) => setCapacity(Number(e.target.value))}
                                                    className={cn(
                                                        "w-full px-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#c5a059]/40",
                                                        errors.capacity && "border-red-500/50"
                                                    )}
                                                />
                                                {errors.capacity && (
                                                    <span className="text-[10px] text-red-400 flex items-center gap-1">{errors.capacity}</span>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 space-y-1">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Space Area (Sq Ft) *</label>
                                                <input
                                                    type="number"
                                                    placeholder="e.g. 8500"
                                                    value={squareFeet === 0 ? '' : squareFeet}
                                                    onChange={(e) => setSquareFeet(Number(e.target.value))}
                                                    className={cn(
                                                        "w-full px-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#c5a059]/40",
                                                        errors.squareFeet && "border-red-500/50"
                                                    )}
                                                />
                                                {errors.squareFeet && (
                                                    <span className="text-[10px] text-red-400 flex items-center gap-1">{errors.squareFeet}</span>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 space-y-1">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Town Name (City) *</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Los Angeles"
                                                    value={location}
                                                    onChange={(e) => setLocation(e.target.value)}
                                                    className={cn(
                                                        "w-full px-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#c5a059]/40",
                                                        errors.location && "border-red-500/50"
                                                    )}
                                                />
                                                {errors.location && (
                                                    <span className="text-[10px] text-red-400 flex items-center gap-1">{errors.location}</span>
                                                )}
                                            </div>

                                        </div>
                                    </div>

                                    {/* Step 2: Perfect For & Amenities */}
                                    <div className="space-y-4 pt-2">
                                        <h3 className="text-sm font-bold text-[#c5a059] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
                                            <Sparkles className="w-4 h-4" /> Perfect For & Amenities
                                        </h3>

                                        {/* Perfect For checkboxes */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Perfect For (Event Categories)</label>
                                            <div className="flex flex-wrap gap-2 pt-0.5">
                                                {PRESET_EVENT_TYPES.map((type) => {
                                                    const isSelected = selectedEventTypes.includes(type);
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={type}
                                                            onClick={() => toggleEventType(type)}
                                                            className={cn(
                                                                "px-3 py-1 rounded-full text-xs border transition-colors",
                                                                isSelected
                                                                    ? "bg-[#c5a059]/20 text-[#c5a059] border-[#c5a059]/45 font-medium"
                                                                    : "bg-white/[0.02] border-white/10 text-white/60 hover:text-white"
                                                            )}
                                                        >
                                                            {type}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Custom Category Input */}
                                            <div className="flex gap-2 pt-1 max-w-xs">
                                                <input
                                                    type="text"
                                                    placeholder="Custom Event Category..."
                                                    value={customEventType}
                                                    onChange={(e) => setCustomEventType(e.target.value)}
                                                    className="flex-1 px-3 py-1 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddCustomEventType}
                                                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-2.5 rounded-lg text-xs"
                                                >
                                                    + Add
                                                </button>
                                            </div>
                                        </div>

                                        {/* Amenities Checklist */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Amenities *</label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {PRESET_AMENITIES.map((item) => {
                                                    const isSelected = selectedAmenities.includes(item);
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={item}
                                                            onClick={() => toggleAmenity(item)}
                                                            className={cn(
                                                                "flex items-center gap-2 p-2 rounded-xl text-xs border text-left transition-colors",
                                                                isSelected
                                                                    ? "bg-white/5 text-white border-[#c5a059]/30"
                                                                    : "bg-white/[0.01] border-white/5 text-white/40 hover:text-white"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0",
                                                                isSelected ? "border-[#c5a059] bg-[#c5a059] text-black" : "border-white/20"
                                                            )}>
                                                                {isSelected && <Check className="w-2.5 h-2.5 font-bold" />}
                                                            </div>
                                                            <span className="truncate">{item}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Custom Amenity Input */}
                                            <div className="flex gap-2 pt-1 max-w-xs">
                                                <input
                                                    type="text"
                                                    placeholder="Custom Amenity..."
                                                    value={customAmenity}
                                                    onChange={(e) => setCustomAmenity(e.target.value)}
                                                    className="flex-1 px-3 py-1 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddCustomAmenity}
                                                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-2.5 rounded-lg text-xs"
                                                >
                                                    + Add
                                                </button>
                                            </div>
                                        </div>

                                    </div>

                                    {/* Step 3: Location & Parking */}
                                    <div className="space-y-4 pt-2">
                                        <h3 className="text-sm font-bold text-[#c5a059] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
                                            <MapPin className="w-4 h-4" /> Location & Parking Accommodations
                                        </h3>

                                        {/* Street Address / Full Location */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Full Location (Street Address) *</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 10450 Wilshire Blvd, Los Angeles, CA 90024"
                                                value={fullAddress}
                                                onChange={(e) => setFullAddress(e.target.value)}
                                                className={cn(
                                                    "w-full px-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#c5a059]/40",
                                                    errors.fullAddress && "border-red-500/50"
                                                )}
                                            />
                                            {errors.fullAddress && (
                                                <span className="text-[10px] text-red-400 flex items-center gap-1">{errors.fullAddress}</span>
                                            )}
                                        </div>

                                        {/* Parking Accommodations */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Parking Accommodations</label>
                                            <textarea
                                                placeholder="Describe valet, garage slot sizes, secure underground slots, EV charging stations..."
                                                value={parking}
                                                onChange={(e) => setParking(e.target.value)}
                                                rows={2}
                                                className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-xs text-white resize-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Step 4: Policies & House Rules */}
                                    <div className="space-y-4 pt-2">
                                        <h3 className="text-sm font-bold text-[#c5a059] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
                                            <ShieldAlert className="w-4 h-4" /> Policies & Guidelines
                                        </h3>

                                        {/* Catering policy */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Food & Catering Policy</label>
                                            <textarea
                                                placeholder="Describe your catering arrangements, licensing, or outside food allowance..."
                                                value={catering}
                                                onChange={(e) => setCatering(e.target.value)}
                                                rows={2}
                                                className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-xs text-white resize-none"
                                            />
                                        </div>

                                        {/* Rules dynamic bullets */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">House Rules</label>
                                            <div className="flex gap-2 max-w-md">
                                                <input
                                                    type="text"
                                                    placeholder="Add a house rule (e.g. Music must transition to indoor after 11 PM)..."
                                                    value={newRule}
                                                    onChange={(e) => setNewRule(e.target.value)}
                                                    className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddRule}
                                                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-xs h-9 px-3 flex items-center gap-1"
                                                >
                                                    <PlusCircle className="w-3.5 h-3.5 text-[#c5a059]" /> Add
                                                </button>
                                            </div>

                                            <ul className="space-y-1.5 bg-black/20 border border-white/5 p-3.5 rounded-xl max-w-md">
                                                {rules.map((rule, idx) => (
                                                    <li key={idx} className="flex justify-between items-center gap-2 text-xs text-white/60">
                                                        <span className="flex items-start gap-2">
                                                            <span className="w-1 h-1 rounded-full bg-[#c5a059] mt-2 flex-shrink-0" />
                                                            <span>{rule}</span>
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveRule(idx)}
                                                            className="text-white/30 hover:text-red-400 p-0.5"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </li>
                                                ))}
                                                {rules.length === 0 && (
                                                    <li className="text-[10px] text-white/40 italic">No rules added.</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Step 5: Images Upload catalog */}
                                    <div className="space-y-4 pt-2">
                                        <h3 className="text-sm font-bold text-[#c5a059] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
                                            <Plus className="w-4 h-4" /> Media Gallery * (Min 3 Images)
                                        </h3>

                                        <div className="space-y-2">
                                            <span className="text-[10px] text-white/40 block">Add exactly three or more high-quality web URLs for your visual gallery.</span>

                                            {/* Image preset selections */}
                                            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                                                {MOCK_IMAGES.map((img, idx) => {
                                                    const isAdded = imageUrls.includes(img);
                                                    return (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => {
                                                                if (isAdded) {
                                                                    setImageUrls(imageUrls.filter(u => u !== img));
                                                                } else {
                                                                    setImageUrls([...imageUrls, img]);
                                                                }
                                                                setErrors(prev => ({ ...prev, images: '' }));
                                                            }}
                                                            className={cn(
                                                                "relative w-16 h-12 rounded-lg overflow-hidden border flex-shrink-0 transition-transform active:scale-95",
                                                                isAdded ? "border-[#c5a059]" : "border-white/10 opacity-60 hover:opacity-100"
                                                            )}
                                                        >
                                                            <img src={img} className="w-full h-full object-cover" alt="Visual Preset Option" />
                                                            {isAdded && (
                                                                <div className="absolute inset-0 bg-[#c5a059]/20 flex items-center justify-center">
                                                                    <Check className="w-3 h-3 text-black font-bold bg-white rounded-full p-0.5" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Custom image addition row */}
                                            <div className="flex gap-2 max-w-md">
                                                <input
                                                    type="text"
                                                    placeholder="Paste a custom image URL..."
                                                    value={customImageUrl}
                                                    onChange={(e) => setCustomImageUrl(e.target.value)}
                                                    className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-white/30"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddImage}
                                                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-xs px-3"
                                                >
                                                    Add URL
                                                </button>
                                            </div>

                                            {/* Image list status */}
                                            <div className="grid grid-cols-1 gap-1.5 pt-1 max-w-md">
                                                {imageUrls.map((url, idx) => (
                                                    <div key={idx} className="flex items-center justify-between gap-3 bg-white/[0.01] border border-white/5 p-1.5 rounded-lg text-[10px]">
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <img src={url} className="w-6 h-6 rounded object-cover flex-shrink-0" alt="Thumbnail Preview" />
                                                            <span className="truncate text-white/50 font-mono">{url}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(idx)}
                                                            className="text-white/40 hover:text-red-400 p-0.5"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {errors.images && (
                                                    <span className="text-[10px] text-red-400 flex items-center gap-1"><BadgeAlert className="w-3 h-3" /> {errors.images}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-4 border-t border-white/5 flex justify-end">
                                        <Button
                                            type="submit"
                                            className="bg-[#c5a059] hover:bg-[#b08e4d] text-black font-bold rounded-full px-8 py-2.5 shadow-lg shadow-[#c5a059]/10 animate-pulse hover:animate-none"
                                        >
                                            Publish Listing Space
                                        </Button>
                                    </div>

                                </div>

                                {/* Right Sticky Summary Column */}
                                <div className="w-full lg:w-[38%] lg:sticky lg:top-28 space-y-6 text-left">

                                    {/* Visual live card details */}
                                    <div className="bg-[#0e0e12]/60 border border-white/5 rounded-3xl p-6 backdrop-blur-md shadow-2xl relative space-y-6">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#c5a059] flex items-center gap-1.5 pb-2 border-b border-white/5">
                                            <Star className="w-3.5 h-3.5" /> Standard Booking Fees (Live)
                                        </h3>

                                        {/* Pricing Inputs */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block mb-1">Standard Daily Rate *</label>
                                                <div className="relative rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 flex items-center">
                                                    <span className="text-sm text-white/50 mr-1.5">$</span>
                                                    <input
                                                        type="number"
                                                        placeholder="450"
                                                        value={pricePerNight === 0 ? '' : pricePerNight}
                                                        onChange={(e) => {
                                                            setPricePerNight(Number(e.target.value));
                                                            setErrors(prev => ({ ...prev, pricePerNight: '' }));
                                                        }}
                                                        className="bg-transparent text-sm text-white focus:outline-none w-full font-semibold"
                                                    />
                                                </div>
                                                {errors.pricePerNight && (
                                                    <span className="text-[10px] text-red-400 mt-1 block">{errors.pricePerNight}</span>
                                                )}
                                            </div>

                                            <hr className="border-white/10" />

                                            {/* Live Calculations */}
                                            <div className="space-y-3 text-xs">
                                                <div className="flex justify-between text-white/70">
                                                    <span className="font-light">Base booking rate</span>
                                                    <span className="font-semibold text-white">${basePrice}</span>
                                                </div>

                                                <div className="flex justify-between text-white/70">
                                                    <span className="font-light">Service & cleaning fee (15%)</span>
                                                    <span className="font-semibold text-white">${serviceFee}</span>
                                                </div>

                                                <hr className="border-white/10 border-dashed" />

                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium text-white/80">Total (1 Day)</span>
                                                    <span className="text-base font-extrabold text-[#c5a059]">${totalPrice}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <span className="text-[9px] text-white/30 leading-relaxed font-light block text-center">
                                                Calculations update live instantly based on your Standard Daily Rate input.
                                            </span>
                                        </div>
                                    </div>

                                    {/* Quick Card Grid Mock preview */}
                                    <div className="bg-[#0e0e12]/30 border border-white/5 p-4 rounded-3xl backdrop-blur-sm space-y-3">
                                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block">Live Visual Mock</span>
                                        <div className="relative h-32 rounded-2xl overflow-hidden border border-white/10 bg-black">
                                            <img src={imageUrls[0] || MOCK_IMAGES[0]} alt="Showcase Visual Preview" className="w-full h-full object-cover" />
                                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] border border-white/10">
                                                {location || 'Los Angeles'}
                                            </div>
                                            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] text-[#c5a059] font-bold">
                                                ★ {rating} Rating
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold truncate text-white">{title || 'The Glass Pavilion'}</h4>
                                            <p className="text-[10px] text-white/50 truncate mt-0.5">{description || 'Description summary...'}</p>
                                        </div>
                                    </div>

                                </div>

                            </form>

                        </motion.div>
                    ) : (
                        <motion.div
                            key="success-view"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                            className="max-w-xl mx-auto text-center space-y-8 bg-[#0e0e12]/90 border border-[#c5a059]/25 p-8 sm:p-12 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden"
                        >
                            {/* Glowing decorative circles */}
                            <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#c5a059]/5 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#c5a059]/5 rounded-full blur-3xl pointer-events-none" />

                            {/* Success badge */}
                            <div className="flex justify-center">
                                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/30">
                                    <CheckCircle2 className="w-8 h-8 text-[#c5a059]" />
                                </div>
                            </div>

                            {/* Success Info */}
                            <div className="space-y-3.5">
                                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Venue Listed Successfully!</h2>
                                <p className="text-xs sm:text-sm text-white/70 max-w-sm mx-auto leading-relaxed">
                                    Your event space <strong className="text-white">"{title}"</strong> has been created and stored dynamically in client memory. No backend was hit!
                                </p>
                            </div>

                            {/* Success CTA links */}
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
                                <Button
                                    onClick={() => navigate(`/venue/${newVenueId}`)}
                                    className="w-full sm:w-auto bg-[#c5a059] hover:bg-[#b08e4d] text-black font-semibold rounded-full px-6 py-2.5 flex items-center justify-center gap-1.5 text-xs"
                                >
                                    <Eye className="w-3.5 h-3.5" /> View Newly Listed Venue
                                </Button>

                                <Button
                                    onClick={() => navigate('/venues')}
                                    className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full px-6 py-2.5 flex items-center justify-center gap-1.5 text-xs"
                                >
                                    <Calendar className="w-3.5 h-3.5 text-[#c5a059]" /> Go to Venues Directory
                                </Button>
                            </div>

                            {/* Create another one reset button */}
                            <div className="pt-4 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTitle('');
                                        setDescription('');
                                        setFullAddress('');
                                        setLocation('');
                                        setCapacity(0);
                                        setSquareFeet(0);
                                        setPricePerNight(0);
                                        setDateRange('Jun 12 - 18');
                                        setImageUrls([MOCK_IMAGES[0], MOCK_IMAGES[1], MOCK_IMAGES[2]]);
                                        setSelectedAmenities(PRESET_AMENITIES);
                                        setSelectedEventTypes(PRESET_EVENT_TYPES);
                                        setRules([
                                            'Music must transition to indoor after 11 PM',
                                            'No confetti, glitter, or open flames permitted',
                                            'Licensed and certified bartenders required for any alcohol service'
                                        ]);
                                        setErrors({});
                                        setActiveStep('form');
                                    }}
                                    className="text-[10px] text-white/40 hover:text-[#c5a059] underline font-medium transition-colors"
                                >
                                    List another event space
                                </button>
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </section>
    );
}
