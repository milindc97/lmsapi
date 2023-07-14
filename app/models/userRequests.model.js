const mongoose = require("mongoose");

const UserRequests = new mongoose.Schema({
    employeeCode: {type:String},
    salutation: {type:String},
    firstName: {type:String},
    lastName: {type:String},
    email: {type:String},
    password: {type:String},
    mobile: {type:Number},
    dob: {type:String},
    gender: {type:String},
    department:{type:String},
    status:{type:Number},
    remark:{type:String},
    state:{type:String},
    cluster:{type:String},
    designation:{type:String},
    branch:{type:String}
});


UserRequests.set('timestamps',true);


module.exports = mongoose.model("userRequests",UserRequests);