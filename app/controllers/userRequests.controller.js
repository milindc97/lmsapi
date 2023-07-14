const db = require("../models");
const {
  userRequests: UserRequests,
  user: User
} = db;
var bcrypt = require("bcryptjs");
var axios = require('axios');
const moment = require('moment-timezone');

exports.createUserRequests = (req, res) => {
  const userRequests = new UserRequests({
    employeeCode: req.body.employeeCode,
    salutation: req.body.salutation,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    mobile: req.body.mobile,
    dob: req.body.dob,
    gender: req.body.gender,
    department: req.body.department,
    state:req.body.state,
    cluster:req.body.cluster,
    branch:req.body.branch,
    designation:req.body.designation,
    status: 0
  });
  User.find({employeeCode:req.body.employeeCode},(err,Udata)=>{ 
    if(Udata.length > 0){
      res.status(200).send({ status: "error", message: "Employee Code Already Exist. Please enter another Employee Code" });
    }else{
      userRequests.save((err, data) => {
        if (err) {
          res.status(500).send({
            message: err
          });
          return;
        }
    
        res.status(200).send({
          status: "success",
          message: "Please wait! Admin will approve your account.",
          data: data
    
        });
      });
    }
  })
  
};


exports.getAllUserRequests = (req, res) => {


  UserRequests.find({}, (err, data) => {
    if (err) {
      res.status(500).send({
        status: "error",
        message: err
      });
    } else {
      res.status(200).send({
        status: "success",
        message: "All User Requests retrieved",
        data: data
      });
    }
  }).sort({
    createdAt: -1
  });
}

exports.getPendingUserRequests = (req, res) => {


  UserRequests.find({
    status: 0
  }, (err, data) => {
    if (err) {
      res.status(500).send({
        status: "error",
        message: err
      });
    } else {
      res.status(200).send({
        status: "success",
        message: "All User Requests retrieved",
        data: data
      });
    }
  }).sort({
    createdAt: -1
  });
}

exports.getSuccessUserRequests = (req, res) => {


  UserRequests.find({
    status: 1
  }, (err, data) => {
    if (err) {
      res.status(500).send({
        status: "error",
        message: err
      });
    } else {
      res.status(200).send({
        status: "success",
        message: "All User Requests retrieved",
        data: data
      });
    }
  }).sort({
    createdAt: -1
  });
}
exports.getRejectedUserRequests = (req, res) => {


  UserRequests.find({
    status: 2
  }, (err, data) => {
    if (err) {
      res.status(500).send({
        status: "error",
        message: err
      });
    } else {
      res.status(200).send({
        status: "success",
        message: "All User Requests retrieved",
        data: data
      });
    }
  }).sort({
    createdAt: -1
  });
}

exports.getOldUserRequests = (req, res) => {


  UserRequests.find({
    status: {
      $ne: 0
    }
  }, (err, data) => {
    if (err) {
      res.status(500).send({
        status: "error",
        message: err
      });
    } else {
      res.status(200).send({
        status: "success",
        message: "All User Requests retrieved",
        data: data
      });
    }
  }).sort({
    createdAt: -1
  });
}



exports.singleUserRequest = (req, res) => {
  UserRequests.findById(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send({
        status: "error",
        message: err
      });
    } else {
      res.status(200).send({
        status: "success",
        message: "Single User Request retrieved",
        data: data
      });
    }
  });
}

exports.countByStatus = (req, res) => {
  UserRequests.find({
    status: 0
  }, (err, pending) => {
    UserRequests.find({
      status: 1
    }, (err, success) => {
      UserRequests.find({
        status: 2
      }, (err, reject) => {
        res.status(200).send({
          status: "success",
          message: "All User Requests retrieved",
          pending: pending,
          success: success,
          reject: reject
        });
      });
    });
  });
  // UserRequests.aggregate([{
  //   "$group": {
  //     _id: "$status",
  //     count: {
  //       $sum: 1
  //     }
  //   }
  // }], (err, data) => {
  //   if (err) {
  //     res.status(500).send({
  //       status: "error",
  //       message: err
  //     });
  //   } else {
  //     data.sort(compare);
  //     res.status(200).send({
  //       status: "success",
  //       message: "All User Requests retrieved",
  //       data: data
  //     });
  //   }
  // })

  // function compare(a, b) {
  //   if (a._id < b._id) {
  //     return -1;
  //   }
  //   if (a._id > b._id) {
  //     return 1;
  //   }
  //   return 0;
  // }
}

