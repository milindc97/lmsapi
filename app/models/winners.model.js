const mongoose = require("mongoose");

const Winners = mongoose.model(
  "Winners",
  new mongoose.Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "questionBank"
    },
    programId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "programs"
    },
    winners:[
      {
        employeeId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        quizScoreId:{
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
        top10:{
          type:Boolean,
          default:false
        },
        top100:{
          type:Boolean,
          default:false
        }
      }
    ],
    quizLiveDate:{
      type:Date
    },
    top10:{
      type:Boolean,
      default:false
    },
    top100:{
      type:Boolean,
      default:false
    }
  }, {
    timestamps: true
  })
);

module.exports = Winners;