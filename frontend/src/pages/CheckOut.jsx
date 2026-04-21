import React, { useEffect, useState } from 'react'
import { IoIosArrowRoundBack } from 'react-icons/io'
import { useNavigate } from 'react-router-dom'
import { IoLocationSharp, IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import "leaflet/dist/leaflet.css"
import { setAddress, setLocation } from '../redux/mapSlice';
import axios from 'axios';
import { MdDeliveryDining } from "react-icons/md";
import { FaMobileScreenButton } from "react-icons/fa6";
import { FaCreditCard } from "react-icons/fa";
import { serverUrl } from "../App";
import { addMyOrder, clearCart } from '../redux/userSlice';



// for location get //
function RecenterMap({location}){
  if(location.lat && location.lon){
    const map = useMap()
    map.setView([location.lat, location.lon], 16, {animate:true})
  }
return null

}

const CheckOut = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiKey = import.meta.env.VITE_GEOAPIKEY

  const {address, location} = useSelector(state=>state.map);
  const {cartItems, totalAmount, userData} = useSelector(state=>state.user);


  const [addressInput, setAddressInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  

  const deliveryFee = totalAmount>500?0:40
  const AmountWithDeliveryFee = totalAmount + deliveryFee

  // for location get //
  const onGragEnd = (e) =>{
  // console.log(e.target._latlng)
  const {lat, lng} = e.target._latlng
  dispatch(setLocation({lat, lon:lng}))
  getAddressByLatLng(lat, lng);
  }


   const getCurrentLocation = async () =>{
         const latitude = userData.location.coordinates[1]
         const longitude = userData.location.coordinates[0]
         
       dispatch(setLocation({lat:latitude, lon:longitude}))
       getAddressByLatLng(latitude, longitude);
     
     
  }


  const getAddressByLatLng = async (lat, lng) =>{
     try {
       const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`)
      //  console.log(result?.data?.results[0].address_line2)
       dispatch(setAddress(result?.data?.results[0].address_line2))
      
     } catch (error) {
       console.log(error)
     }
  }

  // search address show use this Geoapify- (Geocoding API - and copy api first-Forward Geocoding API) //
  const getLatLngByAddress = async () =>{
     try {
       const result = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apiKey}`)

      //  console.log(result?.data?.features[0].properties?.lat)
      const {lat, lon} = result?.data?.features[0].properties
      dispatch(setLocation({lat, lon}))

     } catch (error) {
       console.log(error)
     }
  }


  useEffect(()=> {
    setAddressInput(address)
  }, [address])

 
  // for cash on delivery //
 const handlePlaceOrder = async () => {
  try {
    const result = await axios.post(
      `${serverUrl}/api/order/place-order`,
      {
        paymentMethod,
        deliveryAddress: {
          text: addressInput,
          latitude: location.lat,
          longitude: location.lon
        },
        totalAmount: AmountWithDeliveryFee,
        cartItems
      },
      { withCredentials: true }
    );

    // Cash on delivery
    if (paymentMethod === "cod") {
      dispatch(addMyOrder(result?.data));

      // clear cart after order
      dispatch(clearCart());

      navigate("/order-placed");

    } else {
      const orderId = result.data.orderId;
      const razorOrder = result.data.razorOrder;

      openRazorpayWindow(orderId, razorOrder);
    }

  } catch (error) {
    console.log(error);
  }
};

  // for razorpay ko lagi //
  const openRazorpayWindow = async (orderId, razorOrder) =>{
    const options = {
     key:import.meta.env.VITE_RAZORPAY_KEY_ID,
     amount:razorOrder.amount,
     current:"INR",
     name:"Vingo",
     description:"Food Delivery Website",
     order_id:razorOrder.id,
     handler:async function (response) {
        try {
          const result = await axios.post(`${serverUrl}/api/order/verify-payment`, {
            razorpay_payment_id:response.razorpay_payment_id,
            orderId
          }, {withCredentials:true})
          dispatch(addMyOrder(result?.data))
          navigate("/order-placed");

        } catch (error) {
          console.log(error)
        }
     }
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  }
  

  return (
  <div className='min-h-screen bg-[#fff9f6] flex items-start sm:items-center justify-center p-4 sm:p-6 relative'>

  <div
    className="z-10 absolute top-2 left-2 sm:top-4 sm:left-4 cursor-pointer"
    onClick={() => navigate("/")}>
    <IoIosArrowRoundBack size={30} className="text-[#ff4d2d] sm:w-9 sm:h-9" />
  </div>

  <div className='w-full max-w-md sm:max-w-2xl lg:max-w-4xl bg-white rounded-2xl shadow-lg p-4 sm:p-6 space-y-6'>

    <h1 className='text-xl sm:text-2xl font-bold text-gray-800'>Checkout</h1>

    {/* Delivery Location */}
    <section>
      <h2 className='text-base sm:text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800'>
        <IoLocationSharp className='text-[#ff4d2d]' />
        Delivery Location
      </h2>

      {/* Input Responsive */}
      <div className='flex flex-col sm:flex-row gap-2 mb-3'>
        <input
          type="text"
          className='flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]'
          placeholder='Enter Your Delivery Address..'
          value={addressInput}
          onChange={(e) => setAddressInput(e.target.value)}
        />

        <button
          className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-3 py-2 rounded-lg flex items-center justify-center'
          onClick={getLatLngByAddress}>
          <IoSearchOutline size={17} />
        </button>

        <button
          className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center'
          onClick={getCurrentLocation}>
          <TbCurrentLocation size={17} />
        </button>
      </div>

      {/* Responsive Map Height */}
      <div className='rounded-xl border overflow-hidden'>
        <div className='h-52 sm:h-64 md:h-72 w-full flex items-center justify-center'>
          <MapContainer
            className='w-full h-full'
            center={[location?.lat, location?.lon]}
            zoom={16}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <RecenterMap location={location} />
            <Marker
              position={[location?.lat, location?.lon]}
              draggable
              eventHandlers={{ dragend: onGragEnd }}
            />
          </MapContainer>
        </div>
      </div>
    </section>

    {/* Payment Method */}
    <section>
      <h2 className='text-base sm:text-lg font-semibold mb-3 text-gray-800'>
        Payment Method
      </h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div
          className={`flex items-center gap-3 rounded-xl border p-3 sm:p-4 transition ${
            paymentMethod == "cod"
              ? "border-[#ff4d2d] bg-orange-50 shadow"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => setPaymentMethod("cod")}
        >
          <span className='inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-green-100'>
            <MdDeliveryDining className='text-lg sm:text-xl text-green-600' />
          </span>
          <div>
            <p className='text-sm sm:text-base font-medium text-gray-800'>
              Cash On Delivery
            </p>
            <p className='text-xs text-gray-500'>
              Pay when your food arrives
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-3 rounded-xl border p-3 sm:p-4 transition ${
            paymentMethod == "online"
              ? "border-[#ff4d2d] bg-orange-50 shadow"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => setPaymentMethod("online")}
        >
          <span className='inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-purple-100'>
            <FaMobileScreenButton className='text-sm sm:text-lg text-purple-700' />
          </span>

          <span className='inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-blue-100'>
            <FaCreditCard className='text-sm sm:text-lg text-blue-700' />
          </span>

          <div>
            <p className='text-sm sm:text-base font-medium text-gray-800'>
              UPI / Credit / Debit Card
            </p>
            <p className='text-xs text-gray-500'>
              Pay Securely Online
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Order Summary */}
    <section>
      <h2 className='text-base sm:text-lg mb-3 font-semibold text-gray-800'>
        Order Summary
      </h2>

      <div className='rounded-xl border bg-gray-50 p-3 sm:p-4 space-y-2'>
        {cartItems?.map((item, index) => (
          <div key={index} className='flex justify-between text-sm text-gray-700'>
            <span>{item?.name} x {item?.quantity}</span>
            <span>₹{item?.price * item?.quantity}</span>
          </div>
        ))}

        <hr className='border-gray-200 my-2' />

        <div className='flex justify-between font-medium text-gray-800 text-sm sm:text-base'>
          <span>Subtotal</span>
          <span>₹{totalAmount}</span>
        </div>

        <div className='flex justify-between text-gray-800 text-sm sm:text-base'>
          <span>Delivery Fee</span>
          <span>{deliveryFee == 0 ? "Free" : deliveryFee}</span>
        </div>

        <div className='flex justify-between text-lg text-[#ff4d2d] font-bold pt-2'>
          <span>Total</span>
          <span>₹{AmountWithDeliveryFee}</span>
        </div>
      </div>
    </section>

    <button
      className='w-full bg-[#ff4d2d] hover:bg-[#e64526] text-white py-3 rounded-xl font-semibold text-sm sm:text-base'
      onClick={handlePlaceOrder}
    >
      {paymentMethod == "cod" ? "Place Order" : "Pay & Place Order"}
    </button>

  </div>
</div>
  )
}

export default CheckOut
