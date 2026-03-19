import { getRouteORS } from '../services/routingService.js';
import Trip from '../models/Trip.js';
import User from '../models/User.js';
import { calculateEcoScore } from '../services/ecoScoreCalculator.js';
import { getRouteWeather } from '../services/weatherService.js';
import { checkAchievements } from './achievementController.js';
import { sendTripCompletionEmail } from '../services/emailService.js';

// Get route options for all 3 modes (PUBLIC, WALK/CYCLE, CAR/BIKE)
export async function getRouteOptions(req, res) {
	try {
		const { startLocation, endLocation } = req.body;

		if (!startLocation?.lat || !startLocation?.lng || !endLocation?.lat || !endLocation?.lng) {
			return res.status(400).json({ message: 'Valid start and end coordinates required' });
		}

		const startLngLat = [Number(startLocation.lng), Number(startLocation.lat)];
		const endLngLat = [Number(endLocation.lng), Number(endLocation.lat)];

		// Get weather data first, then routes with weather context
		const weatherData = await getRouteWeather(startLocation.lat, startLocation.lng, endLocation.lat, endLocation.lng).catch(err => ({ condition: 'clear', temp: 25 }));

		// Get routes for all transport modes with weather data
		const routePromises = [
			getRouteORS(startLngLat, endLngLat, 'foot-walking', weatherData).catch(err => ({ error: err.message, mode: 'WALK' })),
			getRouteORS(startLngLat, endLngLat, 'cycling-regular', weatherData).catch(err => ({ error: err.message, mode: 'CYCLE' })),
			getRouteORS(startLngLat, endLngLat, 'driving-car', weatherData).catch(err => ({ error: err.message, mode: 'CAR' }))
		];

		const [walkRoute, cycleRoute, carRoute] = await Promise.all(routePromises);

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
				geometry: walkRoute.geometry,
				color: walkRoute.color,
				steps: walkRoute.steps
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
				geometry: cycleRoute.geometry,
				color: cycleRoute.color,
				steps: cycleRoute.steps
			});
		}

		// Car/Bike Option
		if (!carRoute.error) {
			options.push({
				mode: 'CAR',
				distanceKm: carRoute.distanceKm,
				durationMinutes: carRoute.durationMinutes,
				ecoLabel: 'Drive Smart',
				estimatedEcoScore: 65,
				icon: '🚗',
				speedSuggestion: carRoute.speedSuggestion,
				geometry: carRoute.geometry,
				color: carRoute.color,
				steps: carRoute.steps
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
	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

// Create a new trip (planning phase)
export async function createTrip(req, res) {
	try {
		const { startLocation, endLocation, mode, distanceKm, etaMinutes, routeGeometry, bookedWithUs, bookingRef, subMode } = req.body;

		if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

		if (!startLocation?.lat || !endLocation?.lat || !mode) {
			return res.status(400).json({ message: 'Missing required trip data' });
		}

		// Build trip data
		const tripData = {
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
		};

		// Handle "Book With Us" — set booking details and 7-day ticket expiration
		if (bookedWithUs) {
			const now = new Date();
			const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
			tripData.bookedWithUs = true;
			tripData.bookingRef = bookingRef || '';
			tripData.ticketBookedAt = now;
			tripData.ticketExpiresAt = expiresAt;
		}

		const trip = await Trip.create(tripData);

		return res.status(201).json({
			success: true,
			message: bookedWithUs ? 'Trip booked & planned! Ticket valid for 7 days.' : 'Trip planned successfully',
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
		const { enableTracking = false } = req.body;

		if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

		const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
		if (!trip) return res.status(404).json({ message: 'Trip not found' });

		if (trip.status !== 'planned') {
			return res.status(400).json({ message: 'Trip cannot be started' });
		}

		trip.status = 'in_progress';
		trip.startTime = new Date();
		trip.tracking.enabled = enableTracking;
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

// Update trip location (real-time tracking)
export async function updateTripLocation(req, res) {
	try {
		const { tripId } = req.params;
		const { lat, lng, accuracy, speed, timestamp } = req.body;

		if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

		const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
		if (!trip) return res.status(404).json({ message: 'Trip not found' });

		if (trip.status !== 'in_progress') {
			return res.status(400).json({ message: 'Trip is not in progress' });
		}

		if (!trip.tracking.enabled) {
			return res.status(400).json({ message: 'Tracking not enabled for this trip' });
		}

		// Add location to history
		trip.tracking.locationHistory.push({
			lat: Number(lat),
			lng: Number(lng),
			accuracy: Number(accuracy),
			speed: Number(speed) || 0,
			timestamp: new Date(timestamp || Date.now())
		});

		// Update max speed
		const speedKmh = (speed || 0) * 3.6; // Convert m/s to km/h
		if (speedKmh > trip.tracking.maxSpeedRecorded) {
			trip.tracking.maxSpeedRecorded = speedKmh;
		}

		// Calculate distance from last location
		if (trip.tracking.locationHistory.length > 1) {
			const lastLocation = trip.tracking.locationHistory[trip.tracking.locationHistory.length - 2];
			const distance = calculateDistance(lastLocation.lat, lastLocation.lng, lat, lng);
			trip.tracking.totalDistanceTracked += distance;
		}

		await trip.save();

		return res.json({
			success: true,
			message: 'Location updated',
			tracking: {
				totalDistance: trip.tracking.totalDistanceTracked,
				maxSpeed: trip.tracking.maxSpeedRecorded,
				locationCount: trip.tracking.locationHistory.length
			}
		});

	} catch (err) {
		console.error('updateTripLocation error', err.message || err);
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
			verification = {},
			ecoScorePenalty = 0,
			bookedWithUs = false,
			lagData = {}
		} = req.body;

		if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

		const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
		if (!trip) return res.status(404).json({ message: 'Trip not found' });

		if (trip.status !== 'in_progress' && trip.status !== 'planned' && trip.status !== 'paused') {
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

		// Handle lag data and selfies
		if (lagData.lagCount !== undefined) {
			trip.lagCount = lagData.lagCount;
			trip.lagEvents = lagData.lagEvents || [];

			// Evaluate for flagging
			if (trip.lagCount > 3) {
				trip.tripFlagged = true;
				trip.flagReason = `Excessive GPS lag (${trip.lagCount} times). Requires manual review.`;
			} else if (trip.lagEvents.some(event => !event.selfieProvided)) {
				trip.tripFlagged = true;
				trip.flagReason = 'Missing selfie verification during GPS lag. Requires manual review.';
			}
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

		// Enhanced eco-score calculation with fitness data
		let fitnessBonus = 0;
		if (req.body.fitnessData && (trip.mode === 'WALK' || trip.mode === 'CYCLE')) {
			const fitness = req.body.fitnessData;

			// Bonus for calories burned (health benefit)
			if (fitness.calories > 0) {
				fitnessBonus += Math.min(10, fitness.calories / 50); // Up to 10 points
			}

			// Bonus for stress relief
			if (fitness.stressRelief > 0) {
				fitnessBonus += Math.min(5, fitness.stressRelief / 20); // Up to 5 points
			}

			// Bonus for heart rate (shows actual physical activity)
			if (fitness.avgHeartRate > 100) {
				fitnessBonus += 5; // 5 points for elevated heart rate
			}
		}

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

		// Apply fitness bonus to final score, and subtract penalty
		const finalEcoScore = Math.max(0, Math.min(100, ecoResult.ecoScore + fitnessBonus - ecoScorePenalty));

		// Update trip with eco score and components
		trip.ecoScore = finalEcoScore;
		trip.ecoComponents = {
			...ecoResult.components,
			fitnessBonus: Math.round(fitnessBonus),
			penalty: ecoScorePenalty
		};

		// Calculate rewards (but DON'T award yet - wait for admin verification)
		const rewards = calculateTripRewards(finalEcoScore, trip.distanceKm, trip.mode, fitnessBonus);
		trip.xpEarned = rewards.xp;
		trip.carbonCreditsEarned = rewards.carbonCredits;
		trip.co2Saved = rewards.co2Saved;
		trip.treesGrown = rewards.trees;

		// Only auto-verify if not flagged
		if ((trip.bookedWithUs || bookedWithUs) && !trip.tripFlagged) {
			trip.verificationStatus = 'approved';
			trip.bookedWithUs = true;
			await trip.save();

			try {
				await updateUserStats(user, trip, rewards);
				const newAchievements = await checkAchievements(user._id);

				const updatedUser = await User.findById(user._id).select('-password');
				try { sendTripCompletionEmail(updatedUser, trip, { xp: trip.xpEarned, carbonCredits: trip.carbonCreditsEarned, co2Saved: trip.co2Saved }).catch(()=>{}); } catch(e) {}

				return res.json({
					success: true,
					message: 'Trip completed! Auto-verified successfully.',
					trip,
					pendingRewards: rewards,
					ecoScore: finalEcoScore,
					components: {
						...ecoResult.components,
						fitnessBonus: Math.round(fitnessBonus),
						penalty: ecoScorePenalty
					},
					verificationStatus: 'approved',
					note: 'Your rewards have been credited automatically.',
					updatedUser: {
						xp: updatedUser.xp,
						level: updatedUser.level,
						ecoScore: updatedUser.ecoScore,
						carbonCredits: updatedUser.carbonCredits,
						co2Saved: updatedUser.co2Saved,
						treesGrown: updatedUser.treesGrown,
						currentStreak: updatedUser.currentStreak,
						totalTrips: updatedUser.totalTrips
					}
				});
			} catch (e) {
				console.error("Auto approval error", e);
			}
		}

		// Mark trip as pending verification (don't update user stats yet)
		trip.verificationStatus = 'pending';

		await trip.save();

		// Get user data for response (unchanged stats)
		const updatedUser = await User.findById(user._id).select('-password');

		return res.json({
			success: true,
			message: trip.tripFlagged 
				? 'Trip completed but flagged for suspicious activity. Pending admin review.' 
				: 'Trip completed! Pending admin verification for rewards.',
			trip,
			pendingRewards: rewards,
			ecoScore: finalEcoScore,
			components: {
				...ecoResult.components,
				fitnessBonus: Math.round(fitnessBonus),
				penalty: ecoScorePenalty
			},
			verificationStatus: 'pending',
			note: 'Your rewards will be credited after admin verification',
			updatedUser: {
				xp: updatedUser.xp,
				level: updatedUser.level,
				ecoScore: updatedUser.ecoScore,
				carbonCredits: updatedUser.carbonCredits,
				co2Saved: updatedUser.co2Saved,
				treesGrown: updatedUser.treesGrown,
				currentStreak: updatedUser.currentStreak,
				totalTrips: updatedUser.totalTrips
			}
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
function calculateTripRewards(ecoScore, distanceKm, mode, fitnessBonus = 0) {
	const baseXP = Math.round(ecoScore * 0.5 + distanceKm * 2);
	const modeMultiplier = {
		'PUBLIC': 1.5,
		'WALK': 1.8,
		'CYCLE': 1.6,
		'CAR': 1.0,
		'BIKE': 1.1
	};

	let xp = Math.round(baseXP * (modeMultiplier[mode] || 1));

	// Fitness bonus for walking/cycling
	if (fitnessBonus > 0 && (mode === 'WALK' || mode === 'CYCLE')) {
		xp += Math.round(fitnessBonus * 2); // Double fitness bonus for XP
	}

	const co2Saved = calculateCO2Saved(distanceKm, mode); 
	const carbonCredits = Math.round(co2Saved * 10 + ecoScore * 0.1); 
	
	// 1 mature tree absorbs ~20kg CO2 per year.
	const trees = parseFloat((co2Saved / 20).toFixed(2));

	return { xp, carbonCredits, co2Saved, trees };
}

// Helper function to calculate CO2 saved
function calculateCO2Saved(distanceKm, mode) {
	const carEmission = 0.12; // 120g CO2 per km for average car
	const modeEmissions = {
		'PUBLIC': 0.06, // Average 60g CO2 per km (mix of bus and metro)
		'WALK': 0,
		'CYCLE': 0,
		'CAR': carEmission,
		'BIKE': 0.08 // 80g CO2 per km for motorcycle
	};

	const modeEmission = modeEmissions[mode] || carEmission;
	return Math.max(0, parseFloat(((carEmission - modeEmission) * distanceKm).toFixed(3)));
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

// Pause a trip
export async function pauseTrip(req, res) {
	try {
		const { tripId } = req.params;
		if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

		const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
		if (!trip) return res.status(404).json({ message: 'Trip not found' });

		if (trip.status !== 'in_progress') {
			return res.status(400).json({ message: 'Only in_progress trips can be paused' });
		}

		trip.status = 'paused';
		await trip.save();

		return res.json({ success: true, message: 'Trip paused', trip });
	} catch (err) {
		console.error('pauseTrip error', err.message || err);
		return res.status(500).json({ message: err.message || 'Server error' });
	}
}

// Resume a trip
export async function resumeTrip(req, res) {
	try {
        const { tripId } = req.params;
		if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

		const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
		if (!trip) return res.status(404).json({ message: 'Trip not found' });

		if (trip.status !== 'paused') {
			return res.status(400).json({ message: 'Only paused trips can be resumed' });
		}

		trip.status = 'in_progress';
		await trip.save();

		return res.json({ success: true, message: 'Trip resumed', trip });
    } catch (err) {
		console.error('resumeTrip error', err.message || err);
		return res.status(500).json({ message: err.message || 'Server error' });
    }
}

// Cancel a trip
export async function cancelTrip(req, res) {
	try {
		const { tripId } = req.params;
		if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

		const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
		if (!trip) return res.status(404).json({ message: 'Trip not found' });

		trip.status = 'cancelled';
		trip.endTime = new Date();
		await trip.save();

		return res.json({ success: true, message: 'Trip cancelled', trip });
	} catch (err) {
		console.error('cancelTrip error', err.message || err);
		return res.status(500).json({ message: err.message || 'Server error' });
	}
}

export default {
	getRouteOptions,
	createTrip,
	startTrip,
	updateTripLocation,
	completeTrip,
	getUserTrips,
	getTripDetails,
	pauseTrip,
	resumeTrip,
	cancelTrip
};
