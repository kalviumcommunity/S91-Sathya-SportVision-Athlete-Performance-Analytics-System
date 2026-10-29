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
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

athleteSchema.index({ group: 1, status: 1 })

athleteSchema.virtual('assessments', {
  ref: 'Assessment',
  localField: '_id',
  foreignField: 'athlete',
  justOne: false,
})

athleteSchema.virtual('trainingSessions', {
  ref: 'TrainingSession',
  localField: '_id',
  foreignField: 'athletes',
  justOne: false,
})

export const Athlete = mongoose.models.Athlete ?? mongoose.model('Athlete', athleteSchema)
