'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './map.module.css';

import { Button } from './../../../Buttons/Button';

interface Location {
  lat: number;
  lng: number;
  longitude?: number;
  latitude?: number;
  address?: string;
  city?: string;
  region?: string;
}

interface MapLocationPickerProps {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location;
  height?: string;
  width?: string;
}

declare global {
  interface Window {
    L: any;
  }
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  height = '400px',
  width = '100%'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation || null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load Leaflet CSS and JS
  useEffect(() => {
    if (window.L) {
      setIsLoading(false);
      return;
    }

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      setIsLoading(false);
    };
    script.onerror = () => {
      setError('فشل في تحميل الخريطة');
      setIsLoading(false);
    };
    document.head.appendChild(script);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (isLoading || !mapRef.current || !window.L || mapInstanceRef.current) return;

    const defaultLocation = initialLocation || {
      lat: 30.0444,
      lng: 31.2357
    };

    try {
      // Create map
      const map = window.L.map(mapRef.current).setView(
        [defaultLocation.lat, defaultLocation.lng],
        13
      );

      // Add OpenStreetMap tile layer (FREE!)
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Create custom icon
      const customIcon = window.L.divIcon({
        html: '<div style="background-color: #ff4444; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        className: 'custom-marker'
      });

      // Add marker
      const marker = window.L.marker(
        [defaultLocation.lat, defaultLocation.lng],
        { 
          draggable: true,
          icon: customIcon
        }
      ).addTo(map);

      // Handle marker drag
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        handleLocationSelect(position.lat, position.lng);
      });

      // Handle map click
      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        handleLocationSelect(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      if (initialLocation) {
        handleLocationSelect(initialLocation.lat, initialLocation.lng);
      }
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('خطأ في تهيئة الخريطة');
    }
  }, [isLoading, initialLocation]);

  // Reverse geocoding using Nominatim (FREE OpenStreetMap service)
  const handleLocationSelect = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`
      );
      
      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        
        const location: Location = {
          lat,
          lng,
          address: data.display_name || '',
          city: address.city || address.town || address.village || '',
          region: address.state || address.province || ''
        };

        setSelectedLocation(location);
        onLocationSelect(location);
      }
    } catch (err) {
      console.error('Error geocoding:', err);
      // Still set location even if geocoding fails
      const location: Location = { lat, lng };
      setSelectedLocation(location);
      onLocationSelect(location);
    }
  };

  // Get current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('المتصفح لا يدعم تحديد الموقع الجغرافي');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 15);
          markerRef.current.setLatLng([lat, lng]);
          handleLocationSelect(lat, lng);
        }
        setIsLoading(false);
      },
      (error) => {
        setError('فشل في الحصول على الموقع الحالي');
        setIsLoading(false);
        console.error('Geolocation error:', error);
      }
    );
  };

  // Search location using Nominatim
  const handleSearch = async () => {
    if (!searchQuery) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&accept-language=ar&limit=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);
          
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([lat, lng], 15);
            markerRef.current.setLatLng([lat, lng]);
            handleLocationSelect(lat, lng);
            setSearchQuery('');
            setError(null);
          }
        } else {
          setError('لم يتم العثور على الموقع');
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('خطأ في البحث');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading} style={{ height, width }}>
        <p>جاري تحميل الخريطة...</p>
      </div>
    );
  }

  if (error && !mapInstanceRef.current) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="ابحث عن موقع... (مثال: القاهرة، مصر)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className={styles.searchInput}
          />
         <Button
            onClick={handleSearch}
            variant="primary"
            size="md"
            //   state={isSearching ? 'loading' : 'default'}
            loadingText="جاري البحث..."
              disabled={!searchQuery || isLoading}
            rounded={true}
        >
            بحث
        </Button>
        </div>
        
        <Button
            variant="primary"
            size="md"
            rounded={true}
          onClick={handleGetCurrentLocation}
          disabled={isLoading}
          className={styles.currentLocationButton}
        >
          📍 موقعي الحالي
        </Button>
      </div>

      {error && mapInstanceRef.current && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <div
        ref={mapRef}
        style={{ height, width }}
        className={styles.map}
      />

      {selectedLocation && (
        <div className={styles.selectedLocation}>
          <h4>الموقع المحدد:</h4>
          <p>{selectedLocation.address || 'جاري تحميل العنوان...'}</p>
          {selectedLocation.city && <p>المدينة: {selectedLocation.city}</p>}
          {selectedLocation.region && <p>المحافظة: {selectedLocation.region}</p>}
          {/* <p className={styles.coordinates}>
            الإحداثيات: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </p> */}
        </div>
      )}

      <div className={styles.successBanner}>
        ✓ هذه الخريطة مجانية تماماً - لا حاجة لمفتاح API!
      </div>
    </div>
  );
};

export default MapLocationPicker;