import { IoIosArrowRoundBack } from "react-icons/io";
import { FaBoxOpen, FaStore } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UserOrderCard from "../components/UserOrderCard";
import OwnerOrderCard from "../components/OwnerOrderCard";
import { useEffect } from "react";
import {
  setMyOrders,
  updateRealTimeOrderStatus,
} from "../redux/userSlice";

const MyOrders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userData, myOrders, socket } = useSelector(
    (state) => state.user
  );

  useEffect(() => {
    if (!socket) return;

    socket.on("newOrder", (data) => {
      if (data?.shopOrders?.owner?._id === userData?._id) {
        dispatch(setMyOrders([data, ...(myOrders || [])]));
      }
    });

    socket.on("update-status", ({ orderId, shopId, status, userId }) => {
      if (userId === userData?._id) {
        dispatch(updateRealTimeOrderStatus({ orderId, shopId, status }));
      }
    });

    return () => {
      socket.off("newOrder");
      socket.off("update-status");
    };
  }, [socket, userData, myOrders, dispatch]);

  // Empty UI
  const renderEmpty = () => {
    if (userData?.role === "user") {
      return (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm">
          <FaBoxOpen className="text-5xl text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold">No Orders Yet</h2>
          <p className="text-gray-500 mt-2 text-center max-w-sm">
            You haven’t placed any orders yet.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 px-5 py-2 bg-[#ff4d2d] text-white rounded-lg hover:opacity-90"
          >
            Start Shopping
          </button>
        </div>
      );
    }

    if (userData?.role === "owner") {
      return (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm">
          <FaStore className="text-5xl text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold">No Orders Received</h2>
          <p className="text-gray-500 mt-2 text-center max-w-sm">
            Customers haven’t placed any orders yet.
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex justify-center px-4">
      <div className="w-full max-w-200 p-4">

        {/* Header */}
        <div
          className="flex items-center gap-3 mb-6 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <IoIosArrowRoundBack
            size={35}
            className="text-[#ff4d2d]"
          />
          <h1 className="text-2xl font-bold">My Orders</h1>
        </div>

        {/* Orders */}
        <div className="space-y-6">
          {myOrders?.length > 0
            ? myOrders.map((order) =>
                userData?.role === "user" ? (
                  <UserOrderCard
                    data={order}
                    key={order._id}
                  />
                ) : userData?.role === "owner" ? (
                  <OwnerOrderCard
                    data={order}
                    key={order._id}
                  />
                ) : null
              )
            : renderEmpty()}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;