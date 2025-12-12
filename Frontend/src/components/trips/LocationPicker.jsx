import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdClose, MdLocationOn, MdSearch } from 'react-icons/md'

export default function LocationPicker({ isOpen, onClose, onSave, title = 'Pick Location' }) {
  const [searchInput, setSearchInput] = useState('')
  const [selectedCoords, setSelectedCoords] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState('')

  // Debounce timer for search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchInput.trim().length > 2) {
        fetchLocations(searchInput)
      } else if (searchInput.trim().length === 0) {
        setSuggestions([])
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchInput])

  // Fetch locations using Nominatim (OpenStreetMap free geocoding)
  const fetchLocations = async (query) => {
    setSearchLoading(true)
    setError('')
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const locations = data.map((item) => ({
          name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          address: item.address
        }))
        setSuggestions(locations)
      } else {
        setError('No locations found. Try a different search.')
        setSuggestions([])
      }
    } catch (err) {
      setError('Error fetching locations. Please try again.')
      console.error('Geocoding error:', err)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSelectLocation = (location) => {
    setSelectedCoords({ lat: location.lat, lng: location.lng, name: location.name })
  }

  const handleSave = () => {
    if (selectedCoords) {
      onSave({ lat: selectedCoords.lat, lng: selectedCoords.lng })
      setSearchInput('')
      setSelectedCoords(null)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-[90%] max-w-2xl bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MdLocationOn className="text-emerald-400 text-2xl" />
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <MdClose className="text-2xl text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Search Input */}
              <div className="relative">
                <div className="flex items-center gap-2">
                  <MdSearch className="text-emerald-400 text-xl" />
                  <input
                    type="text"
                    placeholder="Search for any location worldwide... (e.g., 'Times Square NYC', 'Eiffel Tower')"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                    autoFocus
                  />
                  {searchLoading && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-emerald-400 text-xl"
                    >
                      ⟳
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Helper Text */}
              {suggestions.length === 0 && !searchLoading && !error && (
                <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600 text-slate-400 text-sm text-center">
                  {searchInput.length === 0
                    ? 'Start typing to search for locations worldwide'
                    : 'Searching...'}
                </div>
              )}

              {/* Location Suggestions */}
              {suggestions.length > 0 && (
                <div>
                  <div className="text-sm text-slate-300 mb-3 font-semibold">
                    Search Results ({suggestions.length})
                  </div>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {suggestions.map((location, idx) => (
                        <motion.button
                          key={`${location.lat}-${location.lng}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ x: 4 }}
                          onClick={() => handleSelectLocation(location)}
                          className={`w-full p-3 rounded-lg text-left transition-all ${
                            selectedCoords?.lat === location.lat && selectedCoords?.lng === location.lng
                              ? 'bg-emerald-500/30 border-2 border-emerald-400 shadow-lg shadow-emerald-500/20'
                              : 'bg-slate-700/50 border border-slate-600 hover:border-emerald-400/50'
                          }`}
                        >
                          <div className="font-medium text-white text-sm flex items-center gap-2">
                            <MdLocationOn className="text-emerald-400" />
                            {location.name.split(',')[0]}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            📍 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                          </div>
                          {location.address && (
                            <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                              {location.address}
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Selected Location Preview */}
              {selectedCoords && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30"
                >
                  <div className="text-sm text-slate-400">Selected Location</div>
                  <div className="font-semibold text-white">{selectedCoords.name}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Latitude: {selectedCoords.lat.toFixed(6)}
                  </div>
                  <div className="text-xs text-slate-400">
                    Longitude: {selectedCoords.lng.toFixed(6)}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-slate-700 bg-slate-900/50">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={!selectedCoords}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:shadow-lg hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Confirm
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
