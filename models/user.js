const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    phoneNumber: String,
    countryCode: String,
    address:{
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: Number
    },
    otp: Number,
    otpExpiry : {
        type: Date
    }
},{timestamps: true});

userSchema.index({email:1});

module.exports = mongoose.model('User',userSchema);