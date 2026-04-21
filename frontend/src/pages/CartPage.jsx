
import { IoIosArrowRoundBack } from 'react-icons/io'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import CartItemCard from '../components/CartItemCard';
import EmptyCart from '../components/EmptyCart';



const CartPage = () => {
    const navigate = useNavigate();

    const {cartItems, totalAmount} = useSelector(state=>state.user);


  return (
    <div className='min-h-screen bg-[#fff9f6] flex justify-center p-6'>
      <div className='w-full max-w-200'>
    <div className='mb-6'>
   <div  className="flex items-center gap-3 mb-4 z-10 cursor-pointer"
    onClick={() => navigate("/")}>
    <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
    <h1 className="text-2xl text-start font-bold">Your Cart</h1>
  </div>

{cartItems?.length==0 ? (
<EmptyCart/>
): (<>
    <div className='space-y-4'>
   {cartItems?.map((item, index)=>(
      <CartItemCard data={item} key={index}/>
   ))}
    </div>
    <div className='mt-6 bg-white p-4 rounded-xl shadow flex justify-between items-center border'>
     <h1 className='text-lg font-semibold'>Total Amount</h1>
     <span className='text-xl font-bold text-[#ff4d2d]'>₹{totalAmount}</span>
    </div>

    <div className='mt-4 flex justify-end'>
      <button className='bg-[#ff4d2d] cursor-pointer text-white px-6 py-3 rounded-lg text-lg
       font-medium hover:bg-[#e64526] transition' onClick={()=>navigate("/checkout")}>
        Proceed to CheckOut
     </button>
    </div>
    </>
)}

</div>
      </div>
    </div>
  )
}

export default CartPage
