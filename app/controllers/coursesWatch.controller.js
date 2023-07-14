const db = require("../models");
const { coursesWatch: CoursesWatch ,user:User,course:Course,notificationTrans:NotificationTrans,quizScore:QuizScore, module:Modules,
allocation:Allocation} = db;
const mongoose = require("mongoose");
var _ = require('lodash');
const Sentry = require('@sentry/node');

const agenda = require("../../agenda.js");
const moment = require('moment-timezone');

exports.get = async (req,res)=>{
  let coursesWatch = await CoursesWatch.find({}).populate("courseId").populate("modules.moduleId").populate("modules.questionbank").populate("employeeId").sort({createdAt:-1});

  res.status(200).send({
    status:"success",
    message : "All Courses Watch retrieved",
    data: coursesWatch
});
}

exports.getByEmp = async (req,res)=>{
  let coursesWatch = await CoursesWatch.find({employeeId:req.params.id}).populate("courseId").populate("modules.moduleId").populate("modules.questionbank").populate("employeeId").sort({createdAt:-1});

  res.status(200).send({
    status:"success",
    message : "All Courses Watch retrieved",
    data: coursesWatch
});
}


exports.getByEmpCount = async (req, res) => {
  let coursesWatch = await CoursesWatch.find({employeeId:req.params.id}).populate("courseId").populate("modules.moduleId").populate("modules.questionbank").populate("employeeId").sort({createdAt:-1});
  coursesWatch.sort((a, b) => a.index - b.index);
  let count = [];
  if(coursesWatch.length > 0){
    let data =[];
    for(let cou in coursesWatch){
      let couWatch = await CoursesWatch.aggregate([
        {
          $match: {
            courseId:mongoose.Types.ObjectId(coursesWatch[cou].courseId._id)
          }
        },
        {
          $group: {
            _id: {
              courseId: "$courseId",
            },
            // Aggregate data for each group
            module: { $push: "$modules" }
          }
        },
      
      ]);
      const flatModules = couWatch.map((item) => {
        return {
          ...item,
          module: item.module.flat()
        };
      });
      data.push(flatModules[0].module);
      
      if(cou == (coursesWatch.length - 1)){
        data.map((module) => {
          const isPresent = module.filter(item => item.quizReference !== undefined);
          count.push(isPresent.length);
        });
        res.status(200).send({
          status: "success",
          message: "All Programs Watch retrieved",
          data: count
        });
      }
    }
  }else{
    res.status(200).send({
      status: "success",
      message: "All Programs Watch retrieved",
      data: count
    });
  }
}

exports.getByEmpAndDate = async (req, res) => {
  let coursesWatch = await CoursesWatch.find({employeeId:req.params.id,createdAt: {
    $gte: moment(req.params.date1).tz('Asia/Kolkata'),
    $lt: moment(req.params.date2).tz('Asia/Kolkata')
  }}).populate("courseId").populate("modules.moduleId").populate("modules.questionbank").populate("employeeId").sort({createdAt:-1});

    res.status(200).send({
      status:"success",
      message : "All Courses Watch retrieved",
      data: coursesWatch
  });
}

exports.single = async (req, res) => {
  let coursesWatch = await CoursesWatch.find({_id:req.params.id}).populate("courseId").populate("modules.moduleId").populate("modules.questionbank").populate("employeeId").sort({createdAt:-1});
  res.status(200).send({
    status: "success",
    message: "Single Programs Watch retrieved",
    data: coursesWatch[0]
  });
}

exports.singleCount = async (req, res) => {
  let coursesWatch = await CoursesWatch.findById(req.params.id).populate("courseId").populate("modules.moduleId").populate("modules.questionbank").populate("employeeId").sort({createdAt:-1});
  coursesWatch.modules.sort((a, b) => a.index - b.index); 
  let couWatch = await CoursesWatch.aggregate([
    {
      $match: {
        courseId:mongoose.Types.ObjectId(coursesWatch.courseId._id)
      }
    },
    {
      $unwind: "$modules"
    },
    {
      $group: {
        _id: {
          courseId: "$courseId",
          moduleId: "$modules.moduleId"
        },
        // Aggregate data for each group
        module: { $push: "$modules" }
      }
    },
    
  ]);
  const flattenedData = couWatch.reduce((acc, curr) => [...acc, ...curr.module], []);
    let finalData =[]
    coursesWatch.modules.map((module) => {
      const moduleData = flattenedData.filter((data) => data.moduleId.equals(module.moduleId._id));
      finalData.push(moduleData);
    });

    let count =[];
    finalData.map((module) => {
      const isPresent = module.filter(item => item.quizReference !== undefined);
      count.push(isPresent.length);
    });
  res.status(200).send({
    status: "success",
    message: "Single Programs Watch retrieved",
    data:  count
  });
}

