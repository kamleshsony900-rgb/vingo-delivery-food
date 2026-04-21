import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { serverUrl } from '../App';

const UserOrderCard = ({data}) => {
  const [selectedRating, setSelectedRating] = useState({})  // itemId= store (rating)


const navigate = useNavigate();


    const formatDate = (dataString)=>{
      const date = new Date(dataString)
      return date.toLocaleString("en-GB", {
        day:"2-digit",
        month:"short",
        year:"numeric"
      })
    }


    const handleRating = async (itemId, rating) =>{
       try {
        const result = await axios.post(`${serverUrl}/api/item/rating`,
           {itemId, rating},{withCredentials:true})
           setSelectedRating(prev=>({
            ...prev,[itemId]:rating
           }))

           console.log(result)
       } catch (error) {
        console.log(error)
       }
    }

  return (
    <div className='bg-white rounded-lg shadow p-4 space-y-4'>
      <div className='flex justify-between border-b pb-2'>
        {/* for right */}
        <div>
          <p className='font-semibold'>
            order #{data?._id.slice(-6)}
          </p>

          <p className='text-sm text-gray-500'>
            Date: {formatDate(data?.createdAt)}
          </p>
        </div>

         {/* for left */}
        <div className='text-right'>
          {data.paymentMethod=="cod"?  <p className='text-sm text-gray-500'>{data?.paymentMethod?.toUpperCase()}</p> : <p className='text-sm text-gray-500 font-semibold'>Payment: {data?.payment?"true" : "false"}</p>}
        
         <p className='font-medium text-blue-600'>{data?.shopOrders?.[0].status}</p>
        </div>
      </div>

        {/* shop NAME */}
        {data?.shopOrders?.map((shopOrder, index)=>(
       <div key={index} className='border rounded-lg p-3 bg-[#fffaf7] space-y-3'>
        <p>{shopOrder?.shop?.name}</p>

        {/* shop item ketna order kiya oh sab */}
        <div className='flex space-x-4 overflow-x-auto pb-2'>
            {shopOrder?.shopOrderItems?.map((item, _index)=>(
                <div key={_index} className='shrink-0 w-40  border rounded-lg p-2 bg-white'>
                  <img src={item?.item?.image} alt="image" className='w-full h-24 object-cover rounded'/>
                  <p className='text-sm font-semibold mt-1'>{item?.name}</p>
                  <p className='text-sm text-gray-500'>Qty: {item?.quantity} x ₹{item?.price}</p>

                  {/* rating here */}
                  {shopOrder.status=="delivered" && <div className='flex space-x-1 mt-2'>
                   {[1,2,3,4,5].map((star) => (
      <button
        key={star}
        className={`text-lg ${
          (selectedRating[item?.item?._id] || 0) >= star
            ? "text-yellow-400"
            : "text-gray-400"
        }`}
        onClick={() => handleRating(item?.item?._id, star)}
      >
        ★
      </button>
                  ))}
                  </div>}


                </div>
            ))}
        </div>

        <div className='flex justify-between items-center border-t pt-2'>
            <p className='font-semibold'>Subtotal: ₹{shopOrder?.subtotal}</p>
            <p className='text-sm font-medium text-blue-600'>status: {shopOrder?.status}</p>

        </div>
       </div>
     ))}


     <div className='flex justify-between items-center border-t pt-2'>
      <p className='font-semibold'>Total: ₹{data?.totalAmount}</p>
      <button className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-lg text-sm cursor-pointer' onClick={()=>navigate(`/track-order/${data?._id}`)}>
        Track Order</button>
     </div>


    </div>
  )
}

export default UserOrderCard
