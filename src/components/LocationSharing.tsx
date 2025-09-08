import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { MapPin, X, Send, Loader2, Navigation } from 'lucide-react';

interface LocationSharingProps {
  isOpen: boolean;
  onClose: () => void;
  onShareLocation: (location: LocationData) => void;
}

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
}

export function LocationSharing({ isOpen, onClose, onShareLocation }: LocationSharingProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        // Simulate reverse geocoding to get address
        try {
          // In a real app, you'd use a geocoding service like Google Maps or OpenStreetMap
          const mockAddress = await simulateReverseGeocode(location.latitude, location.longitude);
          location.address = mockAddress;
        } catch (error) {
          console.error('Failed to get address:', error);
        }

        setCurrentLocation(location);
        setIsGettingLocation(false);
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        setError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const simulateReverseGeocode = async (lat: number, lng: number): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock address based on coordinates
    const addresses = [
      '123 Ocean Drive, Miami Beach, FL',
      '456 Main Street, Downtown, CA',
      '789 Park Avenue, Central Park, NY',
      '321 Tech Boulevard, Silicon Valley, CA',
      '654 Beach Road, Santa Monica, CA'
    ];
    
    return addresses[Math.floor(Math.random() * addresses.length)];
  };

  const handleShareLocation = () => {
    if (currentLocation) {
      onShareLocation(currentLocation);
      handleClose();
    }
  };

  const handleClose = () => {
    setCurrentLocation(null);
    setError(null);
    setIsGettingLocation(false);
    onClose();
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Share Location
                </h3>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="p-4">
            {!currentLocation && !isGettingLocation && !error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <MapPin className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                  Share Your Location
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  Allow access to your location to share it with this contact
                </p>
                <Button
                  onClick={getCurrentLocation}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Current Location
                </Button>
              </motion.div>
            )}

            {isGettingLocation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  Getting your location...
                </p>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                  <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                </div>
                <Button
                  onClick={getCurrentLocation}
                  variant="outline"
                  className="mr-2"
                >
                  Try Again
                </Button>
                <Button onClick={handleClose} variant="ghost">
                  Cancel
                </Button>
              </motion.div>
            )}

            {currentLocation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Location Preview */}
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                        Current Location
                      </h4>
                      {currentLocation.address ? (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {currentLocation.address}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-500 mb-2">
                          Getting address...
                        </p>
                      )}
                      <div className="text-xs text-slate-500 dark:text-slate-500 space-y-1">
                        <div>
                          Coordinates: {formatCoordinates(currentLocation.latitude, currentLocation.longitude)}
                        </div>
                        {currentLocation.accuracy && (
                          <div>
                            Accuracy: ~{Math.round(currentLocation.accuracy)}m
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map Preview Placeholder */}
                <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-lg h-32 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Map Preview
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentLocation(null);
                      setError(null);
                    }}
                    className="flex-1"
                  >
                    Change Location
                  </Button>
                  <Button
                    onClick={handleShareLocation}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}