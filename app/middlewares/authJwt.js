const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const moment = require('moment-timezone');
const { TokenExpiredError } = jwt;


const User = db.user;
const Role = db.role;
const Audit = db.audit;

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res.status(401).send({ message: "Unauthorized! Access Token was expired!" });
  }

  return res.sendStatus(401).send({ message: "Unauthorized!" });
}

verifyToken = (req, res, next) => {
  let token =  (req.params.token == "" || req.params.token == undefined || req.params.token == null) ? req.headers["x-access-token"] : req.params.token;

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, config.secret, async (err, decoded) => {
    if (err) {
      return catchError(err, res);
    }
    
    req.userId = decoded.id;
    req.userData = await User.findById(req.userId);
    next();
  });
};

isAdmin = (req, res, next) => {
  
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if(user.roles != "admin"){
      res.status(403).send({ message: "Require Admin Role!" });
      return;
    } else {
      next();
    }
  });
};

storeAccessData = (req, res, next) => {
  
  let token =  (req.params.token == "" || req.params.token == undefined || req.params.token == null) ? req.headers["x-access-token"] : req.params.token;

  const audit = new Audit({
    userId: req.userId,
    url: req.url,
    ip:req.socket.remoteAddress,
    token:token,
    createdAt: moment().tz('Asia/Kolkata')
  });
  
  audit.save();
  next();
  
};



const authJwt = {
  verifyToken,
  isAdmin,
  storeAccessData
};
module.exports = authJwt;