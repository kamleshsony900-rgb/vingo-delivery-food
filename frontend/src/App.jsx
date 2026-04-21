import { Navigate, Route, Routes } from "react-router-dom"
import SignUp from "./pages/SignUp"
import SignIn from "./pages/SignIn"
import ForgotPassword from "./pages/ForgotPassword"
import userGetCurrentUser from "./hooks/userGetCurrentUser"
import { useDispatch, useSelector } from "react-redux"
import Home from "./pages/Home"
import useGetCity from "./hooks/useGetCity"
import useGetMyShop from "./hooks/useGetMyShop"
import CreateEditShop from "./pages/CreateEditShop"
import AddItem from "./pages/AddItem"
import EditItem from "./pages/EditItem"
import useGetShopByCity from "./hooks/useGetShopByCity"
import useGetItemsByCity from "./hooks/useGetItemsByCity"
import CartPage from "./pages/CartPage"
import CheckOut from "./pages/CheckOut"
import OrderPlaced from "./pages/OrderPlaced"
import MyOrders from "./pages/MyOrders"
import userGetMyOrders from "./hooks/userGetMyOrders"
import useUpdateLocation from "./hooks/useUpdateLocation"
import TrackOrderPage from "./pages/TrackOrderPage"
import Shop from "./pages/Shop"
import { createContext, useEffect } from "react"

import { io } from "socket.io-client"
import { setSocket } from "./redux/userSlice"
import toast, { Toaster } from "react-hot-toast"
import ContactFeedback from "./pages/ContactPage"
import Success from "./components/Success"
import HelpCenter from "./pages/HelpCenter"

// backend url here to connect frontend //
export const serverUrl = "https://vingo-backend-zpxl.onrender.com"

export const MyContext = createContext();


function App() {
  const dispatch = useDispatch();


  const openAlertBox = (status, msg) => {
    console.log(status);
    if (status === "success") {
      toast.success(msg)
    }
    if (status === "error") {
      toast.error(msg)
    }
  }


  const { userData, authLoading } = useSelector(state => state.user);

  if (authLoading) return <h2>Checking authentication...</h2>;


  userGetCurrentUser();
  useUpdateLocation()

  useGetCity();
  useGetMyShop();
  useGetShopByCity();
  useGetItemsByCity();
  userGetMyOrders();


  // thsi event to access to backend (.on ke thuru)
  useEffect(() => {
    const socketInstance = io(serverUrl, { withCredentials: true })
    dispatch(setSocket(socketInstance))
    socketInstance.on("connect", () => {    // connect hoge tabhi chalega
      // console.log(socket)
      if (userData) {
        socketInstance.emit("identity", { userId: userData?._id })  // event emit hoga or userData backend bhejege
      }
    })

    return () => {
      socketInstance.disconnect()
    }
  }, [userData?._id])

  const values = {
    openAlertBox
  }

  return (
    <>
      <MyContext.Provider value={values}>
        <Routes>
          <Route path="/signup" element={!userData ? <SignUp /> : <Navigate to={"/"} />} />

          <Route path="/signin" element={!userData ? <SignIn /> : <Navigate to={"/"} />} />

          <Route path="/forgot-password" element={!userData ? <ForgotPassword /> : <Navigate to={"/"} />} />

          {/* data hai tabhi dekhaye home barna nahi  */}
          <Route path="/" element={userData ? <Home /> : <Navigate to={"/signin"} />} />

          <Route path="/create-edit-shop" element={userData ? <CreateEditShop /> : <Navigate to={"/signin"} />} />

          <Route path="/add-item" element={userData ? <AddItem /> : <Navigate to={"/signin"} />} />

          <Route path="/edit-item/:itemId" element={userData ? <EditItem /> : <Navigate to={"/signin"} />} />

          <Route path="/cart" element={userData ? <CartPage /> : <Navigate to={"/signin"} />} />

          <Route path="/checkout" element={userData ? <CheckOut /> : <Navigate to={"/signin"} />} />

          <Route path="/order-placed" element={userData ? <OrderPlaced /> : <Navigate to={"/signin"} />} />

          <Route path="/my-orders" element={userData ? <MyOrders /> : <Navigate to={"/signin"} />} />

          <Route path="/track-order/:orderId" element={userData ? <TrackOrderPage /> : <Navigate to={"/signin"} />} />

          <Route path="/shop/:shopId" element={userData ? <Shop /> : <Navigate to={"/signin"} />} />

          <Route
            path="/feedback"
            element={
              userData ? <ContactFeedback /> : <Navigate to={"/signin"} />
            }
          />
          <Route path="/success" element={userData ? <Success /> : <Navigate to={"/signin"} />} />
          <Route path="/help" element={userData ? <HelpCenter /> : <Navigate to={"/signin"} />} />

        </Routes>
      </MyContext.Provider>

      <Toaster />
    </>
  )
}

export default App
