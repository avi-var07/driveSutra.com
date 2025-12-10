import { getRouteORS } from '../utils/routingService.js';

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

export default { getRoute };
