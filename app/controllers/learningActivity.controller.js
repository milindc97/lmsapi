const db = require("../models");
const mongoose = require("mongoose");
const {
  programsWatch: ProgramsWatch,
  user: User,
  questionBank: QuestionBank,
  learningActivityModule: LearningActivityModule,
  learningActivityWatch: LearningActivityWatch,
  notificationTrans: NotificationTrans,
  quizScore: QuizScore,
  program: Program,
  course: Course
} = db;
const moment = require('moment-timezone');
var _ = require('lodash');


exports.get = async (req, res) => {
  let programsWatch = await ProgramsWatch.find({
    isLearningActivity: true
  }).populate("programId").populate("courses.courseId").populate("courses.module.moduleId").populate("courses.module.questionbank").populate("employeeId").sort({
    index: -1
  });

  res.status(200).send({
    status: "success",
    message: "All Programs Watch retrieved",
    data: programsWatch
  });
}

exports.getByEmp = async (req, res) => {
  let programsWatch = await ProgramsWatch.find({
    employeeId: req.params.id,
    isLearningActivity: true
  }).populate("programId").populate("courses.courseId").populate("courses.module.moduleId").populate("courses.module.questionbank").populate("employeeId").sort({
    createdAt: -1
  });

  res.status(200).send({
    status: "success",
    message: "All Programs Watch retrieved",
    data: programsWatch
  });
}

