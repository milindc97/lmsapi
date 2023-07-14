const db = require("../models");
const mongoose = require("mongoose");
const {
  course: Courses,
  program: Program,
  module: Module,
  questionBank: QuestionBank,
  programsWatch: ProgramsWatch,
  coursesWatch: CoursesWatch
} = db;

var _ = require('lodash');

exports.createCourse = async (req, res) => {
  let dt = await Courses.find({
    code: req.body.code
  });

  if (dt.length > 0) {
    res.status(200).send({
      status: "error",
      message: "Code Already Exist"
    });
  } else {
    const courses = new Courses(req.body);

    courses.save((err, data) => {
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
        message: "Course created successfully!",
        data: data
      });
    });
  }
};



exports.updateCourse = (req, res) => {
  Courses.findByIdAndUpdate(req.params.id, {
    $set: req.body
  }, (err, data) => {
    if (err) {
      res.status(500).send({
        status: "error",
        message: err
      });
    }
    data.save(err => {
      if (err) {
        res.status(500).send({
          message: err
        });
        return;
      }

      res.status(200).send({
        status: "success",
        message: "Course Updated successfully!"
      });
    });

  });
}

exports.getSingleCourse = async (req, res) => {
  let courses = await Courses.findById(req.params.id).populate("modules.moduleId");
  res.status(200).send({
    status: "success",
    message: "Single Course retrieved",
    data: courses
  });
}

exports.getAll = async (req, res) => {
  let courses = await Courses.find({}).populate("modules.moduleId");
  res.status(200).send({
    status: "success",
    message: "All Courses retrieved",
    data: courses
  });
}

exports.getAllCourse = async (req, res) => {
  let courses = await Courses.find({isLearningActivity:false}).populate("modules.moduleId");
  res.status(200).send({
    status: "success",
    message: "All Courses retrieved",
    data: courses
  });
}

exports.getAllActiveCourse = async (req, res) => {
  let courses = await Courses.find({status: 1,isLearningActivity:false}).populate("modules.moduleId");
  res.status(200).send({
    status: "success",
    message: "All Courses retrieved",
    data: courses
  });
}

exports.getAllInactiveCourse = async (req, res) => {
  let courses = await Courses.find({status: 0,isLearningActivity:false}).populate("modules.moduleId");
  res.status(200).send({
    status: "success",
    message: "All Courses retrieved",
    data: courses
  });
}

exports.getCourseIncrementalCode = (req, res) => {
  Courses.count((err, data) => {
    if (data == 0) {
      res.status(200).send({
        status: "success",
        message: "Incremental Code Created",
        data: {
          code: 1
        }
      });
    } else {
      Courses.findOne({}).sort('-code').exec(function (err, data) {
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


exports.deleteCourse = async (req, res) => {
  let program = await Program.find({"courses.courseId": req.params.id});

  if(program.length > 0){
    for(let i in program){
      await Program.updateOne({_id: program[i]._id}, {$pull: {"courses": {"courseId": req.params.id}}});
    }
  }
  // let programWatch = await ProgramsWatch.find({"courses.courseId": req.params.id});

  // if (programWatch.length > 0) {
  //   for (let j in programWatch) {
  //     await ProgramsWatch.updateOne({_id: programWatch[j]._id}, {$pull: {"courses": {"courseId": req.params.id}}})
  //   }
  // }

  let programWatch = await ProgramsWatch.find({"courses.courseId": req.params.id});
  for(let i in programWatch){
    let sortedA = _.sortBy(programWatch[i].courses, [function(o) { return o.index; }]);
    let crIndex = _.findIndex(sortedA, {'courseId': mongoose.Types.ObjectId(req.params.id) });
    if(crIndex == 0){
      if(sortedA.length > crIndex+1){
        sortedA[crIndex+1].unlock = true;
      }
    }else if(crIndex > 0 && sortedA[crIndex].unlock){
      if(sortedA.length > crIndex+1){
        sortedA[crIndex+1].unlock = true;
      }
    } 
    sortedA.splice(crIndex,1);
    await ProgramsWatch.findByIdAndUpdate( mongoose.Types.ObjectId(programWatch[i]._id), {$set: {"courses":sortedA}});
  }

  let courWatch =  await CoursesWatch.find({courseId: req.params.id});
  
  for(let i in courWatch){
    let allCourByEmp = await CoursesWatch.find({employeeId:courWatch[i].employeeId,isLearningActivity:false}).sort({index:1});
    
    let crIndex = _.findIndex(allCourByEmp, {'courseId': mongoose.Types.ObjectId(req.params.id) });
    if(crIndex == 0){
      if(allCourByEmp.length > crIndex+1){
        await CoursesWatch.findByIdAndUpdate(mongoose.Types.ObjectId(allCourByEmp[crIndex + 1]._id),{$set:{unlock:true}});
      }
    }else if(crIndex > 0 && allCourByEmp[crIndex].unlock){
      if(allCourByEmp.length > crIndex+1){
        await CoursesWatch.findByIdAndUpdate(mongoose.Types.ObjectId(allCourByEmp[crIndex + 1]._id),{$set:{unlock:true}});
      }
    } 
     if(i == (courWatch.length - 1)){
       await CoursesWatch.deleteMany({courseId: req.params.id});
   }
  }

  await Courses.findByIdAndRemove(req.params.id);

  res.status(200).send({
    status: "success",
    message: "Course Deleted Successfully"
  });

}

exports.updateStatusCourse = (req, res) => {
  Courses.findByIdAndUpdate(req.params.id, {
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
        message: "Course status successfully",
        data: data
      });
    }
  });
}

exports.getAllCourseLearningActivity = async (req, res) => {
  let courses = await Courses.find({isLearningActivity:true}).populate("modules.moduleId");
  res.status(200).send({
    status: "success",
    message: "All Courses retrieved",
    data: courses
  });
}

exports.getAllActiveCourseLearningActivity = async (req, res) => {
  let courses = await Courses.find({status: 1,isLearningActivity:true}).populate("modules.moduleId");
  res.status(200).send({
    status: "success",
    message: "All Courses retrieved",
    data: courses
  });
}

exports.getAllInactiveCourseLearningActivity = async (req, res) => {
  let courses = await Courses.find({status: 0,isLearningActivity:true}).populate("modules.moduleId");
  res.status(200).send({
    status: "success",
    message: "All Courses retrieved",
    data: courses
  });
}