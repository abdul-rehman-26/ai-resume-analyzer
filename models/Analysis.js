import mongoose from "mongoose";

const TipSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["good", "improve"],
    },
    tip: {
      type: String,
      trim: true,
    },
    explanation: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const AnalysisFeedbackSchema = new mongoose.Schema(
  {
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    toneAndStyle: {
      score: { type: Number, min: 0, max: 100 },
      tips: [TipSchema],
    },
    content: {
      score: { type: Number, min: 0, max: 100 },
      tips: [TipSchema],
    },
    structure: {
      score: { type: Number, min: 0, max: 100 },
      tips: [TipSchema],
    },
    skills: {
      score: { type: Number, min: 0, max: 100 },
      tips: [TipSchema],
    },
  },
  { _id: false, strict: false }
);

const AnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthUser",
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    jobTitle: {
      type: String,
      default: "",
      trim: true,
    },
    companyName: {
      type: String,
      default: "",
      trim: true,
    },
    feedback: {
      type: AnalysisFeedbackSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Analysis || mongoose.model("Analysis", AnalysisSchema);
