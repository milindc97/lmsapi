const db = require("../models");
const { questionBanksWatch: QuestionBanksWatch ,user:User,notificationTrans:NotificationTrans} = db;
const mongoose = require("mongoose");

exports.get = async (req,res)=>{
  let questionBanksWatch = await QuestionBanksWatch.find({}).populate("questionbank").populate("employeeId").sort({createdAt:-1});

  res.status(200).send({
    status:"success",
    message : "All Question Banks Watch retrieved",
    data: questionBanksWatch
});
}

exports.getByEmp = async (req,res)=>{
  let questionBanksWatch = await QuestionBanksWatch.find({employeeId:req.params.id}).populate("questionbank").populate("employeeId").sort({createdAt:-1});

  res.status(200).send({
    status:"success",
    message : "All Question Banks Watch retrieved",
    data: questionBanksWatch
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

exports.saveQuestionBanksWatch = (req,res)=>{
  let ops = []
    req.body.assignedQuestionBanks.forEach(function (prg) {
        ops.push({
            "replaceOne": {
                "filter": {
                    "questionbank": prg.questionbank,
                    "employeeId": prg.employeeId
                },
                "replacement": prg,
                "upsert": true
            }
        });
    });
    QuestionBanksWatch.bulkWrite(ops, function (err, r) {
        if (err) {
            res.status(500).send({
                status: "error",
                message: err
            });
            return;
        } else {
          res.status(200).send({
            status: "success",
            message: "Question Bank assign successfully",
            data: r
          });
          return;
           

        }
    });
 
}
