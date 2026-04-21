import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

const EmptyCart = () => {
  return (
    
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="bg-white shadow-lg rounded-2xl p-10 text-center max-w-md w-full">
        
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <FaShoppingCart className="text-6xl text-gray-300" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-800">
          Your Cart is Empty
        </h2>

        {/* Description */}
        <p className="text-gray-500 mt-2">
          Looks like you haven't added any delicious food yet.
        </p>

        {/* Button */}
        <Link to="/">
          <button className="mt-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition">
            Browse Food
          </button>
        </Link>

      </div>
    </div>
  )
}

export default EmptyCart
