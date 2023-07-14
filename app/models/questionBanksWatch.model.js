const mongoose = require("mongoose");

const QuestionBanksWatch = mongoose.model(
  "QuestionBanksWatch",
  new mongoose.Schema({
    questionbank: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "questionBank"
    },
    isWatch:{
      type:Boolean,
      default:false
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  }, {
    timestamps: true
  })
);

module.exports = QuestionBanksWatch;