import deliveryAssignmentModel from "../models/deliveryAssignment.model.js";
import orderModel from "../models/order.model.js";
import shopModel from "../models/shop.model.js";
import userModel from "../models/user.model.js";
import { sendDeliveryOtpMail } from "../utils/mail.js";


import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config()


let instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


export const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (!deliveryAddress?.text || !deliveryAddress?.latitude || !deliveryAddress?.longitude) {
      return res.status(400).json({ message: "Send complete deliveryAddress" });
    }

    const groupItemsByShop = {};

    cartItems.forEach(item => {
      const shopId = item?.shop;
      if (!groupItemsByShop[shopId]) {
        groupItemsByShop[shopId] = [];
      }
      groupItemsByShop[shopId].push(item);
    });

    const shopOrders = await Promise.all(
      Object.keys(groupItemsByShop).map(async (shopId) => {
        const shop = await shopModel.findById(shopId).populate("owner");

        if (!shop) {
          throw new Error("Shop not found");
        }

        const items = groupItemsByShop[shopId];

        const subtotal = items.reduce(
          (sum, i) => sum + Number(i.price) * Number(i.quantity),
          0
        );

        return {
          shop: shop._id,
          owner: shop.owner?._id,
          subtotal,
          shopOrderItems: items.map((i) => ({
            item: i.id,
            price: i.price,
            quantity: i.quantity,
            name: i.name,
          })),
        };
      })
    );


    // for razorpay paymethod //
    if(paymentMethod=="online"){
       const razorOrder = await instance.orders.create({
          amount:Math.round(totalAmount)*100,   /// convert here rupees only allow razorpay
          currency:"INR",
          receipt:`receipt_${Date.now()}`
       })

        // order create here for razorpay on delivery 
    const newOrder = await orderModel.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders,
      razorpayOrderId:razorOrder.id,
      payment:false
    })

      return res.status(200).json({
          razorOrder,
          orderId:newOrder._id,
      });
    }


    // order create here for cash on delivery 
    const newOrder = await orderModel.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders,
    });

   await newOrder.populate("shopOrders.shopOrderItems.item", "name image price")
   await newOrder.populate("shopOrders.shop", "name")
   await newOrder.populate("shopOrders.owner", "name socketId")
   await newOrder.populate("user", "name email mobile") // only socket ke liye populate kiya hai //


  //  socket io implement start //
  const io =req.app.get("io")   // set in index.js here also set.io 
  // event bante hai //
  if(io){
    newOrder.shopOrders.forEach(shopOrder => {
       const ownerSocketId = shopOrder.owner.socketId
       if(ownerSocketId){
        io.to(ownerSocketId).emit("newOrder", {
            _id:newOrder._id,
            paymentMethod:newOrder?.paymentMethod,
            user:newOrder.user,
            shopOrders:shopOrder,
            createdAt:newOrder?.createdAt,
            deliveryAddress:newOrder?.deliveryAddress,
            // for razorpay ke liye //
            payment:newOrder.payment
         }) // same event name use in frontend also(newOrder) 
       }
    });
  }

   //  socket io implement end //


    return res.status(201).json(newOrder);

  } catch (error) {
    return res.status(500).json({
      message: `Place order error: ${error.message}`,
    });
  }
};



