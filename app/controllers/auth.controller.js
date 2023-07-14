const config = require("../config/auth.config");
const db = require("../models");
const { user: User, role: Role, refreshToken: RefreshToken } = db;
const moment = require('moment-timezone');
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

exports.signup = (req, res) => {
  if(req.body.employeeCode == "" || req.body.employeeCode == undefined){
    return res.status(500).send({error:{
      accessToken: null,
      message: "Missing Data",
    }});
  }

  if(req.body.password == "" || req.body.password == undefined){
    return res.status(500).send({error:{
      accessToken: null,
      message: "Missing Data",
    }});
  }

  if(req.body.roles == "" || req.body.roles == undefined){
    return res.status(500).send({error:{
      accessToken: null,
      message: "Missing Data",
    }});
  }

  const user = new User({
    employeeCode: req.body.employeeCode,
    salutation:req.body.salutation,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    mobile: req.body.mobile,
    dob: req.body.dob,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    status: (req.body.status == "" || req.body.status == undefined) ? 0 : req.body.status
  });

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    res.send({ message: "User was registered successfully!" });
  });
};

exports.forgot_password = (req, res) => {
  const date = moment(req.body.dob).tz('Asia/Kolkata');
const tomorrow = moment(req.body.dob).tz('Asia/Kolkata').add(1, 'day');
    User.find({employeeCode:req.body.employeeCode,dob:{$gt:date,$lte:tomorrow},mobile:parseInt(req.body.mobile)},(err,data)=>{
      if(data.length == 0){
        return res.status(200).send({message: "Please enter correct data." });
      }else{
        const empId = mongoose.Types.ObjectId(data[0]._id);
        User.findByIdAndUpdate(empId,{$set:{password: bcrypt.hashSync(req.body.password, 8)}},(err,data)=>{
          if(err){
            res.status(500).send({error:{ status:"error", message: err }});
          } else {
            res.status(200).send({
                status:"success",
                message : "New Password created successfully"
            });
          }
        });
      }
    });
};

exports.signin = (req, res) => {
  console.log(req.body);
  if(req.body.credential == "" || req.body.credential == undefined){
    return res.status(500).send({error:{
      accessToken: null,
      message: "Missing Data",
    }});
  }

  if(req.body.password == "" || req.body.password == undefined){
    return res.status(500).send({error:{
      accessToken: null,
      message: "Missing Data",
    }});
  }

  if(req.body.role == "" || req.body.role == undefined){
    return res.status(500).send({error:{
      accessToken: null,
      message: "Missing Data",
    }});
  }

  User.findOne({$or:[{email: req.body.credential},{employeeCode:req.body.credential}]})
    .exec(async (err, user) => {
      if (err) {
        res.status(500).send({error:{ message: err }});
        return;
      }

      if (!user) {
        return res.status(500).send({error:{ status:"error", message: "Wrong Credential." }});
      }

      let passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(500).send({error:{
          accessToken: null,
          message: "Invalid Password!",
        }});
      }

      let token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: config.jwtExpiration,
      });

      let refreshToken = await RefreshToken.createToken(user);

      if(user.status != 1){
        return res.status(500).send({error:{
          status:"error",
          accessToken: null,
          message: "Your account is locked. Please contact Administrator",
        }});
      }

      if(req.body.platform != undefined && req.body.version != undefined){
        if(req.body.platform == 'android' && parseFloat(req.body.version) < 2.8){
          return res.status(500).send({error:{
            status:"error",
            accessToken: null,
            message: "Fusion gurukul app version must be greater than 2.7",
          }});
        }
      }else{
        return res.status(500).send({error:{
          status:"error",
          accessToken: null,
          message: "Please update latest version of app",
        }});
      }
      

      if(req.body.fcmToken != undefined && req.body.fcmToken != ""){
        User.findByIdAndUpdate(user._id,{$set:{lastLoginOn: moment().tz('Asia/Kolkata'),fcmToken:req.body.fcmToken}},(err,data)=>{
          if(err){
          } 
  
        });
      } else {
        User.findByIdAndUpdate(user._id,{$set:{lastLoginOn: moment().tz('Asia/Kolkata')}},(err,data)=>{
          if(err){
          } 
  
        });
      }
      

      res.status(200).send({
        status:"success",
        message : "Login successfully",
        data: {
          id: user._id,
          salutation:user.salutation,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.roles,
          mobile:user.mobile,
          whatsappNo:user.whatsappNo,
          dob:user.dob,
          photo:user.profilephoto,
          gender:user.gender,
          accessToken: token,
          refreshToken: refreshToken,
          lastLoginOn: user.lastLoginOn,
          isAgree:user.isAgree
        }
      });
    });
};

exports.refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body;

  if (requestToken == null) {
    return res.status(500).json({error:{status:"error", message: "Refresh Token is required!" }});
  }

  try {
    let refreshToken = await RefreshToken.findOne({ token: requestToken });

    if (!refreshToken) {
      res.status(500).json({error:{status:"error", message: "Refresh token is not in database!" }});
      return;
    }

    if (RefreshToken.verifyExpiration(refreshToken)) {
      RefreshToken.findByIdAndRemove(refreshToken._id, { useFindAndModify: false }).exec();
      
      res.status(500).json({error:{
        message: "Refresh token was expired. Please make a new signin request",
      }});
      return;
    }

    let newAccessToken = jwt.sign({ id: refreshToken.user._id }, config.secret, {
      expiresIn: config.jwtExpiration,
    });

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    });
  } catch (err) {
    return res.status(500).send({error:{ message: err }});
  }
};
