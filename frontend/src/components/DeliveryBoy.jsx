import axios from 'axios';
import Nav from './Nav'
import { useSelector } from 'react-redux'
import { serverUrl } from '../App';
import { useEffect, useState } from 'react';
import DeliveryBoyTracking from './DeliveryBoyTracking';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import { ClipLoader } from 'react-spinners';

const DeliveryBoy = () => {
  const {userData, socket} = useSelector(state=>state.user);
  const [availableAssignments, setAvailableAssignments] = useState(null)
  const [currentOrder, setCurrentOrder] = useState()
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null)
  const [todayDeliveries, setTodayDeliveries] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  // socket io for (updateloaction 1 (1omre(updateDeliveryLocation trackorderpage) ))  live change in user //
 useEffect(() => {
  if (!socket || userData.role !== "deliveryBoy") return;

  let watchId;

  if (navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setDeliveryBoyLocation({lat:latitude, lon:longitude})

        socket.emit("updateLocation", {
          latitude,
          longitude,
          userId: userData._id
        });
      },
      (error) => {
        console.log("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true
      }
    );
  }

  return () => {
    if (watchId) navigator.geolocation.clearWatch(watchId);
  };
}, [socket, userData]);



  const getAssignments = async () =>{
      try {
        const result = await axios.get(`${serverUrl}/api/order/get-assignments`,
           {withCredentials:true})
           console.log(result?.data);
           setAvailableAssignments(result?.data)

      } catch (error) {
        console.log(error)
      }
  }


  const getCurrentOrder = async () =>{
     try {
        const result = await axios.get(`${serverUrl}/api/order/get-current-order`,
           {withCredentials:true})
          //  console.log(result?.data);
           setCurrentOrder(result?.data)
        
      } catch (error) {
         console.log(error)
      }
  }

  const acceptOrder = async (assignmentId) =>{
      try {
        const result = await axios.get(`${serverUrl}/api/order/accept-order/${assignmentId}`,
           {withCredentials:true})
           console.log(result?.data);
          await getCurrentOrder()
        
      } catch (error) {
         console.log(error)
      }
  }

  

  
  const sendOtp = async () =>{
    setLoading(true)
      try {
        const result = await axios.post(`${serverUrl}/api/order/send-delivery-otp`,{
          orderId:currentOrder._id, shopOrderId:currentOrder.shopOrder._id
        },
           {withCredentials:true})
           setLoading(false)
            setShowOtpBox(true)

           console.log(result?.data);
           
          
        
      } catch (error) {
         console.log(error)
           setLoading(false)
      }
  }


  const verifyOtp = async () =>{
    setMessage("")
      try {
        const result = await axios.post(`${serverUrl}/api/order/verify-delivery-otp`,{
          orderId:currentOrder?._id, shopOrderId:currentOrder?.shopOrder?._id, otp
        },
           {withCredentials:true})
           
           console.log(result.data);
          setMessage(result.data.message)
          location.reload()
        
      } catch (error) {
         console.log(error)
      }
  }


  const handleTodayDeliveries = async () => {
  try {

    const result = await axios.get(
      `${serverUrl}/api/order/get-today-deliveries`,
      {
        withCredentials: true
      }
    );

    console.log(result.data);
    setTodayDeliveries(result?.data);

  } catch (error) {
    console.log(error);
  }
};



