import { useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import {Link, useNavigate} from "react-router-dom"
import axios from "axios";
import { serverUrl } from "../App";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { ClipLoader } from "react-spinners";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const SignUp = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState("user");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mobile, setMobile] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);


    const primaryColor = "#ff4d2d";
    const hoverColor = "#e64323";
    const bgColor = "#fff9f6";
    const borderColor = "#ddd";

    const navigate = useNavigate();
  //  for redux store data //
  const dispatch = useDispatch();

    const handleSignUp = async()=>{
      setLoading(true)
         try {
            const result = await axios.post(`${serverUrl}/api/auth/signup`, {
              fullName,
              email,
              password,
              mobile,
              role
            }, {withCredentials:true}) // if not true token not found
            // console.log(result);
            // redux me store huwa //
            dispatch(setUserData(result.data));

           setErr("");
          setLoading(false);

         } catch (error) {
          setErr(error?.response?.data?.message)
          setLoading(false);
         }
    }


    // google login with firebase help //
    const handleGoogleAuth=async()=>{
      if(!mobile){
       return setErr("mobile no is required")
      }
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        // console.log(result);

        try {
           const {data} = await axios.post(`${serverUrl}/api/auth/google-auth`, {
             fullName:result?.user?.displayName,
             email:result?.user?.email,
             role,
             mobile
           }, {withCredentials:true});
          //  console.log(data);
          // redux me store huwa //
            dispatch(setUserData(data));
           
        } catch (error) {
          console.log(error);
          
        }
        
    }


  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{backgroundColor:bgColor}}>
     <div className={`bg-white rounded-xl shadow-lg w-full max-w-md p-4 border`} style={{
        border:`1px solid ${borderColor}`
     }}>
       <h1 className={`text-3xl font-bold mb-4`} style={{
        color:primaryColor
       }}>Vingo</h1>
       <p className="text-gray-600 mb-6">
        Create your account to get started with delicious food deliveries
        </p>

        {/* fullName */}
        <div className="mb-4">
         <label htmlFor="fullName" className="block text-gray-700 font-medium mb-1">
          Full Name
          </label>
         <input type="text" className="w-full border rounded-lg px-3 py-2 focus:outline-none" placeholder="Enter your Full Name"
         onChange={(e)=>setFullName(e.target.value)}
         value={fullName}
          required
          style={{
             border:`1px solid ${borderColor}`
         }}/>
        </div>

        {/* email */}
        <div className="mb-4">
         <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
          Email
          </label>
         <input type="email" className="w-full border rounded-lg px-3 py-2 focus:outline-none" placeholder="Enter your Email"
         onChange={(e)=>setEmail(e.target.value)}
         value={email}
          required
          style={{
             border:`1px solid ${borderColor}`
         }}/>
        </div>

        {/* mobile */}
        <div className="mb-4">
         <label htmlFor="mobile" className="block text-gray-700 font-medium mb-1">
          Mobile
          </label>
         <input type="mobile" className="w-full border rounded-lg px-3 py-2 focus:outline-none" placeholder="Enter your Mobile"
         onChange={(e)=>setMobile(e.target.value)}
         value={mobile}
          required
          style={{
             border:`1px solid ${borderColor}`
         }}/>
        </div>

         {/* password */}
        <div className="mb-4">
         <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
          Password
          </label>
            <div className="relative">
             <input type={`${showPassword? "text" : "password"}`} 
             className="w-full border rounded-lg px-3 py-2 focus:outline-none"
             placeholder="Enter your Password"
              onChange={(e)=>setPassword(e.target.value)}
              value={password}
               required
              style={{
             border:`1px solid ${borderColor}`
             }}/>

             <button className="absolute right-3 cursor-pointer top-3 text-gray-500" onClick={()=> setShowPassword(prev=>!prev)}>
             {!showPassword? <FaRegEye /> : <FaRegEyeSlash />}
             </button>
            </div>
        </div>

        {/* role */}
        <div className="mb-4">
  <label htmlFor="role" className="block text-gray-700 font-medium mb-1">
    Role
  </label>

  <div className="flex gap-2">
    {["user", "owner", "deliveryBoy"].map((r) => (
      <button
        key={r}                 // ⭐ required by React
        type="button"           // ⭐ prevents page refresh / submit
        onClick={() => setRole(r)}
        className="flex-1 border rounded-lg px-3 py-2 text-center font-medium transition-colors cursor-pointer"
        style={
          role === r
            ? { backgroundColor: primaryColor, color: "white" }
            : { border: `1px solid ${primaryColor}`, color: primaryColor }
        }
      >
        {r}
      </button>
    ))}
  </div>
     </div>



     

     <button className={`w-full font-semibold rounded-lg  py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`}
     onClick={handleSignUp}
     disabled={loading}
     >
      {
        loading? <ClipLoader size={20} color='white'/> : "Sign Up"
      }
       
     </button>

       {err && <p className="text-red-500 text-center my-4">*{err}</p>}

     <button className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200 border-gray-400 hover:bg-gray-100 cursor-pointer"
     onClick={handleGoogleAuth}>
      <FcGoogle size={20}/>
      <span>Sign up with Google</span>
     </button>

     <p className="text-center mt-4 mb-3 cursor-pointer" onClick={()=> navigate("/signin")}>Already have an account? <Link to={"/signin"}><span className="text-[#ff4d2d] cursor-pointer underline">
      Sign In</span></Link></p>
     </div>
    </div>
  )
}

export default SignUp
