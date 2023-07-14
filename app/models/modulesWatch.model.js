const mongoose = require("mongoose");

const ModulesWatch = mongoose.model(
  "ModulesWatch",
  new mongoose.Schema({
    moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "modules"
    },
    isWatch: {
        type: Boolean,
        default:false
    },
    index:{
      type:Number
    },
    unlock:{
        type:Boolean,
        default:false
    },
    rating:{
      type:Number,
      default:0
    },
    submitRating:{
        type:Boolean,
        default:false
    },
    moduleWatchTime: {
        type:Number,
        default:0
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
    },
  }, {
    timestamps: true
  })
);

module.exports = ModulesWatch;