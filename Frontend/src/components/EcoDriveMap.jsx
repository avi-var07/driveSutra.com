import React, { useRef, useState, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api'

const centerIndia = { lat: 22.3511148, lng: 78.6677428 }

export default function EcoDriveMap() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ['places', 'geometry'],
  })

  const mapRef = useRef(null)
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [directions, setDirections] = useState(null)
  const [ecoDirections, setEcoDirections] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Show placeholder if no API key
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Google Maps API Key Required</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to <a href="https://console.cloud.google.com/google/maps-apis/credentials" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Google Cloud Console</a></li>
                  <li>Create a project and enable Maps JavaScript API & Directions API</li>
                  <li>Create an API key</li>
                  <li>Add it to <code className="bg-yellow-100 px-1 rounded">frontend/.env</code> as <code className="bg-yellow-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY=your_key</code></li>
                  <li>Restart the dev server</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              className="flex-1 p-2 border rounded-md bg-gray-100"
              placeholder="Starting Point"
              disabled
            />
            <input
              className="flex-1 p-2 border rounded-md bg-gray-100"
              placeholder="Ending Point"
              disabled
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              disabled
              className="px-4 py-2 bg-blue-600 text-white rounded-md opacity-50 cursor-not-allowed"
            >
              Show Route
            </button>
            <button
              disabled
              className="px-4 py-2 bg-green-600 text-white rounded-md opacity-50 cursor-not-allowed"
            >
              Show Eco Route
            </button>
          </div>
        </div>

        <div className="h-[600px] rounded-md overflow-hidden border bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <p className="text-lg font-medium">Google Maps will appear here</p>
            <p className="text-sm mt-1">Add your API key to see the map</p>
          </div>
        </div>
      </div>
    )
  }

  const onMapLoad = useCallback((map) => {
    mapRef.current = map
  }, [])

  const fitRouteBounds = (route) => {
    if (!mapRef.current || !route) return
    try {
      const bounds = new window.google.maps.LatLngBounds()
      if (route.bounds && route.bounds.northeast && route.bounds.southwest) {
        bounds.extend(route.bounds.northeast)
        bounds.extend(route.bounds.southwest)
      } else if (route.overview_path && route.overview_path.length) {
        route.overview_path.forEach((p) => bounds.extend(p))
      }
      mapRef.current.fitBounds(bounds)
    } catch (e) {
      // ignore fit errors
    }
  }

  const requestDirections = (opts) =>
    new Promise((resolve, reject) => {
      if (!window.google || !window.google.maps) return reject(new Error('Google maps not available'))
      const service = new window.google.maps.DirectionsService()
      service.route(opts, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) resolve(result)
        else reject(new Error('Directions request failed: ' + status))
      })
    })

  const handleShowRoute = async () => {
    setError('')
    if (!origin || !destination) return setError('Please enter both origin and destination')
    setLoading(true)
    try {
      const result = await requestDirections({
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false,
      })
      setDirections(result)
      setEcoDirections(null)
      if (result.routes && result.routes[0]) fitRouteBounds(result.routes[0])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleShowEcoRoute = async () => {
    setError('')
    if (!origin || !destination) return setError('Please enter both origin and destination')
    setLoading(true)
    try {
      const result = await requestDirections({
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      })

      if (!result || !result.routes || !result.routes.length) throw new Error('No routes returned')

      let bestIndex = 0
      let bestDistance = Infinity
      result.routes.forEach((r, idx) => {
        const dist = (r.legs || []).reduce((s, leg) => s + (leg.distance?.value || 0), 0)
        if (dist < bestDistance) {
          bestDistance = dist
          bestIndex = idx
        }
      })

      const ecoRoute = result.routes[bestIndex]
      const ecoResult = { ...result, routes: [ecoRoute] }
      setEcoDirections(ecoResult)
      if (directions && directions.routes && directions.routes[0]) fitRouteBounds(directions.routes[0])
      if (ecoRoute) fitRouteBounds(ecoRoute)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (loadError) return <div className="p-4 text-red-600">Error loading maps: {String(loadError)}</div>
  if (!isLoaded) return <div className="p-4">Loading Maps...</div>

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Starting Point"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
          />
          <input
            className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Ending Point"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleShowRoute}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Working...' : 'Show Route'}
          </button>
          <button
            onClick={handleShowEcoRoute}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? 'Working...' : 'Show Eco Route'}
          </button>
        </div>
        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      </div>

      <div className="h-[600px] rounded-md overflow-hidden border">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={centerIndia}
          zoom={5}
          onLoad={onMapLoad}
        >
          {directions && (
            <DirectionsRenderer
              options={{
                directions,
                suppressMarkers: false,
                polylineOptions: {
                  strokeColor: '#1976d2',
                  strokeOpacity: ecoDirections ? 0.35 : 0.9,
                  strokeWeight: ecoDirections ? 4 : 6,
                },
              }}
            />
          )}

          {ecoDirections && (
            <DirectionsRenderer
              options={{
                directions: ecoDirections,
                suppressMarkers: false,
                polylineOptions: {
                  strokeColor: '#2e7d32',
                  strokeOpacity: 0.95,
                  strokeWeight: 6,
                },
              }}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  )
}