exports.getByEmpCount = async (req, res) => {
  let learningActivityWatch = await LearningActivityWatch.find({
    employeeId: req.params.id
  }).populate("programId").populate("employeeId").sort({
    createdAt: -1
  });
  let count = [];
  if (learningActivityWatch.length > 0) {
    for (let prg in learningActivityWatch) {
      let prgWatch = await LearningActivityModule.aggregate([{
        $match: {
          programId: mongoose.Types.ObjectId(learningActivityWatch[prg].programId._id),
        }
      }]);
      console.log(prgWatch)
      const isPresent = prgWatch.filter(item => item.quizReference !== undefined);
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

exports.getCourseDoneCount = async (req, res) => {
  let program = await Program.findById(req.params.id);
  let count = [];
  if (program.courses.length > 0) {
    for (let cour in program.courses) {
      let prgWatch = await LearningActivityModule.aggregate([{
        $match: {
          programId: mongoose.Types.ObjectId(req.params.id),
          courseId: mongoose.Types.ObjectId(program.courses[cour].courseId),
        }
      }]);

      const isPresent = prgWatch.filter(item => item.quizReference !== undefined);
      count.push(isPresent.length);
      if (cour == (program.courses.length - 1)) {
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

exports.getModuleDoneCount = async (req, res) => {
  let course = await Course.findById(req.params.courseId);
  let count = [];
  if (course.modules.length > 0) {
    for (let mod in course.modules) {
      let prgWatch = await LearningActivityModule.aggregate([{
        $match: {
          programId: mongoose.Types.ObjectId(req.params.id),
          courseId: mongoose.Types.ObjectId(req.params.courseId),
          moduleId: mongoose.Types.ObjectId(course.modules[mod].moduleId),
        }
      }]);

      const isPresent = prgWatch.filter(item => item.quizReference !== undefined);
      count.push(isPresent.length);
      if (mod == (course.modules.length - 1)) {
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
  let programsWatch = await ProgramsWatch.find({
    employeeId: req.params.id,
    isLearningActivity: true,
    createdAt: {
      $gte: moment(req.params.date1).tz('Asia/Kolkata'),
      $lt: moment(req.params.date2).tz('Asia/Kolkata')
    }
  }).populate("programId").populate("courses.courseId").populate("courses.module.moduleId").populate("courses.module.questionbank").populate("employeeId").sort({
    createdAt: -1
  });

  res.status(200).send({
    status: "success",
    message: "All Programs Watch retrieved",
    data: programsWatch
  });
}

async function quizData(item) {
  let learningActivityModule = await LearningActivityModule.find({
    questionbank: item._id
  }).populate("programId").
  populate("courseId").populate("moduleId").populate("questionbank").populate("quizReference").populate("employeeId");
  let pData = _.groupBy(learningActivityModule, function (item) {
    return item.programId._id;
  });
  let data = [];
  let count = 0;
  _.forEach(pData, function (value, key) {

    pData[count] = _.groupBy(pData[key], function (item) {
      return item.employeeId._id;
    });
    count++;
    data = pData[key];
  });
  return data;
}

exports.getTrainingOfTheDay = async (req, res) => {
  let quiz = await QuestionBank.find({
    isLearningActivity: true,
    status: 1,
    learningLiveDate:{$lte:moment().tz('Asia/Kolkata')}
  }).sort({
    learningLiveDate: -1
  });
  const learningLiveDate = moment(quiz[0].learningLiveDate).tz('Asia/Kolkata');
  const liveDate = moment(quiz[0].learningLiveDate).tz('Asia/Kolkata').add(30, 'minutes');
  const date = moment().tz('Asia/Kolkata');

  if (date > liveDate) {
    let data = [];
    let finaldata = [];
    data = await quizData(quiz[0]);
    data.map(examT => {
      const examEndTime = moment(examT.quizReference.createdAt).tz('Asia/Kolkata');
      if(examT.quizScore >= 70 && (liveDate > examEndTime && examEndTime > learningLiveDate)){
        finaldata.push(examT);
      }
    });
    finaldata.sort(function (a, b) {
      if (a.examTime > b.examTime) return -1;
      if (a.examTime < b.examTime) return 1;

      if (a.quizScore > b.quizScore) return 1;
      if (a.quizScore < b.quizScore) return -1;

      if (moment(a.quizReference.createdAt).tz('Asia/Kolkata') > moment(b.quizReference.createdAt).tz('Asia/Kolkata')) return -1;
      if (moment(a.quizReference.createdAt).tz('Asia/Kolkata') < moment(b.quizReference.createdAt).tz('Asia/Kolkata')) return 1;

    });
    res.status(200).send({
      status: "success",
      message: "Top 100 Winners retrieved",
      data: finaldata,
    });
  } else {
    let data = [];
    let finaldata = [];
    data = await quizData(quiz[1]);
    data.map(examT => {
      const examEndTime = moment(examT.quizReference.createdAt).tz('Asia/Kolkata');
      if(examT.quizScore >= 70 && (liveDate > examEndTime && examEndTime > learningLiveDate)){
        finaldata.push(examT);
      }
    });
    finaldata.sort(function (a, b) {
      if (a.examTime > b.examTime) return -1;
      if (a.examTime < b.examTime) return 1;

      if (a.quizScore > b.quizScore) return 1;
      if (a.quizScore < b.quizScore) return -1;

      if (moment(a.quizReference.createdAt).tz('Asia/Kolkata') > moment(b.quizReference.createdAt).tz('Asia/Kolkata')) return -1;
      if (moment(a.quizReference.createdAt).tz('Asia/Kolkata') < moment(b.quizReference.createdAt).tz('Asia/Kolkata')) return 1;

    });
    res.status(200).send({
      status: "success",
      message: "Top 100 Winners retrieved",
      data: finaldata,
    });
  }



}

exports.top100Winners = async (req, res) => {
  // let programsWatch = await ProgramsWatch.aggregate([{
  //     $match: {
  //       isLearningActivity: true
  //     }
  //   },
  //   {
  //     $unwind: "$courses"
  //   }, {
  //     $unwind: "$courses.module"
  //   },
  //   {
  //     $match: {
  //       "courses.module.questionbank": mongoose.Types.ObjectId(req.params.id),
  //       "courses.module.quizAttended": true
  //     }
  //   },
  //   {
  //     $group: {
  //       _id: "$employeeId",
  //       allData: {
  //         $first: "$$ROOT"
  //       }
  //     }
  //   },
  // ]);
  // let data = [];
  // for (let i in programsWatch) {
  //   let quizScore = await QuizScore.aggregate([{
  //       $match: {
  //         _id: mongoose.Types.ObjectId(programsWatch[i].allData.courses.module.quizReference)
  //       }
  //     },
  //     {
  //       $sort: {
  //         score: -1
  //       }
  //     },
  //     {
  //       $lookup: {
  //         from: 'programs',
  //         localField: 'programId',
  //         foreignField: '_id',
  //         as: 'programsData'
  //       }
  //     },
  //     {
  //       $lookup: {
  //         from: 'modules',
  //         localField: 'moduleId',
  //         foreignField: '_id',
  //         as: 'modulesData'
  //       }
  //     },
  //     {
  //       $lookup: {
  //         from: 'questionbanks',
  //         localField: 'quizId',
  //         foreignField: '_id',
  //         as: 'quizData'
  //       }
  //     },
  //     {
  //       $lookup: {
  //         from: 'users',
  //         localField: 'employeeId',
  //         foreignField: '_id',
  //         as: 'userData'
  //       }
  //     }
  //   ]);
  //   quizScore[0].examMili = ((quizScore[0].examTime.split('.')[0] * 60000) + (quizScore[0].examTime.split('.')[1] * 1000));
  //   data.push(quizScore[0]);

  //   if (i == (programsWatch.length - 1)) {
  //     data.sort(function (a, b) {
  //       if (new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime()) return 1;
  //       if (new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime()) return -1;
  //       if (a.score > b.score) return 1;
  //       if (a.score < b.score) return -1;
  //       if (a.examTime > b.examTime) return -1;
  //       if (a.examTime < b.examTime) return 1;

  //       // If the votes number is the same between both items, sort alphabetically
  //       // If the first item comes first in the alphabet, move it up
  //       // Otherwise move it down
  //     });
  //     res.status(200).send({
  //       status: "success",
  //       message: "Top 100 Winners retrieved",
  //       data: data,
  //     });
  //   }

  // }
  let quiz = await QuestionBank.find({
    _id:req.params.id,
    isLearningActivity: true,
    status: 1,
    learningLiveDate:{$lte:moment().tz('Asia/Kolkata')}
  }).sort({
    learningLiveDate: -1
  });
  const learningLiveDate = moment(quiz[0].learningLiveDate).tz('Asia/Kolkata');
  const liveDate = moment(quiz[0].learningLiveDate).tz('Asia/Kolkata').add(180, 'minutes');
  const date = moment().tz('Asia/Kolkata');

  if (date > liveDate) {
    let data = [];
    let finaldata = [];
    data = await quizData(quiz[0]);
    data.map(examT => {
      const examEndTime = moment(examT.quizReference.createdAt).tz('Asia/Kolkata');
      if(liveDate > examEndTime && examEndTime > learningLiveDate){
        finaldata.push(examT);
      }
    });
    finaldata.sort(function (a, b) {
      if (moment(a.quizReference.createdAt).tz('Asia/Kolkata') > moment(b.quizReference.createdAt).tz('Asia/Kolkata')) return 1;
      if (moment(a.quizReference.createdAt).tz('Asia/Kolkata') < moment(b.quizReference.createdAt).tz('Asia/Kolkata')) return -1;

      if (a.examTime > b.examTime) return -1;
      if (a.examTime < b.examTime) return 1;

      if (a.quizScore > b.quizScore) return 1;
      if (a.quizScore < b.quizScore) return -1;

     

    });
    res.status(200).send({
      status: "success",
      message: "Top 100 Winners retrieved",
      data: finaldata,
    });
  } else {
    res.status(200).send({
      status: "success",
      message: "Top 100 Winners retrieved",
      data: finaldata,
    });
  }
  
}

exports.scoreWiseWinners = async (req, res) => {
  let programsWatch = await ProgramsWatch.aggregate([{
      $match: {
        isLearningActivity: true
      }
    },
    {
      $unwind: "$courses"
    }, {
      $unwind: "$courses.module"
    },
    {
      $match: {
        "courses.module.questionbank": mongoose.Types.ObjectId(req.params.id),
        "courses.module.quizAttended": true
      }
    },
    {
      $group: {
        _id: "$employeeId",
        allData: {
          $first: "$$ROOT"
        }
      }
    },
  ]);
  let data = [];
  for (let i in programsWatch) {
    let quizScore = await QuizScore.aggregate([{
        $match: {
          _id: mongoose.Types.ObjectId(programsWatch[i].allData.courses.module.quizReference)
        }
      },
      {
        $sort: {
          score: -1
        }
      },
      {
        $lookup: {
          from: 'programs',
          localField: 'programId',
          foreignField: '_id',
          as: 'programsData'
        }
      },
      {
        $lookup: {
          from: 'modules',
          localField: 'moduleId',
          foreignField: '_id',
          as: 'modulesData'
        }
      },
      {
        $lookup: {
          from: 'questionbanks',
          localField: 'quizId',
          foreignField: '_id',
          as: 'quizData'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'userData'
        }
      }
    ]);
    quizScore[0].examMili = ((quizScore[0].examTime.split('.')[0] * 60000) + (quizScore[0].examTime.split('.')[1] * 1000));
    data.push(quizScore[0]);
  }
  var groups = _.groupBy(data, "score");
  var array = [];
  _.forOwn(groups, function (value, key) {
    array.push(key);
  });
  let lengthArray = [];
  let colorArray = [];
  for (let i in array) {
    var length = 0;
    length = data.filter((res) => (res.score == array[i])).length;
    lengthArray.push(length);
    var randomColor = Math.floor(Math.random() * 16777215).toString(16);
    colorArray.push("#" + randomColor);
    if (i == (array.length - 1)) {
      const zeroIndexes = lengthArray.reduce((acc, cur, idx) => {
        if (cur === 0) {
          acc.push(idx);
        }
        return acc;
      }, []);
      const scoresArray = array.filter((_, idx) => !zeroIndexes.includes(idx));
      const dataArray = lengthArray.filter((_, idx) => !zeroIndexes.includes(idx));
      const cArray = colorArray.filter((_, idx) => !zeroIndexes.includes(idx));
      res.status(200).send({
        status: "success",
        message: "All Clusters retrieved",
        data: {
          lengthArray: dataArray,
          colorArray: cArray,
          array: scoresArray
        }
      });
    }
  }
}

exports.stateWiseWinners = async (req, res) => {
  let users = await User.find({});
  var groups = _.groupBy(users, "stateEmp");
  var array = [];
  _.forOwn(groups, function (value, key) {
    array.push(key);
  });
  let iUndefined = array.map((img) => {
    return img;
  }).indexOf("undefined");
  array.splice(iUndefined, 1);
  let iNull = array.map((img) => {
    return img;
  }).indexOf("");
  array.splice(iNull, 1);

  let programsWatch = await ProgramsWatch.aggregate([{
      $match: {
        isLearningActivity: true
      }
    },
    {
      $unwind: "$courses"
    }, {
      $unwind: "$courses.module"
    },
    {
      $match: {
        "courses.module.questionbank": mongoose.Types.ObjectId(req.params.id),
        "courses.module.quizAttended": true
      }
    },
    {
      $group: {
        _id: "$employeeId",
        allData: {
          $first: "$$ROOT"
        }
      }
    },
  ]);

  let data = [];
  for (let i in programsWatch) {
    let quizScore = await QuizScore.aggregate([{
        $match: {
          _id: mongoose.Types.ObjectId(programsWatch[i].allData.courses.module.quizReference)
        }
      },
      {
        $sort: {
          score: -1
        }
      },
      {
        $lookup: {
          from: 'programs',
          localField: 'programId',
          foreignField: '_id',
          as: 'programsData'
        }
      },
      {
        $lookup: {
          from: 'modules',
          localField: 'moduleId',
          foreignField: '_id',
          as: 'modulesData'
        }
      },
      {
        $lookup: {
          from: 'questionbanks',
          localField: 'quizId',
          foreignField: '_id',
          as: 'quizData'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'userData'
        }
      },
      {
        $unwind: "$userData"
      }
    ]);
    quizScore[0].examMili = ((quizScore[0].examTime.split('.')[0] * 60000) + (quizScore[0].examTime.split('.')[1] * 1000));
    data.push(quizScore[0]);
    if (i == (programsWatch.length - 1)) {
      let lengthArray = [];
      let colorArray = [];
      for (let j in array) {
        var length = 0;
        length = data.filter((res) => (res.userData.stateEmp == array[j])).length;
        lengthArray.push(length);
        var randomColor = Math.floor(Math.random() * 16777215).toString(16);
        colorArray.push("#" + randomColor);
        if (j == (array.length - 1)) {
          const zeroIndexes = lengthArray.reduce((acc, cur, idx) => {
            if (cur === 0) {
              acc.push(idx);
            }
            return acc;
          }, []);
          const statesArray = array.filter((_, idx) => !zeroIndexes.includes(idx));
          const dataArray = lengthArray.filter((_, idx) => !zeroIndexes.includes(idx));
          const cArray = colorArray.filter((_, idx) => !zeroIndexes.includes(idx));
          res.status(200).send({
            status: "success",
            message: "All Clusters retrieved",
            data: {
              lengthArray: dataArray,
              colorArray: cArray,
              array: statesArray
            }
          });
        }
      }
    }
  }



}

exports.departmentWiseWinners = async (req, res) => {
  let users = await User.find({});
  var groups = _.groupBy(users, "department");
  var array = [];
  _.forOwn(groups, function (value, key) {
    array.push(key);
  });
  let iUndefined = array.map((img) => {
    return img;
  }).indexOf("undefined");
  array.splice(iUndefined, 1);
  let iNull = array.map((img) => {
    return img;
  }).indexOf("");
  array.splice(iNull, 1);
  let programsWatch = await ProgramsWatch.aggregate([{
      $match: {
        isLearningActivity: true
      }
    },
    {
      $unwind: "$courses"
    }, {
      $unwind: "$courses.module"
    },
    {
      $match: {
        "courses.module.questionbank": mongoose.Types.ObjectId(req.params.id),
        "courses.module.quizAttended": true
      }
    },
    {
      $group: {
        _id: "$employeeId",
        allData: {
          $first: "$$ROOT"
        }
      }
    },
  ]);

  let data = [];
  for (let i in programsWatch) {
    let quizScore = await QuizScore.aggregate([{
        $match: {
          _id: mongoose.Types.ObjectId(programsWatch[i].allData.courses.module.quizReference)
        }
      },
      {
        $sort: {
          score: -1
        }
      },
      {
        $lookup: {
          from: 'programs',
          localField: 'programId',
          foreignField: '_id',
          as: 'programsData'
        }
      },
      {
        $lookup: {
          from: 'modules',
          localField: 'moduleId',
          foreignField: '_id',
          as: 'modulesData'
        }
      },
      {
        $lookup: {
          from: 'questionbanks',
          localField: 'quizId',
          foreignField: '_id',
          as: 'quizData'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'userData'
        }
      },
      {
        $unwind: "$userData"
      }
    ]);
    quizScore[0].examMili = ((quizScore[0].examTime.split('.')[0] * 60000) + (quizScore[0].examTime.split('.')[1] * 1000));
    data.push(quizScore[0]);

  }

  let lengthArray = [];
  let colorArray = [];
  for (let i in array) {
    var length = 0;
    length = data.filter((res) => (res.userData.department == array[i])).length;
    lengthArray.push(length);
    var randomColor = Math.floor(Math.random() * 16777215).toString(16);
    colorArray.push("#" + randomColor);
    if (i == (array.length - 1)) {
      const zeroIndexes = lengthArray.reduce((acc, cur, idx) => {
        if (cur === 0) {
          acc.push(idx);
        }
        return acc;
      }, []);
      const deptsArray = array.filter((_, idx) => !zeroIndexes.includes(idx));
      const dataArray = lengthArray.filter((_, idx) => !zeroIndexes.includes(idx));
      const cArray = colorArray.filter((_, idx) => !zeroIndexes.includes(idx));
      res.status(200).send({
        status: "success",
        message: "All Clusters retrieved",
        data: {
          lengthArray: dataArray,
          colorArray: cArray,
          array: deptsArray
        }
      });
    }
  }
}