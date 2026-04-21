import feedbackModel from "../models/feedback.model.js";


export const createFeedback = async (req, res) => {
  try {
    const {
      name,
      email,
      orderId,
      feedbackType,
      rating,
      message,
    } = req.body;

    if (!name || !email || !feedbackType || !message) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    const feedback = new feedbackModel({
      name,
      email,
      orderId,
      feedbackType,
      rating,
      message,
      image: req.file ? req.file.path : "",
    });

    await feedback.save();

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};