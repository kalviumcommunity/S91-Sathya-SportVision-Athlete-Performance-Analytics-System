import mongoose from 'mongoose'

const athleteSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    sport: { type: String, required: true, trim: true },
    group: { type: String, required: true, trim: true },
    position: { type: String, trim: true },
    dateOfBirth: { type: Date },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      required: true,
    },
  },
  { timestamps: true },
)

athleteSchema.index({ group: 1, status: 1 })

export const Athlete = mongoose.models.Athlete ?? mongoose.model('Athlete', athleteSchema)
