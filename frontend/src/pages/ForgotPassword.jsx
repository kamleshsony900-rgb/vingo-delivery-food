import React, { useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { IoIosEye, IoIosEyeOff } from "react-icons/io";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp,setOtp] = useState("");
   const [newPassword,setNewPassword] = useState("");
   const [confirmPassword,setConfirmPassword] = useState("");
   const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   
  const navigate = useNavigate();


    const handleSendOtp=async()=>{
       setLoading(true);
        try {
          const result = await axios.post(`${serverUrl}/api/auth/send-otp`,{
            email
          }, {withCredentials:true});
          console.log(result);
          setErr("");
          setStep(2);
           setLoading(false);

        } catch (error) {
          setErr(error?.response?.data?.message);
           setLoading(false);
          
        }
    }


    const handleVerifyOtp=async()=>{
       setLoading(true);
        try {
          const result = await axios.post(`${serverUrl}/api/auth/verify-otp`,{
            email,
            otp
          }, {withCredentials:true});
          console.log(result);
           setErr("");
          setStep(3);
           setLoading(false);

        } catch (error) {
         setErr(error?.response?.data?.message);
           setLoading(false);
        }
    }


    const handleResetPassword=async()=>{
      if(newPassword!=confirmPassword){
        return null
      }
       setLoading(true);
        try {
          const result = await axios.post(`${serverUrl}/api/auth/reset-password`,{
            email,
            newPassword
          }, {withCredentials:true});
          console.log(result);
            setErr("");
          navigate("/signin");
          setLoading(false);

        } catch (error) {
          setErr(error?.response?.data?.message);
          setLoading(false);
        }
    }


  return (
    <div className='flex items-center justify-center min-h-screen p-4 bg-[#fff9f6]'>
     <div className='w-full rounded-xl shadow-lg max-w-md p-8 bg-white'>
      <div className='flex items-center gap-4 mb-4'>
        <IoIosArrowRoundBack size={30} className='text-[#ff4d2d] cursor-pointer' 
        onClick={()=>navigate("/signin")}/>
        <h1 className='text-2xl font-bold text-center text-[#ff4d2d]'>Forgot Password</h1>
      </div>

      {/* step 1 */}
      {step==1 &&
      <div>
         {/* email */}
        <div className="mb-6">
         <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
          Email
          </label>
         <input type="email" className="w-full border rounded-lg px-3 py-2 focus:outline-none border-gray-200" 
         placeholder="Enter your Email"
         onChange={(e)=>setEmail(e.target.value)}
         value={email}
          />
        </div>

        <button className={`w-full font-semibold rounded-lg  py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`} onClick={handleSendOtp}
        disabled={loading}  >
      {
      loading? <ClipLoader size={20} color='white'/> : "Send Otp"
      }
       </button>

        {/* all error show */}
        {err && <p className="text-red-500 text-center my-4">*{err}</p>}

      </div>
      }

      {/* step 2 */}
      {step==2 &&
      <div>
         {/* email */}
        <div className="mb-6">
         <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
          OTP
          </label>
         <input type="text" className="w-full border rounded-lg px-3 py-2 focus:outline-none border-gray-200" 
         placeholder="Enter OTP"
         onChange={(e)=>setOtp(e.target.value)}
         value={otp}
          />
        </div>

        <button className={`w-full font-semibold rounded-lg  py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`} 
        onClick={handleVerifyOtp}  disabled={loading}>
        {
      loading? <ClipLoader size={20} color='white'/> : "Verify"
      }
       </button>

        {/* all error show */}
        {err && <p className="text-red-500 text-center my-4">*{err}</p>}

      </div>
      }


      {/* step 3 */}
      {step==3 &&
      <div>
         {/* email */}
          <div className="space-y-6">
      {/* New Password */}
      <div className="relative">
        <label className="block text-gray-700 font-medium mb-2">New Password</label>
        <input
          type={showNewPassword ? "text" : "password"}
          placeholder="Enter New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <span
          className="absolute right-3 top-9 cursor-pointer text-gray-500"
          onClick={() => setShowNewPassword(!showNewPassword)}
        >
          {showNewPassword ? <IoIosEyeOff size={20} /> : <IoIosEye size={20} />}
        </span>
      </div>

      {/* Confirm Password */}
      <div className="relative">
        <label className="block text-gray-700 font-medium mb-2">Confirm Password</label>
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <span
          className="absolute right-3 top-9 cursor-pointer text-gray-500"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? <IoIosEyeOff size={20} /> : <IoIosEye size={20} />}
        </span>
      </div>
    </div>

        <button className={`w-full font-semibold rounded-lg mt-4  py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`}  
        onClick={handleResetPassword} disabled={loading}>
         {
      loading? <ClipLoader size={20} color='white'/> : "Reset Password"
      }
       </button>

        {/* all error show */}
        {err && <p className="text-red-500 text-center my-4">*{err}</p>}
      

      </div>
      }



     </div>
    </div>
  )
}

export default ForgotPassword