exports.updateStatusUserRequests = (req, res) => {
  UserRequests.findByIdAndUpdate(req.params.id, {$set: {
      status: req.body.status,
      remark: req.body.remark
    }}, (err, data) => {
    if (err) {
      res.status(500).send({
        status: "error",
        message: err
      });
      return;
    }
    if (req.body.status == 1) {
      User.find({employeeCode:data.employeeCode},(err, dt)=>{
        if(dt.length > 0){
          res.status(200).send({ status: "error", message: "Employee Code Already Exist" });
          return;
        } else {
          const user = new User({
            employeeCode: data.employeeCode,
            employeeId: 0,
            salutation: data.salutation,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: bcrypt.hashSync(data.password, 8),
            mobile: data.mobile,
            dob: data.dob,
            gender: data.gender,
            roles: "user",
            department: data.department,
            status: 1,
            stateEmp:data.state,
            cluster:data.cluster,
            branch:data.branch,
            designation:data.designation
          });
          user.save((err,uData) => {
            if (err) {
              res.status(500).send({
                message: err
              });
              return;
            }

            var data = JSON.stringify({
              "filetype": 2,
              "msisdn": [uData.mobile],
              "language": 0,
              "credittype": 8,
              "senderid": "FUSION",
              "templateid": 114,
              "message": "Team, Learn more about Fusion & it's business, Download Learning App LMS, Login via Registered Mobile No & Password 123456. Fusion Microfinance",
              "ukey": "4sgvVRy1D1b1PvpdfTuj8pA8f",
              "isschd": false,
              "schddate": "",
              "dlttemplateid":"1707164006092761682"
            });

            var config = {
              method: 'post',
              url: 'http://125.16.147.178/VoicenSMS/webresources/CreateSMSCampaignPost',
              headers: {
                'Content-Type': 'application/json'
              },
              data: data
            };

            axios(config)
              .then(function (response) {
                
              })
              .catch(function (error) {
              });


              let notTrnasAr = [];
              notTrnasAr.push({
                userId: uData._id,
                title: "Approved Employee Registration",
                message: 'Your Employee registration request has been approved. Login to access LMS.',
                image: uData.profilephoto,
                createdAt: moment().tz('Asia/Kolkata'),
                status: 0
              });
              NotificationTrans.insertMany(notTrnasAr);
            res.status(200).send({
              status: "success",
              message: "User Requests status updated successfully",
              data: data
            });
          });
        }
      });
    } else {

      var data = JSON.stringify({
        "filetype": 2,
        "msisdn": [data.mobile],
        "language": 0,
        "credittype": 8,
        "senderid": "FUSION",
        "templateid": 114,
        "message": "Team, Learn more about Fusion & it's business, Download Learning App LMS, Login via Registered Mobile No & Password 123456. Fusion Microfinance",
        "ukey": "4sgvVRy1D1b1PvpdfTuj8pA8f",
        "isschd": false,
        "schddate": "",
        "dlttemplateid":"1707164006092761682"
      });

      var config = {
        method: 'post',
        url: 'http://125.16.147.178/VoicenSMS/webresources/CreateSMSCampaignPost',
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      };

      axios(config)
        .then(function (response) {
        })
        .catch(function (error) {
        });

        let notTrnasAr = [];
        notTrnasAr.push({
          userId: req.params.id,
          title: "Rejected Employee Registration",
          message: 'Employee registration request has been rejected. Click to view details.',
          image: dt[0].profilephoto,
          createdAt: moment().tz('Asia/Kolkata'),
          status: 0
        });
        NotificationTrans.insertMany(notTrnasAr);
      res.status(200).send({
        status: "success",
        message: "User Requests status updated successfully",
        data: data
      });
    }

  });
}

exports.deleteUserRequests = (req, res) => {
  UserRequests.findByIdAndRemove(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send({
        status: "error",
        message: err
      });
    } else {
      res.status(200).send({
        status: "success",
        message: "User Requests Deleted Successfully"
      });
    }
  });
}