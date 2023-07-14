const db = require("../models");
const {
  modulesWatch: ModulesWatch,
  module: Module,
  user: User,
  notificationTrans: NotificationTrans,
  quizScore: QuizScore,
  allocation: Allocation
} = db;
const mongoose = require("mongoose");
var _ = require('lodash');
const Sentry = require('@sentry/node');

const agenda = require("../../agenda.js");
const moment = require('moment-timezone');
exports.get = async (req, res) => {
  let modulesWatch = await ModulesWatch.find({}).populate("moduleId").populate("questionbank").populate("employeeId").sort({
    createdAt: -1
  });

  res.status(200).send({
    status: "success",
    message: "All Modules Watch retrieved",
    data: modulesWatch
  });
}

exports.getByEmp = async (req, res) => {
  let modulesWatch = await ModulesWatch.find({
    employeeId: req.params.id
  }).populate("moduleId").populate("questionbank").populate("employeeId").sort({
    createdAt: -1
  });

  res.status(200).send({
    status: "success",
    message: "All Modules Watch retrieved",
    data: modulesWatch
  });
}

exports.getByEmpCount = async (req, res) => {
  let modulesWatch = await ModulesWatch.find({
    employeeId: req.params.id
  }).populate("moduleId").populate("questionbank").populate("employeeId").sort({
    createdAt: -1
  });
  modulesWatch.sort(function (a, b) {
    return a.index - b.index
  });
  let count = [];
  if (modulesWatch.length > 0) {
    for (let i in modulesWatch) {
      let modWatch = await ModulesWatch.find({
        moduleId: modulesWatch[i].moduleId._id
      });
      const isPresent = modWatch.filter(item => item.quizReference !== undefined);
      count.push(isPresent.length);
      if (i == (modulesWatch.length - 1)) {
        res.status(200).send({
          status: "success",
          message: "All Modules Watch retrieved",
          data: count
        });
      }
    }
  } else {
    res.status(200).send({
      status: "success",
      message: "All Modules Watch retrieved",
      data: count
    });
  }


}

exports.getByEmpAndDate = async (req, res) => {
  let modulesWatch = await ModulesWatch.find({
    employeeId: req.params.id,
    createdAt: {
      $gte: moment(req.params.date1).tz('Asia/Kolkata'),
      $lt: moment(req.params.date2).tz('Asia/Kolkata')
    }
  }).populate("moduleId").populate("questionbank").populate("employeeId").sort({
    createdAt: -1
  });

  res.status(200).send({
    status: "success",
    message: "All Modules Watch retrieved",
    data: modulesWatch
  });
}

exports.update = async (req, res) => {
  ModulesWatch.findByIdAndUpdate(req.params.id, {
    $set: req.body
  }, async (err, data) => {
    if (err) {
      res.status(500).send({
        error: {
          status: "error",
          message: err
        }
      });
      return;
    }

    res.status(200).send({
      status: "success",
      message: "Modules Watch successfully Updated",
    });

  });
}

exports.updateIsWatch = async (req, res) => {
  ModulesWatch.findByIdAndUpdate(req.params.id, {
    $set: req.body
  }, async (err, data) => {
    if (err) {
      res.status(500).send({
        error: {
          status: "error",
          message: err
        }
      });
      return;
    }

    let secondModulesWatch = await ModulesWatch.find({
      index: {
        $gt: data.index
      },
      employeeId:data.employeeId
    }).sort({
      index: 1
    });

    if (secondModulesWatch.length > 0) {

      ModulesWatch.findByIdAndUpdate(secondModulesWatch[0]._id, {
        $set: {
          unlock: true
        }
      }, async (err, data) => {
        if (err) {
          res.status(500).send({
            error: {
              status: "error",
              message: err
            }
          });
          return;
        }
        res.status(200).send({
          status: "success",
          message: "Modules Watch successfully Updated",
        });
      });
    } else {
      res.status(200).send({
        status: "success",
        message: "Modules Watch successfully Updated",
      });
    }

  });
}

exports.single = async (req, res) => {
  let modulesWatch = await ModulesWatch.find({
    _id: req.params.id,
    moduleId: req.params.moduleId
  }).populate("moduleId").populate("questionbank").populate("employeeId").sort({
    createdAt: -1
  });
  res.status(200).send({
    status: "success",
    message: "Single Modules Watch retrieved",
    data: modulesWatch[0]
  });
}

