import userModel from "./models/user.model.js"

export const socketHandler = (io) => {
    io.on("connection", (socket) => {
        // console.log("Connected:", socket.id)

        socket.on("identity", async ({ userId }) => {
            try {
                const user = await userModel.findByIdAndUpdate(
                    userId,
                    {
                        socketId: socket.id,
                        isOnline: true
                    },
                    { new: true }
                )
                // console.log("Updated user:", user)
            } catch (error) {
                console.log(error)
            }
        })


        // for updatelocation change delivery change location same time show in user location also change
        socket.on("updateLocation",async ({latitude, longitude, userId})=>{
            try {
                const user = await userModel.findByIdAndUpdate(userId, {
                 location:{
                    type:"Point",
                    coordinates:[longitude, latitude]
                 },
                 isOnline:true,
                 socketId:socket.id
                })
                
                if(user){
                 io.emit("updateDeliveryLocation", {
                    deliveryBoyId: userId.toString(),
                    latitude,
                    longitude
                 })
                }
             
            } catch (error) {
                console.log(`updateDeliveryLocation error ${error}`)
            }
        })

        // after user off immediately socketid=null and isOnline=false show
        socket.on("disconnect", async ()=>{
            try {
                await userModel.findOneAndUpdate({socketId:socket.id}, {
                socketId:null,
                isOnline:false
            })
                
            } catch (error) {
                console.log(error)
            }
            
        })
    })
}