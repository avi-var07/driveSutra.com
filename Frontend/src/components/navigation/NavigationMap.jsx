import React, {useEffect, useRef} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useNavigation from './useNavigation';

const mapStyle = { width: '100%', height: '100%' };

const NavigationMap = ({ start, end, profile = 'driving', following = true, onStartChange, onEndChange, onStateChange }) => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  // The hook encapsulates all logic: init, watchPosition, routing, drawing
  useNavigation({
    mapRef,
    containerRef,
    start,
    end,
    profile,
    following,
    onStartChange,
    onEndChange,
    onStateChange,
  });

  useEffect(() => {
    // Map initialization handled inside useNavigation hook
  }, []);

  return <div ref={containerRef} style={mapStyle} />;
};

export default NavigationMap;
