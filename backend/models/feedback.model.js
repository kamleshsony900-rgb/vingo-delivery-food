import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    orderId: { type: String },
    feedbackType: {
      type: String,
      enum: ["Complaint", "Suggestion", "Question", "Appreciation"],
      required: true,
    },
    rating: { type: Number, default: 0 },
    message: { type: String, required: true },
    image: { type: String }, // store image URL or path
  },
  { timestamps: true }
);

const feedbackModel=mongoose.model("Feedback", feedbackSchema);
export default feedbackModel;
