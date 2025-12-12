import { getRouteORS } from '../utils/routingService.js';
import Trip from '../models/Trip.js';
import User from '../models/User.js';
import { calculateEcoScore } from '../utils/ecoScoreCalculator.js';
import { getRouteWeather } from '../utils/weatherService.js';
import { checkAchievements } from './achievementController.js';

// Get route options for all 3 modes (PUBLIC, WALK/CYCLE, CAR/BIKE)
export async function getRouteOptions(req, res) {
	try {
		const { startLocation, endLocation } = req.body;
		
		if (!startLocation?.lat || !startLocation?.lng || !endLocation?.lat || !endLocation?.lng) {
			return res.status(400).json({ message: 'Valid start and end coordinates required' });
		}

		const startLngLat = [Number(startLocation.lng), Number(startLocation.lat)];
		const endLngLat = [Number(endLocation.lng), Number(endLocation.lat)];

		// Get routes for all transport modes and weather data
		const routePromises = [
			getRouteORS(startLngLat, endLngLat, 'foot-walking').catch(err => ({ error: err.message, mode: 'WALK' })),
			getRouteORS(startLngLat, endLngLat, 'cycling-regular').catch(err => ({ error: err.message, mode: 'CYCLE' })),
			getRouteORS(startLngLat, endLngLat, 'driving-car').catch(err => ({ error: err.message, mode: 'CAR' })),
			getRouteWeather(startLocation.lat, startLocation.lng, endLocation.lat, endLocation.lng).catch(err => ({ condition: 'clear', temp: 25 }))
		];

		const [walkRoute, cycleRoute, carRoute, weatherData] = await Promise.all(routePromises);

		// Calculate straight-line distance for public transport estimation
		const straightDistance = calculateDistance(startLocation.lat, startLocation.lng, endLocation.lat, endLocation.lng);
		
		const options = [];

		// Public Transport Option (estimated)
		options.push({
			mode: 'PUBLIC',
			distanceKm: straightDistance * 1.3, // assume 30% longer route
			durationMinutes: Math.max(15, straightDistance * 4), // ~15 km/h average with stops
			ecoLabel: 'Eco-Friendly',
			estimatedEcoScore: 85,
			icon: '🚌'
		});

		// Walk Option
		if (!walkRoute.error && walkRoute.distanceKm <= 5) { // Only show walk for reasonable distances
			options.push({
				mode: 'WALK',
				distanceKm: walkRoute.distanceKm,
				durationMinutes: walkRoute.durationMinutes,
				ecoLabel: 'Carbon Neutral',
				estimatedEcoScore: 90,
				icon: '🚶',
				geometry: walkRoute.geometry
			});
		}

		// Cycle Option
		if (!cycleRoute.error && cycleRoute.distanceKm <= 15) { // Only show cycle for reasonable distances
			options.push({
				mode: 'CYCLE',
				distanceKm: cycleRoute.distanceKm,
				durationMinutes: cycleRoute.durationMinutes,
				ecoLabel: 'Zero Emission',
				estimatedEcoScore: 88,
				icon: '🚴',
				geometry: cycleRoute.geometry
			});
		}

		// Car/Bike Option
		if (!carRoute.error) {
			const suggestedSpeed = Math.min(60, Math.max(30, carRoute.distanceKm / (carRoute.durationMinutes / 60)));
			options.push({
				mode: 'CAR',
				distanceKm: carRoute.distanceKm,
				durationMinutes: carRoute.durationMinutes,
				ecoLabel: 'Drive Smart',
				estimatedEcoScore: 65,
				icon: '🚗',
				suggestedSpeedRange: `${Math.round(suggestedSpeed - 10)}-${Math.round(suggestedSpeed + 10)} km/h`,
				geometry: carRoute.geometry
			});
		}

		return res.json({
			success: true,
			options,
			startLocation,
			endLocation,
			weather: weatherData
		});

	} catch (err) {
		console.error('getRouteOptions error', err.message || err);
		return res.status(500).json({ message: err.message || 'Server error' });
	}
}

