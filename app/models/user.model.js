const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    employeeCode: {type:String},
    employeeId: {type:Number},
    salutation: {type:String},
    firstName: {type:String},
    lastName: {type:String},
    email: {type:String},
    password: {type:String},
    mobile: {type:Number},
    whatsappNo: {type:Number},
    dob: {type:Date},
    profileCount:{
      type:Number
    },
    designationCount:{
      type:Number
    },
    departmentCount:{
      type:Number
    },
    roles: {
      type:String,
      enum:["admin","user"],
      default: "user",
      required:true
    },
    isSuperAdmin:{
      type:Boolean,
      default:false
    },
    group:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group"
    },
    gender: {type:String},
    department:{type:String},
    status:{type:Number},
    lastLoginOn:{type:Date},
    logoutTime:{type:Date},
    state:{type:String},
    stateEmp:{type:String},
    cluster:{type:String},
    designation:{type:String},
    branch:{type:String},
    socket:{type:String},
    profilephoto:{type:String},
    dummyphoto:{type:String},
    photoRemark:{type:String},
    fcmToken:{type:String},
    photoStatus:{type:String,enum:["Pending","Approve","Reject"]},
    activeWallApproval:{
      type:Boolean,
      default:true
    },
    isAgree:{
      type:Boolean,
      default:false
    }
  })
);

module.exports = User;