// for razorpayment only work function //
export const verifyPayment = async (req, res) => {
     try {
      const {razorpay_payment_id, orderId} = req.body;
      const payment = await instance.payments.fetch(razorpay_payment_id)
      if(!payment || payment.status!="captured"){
         return res.status(400).json({
          message:"payment not captured"
         })
      }

      const order = await orderModel.findById(orderId)
      if(!order){
         return res.status(400).json({
          message:"order not found"
         })
      }

      order.payment=true
      order.razorpayPaymentId=razorpay_payment_id
      await order.save()

   await order.populate("shopOrders.shopOrderItems.item", "name image price")
   await order.populate("shopOrders.shop", "name")
   await order.populate("shopOrders.owner", "name socketId")
   await order.populate("user", "name email mobile") // only socket ke liye populate kiya hai //


  //  socket io implement start //
  const io =req.app.get("io")   // set in index.js here also set.io 
  // event bante hai //
  if(io){
    order.shopOrders.forEach(shopOrder => {
       const ownerSocketId = shopOrder.owner.socketId
       if(ownerSocketId){
        io.to(ownerSocketId).emit("newOrder", {
            _id:order._id,
            paymentMethod:order?.paymentMethod,
            user:order.user,
            shopOrders:shopOrder,
            createdAt:order?.createdAt,
            deliveryAddress:order?.deliveryAddress,
            // for razorpay ke liye //
            payment:order.payment
         }) // same event name use in frontend also(newOrder) 
       }
    });
  }

   //  socket io implement end //

      return res.status(201).json(order);

      
     } catch (error) {
      return res.status(500).json({
      message: `verify payment order error: ${error.message}`,
    });
     }
}

 
// hand written //
export const getMyOrders = async (req, res) => {
      try {
         const user = await userModel.findById(req.userId)

         if(user?.role=="user"){
           const orders = await orderModel.find({user:req.userId})
         .sort({createdAt:-1})  // asbse badh huwa oh pahila dekha order
         .populate("shopOrders.shop", "name")
         .populate("shopOrders.owner", "name email mobile")
         .populate("shopOrders.shopOrderItems.item", "name image price")


          return res.status(200).json(orders);

         }else if(user?.role=="owner"){
           const orders = await orderModel.find({"shopOrders.owner":req.userId})
         .sort({createdAt:-1})  // asbse badh huwa oh pahila dekha order
         .populate("shopOrders.shop", "name")
         .populate("user")
         .populate("shopOrders.shopOrderItems.item", "name image price")
         .populate("shopOrders.assignedDeliveryBoy", "fullName mobile")

         const filteredOrders = orders?.map((order=>({
            _id:order._id,
            paymentMethod:order?.paymentMethod,
            user:order.user,
            shopOrders:order.shopOrders?.find(o=>o.owner?._id==req.userId),
            createdAt:order?.createdAt,
            deliveryAddress:order?.deliveryAddress,
            // for razorpay ke liye //
            payment:order.payment
         })))


          return res.status(200).json(filteredOrders);
         }

      } catch (error) {
         return res.status(500).json({
      message: `get User order error: ${error.message}`,
    });
      }
}


