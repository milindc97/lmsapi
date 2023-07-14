const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateUsernameOrEmail = async (req, res, next) => {
    // Email
    if(req.body.roles == "admin"){
      let user = await User.findOne({email: req.body.email}).countDocuments();
      if(user > 0){
        res.status(500).send({ message: "Failed! Email is already in use!" });
        return;
      }

      next();
    } else{
      let user = await User.findOne({$or:[{email: req.body.email},{employeeCode:req.body.employeeCode}]}).countDocuments();
      if(user > 0){
        res.status(500).send({ message: "Failed! Email Or Employee Code is already in use!" });
        return;
      }

      next();
    }
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(500).send({
          message: `Failed! Role ${req.body.roles[i]} does not exist!`
        });
        return;
      }
    }
  }

  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted
};

module.exports = verifySignUp;