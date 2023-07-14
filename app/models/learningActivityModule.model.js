const mongoose = require("mongoose");

const LearningActivityModule = mongoose.model(
  "LearningActivityModule",
  new mongoose.Schema({
    programId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "programs"
    },
    courseId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses"
    },
    moduleId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "modules"
    },
    quizAttended:{
        type:Boolean,
        default:false
    },
    quizReference:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "quizScore"
    },
    quizScore:{
        type:Number,
        default:0
    },
    examTime:{
        type:String
    },
    questionbank: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "questionBank"
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
  }, {
    timestamps: true
  })
);

module.exports = LearningActivityModule;