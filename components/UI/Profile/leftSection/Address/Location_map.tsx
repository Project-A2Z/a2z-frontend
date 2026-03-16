'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

// styles
import styles from '@/components/UI/Profile/leftSection/Address/map.module.css';

//components
import { Button } from '@/components/UI/Buttons/Button';

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
  const t = useTranslations('Address.location');

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

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      setIsLoading(false);
    };
    script.onerror = () => {
      setError(t('errors.mapLoadFailed'));
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
      const map = window.L.map(mapRef.current).setView(
        [defaultLocation.lat, defaultLocation.lng],
        13
      );

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      const customIcon = window.L.divIcon({
        html: '<div style="background-color: #ff4444; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        className: 'custom-marker'
      });

      const marker = window.L.marker(
        [defaultLocation.lat, defaultLocation.lng],
        {
          draggable: true,
          icon: customIcon
        }
      ).addTo(map);

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        handleLocationSelectDebounced(position.lat, position.lng);
      });

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
      setError(t('errors.mapInitFailed'));
    }
  }, [isLoading, initialLocation]);

  const handleLocationSelectDebounced = (lat: number, lng: number) => {
    if (geocodingTimeoutRef.current) {
      clearTimeout(geocodingTimeoutRef.current);
    }

    const basicLocation: Location = { lat, lng };
    setSelectedLocation(basicLocation);
    onLocationSelect(basicLocation);

    geocodingTimeoutRef.current = setTimeout(() => {
      handleLocationSelect(lat, lng);
    }, 800);
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastGeocodingTimeRef.current;

    if (timeSinceLastRequest < 1500) {
      await new Promise(resolve => setTimeout(resolve, 1500 - timeSinceLastRequest));
    }

    lastGeocodingTimeRef.current = Date.now();
    setIsGeocoding(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`,
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

      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError(t('errors.geocodingTimeout'));
        } else {
          setError(t('errors.geocodingFailed'));
        }
      }

      const location: Location = { lat, lng };
      setSelectedLocation(location);
      onLocationSelect(location);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError(t('errors.geolocationUnsupported'));
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
        let errorMessage = t('errors.geolocationFailed');

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = t('errors.permissionDenied');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = t('errors.positionUnavailable');
            break;
          case error.TIMEOUT:
            errorMessage = t('errors.geolocationTimeout');
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
          setError(t('search.notFound'));
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      console.error('Search error:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        setError(t('search.timeout'));
      } else {
        setError(t('search.error'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !mapInstanceRef.current) {
    return (
      <div className={styles.loading} style={{ height, width }}>
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (error && !mapInstanceRef.current) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>{t('retry')}</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder={t('search.placeholder')}
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
            loadingText={t('search.loadingText')}
            disabled={!searchQuery.trim() || isLoading}
            rounded={true}
          >
            {t('search.button')}
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
          {t('currentLocation')}
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
          {t('geocoding')}
        </div>
      )}

      <div
        ref={mapRef}
        style={{ height, width }}
        className={styles.map}
      />

      {selectedLocation && (
        <div className={styles.selectedLocation}>
          <h4>{t('selected.title')}</h4>
          <p>
            {selectedLocation.address
              ? selectedLocation.address
              : isGeocoding
                ? t('selected.loadingAddress')
                : t('selected.coordinates', {
                    lng: selectedLocation.lng.toFixed(6),
                    lat: selectedLocation.lat.toFixed(6),
                  })
            }
          </p>
          {selectedLocation.city && (
            <p>{t('selected.city', { city: selectedLocation.city })}</p>
          )}
          {selectedLocation.region && (
            <p>{t('selected.region', { region: selectedLocation.region })}</p>
          )}
        </div>
      )}

      <div className={styles.instructions} style={{
        padding: '12px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        marginTop: '12px',
        fontSize: '13px'
      }} />
    </div>
  );
};

export default MapLocationPicker;