
import userModel from "../models/user.model.js";




export const getCurrentUser = async (req, res) => {
       try {

        const userId = req.userId;

        if(!userId){
            return res.status(400).json({
                message:"UserId is not found."
            })
        }

        const user = await userModel.findById(userId);
        if(!user){
            return res.status(400).json({
                message:"User not found."
            })
        }
        
        return res.status(200).json(user);


       } catch (error) {
        return res.status(500).json({
            message:`get current user error ${error}`
        })
       }
}




// export const updateUserLocation = async (req, res) => {
//           try {
//             const {lat, lon} =req.body;

//             const user = await userModel.findByIdAndUpdate(req.userId, {
//                 location:{
//                     type:"Point",
//                     coordinates:[lon,lat]
//                 }
//             }, {new: true})

//             if(!user){
//             return res.status(400).json({
//                 message:"User is not found."
//             })
//         }

//           return res.status(200).json({message:"location updated"});
            
//           } catch (error) {
//             return res.status(500).json({
//             message:`location update user error ${error}`
//         })
//           }
// }





// for chatgpt 
export const updateUserLocation = async (req, res) => {
  try {
    const { lat, lon } = req.body;

    // 1️⃣ Validate input
    if (lat === undefined || lon === undefined) {
      return res.status(400).json({
        message: "Latitude and Longitude are required",
      });
    }

    // 2️⃣ Convert to numbers (important!)
    const latitude = Number(lat);
    const longitude = Number(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        message: "Latitude and Longitude must be valid numbers",
      });
    }

    const user = await userModel.findByIdAndUpdate(
      req.userId,
      {
        location: {
          type: "Point",
          coordinates: [longitude, latitude], // GeoJSON format
        },
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Location updated successfully",
      location: user.location,
    });


  } catch (error) {
    return res.status(500).json({
      message: "Location update user error",
      error: error.message,
    });
  }
};



