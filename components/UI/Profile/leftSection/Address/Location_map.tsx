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
  const lastGeocodingTimeRef = useRef<number>(0);
  const geocodingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation || null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

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

    return () => {
      if (geocodingTimeoutRef.current) {
        clearTimeout(geocodingTimeoutRef.current);
      }
    };
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

      // Handle marker drag with debouncing
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        handleLocationSelectDebounced(position.lat, position.lng);
      });

      // Handle map click with debouncing
      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        handleLocationSelectDebounced(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      if (initialLocation) {
        handleLocationSelectDebounced(initialLocation.lat, initialLocation.lng);
      }
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('خطأ في تهيئة الخريطة');
    }
  }, [isLoading, initialLocation]);

  // Debounced location select to prevent rapid API calls
  const handleLocationSelectDebounced = (lat: number, lng: number) => {
    // Clear any pending geocoding request
    if (geocodingTimeoutRef.current) {
      clearTimeout(geocodingTimeoutRef.current);
    }

    // Immediately update location without address
    const basicLocation: Location = { lat, lng };
    setSelectedLocation(basicLocation);
    onLocationSelect(basicLocation);

    // Debounce the geocoding request
    geocodingTimeoutRef.current = setTimeout(() => {
      handleLocationSelect(lat, lng);
    }, 800); // Wait 800ms before making the API call
  };

  // Reverse geocoding using Nominatim (FREE OpenStreetMap service)
  const handleLocationSelect = async (lat: number, lng: number) => {
    // Rate limiting: ensure at least 1.5 seconds between requests
    const now = Date.now();
    const timeSinceLastRequest = now - lastGeocodingTimeRef.current;
    
    if (timeSinceLastRequest < 1500) {
      // Wait before making the request
      await new Promise(resolve => setTimeout(resolve, 1500 - timeSinceLastRequest));
    }

    lastGeocodingTimeRef.current = Date.now();
    setIsGeocoding(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`,
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'YourAppName/1.0', // Required by Nominatim
          },
        }
      );

      clearTimeout(timeoutId);
      
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
        setError(null);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      console.error('Error geocoding:', err);
      
      // Handle different error types
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.');
        } else {
          setError('تعذر الحصول على تفاصيل العنوان. يمكنك المتابعة بدون عنوان تفصيلي.');
        }
      }
      
      // Still set location even if geocoding fails
      const location: Location = { lat, lng };
      setSelectedLocation(location);
      onLocationSelect(location);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Get current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('المتصفح لا يدعم تحديد الموقع الجغرافي');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 15);
          markerRef.current.setLatLng([lat, lng]);
          handleLocationSelectDebounced(lat, lng);
        }
        setIsLoading(false);
      },
      (error) => {
        let errorMessage = 'فشل في الحصول على الموقع الحالي';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'تم رفض إذن الوصول للموقع';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'معلومات الموقع غير متاحة';
            break;
          case error.TIMEOUT:
            errorMessage = 'انتهت مهلة طلب الموقع';
            break;
        }
        
        setError(errorMessage);
        setIsLoading(false);
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Search location using Nominatim
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=eg&accept-language=ar&limit=1`,
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'YourAppName/1.0',
          },
        }
      );

      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);
          
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([lat, lng], 15);
            markerRef.current.setLatLng([lat, lng]);
            handleLocationSelectDebounced(lat, lng);
            setSearchQuery('');
            setError(null);
          }
        } else {
          setError('لم يتم العثور على الموقع');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      console.error('Search error:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        setError('انتهت مهلة البحث');
      } else {
        setError('خطأ في البحث. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !mapInstanceRef.current) {
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
        <button onClick={() => window.location.reload()}>إعادة المحاولة</button>
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
            className={styles.searchInput}
          />
         <Button
            onClick={handleSearch}
            variant="primary"
            size="md"
            loadingText="جاري البحث..."
            disabled={!searchQuery.trim() || isLoading}
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

      {isGeocoding && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: '#e3f2fd',
          borderRadius: '4px',
          marginBottom: '8px',
          fontSize: '13px',
          color: '#1976d2'
        }}>
          جاري تحميل تفاصيل العنوان...
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
          <p>
            {selectedLocation.address ? 
              selectedLocation.address : 
              isGeocoding ? 
                'جاري تحميل العنوان...' : 
                `خط الطول: ${selectedLocation.lng.toFixed(6)}, خط العرض: ${selectedLocation.lat.toFixed(6)}`
            }
          </p>
          {selectedLocation.city && <p>المدينة: {selectedLocation.city}</p>}
          {selectedLocation.region && <p>المحافظة: {selectedLocation.region}</p>}
        </div>
      )}

      <div className={styles.instructions} style={{
        padding: '12px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        marginTop: '12px',
        fontSize: '13px'
      }}>
       
      </div>
    </div>
  );
};

export default MapLocationPicker;
