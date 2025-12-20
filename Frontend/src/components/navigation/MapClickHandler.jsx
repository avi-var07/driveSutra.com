import { useMapEvents } from 'react-leaflet';

const MapClickHandler = ({ onMapClick, isNavigating }) => {
  useMapEvents({
    click: (e) => {
      if (!isNavigating && onMapClick) {
        onMapClick(e);
      }
    }
  });

  return null;
};

export default MapClickHandler;