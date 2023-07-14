const db = require("../models");
const {
  learningActivityWatch: LearningActivityWatch,
  user: User,
  notificationTrans: NotificationTrans,
  quizScore: QuizScore,
  allocation: Allocation,
  program: Program
} = db;
const mongoose = require("mongoose");
var _ = require('lodash');

var forAsync = require('for-async'); // Common JS, or
const LearningActivityModule = require("../models/learningActivityModule.model");

const Sentry = require('@sentry/node');

const agenda = require("../../agenda.js");
const moment = require('moment-timezone');

exports.update = async (req, res) => {
  LearningActivityWatch.findByIdAndUpdate(req.params.id, {
    $set: req.body
  }, (err, data) => {
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

exports.getByEmp = async (req, res) => {
  let learningActivityWatch = await LearningActivityWatch.find({
    employeeId: req.params.id
  }).populate({
    path: 'programId',
    populate: {
      path: 'courses.courseId',
      populate:{
        path: 'modules.moduleId',
        populate:{
          path: 'questionbank'
        }
      }
    }
  }).populate("employeeId").sort({
    createdAt: -1
  });

  res.status(200).send({
    status: "success",
    message: "All Programs Watch retrieved",
    data: learningActivityWatch
  });
}

exports.getByEmpCount = async (req, res) => {
  let learningActivityWatch = await LearningActivityWatch.find({
    employeeId: req.params.id,
    isLearningActivity: false
  }).populate("programId").populate("employeeId").sort({
    createdAt: -1
  });
  learningActivityWatch.sort((a, b) => {
    return a.index - b.index
  });
  let count = [];
  if (learningActivityWatch.length > 0) {
    for (let prg in learningActivityWatch) {
      let prgWatch = await LearningActivityWatch.aggregate([{
          $match: {
            programId: mongoose.Types.ObjectId(learningActivityWatch[prg].programId._id)
          }
        },
        {
          $project: {
            modules: {
              $reduce: {
                input: "$courses",
                initialValue: [],
                in: {
                  $concatArrays: ["$$value", "$$this.module"]
                }
              }
            }
          }
        }
      ]);
      const flattenedData = prgWatch.reduce((acc, curr) => [...acc, ...curr.modules], []);

      const isPresent = flattenedData.filter(item => item.quizReference !== undefined);
      count.push(isPresent.length);
      if (prg == (learningActivityWatch.length - 1)) {
        res.status(200).send({
          status: "success",
          message: "All Programs Watch retrieved",
          data: count
        });
      }
    }
  } else {
    res.status(200).send({
      status: "success",
      message: "All Programs Watch retrieved",
      data: count
    });
  }


}

exports.getByEmpAndDate = async (req, res) => {
  let learningActivityWatch = await LearningActivityWatch.find({
    employeeId: req.params.id,
    createdAt: {
      $gte: moment(req.params.date1).tz('Asia/Kolkata'),
      $lt: moment(req.params.date2).tz('Asia/Kolkata')
    }
  }).populate({
    path: 'programId',
    populate: {
      path: 'courses.courseId',
      populate:{
        path: 'modules.moduleId',
        populate:{
          path: 'questionbank'
        }
      }
    }
  }).populate("employeeId").sort({
    createdAt: -1
  });

  res.status(200).send({
    status: "success",
    message: "All Programs Watch retrieved",
    data: learningActivityWatch
  });
}

exports.single = async (req, res) => {
  let learningActivityWatch = await LearningActivityWatch.findById(req.params.id).populate({
    path: 'programId',
    populate: {
      path: 'courses.courseId',
      populate:{
        path: 'modules.moduleId',
        populate:{
          path: 'questionbank'
        }
      }
    }
  }).populate("employeeId");
  res.status(200).send({
    status: "success",
    message: "Single Programs Watch retrieved",
    data: learningActivityWatch
  });
}

exports.deleteByProgram = (req, res) => {
  LearningActivityWatch.findOneAndRemove({
    programId: req.params.id
  }, (err, data) => {
    if (err) {
      res.status(500).send({
        status: "error",
        message: err
      });
    } else {
      res.status(200).send({
        status: "success",
        message: "Programs Watch Deleted Successfully"
      });
    }
  });
}



exports.saveLearningActivityWatch = async (req, res) => {
  try{
    await agenda.now('learningActivityAllocation',{ data:  JSON.stringify(req.body), userdata: JSON.stringify(req.userData)});

    res.status(200).send({
      status: "success",
      message: `Learning Activity allocation is in progress. Notification will be received once process completed`,
    });
  } catch(error){
    Sentry.captureException(new Error('Error '+ error))
    console.log(error);
  }
}

exports.delete = async (req,res)=>{
  let learningActivityWatch =  await LearningActivityWatch.findById(req.params.id).populate({
    path: 'programId',
    populate: {
      path: 'courses.courseId',
      populate:{
        path: 'modules.moduleId',
        populate:{
          path: 'questionbank'
        }
      }
    }
  }).populate("employeeId");
  for(let i in learningActivityWatch.programId?.courses){
    for(let j in learningActivityWatch.programId?.courses[i].courseId?.modules){
      let learningActivityModule = await LearningActivityModule.find({programId:learningActivityWatch.programId?._id,
      courseId:learningActivityWatch.programId?.courses[i].courseId?._id,
      moduleId:learningActivityWatch.programId?.courses[i].courseId?.modules[j].moduleId._id,
      employeeId:learningActivityWatch.employeeId?._id});
      if(learningActivityModule.length > 0){
        await QuizScore.findByIdAndRemove(learningActivityModule[0].quizReference);
        await LearningActivityModule.findByIdAndRemove(learningActivityModule[0]._id);
      }
    }
    if(i == (learningActivityWatch.programId?.courses.length - 1)){
      LearningActivityWatch.findByIdAndRemove(req.params.id,(err,data)=>{
        if(err){
            res.status(500).send({ status:"error", message: err });
        } else {
            res.status(200).send({
                status:"success", message : "Learning Activity Allocation Deleted Successfully"
            });
        }
    });
    }
  }
}