// status update code here // (vvi concept for any developer)
export const updateOrderStatus = async (req, res) => {
       try {
        const {orderId, shopId} = req.params
        const {status} = req.body

        const order = await orderModel.findById(orderId)

        const shopOrder = order.shopOrders.find(o=>o.shop==shopId)
        if(!shopOrder){
          return res.status(400).json({message:"shop order not found"})
        }

        shopOrder.status=status

        let deliveryBoysPaylod=[]

        // for deliveryBoy find here //
        if(status==="out of delivery" && !shopOrder.assignment){
          const {longitude, latitude} = order.deliveryAddress
          const nearByDeliveryBoys = await userModel.find({
              role:"deliveryBoy",
              location:{
                  $near:{
                      $geometry:{type:"Point", coordinates:[Number(longitude), Number(latitude)]},
                      $maxDistance:5000  // 5kilometer
                  }
              }
          })
            
          // all deliveryBoy Ids here //
          const nearByIds = nearByDeliveryBoys.map(b=>b._id)
          const busyIds = await deliveryAssignmentModel.find({
             assignedTo:{$in:nearByIds},
             status:{$nin:["brodcasted","completed"]}  // nin- not in 
          }).distinct("assignedTo")   // jo bhi deliveryBoy assigned kiya oh time id milega (.distinct("assignedTo"))

          const busyIdSet = new Set(busyIds.map(id=>String(id)))

        const availableBoys =nearByDeliveryBoys.filter(b=>!busyIdSet.has(String(b._id)))
        const candidates = availableBoys.map(b=>b._id)

        if(candidates.length==0){
           await order.save()
           return res.json({
               message:"order status updated but there is no available delivery boys!."
           })
        }

        const deliveryAssignment = await deliveryAssignmentModel.create({
              order:order._id,
              shop:shopOrder.shop,
              shopOrderId:shopOrder._id,
              brodcastedTo:candidates,
              status:"brodcasted"
        })
        
        shopOrder.assignedDeliveryBoy=deliveryAssignment.assignedTo


         shopOrder.assignment=deliveryAssignment?._id
         deliveryBoysPaylod=availableBoys.map(b=>({
          id:b._id,
          fullName:b.fullName,
          longitude:b.location.coordinates?.[0],
          latitude:b.location.coordinates?.[1],
          mobile:b.mobile
         }))

         //  start here socket io //
        //  for socket ke liye eh //
        await deliveryAssignment.populate("order")
       await deliveryAssignment.populate("shop")
        // for update real to accept delivery boy message to accept delivery items real time //
        // using socket io for imadiately message go //
        const io = req.app.get("io")
        if(io){
          availableBoys.forEach(boy => {
            const boySocketId = boy.socketId
            if(boySocketId){
              io.to(boySocketId).emit("newAssignment", {
               sentTo:boy._id,
               assignmentId:deliveryAssignment._id,
               orderId:deliveryAssignment.order?._id,
               shopName:deliveryAssignment.shop?.name,
               deliveryAddress:deliveryAssignment.order?.deliveryAddress,
               
               items:deliveryAssignment.order?.shopOrders?.find(so=>so._id.equals(deliveryAssignment.shopOrderId)).shopOrderItems || [],

               subtotal:deliveryAssignment.order?.shopOrders?.find(so=>so._id.equals(deliveryAssignment.shopOrderId)).subtotal

              })
            }
          });
        }

      //  end here socket io //
        }


        await order.save();
        const updatedShopOrder = order.shopOrders.find(o=>o.shop==shopId)

        await  order.populate("shopOrders.shop", "name")
        await  order.populate("shopOrders.assignedDeliveryBoy", "fullName email mobile")
        await  order.populate("user", "socketId")

        // using socket io for updating real time means immediately show //
        // get io //
        const io = req.app.get("io")
        if(io){
        const userSocketId = order.user.socketId
        if(userSocketId){
          io.to(userSocketId).emit("update-status", {
            orderId:order._id,
            shopId:updatedShopOrder.shop._id,
            status:updatedShopOrder.status,
            userId:order.user._id
          })
        }
        }
       
        
        //  return res.status(200).json(shopOrder.status);
          return res.status(200).json({
            shopOrder:updatedShopOrder,
            assignedDeliveryBoy:updatedShopOrder?.assignedDeliveryBoy,
            availableBoys:deliveryBoysPaylod,
            assignment:updatedShopOrder?.assignment._id
          });
         
         

        
       } catch (error) {
         return res.status(500).json({
            message: `order status error: ${error.message}`,
           });
       }
}



export const getDeliveryBoyAssignment = async (req, res) =>{
      try {
        const deliveryBoyId = req.userId;
        
        const assignments = await deliveryAssignmentModel.find({
          brodcastedTo:deliveryBoyId,
          status:"brodcasted"
        })
        .populate("order")
        .populate("shop")

        const formated = assignments.map(a=>({
           assignmentId:a._id,
           orderId:a.order?._id,
           shopName:a.shop?.name,
           deliveryAddress:a.order?.deliveryAddress,
           items:a.order?.shopOrders?.find(so=>so._id.equals(a.shopOrderId)).shopOrderItems || [],
           subtotal:a.order?.shopOrders?.find(so=>so._id.equals(a.shopOrderId)).subtotal

        }))

        return res.status(200).json(formated)

        
      } catch (error) {
        return res.status(500).json({
            message: `get Assignment error: ${error.message}`,
           });
      }
}



