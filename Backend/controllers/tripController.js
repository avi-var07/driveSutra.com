import { getRouteORS } from '../utils/routingService.js';
import Trip from '../models/Trip.js';
import { calculateEcoScore } from '../utils/ecoScoreCalculator.js';

export async function getRoute(req, res) {
	try {
		const { start, end, mode } = req.body;
		if (!start || !end) return res.status(400).json({ message: 'start and end coordinates required' });

		// start/end expected as [lat, lng] or { lat, lng }
		const parsePoint = (p) => {
			if (Array.isArray(p) && p.length >= 2) return [Number(p[1]), Number(p[0])]; // [lng, lat]
			if (p && typeof p === 'object' && ('lat' in p) && ('lng' in p)) return [Number(p.lng), Number(p.lat)];
			throw new Error('Invalid coordinate format');
		};

		const startLngLat = parsePoint(start);
		const endLngLat = parsePoint(end);

		const profile = (mode === 'WALK' || mode === 'CYCLE') ? (mode === 'WALK' ? 'foot-walking' : 'cycling-regular') : 'driving-car';

		const route = await getRouteORS(startLngLat, endLngLat, profile);

		return res.json({
			distanceKm: route.distanceKm,
			durationMinutes: route.durationMinutes,
			geometry: route.geometry
		});
	} catch (err) {
		console.error('getRoute error', err.message || err);
		return res.status(500).json({ message: err.message || 'Server error' });
	}
}

export async function createTrip(req, res) {
	try {
		const { start, end, mode, distanceKm, durationMinutes, geometry } = req.body;
		if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

		const trip = await Trip.create({
			user: req.user._id,
			start: start && (start.lat ? { lat: Number(start.lat), lng: Number(start.lng) } : null),
			end: end && (end.lat ? { lat: Number(end.lat), lng: Number(end.lng) } : null),
			mode,
			distanceKm: Number(distanceKm || 0),
			durationMinutes: Number(durationMinutes || 0),
			metadata: { geometry }
		});

		// calculate ecoScore for the trip (basic, using eta==actual)
		const eco = calculateEcoScore({ mode, distanceKm: trip.distanceKm, etaMinutes: trip.durationMinutes, actualMinutes: trip.durationMinutes });
		trip.ecoScore = eco.ecoScore;
		await trip.save();

		// Optionally update user's xp/ecoScore aggregate here (not implemented)

		return res.status(201).json({ success: true, trip });
	} catch (err) {
		console.error('createTrip error', err.message || err);
		return res.status(500).json({ message: err.message || 'Server error' });
	}
}

export default { getRoute, createTrip };
