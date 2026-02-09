import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import locationTrackingService from '../../services/locationTrackingService';
import healthApiService from '../../services/healthApiService';
import publicTransportService from '../../services/publicTransportService';
import tripService from '../../services/tripService';
import treePlantingService from '../../services/treePlantingService';

export default function EnhancedTripTracker({ trip, onComplete }) {
  const navigate = useNavigate();
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [speed, setSpeed] = useState({ current: 0, max: 0, average: 0 });
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [healthConnected, setHealthConnected] = useState(false);
  const [nearbyMetro, setNearbyMetro] = useState(null);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationData, setVerificationData] = useState({});
  
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Initialize health API for walk/cycle trips
    if (trip.mode === 'WALK' || trip.mode === 'CYCLE') {
      initializeHealthApi();
    }

    // Check for nearby metro if public transport
    if (trip.mode === 'PUBLIC') {
      checkNearbyMetro();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [trip.mode]);

  const initializeHealthApi = async () => {
    try {
      const result = await healthApiService.connect();
      if (result?.success) {
        setHealthConnected(true);
        console.log('✅ Health API connected:', result.provider || 'google');
      }
    } catch (error) {
      console.error('Health API connection failed:', error);
    }
  };

  const checkNearbyMetro = async () => {
    try {
      const location = await locationTrackingService.getCurrentLocation();
      const result = await publicTransportService.findNearbyMetroStations(
        location.lat,
        location.lng,
        2
      );
      
      if (result.success && result.stations.length > 0) {
        setNearbyMetro(result);
      }
    } catch (error) {
      console.error('Metro check failed:', error);
    }
  };

  const startTracking = async () => {
    try {
      // Start trip on backend
      await tripService.startTrip(trip._id, true);

      // Start location tracking
      locationTrackingService.startTracking({
        onLocationUpdate: handleLocationUpdate,
        onSpeedUpdate: handleSpeedUpdate,
        onError: handleTrackingError
      });

      setIsTracking(true);
      startTimeRef.current = Date.now();

      // Start duration timer
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000 / 60;
        setDuration(elapsed);
      }, 1000);

    } catch (error) {
      console.error('Failed to start tracking:', error);
      alert('Failed to start trip tracking');
    }
  };

  const handleLocationUpdate = async (locationData) => {
    setCurrentLocation(locationData);
    setDistance(locationData.totalDistance);

    // Send location to backend for real-time tracking
    try {
      await tripService.updateTripLocation(trip._id, {
        lat: locationData.lat,
        lng: locationData.lng,
        accuracy: locationData.accuracy,
        speed: locationData.speed,
        timestamp: locationData.timestamp
      });
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  const handleSpeedUpdate = (speedData) => {
    setSpeed(speedData);

    // Alert for speed violations (car/bike only)
    if ((trip.mode === 'CAR' || trip.mode === 'BIKE') && speedData.current > 80) {
      console.warn('⚠️ Speed limit exceeded!');
    }
  };

  const handleTrackingError = (error) => {
    console.error('Tracking error:', error);
    alert(`Location tracking error: ${error.message}`);
  };

  const stopTracking = async () => {
    // Stop location tracking
    const summary = locationTrackingService.stopTracking();
    
    // Stop duration timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setIsTracking(false);

    // Show verification dialog
    setVerificationData({
      actualMinutes: summary.duration,
      totalDistance: summary.totalDistance,
      maxSpeed: summary.maxSpeed,
      averageSpeed: summary.averageSpeed
    });
    setShowVerification(true);
  };

  const completeTrip = async (additionalData = {}) => {
    try {
      let fitnessData = null;

      // Get fitness data for walk/cycle trips
      if ((trip.mode === 'WALK' || trip.mode === 'CYCLE') && healthConnected) {
        const startTime = startTimeRef.current;
        const endTime = Date.now();
        fitnessData = await healthApiService.getFitnessData(startTime, endTime);
      }

      // Complete trip on backend
      const result = await tripService.completeTrip(trip._id, {
        ...verificationData,
        ...additionalData,
        fitnessData
      });

      // Plant trees if CO2 saved
      if (result.trip.co2Saved > 0) {
        try {
          const treeResult = await treePlantingService.plantTreesForTrip(trip._id);
          if (treeResult.success) {
            alert(`🌳 ${treeResult.treePlanting.treeCount} tree(s) will be planted in your name!`);
          }
        } catch (error) {
          console.error('Tree planting failed:', error);
        }
      }

      // Navigate to trip summary
      if (onComplete) {
        onComplete(result);
      } else {
        navigate('/trips', { state: { completedTrip: result } });
      }

    } catch (error) {
      console.error('Failed to complete trip:', error);
      alert('Failed to complete trip');
    }
  };

  const handleTicketUpload = async (file) => {
    try {
      const result = await publicTransportService.verifyTicket(file);
      if (result.verified) {
        setVerificationData(prev => ({
          ...prev,
          ticketImage: file,
          ticketVerified: true
        }));
        alert('✅ Ticket verified successfully!');
      }
    } catch (error) {
      console.error('Ticket verification failed:', error);
      alert('Ticket verification failed');
    }
  };

  const handleTransactionVerification = async (transactionData) => {
    try {
      const result = await publicTransportService.verifyTransaction({
        ...transactionData,
        tripId: trip._id
      });
      
      if (result.verified) {
        setVerificationData(prev => ({
          ...prev,
          transactionVerified: true,
          transactionId: transactionData.transactionId
        }));
        alert('✅ Transaction verified successfully!');
      }
    } catch (error) {
      console.error('Transaction verification failed:', error);
      alert('Transaction verification failed');
    }
  };

  return (
    <div className="enhanced-trip-tracker p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">
        {trip.mode} Trip Tracker
      </h2>

      {/* Trip Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="stat-card p-4 bg-blue-50 rounded">
          <div className="text-sm text-gray-600">Distance</div>
          <div className="text-2xl font-bold">
            {distance.toFixed(2)} km
          </div>
        </div>
        <div className="stat-card p-4 bg-green-50 rounded">
          <div className="text-sm text-gray-600">Duration</div>
          <div className="text-2xl font-bold">
            {Math.floor(duration)} min
          </div>
        </div>
        {(trip.mode === 'CAR' || trip.mode === 'BIKE') && (
          <>
            <div className="stat-card p-4 bg-yellow-50 rounded">
              <div className="text-sm text-gray-600">Current Speed</div>
              <div className="text-2xl font-bold">
                {speed.current.toFixed(1)} km/h
              </div>
            </div>
            <div className="stat-card p-4 bg-red-50 rounded">
              <div className="text-sm text-gray-600">Max Speed</div>
              <div className="text-2xl font-bold">
                {speed.max.toFixed(1)} km/h
              </div>
            </div>
          </>
        )}
      </div>

      {/* Health API Status */}
      {(trip.mode === 'WALK' || trip.mode === 'CYCLE') && (
        <div className="mb-4 p-3 bg-purple-50 rounded">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Health Tracking: {healthConnected ? '✅ Connected' : '❌ Not Connected'}
            </span>
            {!healthConnected && (
              <button
                onClick={initializeHealthApi}
                className="text-sm text-blue-600 hover:underline"
              >
                Connect
              </button>
            )}
          </div>
        </div>
      )}

      {/* Nearby Metro Info */}
      {trip.mode === 'PUBLIC' && nearbyMetro && (
        <div className="mb-4 p-3 bg-indigo-50 rounded">
          <div className="text-sm font-medium mb-2">
            🚇 Nearby Metro Stations in {nearbyMetro.city}
          </div>
          {nearbyMetro.stations.slice(0, 2).map((station, idx) => (
            <div key={idx} className="text-xs text-gray-600">
              • {station.name} - {station.distance.toFixed(1)} km ({station.line})
            </div>
          ))}
        </div>
      )}

      {/* Tracking Controls */}
      <div className="flex gap-3">
        {!isTracking ? (
          <button
            onClick={startTracking}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
          >
            Start Trip
          </button>
        ) : (
          <button
            onClick={stopTracking}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700"
          >
            Stop Trip
          </button>
        )}
      </div>

      {/* Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Complete Trip</h3>
            
            {/* Public Transport Verification */}
            {trip.mode === 'PUBLIC' && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Verification Required</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => document.getElementById('ticket-upload').click()}
                    className="w-full p-2 border rounded hover:bg-gray-50"
                  >
                    📷 Upload Ticket
                  </button>
                  <input
                    id="ticket-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleTicketUpload(e.target.files[0])}
                  />
                  <button
                    onClick={() => {
                      const txnId = prompt('Enter Transaction ID:');
                      const amount = prompt('Enter Amount:');
                      if (txnId && amount) {
                        handleTransactionVerification({
                          transactionId: txnId,
                          amount: parseFloat(amount),
                          timestamp: Date.now(),
                          paymentMethod: 'upi'
                        });
                      }
                    }}
                    className="w-full p-2 border rounded hover:bg-gray-50"
                  >
                    💳 Verify Transaction
                  </button>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="text-sm space-y-1">
                <div>Distance: {verificationData.totalDistance?.toFixed(2)} km</div>
                <div>Duration: {Math.floor(verificationData.actualMinutes)} min</div>
                {verificationData.averageSpeed > 0 && (
                  <div>Avg Speed: {verificationData.averageSpeed.toFixed(1)} km/h</div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowVerification(false)}
                className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => completeTrip()}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Complete Trip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
