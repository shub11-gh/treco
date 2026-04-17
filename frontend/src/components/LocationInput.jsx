import React, { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { MapPin, Navigation, Search, Map as MapIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LocationInput({ 
  value, 
  onChange, 
  placeholder, 
  type = 'origin', 
  onMapSelect 
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const Icon = type === 'origin' ? MapPin : Navigation;

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchPlaces = async () => {
      if (!query || query.length < 3 || query === value) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        // Photon is an ElasticSearch wrapper around OpenStreetMap, MUCH better at fuzzy autocomplete than Nominatim
        // Bounding box for India: 68.1 (minLon), 6.5 (minLat), 97.4 (maxLon), 35.5 (maxLat)
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6&bbox=68.1,6.5,97.4,35.5`);
        const data = await res.json();
        
        // Map GeoJSON features into a flat format our UI expects
        const parsed = data.features.map(f => {
          const p = f.properties;
          // Build a readable display name
          const namePart = p.name ? p.name : (p.street || p.city || 'Unknown Place');
          const contextPart = [p.district, p.city, p.state].filter(Boolean).join(', ');
          return {
            place_id: p.osm_id || Math.random().toString(),
            display_name: `${namePart}${contextPart ? ', ' + contextPart : ''}`,
            name: namePart,
            context: contextPart,
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0]
          };
        });
        
        setSuggestions(parsed);
        setIsOpen(true);
      } catch (err) {
        console.error('Geo Search Error', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchPlaces, 600);
    return () => clearTimeout(timer);
  }, [query, value]);

  const handleSelect = (place) => {
    // Just use the short name for the input box
    setQuery(place.name);
    onChange(place.name);
    setIsOpen(false);
  };

  return (
    <div className="w-full space-y-2 relative" ref={dropdownRef}>
      <label className="text-foreground font-semibold flex justify-between items-center">
        <span>{type === 'origin' ? 'Current Location / Origin' : 'Destination'}</span>
        <button 
          onClick={onMapSelect}
          className="text-xs font-bold text-accent hover:text-accent/80 flex items-center gap-1 bg-accent/10 px-2 py-1 rounded"
        >
          <MapIcon className="w-3 h-3" /> Choose on Map
        </button>
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="pl-10 pr-10 text-base bg-background/50 border-border shadow-inner"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
        />
        {loading && <Loader2 className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground animate-spin" />}
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto p-2 space-y-1">
              {suggestions.map((place) => (
                <button
                  key={place.place_id}
                  onClick={() => handleSelect(place)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors flex items-start gap-3"
                >
                  <Search className="w-4 h-4 mt-1 text-muted-foreground shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm truncate">{place.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">{place.context || 'India'}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
