import { useState } from "react";
import { ClipLoader } from "react-spinners";
import axios from "axios";
import { serverUrl } from "../App"; // your backend URL
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ContactFeedback = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const history = useNavigate();

  const feedbackOptions = ["Complaint", "Suggestion", "Question", "Appreciation"];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Frontend validation
    if (!name.trim()) return setError("Name is required");
    if (!email.trim()) return setError("Email is required");
    if (!feedbackType) return setError("Select feedback type");
    if (!message.trim()) return setError("Message is required");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("orderId", orderId);
      formData.append("feedbackType", feedbackType);
      formData.append("rating", rating);
      formData.append("message", message);
      if (image) formData.append("image", image);

      const res = await axios.post(`${serverUrl}/api/feedback`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setName("");
      setEmail("");
      setOrderId("");
      setFeedbackType("");
      setRating(0);
      setMessage("");
      setImage(null);
      history("/success")

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff9f6] flex justify-center items-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-[#ff4d2d] text-center mb-6">
          Contact / Feedback
        </h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="text"
            placeholder="Order ID (optional)"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />

          <select
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={feedbackType}
            onChange={(e) => setFeedbackType(e.target.value)}
          >
            <option value="">Select Feedback Type</option>
            {feedbackOptions.map((opt, i) => (
              <option value={opt} key={i}>
                {opt}
              </option>
            ))}
          </select>

          {/* Star Rating */}
          <div className="flex items-center gap-2">
            <span className="font-semibold">Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`cursor-pointer text-2xl ${rating >= star ? "text-yellow-400" : "text-gray-300"
                  }`}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            placeholder="Write your feedback..."
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <input
            type="file"
            accept="image/*"
            className="w-full"
            onChange={handleImageChange}
          />
          {image && <p className="text-sm text-gray-500">Selected: {image.name}</p>}

          <button
            type="submit"
            className="w-full bg-[#ff4d2d] text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-all"
            disabled={loading}
          >
            {loading ? <ClipLoader size={20} color="white" /> : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactFeedback;