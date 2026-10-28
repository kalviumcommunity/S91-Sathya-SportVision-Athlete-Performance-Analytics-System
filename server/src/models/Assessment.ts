import mongoose from 'mongoose'

const assessmentMetricSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    value: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true },
    score: { type: Number, min: 0, max: 100 },
  },
  { _id: false },
)

const assessmentSchema = new mongoose.Schema(
  {
    athlete: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Athlete',
      required: true,
    },
    assessedAt: { type: Date, required: true, default: Date.now },
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    metrics: {
      type: [assessmentMetricSchema],
      required: true,
      validate: {
        validator: (metrics: unknown[]) => metrics.length > 0,
        message: 'An assessment must include at least one metric.',
      },
    },
    notes: { type: String, trim: true, maxlength: 2000 },
  },
  { timestamps: true },
)

assessmentSchema.index({ athlete: 1, assessedAt: -1 })

export const Assessment = mongoose.models.Assessment ?? mongoose.model('Assessment', assessmentSchema)