const ratePerDelivery = 50;
const totalEarning = todayDeliveries.reduce((sum,d)=>sum +d.count*ratePerDelivery, 0)



  // for socket io ke liye only data real accept order real time //
  useEffect(()=>{
   socket?.on("newAssignment", (data)=>{
    if(data.sentTo==userData?._id){
      setAvailableAssignments(prev=>[...prev, data])
    }
   })

   return ()=>{
    socket.off("newAssignment")
   }
  }, [socket])


  useEffect(()=>{
    getAssignments()
    getCurrentOrder()
    handleTodayDeliveries()
  }, [userData])


  return (
    <div className='w-screen min-h-screen bg-[#fff9f6] gap-5 flex flex-col items-center overflow-y-auto'>
      <Nav/>

      <div className='w-full max-w-200 flex flex-col gap-5 items-center'>
      <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6 md:p-8 flex flex-col justify-start items-center w-full max-w-md mx-auto border border-orange-100 text-center gap-2">
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#ff4d2d]">
       Welcome, {userData?.fullName}
       </h1>
       <p className="text-sm sm:text-base md:text-lg text-[#ff4d2d]">
      <span className="font-semibold">Latitude:</span> {deliveryBoyLocation?.lat}, 
       <span className="font-semibold ml-2">Longitude:</span> {deliveryBoyLocation?.lon}
      </p>
     </div>


      <div className='bg-white rounded-2xl shadow-md p-5 w-[90%] mb-6 border border-orange-50'>
        <h1 className='text-lg font-bold mb-3 text-[#ff4d2d]'>Today Deliveries</h1>

        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={todayDeliveries}>
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey="hour" tickFormatter={(h)=>`${h}:00`}/>
            <YAxis  allowDecimals={false}/>
            <Tooltip formatter={(value)=>[value, "orders"]} labelFormatter={lable=>`${lable}:00`}/>
              <Bar dataKey="count" fill='#ff4d2d'/>
          </BarChart>
        </ResponsiveContainer>

        <div className='max-w-sm mx-auto mt-6 p-6 bg-white rounded-2xl shadow-lg text-lg'>
        <h1 className='text-lg font-semibold text-gray-800 mb-2'>Today's Earning</h1>
        <span className='text-3xl text-green-600 font-bold'>₹{totalEarning}</span>
        </div>
      </div>

        {/* current order nahi tabhi eh dikhega hai no niche bala dikhe ga  */}
       {!currentOrder &&  <div className='bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100'>
        <h1 className='text-lg font-bold mb-4 items-center gap-2'>Available Orders</h1>
        
        <div className='space-y-4'>
          {availableAssignments?.length>0
          ?
          (
            availableAssignments.map((a, index)=>(
              <div key={index} className='border rounded-lg p-4 flex justify-between items-center'>
                <div>
                  <p className='text-sm font-semibold'>{a.shopName}</p>
                  <p className='text-sm text-gray-400'><span className='font-semibold'>Delivery Address:</span> 
                    {""} {a.deliveryAddress?.text}</p>
                  <p className='text-sm text-gray-400'>{a.items?.length} items || {a.subtotal}  </p>
                </div>
                <button className='bg-orange-500 text-white cursor-pointer px-4 py-1 rounded-lg text-sm hover:bg-orange-600' onClick={()=>acceptOrder(a.assignmentId)}>
                 Accept
                </button>


              </div>
            ))
          ) : <p className='text-sm text-gray-400'>No Available Orders</p>}
        </div>
      </div>}


      {currentOrder && <div className='bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100'>
       <h1 className='text-lg font-bold mb-3'>Current Order</h1>
       <div className='border rounded-lg p-4 mb-3'>
        <p className='font-semibold text-sm'>{currentOrder?.shopOrder.shop.name}</p>
        <p className='text-sm text-gray-400'><span className='font-semibold'>Delivery Address:</span> 
        {""} {currentOrder?.deliveryAddress?.text}</p>
         <p className='text-sm text-gray-400'>{currentOrder?.shopOrder?.shopOrderItems?.length} 
          {""} items || ₹{currentOrder?.shopOrder?.subtotal}  </p>
       </div>


       <DeliveryBoyTracking data={{
         deliveryBoyLocation: deliveryBoyLocation ||{
            lat: userData?.location?.coordinates?.[1],
            lon: userData?.location?.coordinates?.[0],
          },

        customerLocation:{
             lat:currentOrder.deliveryAddress.latitude,
             lon:currentOrder.deliveryAddress.longitude,
        }}}/>

       {!showOtpBox ?  <button className='mt-4 w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 active:scale-95 transition-all duration-200 cursor-pointer'
       onClick={sendOtp} disabled={loading}>
        {loading?<ClipLoader size={20} color='white'/> :"Mark As Delivered"}
       </button> : <div className='mt-4 p-4 border rounded-xl bg-gray-50'>
        <p className='text-sm font-semibold mb-2'>Enter Otp send to {" "}
          <span className='text-orange-500'>{currentOrder?.user?.fullName}</span></p>

          <input type="text"  className='w-full border px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400' placeholder='Enter OTP'
          onChange={(e)=>setOtp(e.target.value)} value={otp}/>

         {message &&   <p className='text-center text-green-500'>{message}</p>}
       

          <button className='w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-all cursor-pointer' onClick={verifyOtp}>Submit OTP</button>
        </div>}
      
      </div>}
      

      </div>
    </div>
  )
}

export default DeliveryBoy
