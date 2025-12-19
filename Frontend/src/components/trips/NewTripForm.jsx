import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getRouteOptions, createTrip } from '../../services/tripService'
import { FaBus, FaBicycle, FaCar } from 'react-icons/fa'
import { MdLocationOn, MdCheckCircle, MdError } from 'react-icons/md'
import LocationPicker from './LocationPicker'
import CurrentLocationPicker from './CurrentLocationPicker'
import EnhancedRouteDisplay from './EnhancedRouteDisplay'

const modeLabels = {
  PUBLIC: { icon: <FaBus />, label: 'Public Transport', color: 'from-blue-500 to-blue-600', eco: 95 },
  CYCLE: { icon: <FaBicycle />, label: 'Cycle / Walk', color: 'from-green-500 to-emerald-600', eco: 90 },
  CAR: { icon: <FaCar />, label: 'Car / Bike', color: 'from-orange-500 to-red-600', eco: 60 }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export default function NewTripForm() {
  const navigate = useNavigate()
  const [start, setStart] = useState(null)
  const [end, setEnd] = useState(null)
  const [useCurrentLocation, setUseCurrentLocation] = useState(false)
  const [loading, setLoading] = useState(false)
  const [routeOptions, setRouteOptions] = useState(null)
  const [selectedOption, setSelectedOption] = useState(null)
  const [weatherData, setWeatherData] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [savedTrip, setSavedTrip] = useState(null)
  const [activeLocationPicker, setActiveLocationPicker] = useState(null)

  const handleGetRouteOptions = async () => {
    setError('')
    setSuccess('')
    if (!start || !end) {
      setError('Please select both start and end locations')
      return
    }

    setLoading(true)
    try {
      const startLocation = { lat: start.lat, lng: start.lng, address: start.name };
      const endLocation = { lat: end.lat, lng: end.lng, address: end.name };
      
      const res = await getRouteOptions(startLocation, endLocation)
      
      if (res.success) {
        setRouteOptions(res.options)
        setWeatherData(res.weather)
        setSuccess('Route options calculated! Select your preferred travel mode.')
        
        // Auto-select the first available option
        if (res.options.length > 0) {
          setSelectedOption(res.options[0])
        }
      }

      // Clear success message after 3s
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to get route options. Please try again.')
      console.error('Route options error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectOption = (option) => {
    setSelectedOption(option)
    setSuccess(`Selected ${option.mode} mode!`)
    setTimeout(() => setSuccess(''), 2000)
  }

  const handleConfirmTrip = async () => {
    if (!selectedOption) {
      setError('Please select a travel mode')
      return
    }

    try {
      setLoading(true)
      const payload = {
        startLocation: { lat: start.lat, lng: start.lng, address: start.name },
        endLocation: { lat: end.lat, lng: end.lng, address: end.name },
        mode: selectedOption.mode,
        distanceKm: selectedOption.distanceKm,
        etaMinutes: selectedOption.durationMinutes,
        routeGeometry: selectedOption.geometry
      }
      
      const res = await createTrip(payload)
      if (res?.success) {
        setSavedTrip(res.trip)
        setSuccess('Trip planned successfully! Redirecting to trip tracker...')
        // Navigate to trip tracker after 2 seconds
        setTimeout(() => {
          navigate(`/trip/${res.trip._id}/track`)
        }, 2000)
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to plan trip')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto relative z-10"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Plan Your Eco Trip
          </h1>
          <p className="text-slate-400">Choose sustainable travel options and track your eco impact</p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl"
        >
          {/* Location Selection */}
          <motion.div variants={itemVariants} className="space-y-6 mb-8">
            {/* Current Location Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700">
              <div>
                <h3 className="font-semibold text-white">Use Current Location as Start</h3>
                <p className="text-sm text-slate-400">Automatically detect your current position</p>
              </div>
              <button
                onClick={() => setUseCurrentLocation(!useCurrentLocation)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                  useCurrentLocation ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                    useCurrentLocation ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Location */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                <label className="block text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                  <MdLocationOn className="text-lg" />
                  Start Location {useCurrentLocation && '(Current)'}
                </label>
                {useCurrentLocation ? (
                  <CurrentLocationPicker
                    onLocationSelect={setStart}
                    selectedLocation={start}
                  />
                ) : (
                  <motion.button
                    onClick={() => setActiveLocationPicker('start')}
                    className="w-full p-4 rounded-xl bg-slate-700/30 border-2 border-slate-600 hover:border-emerald-400/50 text-left transition-all duration-300 hover:bg-slate-700/50"
                  >
                    {start ? (
                      <div>
                        <div className="font-semibold text-white">{start.name || 'Custom Location'}</div>
                        <div className="text-xs text-slate-400">
                          {start.lat.toFixed(4)}° N, {start.lng.toFixed(4)}° E
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-400">Click to select start location</div>
                    )}
                  </motion.button>
                )}
              </motion.div>

              {/* End Location */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                <label className="block text-sm font-semibold text-teal-400 mb-2 flex items-center gap-2">
                  <MdLocationOn className="text-lg" />
                  End Location
                </label>
                <motion.button
                  onClick={() => setActiveLocationPicker('end')}
                  className="w-full p-4 rounded-xl bg-slate-700/30 border-2 border-slate-600 hover:border-teal-400/50 text-left transition-all duration-300 hover:bg-slate-700/50"
                >
                  {end ? (
                    <div>
                      <div className="font-semibold text-white">{end.name || 'Custom Location'}</div>
                      <div className="text-xs text-slate-400">
                        {end.lat.toFixed(4)}° N, {end.lng.toFixed(4)}° E
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400">Click to select end location</div>
                  )}
                </motion.button>
              </motion.div>
            </div>
          </motion.div>

          {/* Error/Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 flex items-center gap-2"
              >
                <MdError className="text-lg" />
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 flex items-center gap-2"
              >
                <MdCheckCircle className="text-lg" />
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Get Route Options Button */}
          <motion.div variants={itemVariants} className="mb-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGetRouteOptions}
              disabled={loading || !start || !end}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? 'Getting Route Options...' : 'Get Route Options'}
            </motion.button>
          </motion.div>

          {/* Weather Info */}
          <AnimatePresence>
            {weatherData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {weatherData.condition === 'clear' ? '☀️' : 
                     weatherData.condition === 'rain' ? '🌧️' : 
                     weatherData.condition === 'cloudy' ? '☁️' : 
                     weatherData.condition === 'snow' ? '❄️' : '🌤️'}
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      {weatherData.temp}°C - {weatherData.description}
                    </div>
                    <div className="text-slate-400 text-sm">
                      Weather conditions for your route
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Route Display */}
          <AnimatePresence>
            {routeOptions && start && end && (
              <motion.div
                variants={itemVariants}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mb-8"
              >
                <EnhancedRouteDisplay
                  routes={routeOptions}
                  startLocation={start}
                  endLocation={end}
                  weather={weatherData}
                  selectedRoute={selectedOption}
                  onRouteSelect={handleSelectOption}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selected Route Summary & Confirm */}
          <AnimatePresence>
            {selectedOption && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-6 p-6 rounded-xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50"
              >
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-white mb-2">Trip Summary</h3>
                  <p className="text-slate-300 text-sm">
                    Selected mode: <span className="font-semibold text-emerald-400">{selectedOption.mode}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                      {selectedOption.distanceKm.toFixed(1)}
                    </div>
                    <div className="text-sm text-slate-400">Distance (km)</div>
                  </motion.div>

                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center">
                    <div className="text-2xl font-bold text-teal-400">
                      {Math.round(selectedOption.durationMinutes)}
                    </div>
                    <div className="text-sm text-slate-400">Est. Time (min)</div>
                  </motion.div>

                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {selectedOption.estimatedEcoScore}
                    </div>
                    <div className="text-sm text-slate-400">Est. EcoScore</div>
                  </motion.div>

                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center">
                    <div className="text-2xl">{selectedOption.icon}</div>
                    <div className="text-sm text-slate-400">{selectedOption.ecoLabel}</div>
                  </motion.div>
                </div>

                {/* Confirm Trip Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmTrip}
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? 'Planning Trip...' : 'Plan This Trip'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Saved Trip Confirmation */}
          <AnimatePresence>
            {savedTrip && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/50"
              >
                <div className="flex items-center gap-3 mb-2">
                  <MdCheckCircle className="text-3xl text-emerald-400" />
                  <h3 className="text-lg font-bold text-emerald-300">Trip Saved Successfully!</h3>
                </div>
                <p className="text-sm text-slate-300">
                  Trip ID: <span className="font-mono text-emerald-400">{savedTrip._id}</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Location Picker Modals */}
      <LocationPicker
        isOpen={activeLocationPicker === 'start'}
        onClose={() => setActiveLocationPicker(null)}
        onSave={(coords) => {
          setStart({ ...coords })
          setActiveLocationPicker(null)
        }}
        title="Select Start Location"
      />

      <LocationPicker
        isOpen={activeLocationPicker === 'end'}
        onClose={() => setActiveLocationPicker(null)}
        onSave={(coords) => {
          setEnd({ ...coords })
          setActiveLocationPicker(null)
        }}
        title="Select End Location"
      />
    </div>
  )
}
