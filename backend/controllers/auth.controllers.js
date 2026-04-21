import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs"
import genToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";


export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, mobile, role } = req.body;

    if (!fullName || !email || !password || !mobile || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    if (!/^[0-9]{10,15}$/.test(mobile)) {
      return res.status(400).json({ message: "Invalid mobile number" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      fullName,
      email,
      mobile,
      role,
      password: hashedPassword
    });

    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // remove password before sending user to frontend
    const { password: pwd, ...userData } = user._doc;

    return res.status(201).json({
      message: "User created successfully!",
      user: userData
    });

  } catch (error) {
    console.error("SignUp Error:", error);
    return res.status(500).json({ message: "Sign up error" });
  }
};



export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "User does not exist."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Incorrect password"
            });
        }

        const token = await genToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure:false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Extract the password field and ignore it (_ means unused variable)
       // Then collect all remaining user fields into safeUser
     // This prevents sending hashed password to frontend
        const { password: _, ...safeUser } = user._doc;

        return res.status(200).json({
          success: true,      // <-- add this
          user: safeUser,
          message: "Login successful!"
        });

    } catch (error) {
        return res.status(500).json({ message: "Sign in error", error: error.message });
    }
};


export const signOut = async (req, res) => {
     try {
        res.clearCookie("token");

        return res.status(200).json({
            message:"log out successfully!"
        });

     } catch (error) {
         return res.status(500).json({
         message: "Sign out error", error: error.message
         });
     }
}


// start here from email connection //
export const sendOtp = async (req, res) => {
      try {
        const {email} = req.body;

        const user = await userModel.findOne({email});
        if(!user){
           return res.status(400).json({
            message:"User does not exit."
           })
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        user.resetOtp=otp;
        user.otpExpires=Date.now()+5*60*1000;  // expires in 5 minutes
        user.isOtpVerified=false
        await user.save();
        await sendOtpMail({ to: email, otp });

        return res.status(200).json({
            message:"otp send successfull!."
        });


      } catch (error) {
         return res.status(500).json({
         message: "Send otp error", error: error.message
         });
      }
}


export const verifyOtp = async (req, res) => {
       try {
        const {email, otp} = req.body;

        const user = await userModel.findOne({email});

        if(!user || user.resetOtp!=otp || user.otpExpires<Date.now()){
           return res.status(400).json({
            message:"invalid/expired otp"
           }); 
        }

        user.isOtpVerified=true
        user.resetOtp=undefined
        user.otpExpires=undefined
        await user.save();


        return res.status(200).json({
            message:"otp verify successfull!."
        });


       } catch (error) {
        return res.status(500).json({
         message: "Otp verify error", error: error.message
         });
       }
}


export const resetPassword = async (req, res) => {
     try {
        const {email, newPassword} = req.body;

        const user = await userModel.findOne({email});

        if(!user || !user.isOtpVerified){
           return res.status(400).json({
            message:"otp verification required."
           })
        }

        const hashedPassword = await bcrypt.hash(newPassword,10);
        user.password=hashedPassword;
        user.isOtpVerified=false;
        await user.save();

         return res.status(200).json({
            message:"password reset successfully!."
           })

     } catch (error) {
        return res.status(500).json({
         message: "reset password error", error: error.message
         });
     }
}


export const googleAuth = async (req, res) => {
     try {
        const {fullName, email, mobile, role} = req.body;

        let user = await userModel.findOne({email});

        if(!user){
            user=await userModel.create({
                fullName,
                email,
                mobile,
                role
            })
        }

        const token = await genToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure:false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Extract the password field and ignore it (_ means unused variable)
       // Then collect all remaining user fields into safeUser
     // This prevents sending hashed password to frontend
        const { password: _, ...safeUser } = user._doc;

        return res.status(200).json({
            user: safeUser,
        });

     } catch (error) {
         return res.status(500).json({
         message: "google auth error", error: error.message
         });
     }
}