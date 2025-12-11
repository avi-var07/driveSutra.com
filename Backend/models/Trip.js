import mongoose from 'mongoose'

const tripSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  start: { lat: Number, lng: Number },
  end: { lat: Number, lng: Number },
  mode: { type: String },
  distanceKm: { type: Number },
  durationMinutes: { type: Number },
  ecoScore: { type: Number },
  metadata: { type: Object },
}, { timestamps: true })

export default mongoose.model('Trip', tripSchema)
