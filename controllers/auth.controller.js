const User = require('../models/user');

exports.signIn = async(req,res) => {
    try{

        const {name,email} = req.body;

        if(!email || !name){
            return res.status(400).json({message:"Email Required for Sign In !"})
        }

        let user = await User.findOne({email:email});

        const otp = Math.floor(1000 + Math.random() * 9000); 

        const otpExpiry = Date.now() + 10 * 60 * 1000;
        
        if(!user){
            
            user = new User({
            name:name,
            email:email

        });
    }
    
        user.otp = otp;

        user.otpExpiry = otpExpiry;

        await user.save();

        res.status(201).json({
            success: true,
            message: `OTP sent successfully to ${email}`        
        });

    }
    catch(error){
        console.error("Error in user Sign In : ",error);
        res.status(500).json({message:"Internal Server Error !"})
    }
}

exports.verifyOtp = async(req,res) => {
    try{

        const {email,otp} = req.body;

        if(!email || !otp){
            return res.status(400).json({message:"Email and OTP Required for otp verification !"})
        }

        const user = await User.findOne({email:email});

        if(!user){
            return res.status(404).json({message:"User not found !"})
        }

        if(user.otp !== Number(otp) || Date.now() > user.otpExpiry){
            return res.status(400).json({message:"OTP Invalid or Expired !"})
        }

        user.otpExpiry = null ;

        user.otp = null;

        await user.save();

        res.status(200).json({
            success: true,
            message: "OTP verified Successfully !"
        });

    }
    catch(error){
        console.error("Error in OTP Verification : ",error);
        res.status(500).json({message:"Internal Server Error !"})
    }
}