// Helper function to calculate straight-line distance
function calculateDistance(lat1, lon1, lat2, lon2) {
	const R = 6371; // Earth's radius in km
	const dLat = (lat2 - lat1) * Math.PI / 180;
	const dLon = (lon2 - lon1) * Math.PI / 180;
	const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
		Math.sin(dLon/2) * Math.sin(dLon/2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	return R * c;
}

// Create a new trip (planning phase)
export async function createTrip(req, res) {
	try {
		const { startLocation, endLocation, mode, distanceKm, etaMinutes, routeGeometry } = req.body;
		
		if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
		
		if (!startLocation?.lat || !endLocation?.lat || !mode) {
			return res.status(400).json({ message: 'Missing required trip data' });
		}

		const trip = await Trip.create({
			user: req.user._id,
			startLocation: {
				lat: Number(startLocation.lat),
				lng: Number(startLocation.lng),
				address: startLocation.address || ''
			},
			endLocation: {
				lat: Number(endLocation.lat),
				lng: Number(endLocation.lng),
				address: endLocation.address || ''
			},
			mode,
			distanceKm: Number(distanceKm || 0),
			etaMinutes: Number(etaMinutes || 0),
			status: 'planned',
			routeGeometry: routeGeometry || null
		});

		return res.status(201).json({ 
			success: true, 
			message: 'Trip planned successfully',
			trip 
		});
		
	} catch (err) {
		console.error('createTrip error', err.message || err);
		return res.status(500).json({ message: err.message || 'Server error' });
	}
}

// Start a trip (user begins traveling)
export async function startTrip(req, res) {
	try {
		const { tripId } = req.params;
		
		if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
		
		const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
		if (!trip) return res.status(404).json({ message: 'Trip not found' });
		
		if (trip.status !== 'planned') {
			return res.status(400).json({ message: 'Trip cannot be started' });
		}

		trip.status = 'in_progress';
		trip.startTime = new Date();
		await trip.save();

		return res.json({ 
			success: true, 
			message: 'Trip started successfully',
			trip 
		});
		
	} catch (err) {
		console.error('startTrip error', err.message || err);
		return res.status(500).json({ message: err.message || 'Server error' });
	}
}

// Complete a trip with verification data
export async function completeTrip(req, res) {
	try {
		const { tripId } = req.params;
		const { 
			actualMinutes, 
			ticketImage, 
			stepsData, 
			weatherData,
			verification = {} 
		} = req.body;
		
		if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
		
		const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
		if (!trip) return res.status(404).json({ message: 'Trip not found' });
		
		if (trip.status !== 'in_progress' && trip.status !== 'planned') {
			return res.status(400).json({ message: 'Trip cannot be completed' });
		}

		// Update trip with completion data
		trip.status = 'completed';
		trip.endTime = new Date();
		trip.actualMinutes = Number(actualMinutes) || trip.etaMinutes;
		
		// Weather data
		if (weatherData) {
			trip.weather = weatherData;
		}
		
		// Verification data
		if (ticketImage) {
			trip.verification.ticketUploaded = true;
			trip.verification.ticketImageUrl = ticketImage;
		}
		
		if (stepsData) {
			trip.verification.stepsData = stepsData;
		}
		
		// Calculate speed analysis for car/bike
		if (trip.mode === 'CAR' || trip.mode === 'BIKE') {
			const avgSpeed = trip.distanceKm / (trip.actualMinutes / 60);
			trip.verification.speedAnalysis = {
				avgSpeed,
				maxSpeed: avgSpeed * 1.2, // estimated
				speedViolations: avgSpeed > 80 ? 1 : 0
			};
		}

		// Get user for fraud strikes
		const user = await User.findById(req.user._id);
		
		// Calculate ecoScore with all components
		const ecoResult = calculateEcoScore({
			mode: trip.mode,
			distanceKm: trip.distanceKm,
			etaMinutes: trip.etaMinutes,
			actualMinutes: trip.actualMinutes,
			weather: trip.weather,
			verification: {
				ticketVerified: trip.verification.ticketUploaded,
				stepsMatch: stepsData ? true : false,
				avgSpeed: trip.verification.speedAnalysis?.avgSpeed,
				fraudStrikes: user.fraudStrikes || 0
			}
		});

		// Update trip with eco score and components
		trip.ecoScore = ecoResult.ecoScore;
		trip.ecoComponents = ecoResult.components;
		
		// Calculate rewards
		const rewards = calculateTripRewards(trip.ecoScore, trip.distanceKm, trip.mode);
		trip.xpEarned = rewards.xp;
		trip.carbonCreditsEarned = rewards.carbonCredits;
		trip.co2Saved = rewards.co2Saved;
		trip.treesGrown = rewards.trees;
		
		await trip.save();

		// Update user stats
		await updateUserStats(user, trip, rewards);

		// Check for new achievements
		const newAchievements = await checkAchievements(user._id);

		return res.json({ 
			success: true, 
			message: 'Trip completed successfully!',
			trip,
			rewards,
			ecoScore: ecoResult.ecoScore,
			components: ecoResult.components,
			newAchievements
		});
		
	} catch (err) {
		console.error('completeTrip error', err.message || err);
		return res.status(500).json({ message: err.message || 'Server error' });
	}
}

// Get user's trip history
export async function getUserTrips(req, res) {
	try {
		if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
		
		const { page = 1, limit = 10, status } = req.query;
		
		const query = { user: req.user._id };
		if (status) query.status = status;
		
		const trips = await Trip.find(query)
			.sort({ createdAt: -1 })
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.select('-routeGeometry -metadata'); // Exclude heavy data
		
		const total = await Trip.countDocuments(query);
		
		return res.json({
			success: true,
			trips,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total,
				pages: Math.ceil(total / limit)
			}
		});
		
	} catch (err) {
		console.error('getUserTrips error', err.message || err);
		return res.status(500).json({ message: err.message || 'Server error' });
	}
}