export const acceptOrder = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // 1️⃣ Find Assignment
    const assignment = await deliveryAssignmentModel.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    // 2️⃣ Check Status
    if (assignment.status !== "brodcasted") {
      return res.status(400).json({
        message: "Assignment is expired",
      });
    }

    // 3️⃣ Check If Delivery Boy Already Assigned
    const alreadyAssigned = await deliveryAssignmentModel.findOne({
      assignedTo: req.userId,
      status: { $nin: ["brodcasted", "completed"] },
    });

    if (alreadyAssigned) {
      return res.status(400).json({
        message: "You are already assigned to another order",
      });
    }

    // 4️⃣ Update Assignment
    assignment.assignedTo = req.userId;
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();
    await assignment.save();

    // 5️⃣ Find Order
    const order = await orderModel.findById(assignment.order);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // 6️⃣ Find Correct Shop Order (SAFE ObjectId comparison)
    const shopOrder = order.shopOrders.find(
      (so) => so._id.toString() === assignment.shopOrderId.toString()
    );

    if (!shopOrder) {
      return res.status(404).json({
        message: "Shop order not found inside this order",
      });
    }

    // 7️⃣ Assign Delivery Boy
    shopOrder.assignedDeliveryBoy = req.userId;

    await order.save();

    return res.status(200).json({
      message: "Order accepted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      message: `accepted error: ${error.message}`,
    });
  }
};



export const getCurrentOrder = async (req, res) => {
      try {
        const assignment = await deliveryAssignmentModel.findOne({
           assignedTo:req.userId,
           status:"assigned"
        })

        .populate("shop", "name")
        .populate("assignedTo", "fullName email mobile location")
        .populate({
          path:"order",
          populate:[{path:"user", select:"fullName email mobile location"}],
          
        })

        if(!assignment){
          return res.status(404).json({
           message: "assignment not found",
         });
        }

         if(!assignment.order){
          return res.status(404).json({
           message: "order not found",
         });
        }
        const shopOrder = assignment.order.shopOrders.find(so=>toString(so._id)==toString(assignment.shopOrderId))

         if(!shopOrder){
          return res.status(404).json({
           message: "shopOrder not found",
         });
        }

        let deliveryBoyLocation ={lat:null, lon:null}
        if(assignment.assignedTo.location.coordinates.length==2){
          deliveryBoyLocation.lat=assignment.assignedTo.location.coordinates[1]
         deliveryBoyLocation.lon=assignment.assignedTo.location.coordinates[0]
        }
         

        let customerLocation ={lat:null, lon:null}
        if(assignment.order.deliveryAddress){
          customerLocation.lat=assignment.order.deliveryAddress.latitude
          customerLocation.lon=assignment.order.deliveryAddress.longitude
        }

        return res.status(200).json({
          _id:assignment.order._id,
          user:assignment.order.user,
          shopOrder,
          deliveryAddress:assignment.order.deliveryAddress,
          deliveryBoyLocation,
          customerLocation
        })
       
        
      } catch (error) {
         return res.status(500).json({
          message: `current order error: ${error.message}`,
        });
      }
}



export const getOrderById = async (req, res) => {
    try {
      const {orderId} = req.params;

      const order = await orderModel.findById(orderId)

      .populate("user")
      .populate({
        path:"shopOrders.shop",
        model:"Shop"
      })

       .populate({
        path:"shopOrders.assignedDeliveryBoy",
        model:"User"
      })

      .populate({
        path:"shopOrders.shopOrderItems.item",
        model:"Item"
      })
      .lean()

      if(!order){
          return res.status(404).json({
           message: "order not found",
         });
        }
      
         return res.status(200).json(order)
      
    } catch (error) {
      return res.status(500).json({
          message: `get by id order error: ${error.message}`,
        });
    }
}