// exports.getModuleWatchesByEmp = (req,res)=>{
//   const empId = mongoose.Types.ObjectId(req.params.id);
//   ModulesWatch.aggregate([{$match:{employeeId:empId}},{$lookup: {from: 'modules',localField: 'moduleId',foreignField: '_id',as: 'moduleDetails'}},{$lookup: {from: 'users',localField: 'employeeId',foreignField: '_id',as: 'userDetails'}},{
//     $group:
//     {
//       _id:"$employeeId",
//       "participantsCount":{$sum:1},
//       "module":{$push:"$moduleDetails"},
//       "user":{$push:"$userDetails"},
//       "createdAt":{$push:"$createdAt"}
//     }
// },{$sort:{createdAt:-1}}],(err,data)=>{
//       if(err){
//           res.status(500).send({ status:"error", message: err });
//       } else {
//           res.status(200).send({
//               status:"success",
//               message : "All ModulesWatches retrieved",
//               data: data
//           });
//       }
//   });
// }

// exports.getModuleWatchesByEmpAndModule = (req,res)=>{
//   const empId = mongoose.Types.ObjectId(req.params.id1);
//   const moduleId = mongoose.Types.ObjectId(req.params.id2);
//   ModulesWatch.aggregate([{$match:{employeeId:empId,moduleId:moduleId}},{$lookup: {from: 'modules',localField: 'moduleId',foreignField: '_id',as: 'moduleDetails'}},{$lookup: {from: 'users',localField: 'employeeId',foreignField: '_id',as: 'userDetails'}},{
//     $group:
//     {
//       _id:"$employeeId",
//       "participantsCount":{$sum:1},
//       "module":{$push:"$moduleDetails"},
//       "user":{$push:"$userDetails"},
//       "createdAt":{$push:"$createdAt"},
//       "moduleWatch":{$push:"$moduleWatchTime"}
//     }
// },{$sort:{createdAt:-1}}],(err,data)=>{
//       if(err){
//           res.status(500).send({ status:"error", message: err });
//       } else {
//           res.status(200).send({
//               status:"success",
//               message : "All ModulesWatches retrieved",
//               data: data
//           });
//       }
//   });
// }

exports.saveModulesWatch = async (req, res) => {
  try{
    await agenda.now('moduleAllocation',{ data:  JSON.stringify(req.body), userdata: JSON.stringify(req.userData)});

    res.status(200).send({
      status: "success",
      message: `Module allocation is in progress. Notification will be received once process completed`,
    });
  } catch(error){
    Sentry.captureException(new Error('Error '+ error))
    console.log(error);
  }

}

exports.getCertifiedData = async (req, res) => {
  let modWatch = await ModulesWatch.find({moduleId: req.params.id});
  const isPresent = modWatch.filter(item => item.quizReference !== undefined);
  let data = [];
  if (isPresent.length > 0) {
    await Promise.all(isPresent.map(async (isP) => {
      let quizScore = await QuizScore.findById(isP.quizReference).populate("quizId").populate("employeeId");
      quizScore.examMili = ((quizScore.examTime.split('.') * 60000) + (quizScore.examTime.split('.')[1] * 1000));
      data.push(quizScore);
    }));
    data.sort(function (a, b) {
      if (a.examMili > b.examMili) return 1;
      if (a.examMili < b.examMili) return -1;
      if (a.score > b.score) return -1;
      if (a.score < b.score) return 1;
    });
    res.status(200).send({
      status: "success",
      message: "Program assign successfully",
      data: data
    });
  } else {
    res.status(200).send({
      status: "success",
      message: "Program assign successfully",
      data: []
    });
  }


}

exports.delete = async (req, res) => {
  let modWatch = await ModulesWatch.findById(req.params.id);
  await QuizScore.findByIdAndRemove(modWatch.quizReference);
  let allModByEmp = await ModulesWatch.find({
    employeeId: modWatch.employeeId,
    isLearningActivity: false
  }).sort({
    index: 1
  });
  let mrIndex = _.findIndex(allModByEmp, {
    '_id': mongoose.Types.ObjectId(req.params.id)
  });
  if (mrIndex == 0) {
    if(allModByEmp.length > mrIndex +1){
      await ModulesWatch.findByIdAndUpdate(mongoose.Types.ObjectId(allModByEmp[mrIndex + 1]._id), {
        $set: {
          unlock: true
        }
      });
    }
  } else if (mrIndex > 0 && modWatch.unlock) {
    if(allModByEmp.length > mrIndex +1){
      await ModulesWatch.findByIdAndUpdate(mongoose.Types.ObjectId(allModByEmp[mrIndex + 1]._id), {
        $set: {
          unlock: true
        }
      });
    }
  }
  ModulesWatch.findByIdAndRemove(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send({
        status: "error",
        message: err
      });
    } else {
      res.status(200).send({
        status: "success",
        message: "Module Allocation Deleted Successfully"
      });
    }
  });
}