// Get trip details
export async function getTripDetails(req, res) {
	try {
		const { tripId } = req.params;
		
		if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
		
		const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
		if (!trip) return res.status(404).json({ message: 'Trip not found' });
		
		return res.json({ success: true, trip });
		
	} catch (err) {
		console.error('getTripDetails error', err.message || err);
		return res.status(500).json({ message: err.message || 'Server error' });
	}
}

// Helper function to calculate trip rewards
function calculateTripRewards(ecoScore, distanceKm, mode) {
	const baseXP = Math.round(ecoScore * 0.5 + distanceKm * 2);
	const modeMultiplier = {
		'PUBLIC': 1.5,
		'WALK': 1.8,
		'CYCLE': 1.6,
		'CAR': 1.0,
		'BIKE': 1.1
	};
	
	const xp = Math.round(baseXP * (modeMultiplier[mode] || 1));
	const carbonCredits = Math.round(ecoScore * 0.1 + distanceKm * 0.5);
	const co2Saved = calculateCO2Saved(distanceKm, mode);
	const trees = Math.round(co2Saved / 22); // ~22kg CO2 per tree per year
	
	return { xp, carbonCredits, co2Saved, trees };
}

// Helper function to calculate CO2 saved
function calculateCO2Saved(distanceKm, mode) {
	const carEmission = 0.21; // kg CO2 per km for average car
	const modeEmissions = {
		'PUBLIC': 0.05, // kg CO2 per km
		'WALK': 0,
		'CYCLE': 0,
		'CAR': carEmission,
		'BIKE': 0.15 // kg CO2 per km for motorcycle
	};
	
	const modeEmission = modeEmissions[mode] || carEmission;
	return Math.max(0, (carEmission - modeEmission) * distanceKm);
}

// Helper function to update user stats
async function updateUserStats(user, trip, rewards) {
	user.xp += rewards.xp;
	user.carbonCredits += rewards.carbonCredits;
	user.co2Saved += rewards.co2Saved;
	user.treesGrown += rewards.trees;
	user.totalTrips += 1;
	user.totalDistance += trip.distanceKm;
	
	// Update level based on XP
	const newLevel = Math.floor(user.xp / 1000) + 1;
	user.level = Math.max(user.level, newLevel);
	
	// Update ecoScore (running average)
	user.ecoScore = Math.round(
		(user.ecoScore * (user.totalTrips - 1) + trip.ecoScore) / user.totalTrips
	);
	
	// Update streak
	const today = new Date();
	const lastTrip = user.lastTripDate;
	
	if (!lastTrip) {
		user.currentStreak = 1;
	} else {
		const daysDiff = Math.floor((today - lastTrip) / (1000 * 60 * 60 * 24));
		if (daysDiff === 1) {
			user.currentStreak += 1;
		} else if (daysDiff > 1) {
			user.currentStreak = 1;
		}
		// If same day, don't change streak
	}
	
	user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
	user.lastTripDate = today;
	
	await user.save();
}

export default { 
	getRouteOptions, 
	createTrip, 
	startTrip, 
	completeTrip, 
	getUserTrips, 
	getTripDetails 
};
