import mongoose from "mongoose";



const userSchema = new mongoose.Schema({
     
    fullName:{
       type:String,
       required:true
    },
     email:{
       type:String,
       required:true,
       unique:true
    },
    password:{
         type:String
    },
    mobile:{
        type:Number,
        required:true
    },
    role:{
        type:String,
        enum:["user", "owner", "deliveryBoy"],
         required:true
    },
    resetOtp:{
        type:Number,
    },

    isOtpVerified:{
        type:Boolean,
        default:false
    },

    otpExpires:{
        type:Date
    },

    // for socketId create send this is to direct user //
    socketId:{
      type:String
    },

     // for realTime user online hai to jayega message nahi to nahi for  socket  //
    isOnline:{
        type:Boolean,
        default:false
    },

    //  delivery par kam karne time add (location only )
    location:{
        type:{type:String, enum:["Point"], default:"Point"},
        coordinates:{type:[Number], default:[0,0]}
    }


}, {timestamps: true})

//  delivery par kam karne time add (location only )
userSchema.index({location:"2dsphere"})

const userModel = mongoose.model("User", userSchema);
export default userModel;