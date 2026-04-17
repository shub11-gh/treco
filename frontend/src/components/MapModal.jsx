import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, X, CheckCircle2 } from 'lucide-react';

// Fix leaflet default marker icons
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

function MapClickHandler({ setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return null;
}

export default function MapModal({ isOpen, onClose, onConfirm, initialPos = [12.9716, 77.5946] }) {
  const [position, setPosition] = useState(null);
  const [loadingGeocode, setLoadingGeocode] = useState(false);
  const [address, setAddress] = useState('');

  // Default to Bangalore center if no initial pos

  useEffect(() => {
    if (isOpen) {
      setPosition(null);
      setAddress('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!position) return;
    const fetchAddress = async () => {
      setLoadingGeocode(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`);
        const data = await res.json();
        setAddress(data.display_name.split(',')[0]); // Use short name
      } catch (err) {
        setAddress('Unknown Location');
      } finally {
        setLoadingGeocode(false);
      }
    };
    fetchAddress();
  }, [position]);

  const handleConfirm = () => {
    if (address) {
      onConfirm(address, position);
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-4xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh] md:h-[600px]"
        >
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="text-primary w-5 h-5" /> 
              Drop a Pin
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Map Area */}
          <div className="flex-1 bg-slate-900 relative">
            <MapContainer 
              center={initialPos} 
              zoom={13} 
              minZoom={5}
              maxBounds={[
                [6.5, 68.1], // Southwest bound (India)
                [35.5, 97.4] // Northeast bound (India)
              ]}
              maxBoundsViscosity={1.0}
              style={{ height: '100%', width: '100%', zIndex: 10 }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {position && <Marker position={position} />}
              <MapClickHandler setPosition={setPosition} />
            </MapContainer>

            {/* Instruction Overlay */}
            {!position && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[20] bg-background/90 backdrop-blur px-6 py-3 rounded-full border border-border shadow-lg pointer-events-none transition-all">
                <span className="font-bold text-sm">Click anywhere on the map to set location</span>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 min-w-0 w-full">
              {position ? (
                loadingGeocode ? (
                  <span className="text-sm font-medium text-muted-foreground animate-pulse">Resolving address...</span>
                ) : (
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Selected Location</span>
                    <span className="font-bold text-lg truncate text-primary">{address}</span>
                  </div>
                )
              ) : (
                <span className="text-sm text-muted-foreground italic">Waiting for selection...</span>
              )}
            </div>

            <button
              disabled={!position || loadingGeocode}
              onClick={handleConfirm}
              className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Confirm Selection
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
