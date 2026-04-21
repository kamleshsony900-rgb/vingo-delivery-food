import { useEffect, useState } from "react";
import { FaLeaf, FaShoppingCart } from "react-icons/fa";
import { FaDrumstickBite } from "react-icons/fa";
import { FaMinus, FaPlus, FaRegStar, FaStar } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/userSlice";
import FoodCardLoading from "./FoodCardLoading";


const FoodCard = ({data}) => {
  const [quantity, setQuantity] = useState(0);
  const dispatch = useDispatch();

  const {cartItems} = useSelector(state=>state.user)
 // ✅ Loading state for skeleton
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    // Show skeleton for 2 seconds
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

    const renderStars = (rating) =>{
    const stars = [];

  for (let i = 0; i < 5; i++) {
    stars.push(
      (i < rating) ? (
        <FaStar key={i} className="text-yellow-500 text-lg"/>
      ) : (
        <FaRegStar key={i} className="text-yellow-500 text-lg"/>
      )
    )
  }

  return stars;
}

    const handleIncrease =()=>{
        const newQty = quantity+1
        setQuantity(newQty)
    }

    const handleDecrease =()=>{
        if(quantity>0){
         const newQty = quantity-1
        setQuantity(newQty)
        }
    }


  return (
    <>
    {loading? <FoodCardLoading/> :( <div className='w-64 rounded-2xl border border-gray-200 bg-white shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col'>

  {/* Image Section */}
  <div className='w-full relative h-44 bg-gray-50 overflow-hidden flex items-center justify-center'>

    {/* Veg / Non-Veg Icon */}
    <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow flex items-center justify-center">
      {data?.foodType === "veg" 
        ? <FaLeaf className="text-green-500 text-lg"/>
        : <FaDrumstickBite className="text-red-500 text-lg"/>
      }
    </div>

    {/* Center Image */}
    <img
      src={data?.image}
      alt="food"
      className='w-full h-full object-cover transition-transform duration-500 hover:scale-110'
    />
  </div>

  {/* Content */}
  <div className="flex flex-1 flex-col p-4">

    {/* Food Name */}
    <h1 className="font-semibold text-gray-900 text-base truncate">
      {data?.name}
    </h1>

    {/* Rating Stars below name */}
    <div className="flex items-center gap-1 mt-1">
      {renderStars(data?.rating?.average || 0)}
      <span className="text-sm text-gray-500">
        ({data?.rating?.count || 0})
      </span>
    </div>

    {/* Bottom Section */}
    <div className="flex justify-between items-center mt-auto pt-3">

      {/* Price */}
      <span className="font-bold text-[#ff4d2d] text-lg">
        ₹{data?.price}
      </span>

      {/* Quantity + Cart */}
      <div className="flex items-center gap-1 border rounded-full overflow-hidden shadow-sm">
        <button
          className="px-2 py-1 hover:bg-gray-100 transition cursor-pointer"
          onClick={handleDecrease}
        >
          <FaMinus size={12}/>
        </button>

        <span className="text-sm px-1">{quantity}</span>

        <button
          className="px-2 py-1 hover:bg-gray-100 transition cursor-pointer"
          onClick={handleIncrease}
        >
          <FaPlus size={12}/>
        </button>

        {/* Add to Cart */}
        <button
          className={`${cartItems.some(i=>i.id==data?._id)
            ? "bg-gray-900"
            : "bg-[#ff4d2d] hover:bg-[#e64526]"} text-white px-3 py-2 transition-colors cursor-pointer`}
          onClick={()=>quantity>0 && dispatch(addToCart({
              id:data._id,
              name:data.name,
              image:data.image,
              price:data.price,
              shop:data.shop,
              quantity,
              foodType:data.foodType
          }))}
        >
          <FaShoppingCart size={15}/>
        </button>
      </div>
    </div>
  </div>
</div>) }
 
</>
  )
}

export default FoodCard
