import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Filter, Star, CheckCircle, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingCalendar from "@/components/BookingCalendar";
import { toast } from "@/hooks/use-toast";
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import RealtimeChat from "@/components/RealtimeChat";

// Discover page: shows skill cards, integrates MapTiler for map/directions and RealtimeChat for socket chat
const Discover = () => {
  // Default radius of 1 km
  const [radius, setRadius] = useState([1]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<number | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  // skill list
  const [skills, setSkills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);

  // Helper: normalize many coordinate shapes into { lat, lng } or null
  const normalizeCoords = (c: any): { lat: number; lng: number } | null => {
    if (!c) return null;
    // GeoJSON style: { coordinates: [lng, lat] }
    if (c.coordinates && Array.isArray(c.coordinates) && c.coordinates.length >= 2) {
      const [lng, lat] = c.coordinates;
      if (typeof lat === 'number' && typeof lng === 'number') return { lat, lng };
    }
    // array [lng, lat]
    if (Array.isArray(c) && c.length >= 2 && typeof c[0] === 'number' && typeof c[1] === 'number') {
      return { lat: c[1], lng: c[0] };
    }
    // object { lat, lng }
    if (typeof c.lat === 'number' && typeof c.lng === 'number') return { lat: c.lat, lng: c.lng };
    return null;
  };

  // small utility to validate lat/lng ranges
  const validLat = (v: number) => typeof v === 'number' && v >= -90 && v <= 90;
  const validLng = (v: number) => typeof v === 'number' && v >= -180 && v <= 180;

  // Fetch skills from backend and compute optional distance
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("http://localhost:3000/skills");
        if (!res.ok) throw new Error("Failed to fetch skills");
        const data = await res.json();

        // attempt to get user location for distance calculation
        let userLoc: { lat: number; lng: number } | null = null;
        try {
          const pos = await new Promise<GeolocationPosition | null>((resolve) => {
            if (!navigator.geolocation) return resolve(null);
            navigator.geolocation.getCurrentPosition((p) => resolve(p), () => resolve(null), { timeout: 5000 });
          });
          if (pos && pos.coords) userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } catch (e) {
          userLoc = null;
        }

        // haversine
        const toRad = (v: number) => (v * Math.PI) / 180;
        const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
          const R = 6371; // km
          const dLat = toRad(lat2 - lat1);
          const dLon = toRad(lon2 - lon1);
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        };

        const mapped = data.map((s: any, index: number) => {
          // normalize location shape before computing distance
          const loc = normalizeCoords(s.location?.coordinates ?? s.location ?? null);
          let distance: number | null = null;
          if (userLoc && loc && validLat(loc.lat) && validLng(loc.lng)) {
            distance = Number(haversine(userLoc.lat, userLoc.lng, loc.lat, loc.lng).toFixed(1));
          }

          return {
            id: s.id ?? s._id ?? `${index}`,
            userId: s.userId,
            name: s.name,
            provider: s.userId ? `User ${String(s.userId).slice(0, 6)}` : 'Provider',
            distance,
            rating: (4.5 + Math.random() * 0.5).toFixed(1),
            reviews: Math.floor(Math.random() * 200) + 10,
            verified: true,
            price: Math.floor(20 + (s.level || 50) / 2),
            category: s.category,
            level: s.level,
            image: (s.category || '').toLowerCase().includes('music') ? '🎸' : '⭐',
            location: s.location,
          };
        });

        setSkills(mapped);
        if (userLoc) setUserLocation(userLoc);
      } catch (err) {
        console.error(err);
        toast({ title: 'Load error', description: 'Failed to fetch skills' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkills();
  }, []);

  // draw directions using MapTiler directions API (v2)
  const drawRoute = async (toCoordsRaw: any) => {
    const map = mapRef.current;
    if (!map) return toast({ title: 'Map not ready', description: 'Open the map first' });

    const from = userLocation;
    const toNorm = normalizeCoords(toCoordsRaw);
    if (!from) return toast({ title: 'Location required', description: 'Allow location access to get directions' });
    if (!toNorm) return toast({ title: 'Invalid destination', description: 'Skill location missing or invalid' });

    if (!validLat(from.lat) || !validLng(from.lng) || !validLat(toNorm.lat) || !validLng(toNorm.lng)) {
      return toast({ title: 'Invalid coordinates', description: 'Coordinates out of range' });
    }

    const token = import.meta.env.VITE_MAPTILER_KEY;
    if (!token) return toast({ title: 'Map config', description: 'Set VITE_MAPTILER_KEY in .env' });

    try {
      const fromPair = `${from.lng},${from.lat}`;
      const toPair = `${toNorm.lng},${toNorm.lat}`;
      const url = `https://api.maptiler.com/directions/v2/driving/${fromPair};${toPair}?key=${token}&geometries=geojson`;
      console.log('Fetching directions URL:', url);

      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text();
        console.error('Directions error', res.status, text);
        throw new Error(`Directions API ${res.status}: ${text}`);
      }

      const data = await res.json();
      console.log('Directions response', data);

      const route = data.routes?.[0];
      if (!route || !route.geometry) throw new Error('No route returned');

      // remove existing route if present
      try {
        if (map.getLayer('route-line')) map.removeLayer('route-line');
        if (map.getSource('route-source')) map.removeSource('route-source');
      } catch (e) { /* ignore */ }

      const geojson = { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: route.geometry }] };

      map.addSource('route-source', { type: 'geojson', data: geojson });
      map.addLayer({ id: 'route-line', type: 'line', source: 'route-source', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#3b82f6', 'line-width': 6 } });

      // fit bounds
      const coords: any[] = route.geometry.coordinates || [];
      const bounds = new maptilersdk.LngLatBounds();
      coords.forEach((c) => { if (Array.isArray(c) && c.length >= 2) bounds.extend([c[0], c[1]]); });
      try { map.fitBounds(bounds, { padding: 60 }); } catch (e) { console.warn('fitBounds failed', e); }
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Directions error', description: e?.message || 'Failed to fetch route', variant: 'destructive' });
    }
  };

  // open/init MapTiler map for a skill (or for user location)
  const openMapForSkill = async (skillOrId?: any) => {
    const skill = skillOrId && skillOrId.location ? skillOrId : skills.find((s) => s.id === skillOrId || s.id === selectedSkill);
    if (!skill) return;

    // ensure we have userLocation
    if (!userLocation) {
      try {
        const pos = await new Promise<GeolocationPosition | null>((resolve) => {
          if (!navigator.geolocation) return resolve(null);
          navigator.geolocation.getCurrentPosition((p) => resolve(p), () => resolve(null), { timeout: 5000 });
        });
        if (pos && pos.coords) setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } catch (e) { }
    }

    const token = import.meta.env.VITE_MAPTILER_KEY;
    if (!token) return toast({ title: 'Map config', description: 'Set VITE_MAPTILER_KEY in .env' });

    try {
      // remove previous map
      if (mapRef.current) { try { mapRef.current.remove(); } catch (e) {} mapRef.current = null; }

      // set SDK api key and build map using MapTiler tiles
      maptilersdk.config.apiKey = token;
      const center = userLocation ? [userLocation.lng, userLocation.lat] as [number, number] : (normalizeCoords(skill.location?.coordinates) ? [normalizeCoords(skill.location?.coordinates)!.lng, normalizeCoords(skill.location?.coordinates)!.lat] as [number, number] : [0,0]);

      const map = new maptilersdk.Map({ container: mapContainer.current as HTMLElement, style: `https://api.maptiler.com/maps/streets/style.json?key=${token}`, center: center as [number, number], zoom: 12 });
      map.addControl(new maptilersdk.NavigationControl());

      map.on('error', (e: any) => {
        console.error('Map error', e);
        toast({ title: 'Map error', description: 'Failed to load map tiles or style (check API key)', variant: 'destructive' });
      });

      map.on('load', () => {
        // prepare route source if missing
        try {
          if (!map.getSource('route-source')) map.addSource('route-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
          if (!map.getLayer('route-line')) map.addLayer({ id: 'route-line', type: 'line', source: 'route-source', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#3b82f6', 'line-width': 6 } });
        } catch (e) { /* ignore if already present */ }

        // add markers if coords available
        const target = normalizeCoords(skill.location?.coordinates);
        if (target) {
          new maptilersdk.Marker({ color: '#ef4444' }).setLngLat([target.lng, target.lat]).setPopup(new maptilersdk.Popup({ offset: 12 }).setText(skill.name)).addTo(map);
        }
        if (userLocation) {
          new maptilersdk.Marker({ color: '#3b82f6' }).setLngLat([userLocation.lng, userLocation.lat]).setPopup(new maptilersdk.Popup({ offset: 12 }).setText('You')).addTo(map);
        }

        if (userLocation && target) drawRoute(target);
      });

      mapRef.current = map;

      try { mapContainer.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { }
    } catch (e) {
      console.error('Failed to init map', e);
      toast({ title: 'Map init error', description: 'Could not initialize map' });
    }
  };

  const filters = ["Tutoring", "Fitness", "Crafts", "Tech", "Language", "Music", "Art", "Cooking"];

  const toggleFilter = (filter: string) => setSelectedFilters((prev) => prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]);

  const handleSkillClick = (skillId: number) => setSelectedSkill(skillId);
  const closeSkillDetail = () => { setSelectedSkill(null); setShowBooking(false); };

  const handleBookingComplete = (date: Date, time: string) => {
    toast({ title: 'Booking Confirmed!', description: `Your session has been booked for ${date.toLocaleDateString()} at ${time}` });
    closeSkillDetail();
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Discover Skills Near You</h1>
          <p className="text-muted-foreground">Find talented people in your area ready to share their expertise</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4"><Filter className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold">Filters</h2></div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3"><label className="text-sm font-medium">Search Radius</label><span className="text-sm text-muted-foreground">{radius[0]} km</span></div>
              <Slider value={radius} onValueChange={setRadius} min={1} max={200} step={1} className="w-full" />
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Categories</label>
              <div className="flex flex-wrap gap-2">
                {filters.map((f) => <Badge key={f} variant={selectedFilters.includes(f) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleFilter(f)}>{f}</Badge>)}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.filter((s) => {
            // First apply category filter
            if (selectedFilters.length && !selectedFilters.includes(s.category)) return false;
            
            // Always filter by radius - only show skills that have a valid distance and are within radius
            const maxKm = radius?.[0] ?? 1;
            return typeof s.distance === 'number' && s.distance <= maxKm;
          }).map((skill, idx) => {
            const isSelected = selectedSkill === skill.id;
            const coordsAvailable = Boolean(normalizeCoords(skill.location?.coordinates ?? skill.location));

            return (
              <motion.div key={skill.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className={`skill-card-zoom ${isSelected ? 'skill-card-zoom-active' : ''}`} style={{ zIndex: isSelected ? 50 : 1 }}>
                <Card className={`glass-strong ${isSelected ? 'relative overflow-visible' : 'overflow-hidden'} hover:border-primary/50 transition-all h-full group cursor-pointer glow-hover`}>
                  <div className="p-6 relative">
                    {isSelected && <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-20" onClick={() => closeSkillDetail()}><X className="w-5 h-5" /></Button>}

                    <div onClick={() => !isSelected && handleSkillClick(skill.id)} className={!isSelected ? 'cursor-pointer' : ''}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">{skill.image}</div>
                        {skill.verified && <CheckCircle className="w-5 h-5 text-primary" />}
                      </div>

                      <h3 className="text-xl font-semibold mb-1">{skill.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{skill.provider}</p>

                      <div className="flex items-center gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{typeof skill.distance === 'number' ? `${skill.distance} km` : '—'}</span>
                          {!coordsAvailable && <span className="ml-2 text-xs text-amber-600">(No location)</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span>{skill.rating} ({skill.reviews})</span>
                        </div>
                      </div>

                      <Badge variant="secondary" className="mb-4">{skill.category}</Badge>

                      {isSelected && (
                        <div className="mb-3">
                          <div ref={mapContainer} className="w-full h-40 mb-3 rounded-lg overflow-hidden" />
                          <div className="text-sm text-muted-foreground">Distance: {typeof skill.distance === 'number' ? `${skill.distance} km` : '—'}</div>
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {isSelected && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute left-0 right-0 bottom-0 bg-background/80 backdrop-blur py-4 px-6 border-t border-border/50 rounded-b-lg shadow-lg z-10">
                          <p className="text-sm text-muted-foreground mb-4">Expert in {skill.category?.toLowerCase()} with {skill.reviews} satisfied clients. Available for in-person and virtual sessions.</p>

                          <div className="flex gap-2 mb-3">
                            <Button onClick={() => setShowBooking(true)} className="flex-1 glow"><Clock className="w-4 h-4 mr-2"/>Schedule Session</Button>

                            <Button variant="outline" disabled={!coordsAvailable} onClick={async () => { await openMapForSkill(skill); const t = normalizeCoords(skill.location?.coordinates ?? skill.location); if (t) drawRoute(t); else toast({ title: 'No location', description: 'This skill has no coordinates' }); }} className="flex-1">Get Directions</Button>
                          </div>

                          {showBooking && <div className="mt-3"><BookingCalendar onBookingComplete={handleBookingComplete} /></div>}

                          <div className="mt-3">
                            <RealtimeChat defaultRoom={String(skill.id)} inline={true} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!isSelected && (
                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div>
                          <div className="text-2xl font-bold">{skill.price}</div>
                          <div className="text-xs text-muted-foreground">credits/hour</div>
                        </div>
                        <Button size="sm" className="glow"><Clock className="w-4 h-4 mr-2"/>Book Session</Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default Discover;