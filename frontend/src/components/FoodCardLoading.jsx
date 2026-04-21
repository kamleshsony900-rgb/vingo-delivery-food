import { FaLeaf, FaDrumstickBite, FaRegImages } from "react-icons/fa";

const FoodCardLoading = () => {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-center">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="w-64 rounded-2xl border border-gray-200 bg-white shadow-md overflow-hidden animate-pulse flex flex-col"
        >
          {/* Image skeleton with icons and centered image icon */}
          <div className="relative h-44 bg-gray-100 flex items-center justify-center">

            {/* Center image icon */}
            <FaRegImages className="text-gray-400 text-5xl opacity-50" />

            {/* Veg icon - top-left */}
            <div className="absolute top-2 left-2 bg-white rounded-full p-1 shadow flex items-center justify-center">
              <FaLeaf className="text-green-500 text-lg" />
            </div>

            {/* Non-Veg icon - top-right */}
            <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow flex items-center justify-center">
              <FaDrumstickBite className="text-red-500 text-lg" />
            </div>
          </div>

          {/* Content skeleton */}
          <div className="p-4 space-y-3 flex-1 flex flex-col">
            {/* Food name */}
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>

            {/* Rating */}
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>

            {/* Price + cart */}
            <div className="flex justify-between items-center mt-auto pt-2">
              <div className="h-5 w-12 bg-gray-200 rounded"></div>
              <div className="h-8 w-16 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FoodCardLoading;