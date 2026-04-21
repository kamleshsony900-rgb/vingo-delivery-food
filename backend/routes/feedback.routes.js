import express from "express";
import { upload } from "../middlewares/multer.js";
import { createFeedback } from "../controllers/feedback.controller.js";


const feedbackRouter = express.Router();

// image field name = "image"
feedbackRouter.post("/", upload.single("image"), createFeedback);

export default feedbackRouter;