// send otp to user for confirm items received //
export const sendDeliveryOtp = async (req, res) => {
   try {
      const { shopOrderId, orderId } = req.body;

      const order = await orderModel
         .findById(orderId)
         .populate("user");

      if (!order) {
         return res.status(400).json({
            message: "Invalid orderId",
         });
      }

      const shopOrder = order.shopOrders.id(shopOrderId);

      if (!shopOrder) {
         return res.status(400).json({
            message: "Invalid shopOrderId",
         });
      }

      // 🔒 Make sure user email exists
      if (!order.user || !order.user.email) {
         return res.status(400).json({
            message: "User email not found",
         });
      }

      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      shopOrder.deliveryOtp = otp;
      shopOrder.otpExpires = Date.now() + 5 * 60 * 1000;

      await order.save();

      // ✅ CORRECT WAY (Pass object)
      await sendDeliveryOtpMail({ user: order.user, otp });

      return res.status(200).json({
         message: `Otp sent successfully to ${order.user.fullName}`,
      });

   } catch (error) {
      return res.status(500).json({
         message: `delivery otp error: ${error.message}`,
      });
   }
};



export const verifyDeliveryOtp = async (req, res) => {
   try {
      const { shopOrderId, orderId, otp } = req.body;

      const order = await orderModel.findById(orderId);

      if (!order) {
         return res.status(400).json({ message: "Invalid orderId" });
      }

      const shopOrder = order.shopOrders.id(shopOrderId);

      if (!shopOrder) {
         return res.status(400).json({ message: "Invalid shopOrderId" });
      }

      if (!shopOrder.deliveryOtp || !shopOrder.otpExpires) {
         return res.status(400).json({ message: "No OTP found" });
      }

      if (shopOrder.otpExpires < Date.now()) {
         return res.status(400).json({ message: "OTP Expired" });
      }

      const enteredOtp = String(otp).trim();
      const storedOtp = String(shopOrder.deliveryOtp).trim();

      if (storedOtp !== enteredOtp) {
         return res.status(400).json({ message: "Invalid OTP" });
      }

      // ✅ Mark Delivered
      shopOrder.status = "delivered";
      shopOrder.deliveredAt = Date.now();
      shopOrder.deliveryOtp = undefined;
      shopOrder.otpExpires = undefined;

      await order.save();

      // ✅ Delete delivery assignment
      if (shopOrder.assignedDeliveryBoy) {
         await deliveryAssignmentModel.deleteOne({
            shopOrderId: shopOrder._id,
            order: order._id,
            assignedTo: shopOrder.assignedDeliveryBoy
         });
      }

      return res.status(200).json({
         message: "Order Delivered Successfully!"
      });

   } catch (error) {
      return res.status(500).json({
         message: `verify delivery otp error: ${error.message}`,
      });
   }
};


export const getTodayDeliveries = async (req, res) => {
      try {
         const deliveryBoyId = req.userId;

         const startsOfDay = new Date()
         startsOfDay.setHours(0,0,0,0)
         
        //  all days deliered items here //
         const orders = await orderModel.find({
            "shopOrders.assignedDeliveryBoy" : deliveryBoyId,
            "shopOrders.status" : "delivered",
            "shopOrders.deliveredAt" : {$gte:startsOfDay}
         }).lean()

        //  only for today delivered items only //
        let todaysDeliveries = [];

        orders.forEach(order=>{
           order.shopOrders.forEach(shopOrder=>{
              if(shopOrder.assignedDeliveryBoy==deliveryBoyId && 
                shopOrder.status=="delivered" &&
                shopOrder.deliveredAt &&
                 shopOrder.deliveredAt>=startsOfDay
              ){
                todaysDeliveries.push(shopOrder)
              }
           })
        })

        let stats = {}

        //  how many items delivered in 1 hour get here //
        todaysDeliveries.forEach(shopOrder=>{
            const hour = new Date(shopOrder.deliveredAt).getHours()
            stats[hour] = (stats[hour] || 0) + 1
        })

        let formattedStats = Object.keys(stats).map(hour=>({
          hour:parseInt(hour),
          count:stats[hour]
        }))

        formattedStats.sort((a,b)=>a.hour-b.hour)

        return res.status(200).json(formattedStats)
        
      } catch (error) {
        return res.status(500).json({
         message: `today deliveries error: ${error.message}`,
      });
      }
}