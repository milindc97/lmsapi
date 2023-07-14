const db = require("../models");
const {
  programsWatch: ProgramsWatch,
  user: User,
  notificationTrans: NotificationTrans,
  quizScore: QuizScore,
  allocation: Allocation,
  program:Program,
  course:Courses
} = db;
const mongoose = require("mongoose");
var _ = require('lodash');

var forAsync = require('for-async');  // Common JS, or

const Sentry = require('@sentry/node');

const agenda = require("../../agenda.js");
const moment = require('moment-timezone');

exports.get = async (req, res) => {
  let programsWatch = await ProgramsWatch.find({isLearningActivity:false}).populate("programId").populate("courses.courseId").populate({path:"courses.module.moduleId",populate:{path:"questionbank"}}).populate("employeeId").sort({
    createdAt: -1
  });

  res.status(200).send({
    status: "success",
    message: "All Programs Watch retrieved",
    data: programsWatch
  });
}

exports.update = async (req, res) => {
  ProgramsWatch.findByIdAndUpdate(req.params.id,{$set:req.body}, (err, data) => {
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
          message: "Programs Watch successfully Updated",
      });
  });
}

exports.updateProgramData = async (req, res) => {
  let programsWatch = await ProgramsWatch.findById(req.params.id).populate("programId").populate("courses.courseId").populate({path:"courses.module.moduleId",populate:{path:"questionbank"}}).populate("employeeId");
  let watches = 0;
  for(let i =0;i< programsWatch.courses.length;i++){
    if(programsWatch.courses[i].isWatch){
      watches += 1;
    }
  }
  
  
  
  if(programsWatch.courses.length == watches){
    ProgramsWatch.findByIdAndUpdate(req.params.id,{$set:req.body},async (err, data) => {
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
        message: "Programs Watch successfully Updated",
      });
    });
  }else{
    res.status(200).send({
      status: "success",
      message: "Programs Watch successfully Not Updated",
    });
  }
}

exports.updateCourseData = async (req, res) => {
  let programsWatch = await ProgramsWatch.find({
    _id: req.params.id
  }, {
    courses: {
      $elemMatch: {
        courseId: req.params.courseId
      }
    }
  }).populate("programId").populate("courses.courseId").populate({path:"courses.module.moduleId",populate:{path:"questionbank"}}).populate("employeeId").sort({"courses.0.module.index":1});
  let watches = 0;
  for(let i =0;i< programsWatch[0].courses[0].module.length;i++){
    if(programsWatch[0].courses[0].module[i].isWatch){
      watches += 1;
    }
  }
  if(programsWatch[0].courses[0].module.length == watches){
    ProgramsWatch.findOneAndUpdate({_id:req.params.id,"courses.courseId":req.params.courseId},{$set:req.body}, (err, data) => {
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
          message: "Programs Watch successfully Updated",
      });
  });
  }else{
    res.status(200).send({
      status: "success",
      message: "Programs Watch successfully Not Updated",
  });
  }
  
}

exports.updateCourse = async (req, res) => {
  ProgramsWatch.findOneAndUpdate({_id:req.params.id,"courses.courseId":req.params.courseId},{$set:req.body}, (err, data) => {
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
          message: "Programs Watch successfully Updated",
      });
  });
  
}

exports.updateModuleData = async (req, res) => {
  
  ProgramsWatch.findOneAndUpdate({_id:req.params.id,"courses.courseId":req.params.courseId,"courses.module.moduleId":req.params.moduleId},{$set:req.body}, (err, data) => {
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
          message: "Programs Watch successfully Updated",
          data:data
      });
  });
}

exports.getByEmp = async (req, res) => {
  let programsWatch = await ProgramsWatch.find({
    employeeId: req.params.id,isLearningActivity:false
  }).populate("programId").populate("courses.courseId").populate({path:"courses.module.moduleId",populate:{path:"questionbank"}}).populate("employeeId").sort({
    createdAt: -1
  });

  res.status(200).send({
    status: "success",
    message: "All Programs Watch retrieved",
    data: programsWatch
  });
}