exports.singleForModule = async (req, res) => {
  let coursesWatch = await CoursesWatch.find({
    _id: req.params.id
  }, {
    modules: {
      $elemMatch: {
        moduleId: req.params.moduleId
      }
    }
  }).populate("courseId").populate("modules.moduleId").populate("modules.questionbank").populate("employeeId");

  res.status(200).send({
    status: "success",
    message: "Single Courses Watch retrieved",
    data:  coursesWatch
  });
}

exports.update = async (req, res) => {
  CoursesWatch.findByIdAndUpdate(req.params.id,{$set:req.body}, (err, data) => {
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
          message: "Courses Watch successfully Updated",
      });
  });
}

exports.updateCourseData = async (req, res) => {
  let coursesWatch = await CoursesWatch.find({_id:req.params.id}).populate("courseId").populate("modules.moduleId").populate("modules.questionbank").populate("employeeId").sort({createdAt:-1});
  let watches = 0;
  for(let i =0;i< coursesWatch[0].modules.length;i++){
    if(coursesWatch[0].modules[i].isWatch){
      watches += 1;
    }
  }
  if(coursesWatch[0].modules.length == watches){
    CoursesWatch.findByIdAndUpdate(req.params.id,{$set:req.body},async (err, data) => {
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
          message: "Courses Watch successfully Updated",
      });
    });
  }else{
    res.status(200).send({
      status: "success",
      message: "Courses Watch successfully Not Updated",
  });
  }
}

exports.updateModuleData = async (req, res) => {
  CoursesWatch.findOneAndUpdate({_id:req.params.id,"modules.moduleId":req.params.moduleId},{$set:req.body}, (err, data) => {
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
          message: "Courses Watch successfully Updated",
      });
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

exports.saveCoursesWatch = async (req,res)=>{
  try{
    await agenda.now('courseAllocation',{ data:  JSON.stringify(req.body), userdata: JSON.stringify(req.userData)});

    res.status(200).send({
      status: "success",
      message: `Course allocation is in progress. Notification will be received once process completed`,
    });
  } catch(error){
    Sentry.captureException(new Error('Error '+ error))
    console.log(error);
  }

   
}


exports.delete = async (req,res)=>{
  let courWatch =  await CoursesWatch.findById(req.params.id);
  for(let i in courWatch.modules){
    if(courWatch.modules[i].quizReference != undefined || courWatch.modules[i].quizReference != '' || courWatch.modules[i].quizReference != null){
      await QuizScore.findByIdAndRemove(courWatch.modules[i].quizReference);
    }
    if(i == (courWatch.modules.length - 1)){
      let allCourByEmp = await CoursesWatch.find({employeeId:courWatch.employeeId,isLearningActivity:false}).sort({index:1});
      let crIndex = _.findIndex(allCourByEmp, {'_id': mongoose.Types.ObjectId(req.params.id) });
      if(crIndex == 0){
        if(allCourByEmp.length > crIndex +1){
          await CoursesWatch.findByIdAndUpdate(mongoose.Types.ObjectId(allCourByEmp[crIndex + 1]._id),{$set:{unlock:true}});
        }
      }else if(crIndex > 0 && courWatch.unlock){
        if(allCourByEmp.length > crIndex +1){
          await CoursesWatch.findByIdAndUpdate(mongoose.Types.ObjectId(allCourByEmp[crIndex + 1]._id),{$set:{unlock:true}});
        }
      }
      CoursesWatch.findByIdAndRemove(req.params.id,(err,data)=>{
          if(err){
              res.status(500).send({ status:"error", message: err });
          } else {
              res.status(200).send({
                  status:"success", message : "Course Allocation Deleted Successfully"
              });
          }
      });
    }
  }
}

exports.getCertifiedData = async (req, res) =>{
  let courseWatch = await CoursesWatch.aggregate([
    {
      $match: {
        courseId:mongoose.Types.ObjectId(req.params.id)
      }
    },
    {
      $unwind: "$modules"
    },
    {
      $group: {
        _id: "$_id",
        modules: { $push: "$modules" }
      }
    },
    {
      $project: {
        _id: 0,
        modules: 1
      }
    }
  ]);
 
  const flattenedData = courseWatch.reduce((acc, curr) => [...acc, ...curr.modules], []);
  const isPresent = flattenedData.filter(item => item.quizReference !== undefined);
  let data = [];
  if(isPresent.length > 0){
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
  }else{
    res.status(200).send({
      status: "success",
      message: "Program assign successfully",
      data: []
    });
  }
  
  
}