import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const Success = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff9f6] px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
        
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <CheckCircle className="text-green-500 w-16 h-16" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Feedback Submitted 🎉
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          Thank you for your feedback! We really appreciate you taking the time
          to help us improve.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-[#ff4d2d] text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
          >
            Go to Home
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full border border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Submit Another Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;