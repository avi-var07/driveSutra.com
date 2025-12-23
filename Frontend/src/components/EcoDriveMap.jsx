import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { mapService } from '../services/mapService';

// Fix Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Child component to update map view
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
}

export default function EcoDriveMap({ startLocation, endLocation, onRouteFound, interactive = true }) {
  const [routeData, setRouteData] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India Center
  const [zoom, setZoom] = useState(5);

  // Decoding OSRM GeoJSON for Polyline
  const [routePositions, setRoutePositions] = useState([]);

  useEffect(() => {
    if (startLocation && endLocation) {
      fetchRoute();
    } else if (startLocation) {
      setMapCenter([startLocation.lat, startLocation.lng]);
      setZoom(13);
    }
  }, [startLocation, endLocation]);

  const fetchRoute = async () => {
    try {
      const route = await mapService.getRoute(startLocation, endLocation, 'driving');

      // OSRM returns geometry as [lon, lat], Leaflet needs [lat, lon]
      const positions = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
      setRoutePositions(positions);
      setRouteData(route);

      if (onRouteFound) {
        onRouteFound(route);
      }

      // Fit bounds (rough approx)
      if (positions.length > 0) {
        const latLngs = positions.map(p => L.latLng(p[0], p[1]));
        const bounds = L.latLngBounds(latLngs);
        // We can't access 'map' directly here easily to fitBounds without ref, 
        // but MapUpdater handles center. For bounds we might need a different approach 
        // or just center on mid point.
        // Simplified: Center on start
        setMapCenter([startLocation.lat, startLocation.lng]);
        setZoom(10);
      }
    } catch (error) {
      console.error("Failed to fetch route", error);
    }
  };

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-emerald-500/30 relative z-0">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={interactive}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater center={mapCenter} zoom={zoom} />

        {startLocation && (
          <Marker position={[startLocation.lat, startLocation.lng]}>
            <Popup>Start: {startLocation.address}</Popup>
          </Marker>
        )}

        {endLocation && (
          <Marker position={[endLocation.lat, endLocation.lng]}>
            <Popup>End: {endLocation.address}</Popup>
          </Marker>
        )}

        {routePositions.length > 0 && (
          <Polyline
            positions={routePositions}
            pathOptions={{ color: '#10b981', weight: 6, opacity: 0.8 }}
          />
        )}
      </MapContainer>

      {/* Route Info Overlay */}
      {routeData && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-4 rounded-lg border border-emerald-500/30 text-white z-[1000]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400">Total Distance</p>
              <p className="text-xl font-bold text-emerald-400">{(routeData.distance / 1000).toFixed(1)} km</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Est. Time</p>
              <p className="text-xl font-bold text-white">{(routeData.duration / 60).toFixed(0)} min</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