exports.getByEmpCount = async (req, res) => {
  let programsWatch = await ProgramsWatch.find({
    employeeId: req.params.id,isLearningActivity:false
  }).populate("programId").populate("courses.courseId").populate({path:"courses.module.moduleId",populate:{path:"questionbank"}}).populate("employeeId").sort({
    createdAt: -1
  });
  programsWatch.sort((a, b)=>{return a.index - b.index});
  let count = [];
  if(programsWatch.length > 0){
    for(let prg in programsWatch){
      let prgWatch = await ProgramsWatch.aggregate([
        {
          $match: {
            programId:mongoose.Types.ObjectId(programsWatch[prg].programId._id)
          }
        },
        {
          $project: {
            modules: {
              $reduce: {
                input: "$courses",
                initialValue: [],
                in: { $concatArrays: ["$$value", "$$this.module"] }
              }
            }
          }
        }
      ]);
      const flattenedData = prgWatch.reduce((acc, curr) => [...acc, ...curr.modules], []);
      
      const isPresent = flattenedData.filter(item => item.quizReference !== undefined);
      count.push(isPresent.length);
      if(prg == (programsWatch.length - 1)){
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
  let programsWatch = await ProgramsWatch.find({
    employeeId: req.params.id, 
    isLearningActivity:false,
    createdAt: {
      $gte: moment(req.params.date1).tz('Asia/Kolkata'),
      $lt: moment(req.params.date2).tz('Asia/Kolkata')
  }
  }).populate("programId").populate("courses.courseId").populate({path:"courses.module.moduleId",populate:{path:"questionbank"}}).populate("employeeId").sort({
    createdAt: -1
  });

  res.status(200).send({
    status: "success",
    message: "All Programs Watch retrieved",
    data: programsWatch
  });
}

exports.single = async (req, res) => {
  let programsWatch = await ProgramsWatch.findById(req.params.id).populate("programId").populate("courses.courseId").populate({path:"courses.module.moduleId",populate:{path:"questionbank"}}).populate("employeeId");
  res.status(200).send({
    status: "success",
    message: "Single Programs Watch retrieved",
    data: programsWatch
  });
}

exports.singleCount = async (req, res) => {
  let programsWatch = await ProgramsWatch.findById(req.params.id).populate("programId").populate("courses.courseId").populate({path:"courses.module.moduleId",populate:{path:"questionbank"}}).populate("employeeId").lean();
  programsWatch.courses.sort((a, b) => a.index - b.index);
  let prgWatch = await ProgramsWatch.aggregate([
    {
      $match: {
        programId:mongoose.Types.ObjectId(programsWatch.programId._id)
      }
    },
    {
      $unwind: "$courses"
    },
    {
      $group: {
        _id: {
          programId: "$programId",
          courseId: "$courses.courseId"
        },
        // Aggregate data for each group
        module: { $push: "$courses.module" }
      }
    },
    
  ]);
  let data =[];
  programsWatch.courses.map((module) => {
    let index = prgWatch.findIndex(item => item._id.courseId.toString() === module.courseId._id.toString());
    let flatModuleArray = prgWatch[index].module.reduce((acc, curr) => [...acc, ...curr], []);;
    data.push(flatModuleArray);
  });
    let count =[];
    data.map((module) => {
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
  let programsWatch = await ProgramsWatch.find({
    _id: req.params.id
  }, {
    courses: {
      $elemMatch: {
        courseId: req.params.courseId
      }
    }
  }).populate("programId").populate("courses.courseId").populate({path:"courses.module.moduleId",populate:{path:"questionbank"}}).populate("employeeId").sort({"courses.0.module.index":1});
    
  res.status(200).send({
    status: "success",
    message: "Single Programs Watch retrieved",
    data:  programsWatch[0].courses[0]
  });
}

exports.singleForModuleCount = async (req, res) => {
  let programsWatch = await ProgramsWatch.find({
    _id: req.params.id
  }, {
    courses: {
      $elemMatch: {
        courseId: req.params.courseId
      }
    }
  }).populate("programId").populate("courses.courseId").populate({path:"courses.module.moduleId",populate:{path:"questionbank"}}).populate("employeeId").sort({"courses.0.module.index":1});
  programsWatch[0].courses[0].module.sort(function(a, b){return a.index - b.index});
  let program = await ProgramsWatch.findById(req.params.id);
  let prgWatch = await ProgramsWatch.aggregate([
    {
      $match: {
        programId:mongoose.Types.ObjectId(program.programId)
      }
    },
    {
      $project: {
        modules: {
          $reduce: {
            input: "$courses",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this.module"] }
          }
        }
      }
    }
  ]);
  const flattenedData = prgWatch.reduce((acc, curr) => [...acc, ...curr.modules], []);
    let finalData =[]
    programsWatch[0].courses[0].module.map((module) => {
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

exports.singleForModuleDetails = async (req, res) => {
  let programsWatch = await ProgramsWatch.aggregate([{$match:{_id:mongoose.Types.ObjectId(req.params.id)}},
  {$unwind:"$courses"},{$match:{"courses.courseId":mongoose.Types.ObjectId(req.params.courseId)}},
  {$unwind:"$courses.module"},{$match:{"courses.module.moduleId":mongoose.Types.ObjectId(req.params.moduleId)}}]);
  
  res.status(200).send({
    status: "success",
    message: "Single Programs Watch retrieved",
    data: programsWatch
  });
  // let programsWatch = await ProgramsWatch.find({
  //   _id: req.params.id,"courses.courseId":req.params.courseId
  // },{
  //     "courses.module":{
  //       $elemMatch: {
  //         moduleId: req.params.moduleId
  //       },
  //     }
  // }).populate("programId").populate("courses.courseId").populate({path:"courses.module.moduleId",populate:{path:"questionbank"}}).populate("employeeId");
  // res.status(200).send({
  //   status: "success",
  //   message: "Single Programs Watch retrieved",
  //   data: programsWatch
  // });
}

exports.deleteByProgram = (req,res)=>{
  ProgramsWatch.findOneAndRemove({programId:req.params.id},(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success", message : "Programs Watch Deleted Successfully"
          });
      }
  });
}


exports.saveProgramsWatch =async  (req, res) => {
  try{
    await agenda.now('programAllocation',{ data:  JSON.stringify(req.body), userdata: JSON.stringify(req.userData)});

    res.status(200).send({
      status: "success",
      message: `Program allocation is in progress. Notification will be received once process completed`,
    });
  } catch(error){
    Sentry.captureException(new Error('Error '+ error))
    console.log(error);
  }
}

exports.delete = async (req,res)=>{
  let prgWatch =  await ProgramsWatch.findById(req.params.id);
  console.log(prgWatch);
  for(let i in prgWatch.courses){
    for(let j in prgWatch.courses[i].module){
      if(prgWatch.courses[i].module[j].quizReference != undefined || prgWatch.courses[i].module[j].quizReference != '' || prgWatch.courses[i].module[j].quizReference != null){
        await QuizScore.findByIdAndRemove(prgWatch.courses[i].module[j].quizReference);
      }
    }
    if(i == (prgWatch.courses.length - 1)){
      let allPrgByEmp = await ProgramsWatch.find({employeeId:prgWatch.employeeId,isLearningActivity:false}).sort({index:1});
      let prIndex = _.findIndex(allPrgByEmp, {'_id': mongoose.Types.ObjectId(req.params.id) });
      if(prIndex == 0){
        if(allPrgByEmp.length > prIndex +1){
          await ProgramsWatch.findByIdAndUpdate(mongoose.Types.ObjectId(allPrgByEmp[prIndex + 1]._id),{$set:{unlock:true}});
        }
      }else if(prIndex > 0 && prgWatch.unlock){
        if(allPrgByEmp.length > prIndex +1){
          await ProgramsWatch.findByIdAndUpdate(mongoose.Types.ObjectId(allPrgByEmp[prIndex + 1]._id),{$set:{unlock:true}});
        }
      }
      ProgramsWatch.findByIdAndRemove(req.params.id,(err,data)=>{
          if(err){
              res.status(500).send({ status:"error", message: err });
          } else {
              res.status(200).send({
                  status:"success", message : "Program Allocation Deleted Successfully"
              });
          }
      });
    }
  }
  
}


exports.getCertifiedData = async (req, res) =>{
  let prgWatch = await ProgramsWatch.aggregate([
    {
      $match: {
        programId:mongoose.Types.ObjectId(req.params.id)
      }
    },
    {
      $project: {
        modules: {
          $reduce: {
            input: "$courses",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this.module"] }
          }
        }
      }
    }
  ]);
  const flattenedData = prgWatch.reduce((acc, curr) => [...acc, ...curr.modules], []);
  
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