const db = require("../models");
const mongoose = require("mongoose");
const {
  program: Program,
  course: Courses,
  module: Module,
  programsWatch: ProgramsWatch
} = db;

var _ = require('lodash');
const LearningActivityModule = require("../models/learningActivityModule.model");
const LearningActivityWatch = require("../models/learningActivityWatch.model");

exports.createProgram = async (req, res) => {
  let dt = await Program.find({
    code: req.body.code
  });

  if (dt.length > 0) {
    res.status(200).send({
      status: "error",
      message: "Code Already Exist"
    });
  } else {
    const program = new Program(req.body);

    program.save((err, data) => {
      if (err) {
        const error = mongooseErrorHandler(err);
        res.status(error.status || 500);
        res.json({
          error: {
            status: "error",
            message: error.message
          }
        });

        return;
      }

      res.status(200).send({
        status: 'success',
        message: "Program created successfully!",
        data: data
      });
    });
  }



};

exports.updateProgram = async (req, res) => {
  Program.findByIdAndUpdate(req.params.id, {
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
      message: "Program successfully Updated",
    });
  });
}


exports.getSingleProgram = async (req, res) => {
  let program = await Program.findById(req.params.id).populate("courses.courseId");
  res.status(200).send({
    status: "success",
    message: "All Programs retrieved",
    data: program
  });
}

exports.getSingleProgramByCode = async (req, res) => {
  const code = parseInt(req.params.id);
  let program = await Program.find({
    code: code
  }).populate("courses.courseId");
  res.status(200).send({
    status: "success",
    message: "All Programs retrieved",
    data: program[0]
  });
}

exports.getAll = async (req, res) => {
  let program = await Program.find({}).populate("courses.courseId");
  res.status(200).send({
    status: "success",
    message: "All Programs retrieved",
    data: program
  });
}

exports.getAllProgram = async (req, res) => {
  let program = await Program.find({
    isLearningActivity: false
  }).populate("courses.courseId");
  res.status(200).send({
    status: "success",
    message: "All Programs retrieved",
    data: program
  });
}

exports.getAllActiveProgram = async (req, res) => {
  let program = await Program.find({
    status: 1,
    isLearningActivity: false
  }).populate("courses.courseId");
  res.status(200).send({
    status: "success",
    message: "All Programs retrieved",
    data: program
  });
}

exports.getAllInactiveProgram = async (req, res) => {
  let program = await Program.find({
    status: 0,
    isLearningActivity: false
  }).populate("courses.courseId");
  res.status(200).send({
    status: "success",
    message: "All Programs retrieved",
    data: program
  });
}

exports.getProgramIncrementalCode = (req, res) => {

  Program.count((err, data) => {
    if (data == 0) {
      res.status(200).send({
        status: "success",
        message: "Incremental Code Created",
        data: {
          code: 1
        }
      });
    } else {
      Program.findOne({}).sort('-code').exec(function (err, data) {
        if (err) {
          res.status(500).send({
            status: "error",
            message: err
          });
        } else {
          let code = {
            code: data.code + 1
          };
          res.status(200).send({
            status: "success",
            message: "Incremental Code Created",
            data: code
          });
        }
      });
    }
  });
}


exports.deleteProgram = async (req, res) => {
  let program = await Program.findById(req.params.id);
  if(program.isLearningActivity){
    await LearningActivityModule.deleteMany({
      programId: req.params.id
    });
    await LearningActivityWatch.deleteMany({
      programId: req.params.id
    });
  }else{
    let prgWatch = await ProgramsWatch.find({
      programId: req.params.id
    });
    for (let i in prgWatch) {
      let allPrgByEmp = await ProgramsWatch.find({
        employeeId: prgWatch[i].employeeId,
        isLearningActivity: false
      }).sort({
        index: 1
      });
  
      let prIndex = _.findIndex(allPrgByEmp, {
        'programId': mongoose.Types.ObjectId(req.params.id)
      });
      if (prIndex == 0) {
        if(allPrgByEmp.length > prIndex +1){
          await ProgramsWatch.findByIdAndUpdate(mongoose.Types.ObjectId(allPrgByEmp[prIndex + 1]._id), {
            $set: {
              unlock: true
            }
          });
        }
      } else if (prIndex > 0 && allPrgByEmp[prIndex].unlock) {
        if(allPrgByEmp.length > prIndex +1){
          await ProgramsWatch.findByIdAndUpdate(mongoose.Types.ObjectId(allPrgByEmp[prIndex + 1]._id), {
            $set: {
              unlock: true
            }
          });
        }
      }
      if (i == (prgWatch.length - 1)) {
        await ProgramsWatch.deleteMany({
          programId: req.params.id
        });
      }
    }
  }
  await Program.findByIdAndRemove(req.params.id);

  res.status(200).send({
    status: "success",
    message: "Program Deleted Successfully"
  });
}


exports.updateStatusProgram = (req, res) => {
  Program.findByIdAndUpdate(req.params.id, {
    $set: {
      status: req.body.status
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
        message: "Program status successfully",
        data: data
      });
    }
  });
}

exports.getAllLearningActivity = async (req, res) => {
  let program = await Program.find({
    isLearningActivity: true
  }).populate("courses.courseId");
  res.status(200).send({
    status: "success",
    message: "All Programs retrieved",
    data: program
  });
}

exports.getAllActiveLearningActivity = async (req, res) => {
  let program = await Program.find({
    status: 1,
    isLearningActivity: true
  }).populate("courses.courseId");
  res.status(200).send({
    status: "success",
    message: "All Programs retrieved",
    data: program
  });
}

exports.getAllInactiveLearningActivity = async (req, res) => {
  let program = await Program.find({
    status: 0,
    isLearningActivity: true
  }).populate("courses.courseId");
  res.status(200).send({
    status: "success",
    message: "All Programs retrieved",
    data: program
  });
}