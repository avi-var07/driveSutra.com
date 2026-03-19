import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const TripContext = createContext(null);
export const useTripContext = () => useContext(TripContext);

const PAUSE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const ECO_SCORE_PENALTY = 50;

export const TripProvider = ({ children }) => {
  const [activeTripId, setActiveTripId] = useState(null);
  const [tripMode, setTripMode] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedAt, setPausedAt] = useState(null);
  const [pauseCount, setPauseCount] = useState(0);
  const [showNavGuard, setShowNavGuard] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const pauseTimerRef = useRef(null);

  // Load persisted trip state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('activeTripState');
      if (saved) {
        const state = JSON.parse(saved);
        setActiveTripId(state.activeTripId);
        setTripMode(state.tripMode);
        setIsPaused(state.isPaused || false);
        setPausedAt(state.pausedAt ? new Date(state.pausedAt) : null);
        setPauseCount(state.pauseCount || 0);

        // If paused, check if 5 min window expired
        if (state.isPaused && state.pausedAt) {
          const elapsed = Date.now() - new Date(state.pausedAt).getTime();
          if (elapsed >= PAUSE_TIMEOUT_MS) {
            // Auto-cancel — window expired
            clearActiveTripState();
          }
        }
      }
    } catch (e) {
      console.error('Failed to restore trip state:', e);
    }
  }, []);

  // Persist state changes
  const persistState = useCallback((tripId, mode, paused, pauseTime, count) => {
    const state = {
      activeTripId: tripId,
      tripMode: mode,
      isPaused: paused,
      pausedAt: pauseTime ? pauseTime.toISOString() : null,
      pauseCount: count
    };
    localStorage.setItem('activeTripState', JSON.stringify(state));
  }, []);

  // Start tracking a trip
  const registerActiveTrip = useCallback((tripId, mode) => {
    setActiveTripId(tripId);
    setTripMode(mode);
    setIsPaused(false);
    setPausedAt(null);
    setPauseCount(0);
    persistState(tripId, mode, false, null, 0);
  }, [persistState]);

  // Clear active trip state
  const clearActiveTripState = useCallback(() => {
    setActiveTripId(null);
    setTripMode(null);
    setIsPaused(false);
    setPausedAt(null);
    setPauseCount(0);
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
    localStorage.removeItem('activeTripState');
  }, []);

  // Pause trip
  const pauseTrip = useCallback(() => {
    const now = new Date();
    setIsPaused(true);
    setPausedAt(now);
    setPauseCount(prev => {
      const newCount = prev + 1;
      persistState(activeTripId, tripMode, true, now, newCount);
      return newCount;
    });

    // Auto-cancel after 5 minutes
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      clearActiveTripState();
    }, PAUSE_TIMEOUT_MS);
  }, [activeTripId, tripMode, persistState, clearActiveTripState]);

  // Resume trip
  const resumeTrip = useCallback(() => {
    if (pausedAt) {
      const elapsed = Date.now() - pausedAt.getTime();
      if (elapsed >= PAUSE_TIMEOUT_MS) {
        // Window expired
        clearActiveTripState();
        return false;
      }
    }
    setIsPaused(false);
    setPausedAt(null);
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
    persistState(activeTripId, tripMode, false, null, pauseCount);
    return true;
  }, [activeTripId, tripMode, pauseCount, pausedAt, persistState, clearActiveTripState]);

  // Navigation guard: call this before navigating away during active trip
  const requestNavigation = useCallback((targetPath) => {
    if (activeTripId && !isPaused) {
      setPendingNavigation(targetPath);
      setShowNavGuard(true);
      return false; // blocked
    }
    return true; // allow
  }, [activeTripId, isPaused]);

  const dismissNavGuard = useCallback(() => {
    setShowNavGuard(false);
    setPendingNavigation(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, []);

  return (
    <TripContext.Provider
      value={{
        activeTripId,
        tripMode,
        isTripActive: !!activeTripId,
        isPaused,
        pausedAt,
        pauseCount,
        ecoScorePenalty: pauseCount * ECO_SCORE_PENALTY,
        pauseTimeoutMs: PAUSE_TIMEOUT_MS,
        showNavGuard,
        pendingNavigation,
        registerActiveTrip,
        clearActiveTripState,
        pauseTrip,
        resumeTrip,
        requestNavigation,
        dismissNavGuard,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export default TripContext;
