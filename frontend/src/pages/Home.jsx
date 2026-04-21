import React from 'react'
import UserDashBoard from '../components/UserDashBoard'; // ✅ FIXED
import OwnerDashboard from '../components/OwnerDashboard';
import DeliveryBoy from '../components/DeliveryBoy';
import { useSelector } from 'react-redux';
import userGetCurrentUser from '../hooks/userGetCurrentUser';
import userGetMyOrders from '../hooks/userGetMyOrders';

const Home = () => {
  userGetCurrentUser();
  userGetMyOrders();

  const { userData } = useSelector(state => state.user);

  return (
    <div className='w-screen min-h-screen pt-25 flex flex-col items-center bg-[#fff9f6]'>
      {userData?.role === "user" && <UserDashBoard />}
      {userData?.role === "owner" && <OwnerDashboard />}
      {userData?.role === "deliveryBoy" && <DeliveryBoy />}
    </div>
  )
}

export default Home;
