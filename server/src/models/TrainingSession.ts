import mongoose from 'mongoose'

const trainingSessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, maxlength: 2000 },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    focusAreas: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    athletes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Athlete' }],
      required: true,
      validate: {
        validator: (athletes: unknown[]) => athletes.length > 0,
        message: 'A training session must include at least one athlete.',
      },
    },
    status: {
      type: String,
      enum: ['planned', 'completed', 'cancelled'],
      default: 'planned',
      required: true,
    },
  },
  { timestamps: true },
)

trainingSessionSchema.index({ scheduledAt: 1, status: 1 })
trainingSessionSchema.index({ athletes: 1, scheduledAt: -1 })

export const TrainingSession = mongoose.models.TrainingSession ?? mongoose.model('TrainingSession', trainingSessionSchema)
