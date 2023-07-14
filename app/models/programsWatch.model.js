const mongoose = require("mongoose");

const ProgramsWatch = mongoose.model(
  "ProgramsWatch",
  new mongoose.Schema({
    programId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "programs"
    },
    isWatch: {
        type: Boolean,
        default:false
    },
    isLearningActivity:{
        type:Boolean,
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
    courses: [
        {
            courseId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "courses"
            },
            isWatch: {
                type: Boolean,
                default:false
            },
            rating:{
                type:Number,
                default:0
            },
            unlock:{
                type:Boolean,
                default: false
            },
            submitRating:{
                type:Boolean,
                default:false
            },
            index:{
                type:Number
            },
            module: [
                {
                    moduleId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "modules"
                    },
                    isWatch: {
                        type: Boolean,
                        default:false
                    },
                    unlock:{
                        type:Boolean,
                        default: false
                    },
                    rating:{
                        type:Number,
                        default:0
                    },
                    submitRating:{
                        type:Boolean,
                        default:false
                    },
                    index:{
                        type:Number
                    },
                    moduleWatchTime:{
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
                    }
                }
            ]
        }
    ],
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
  }, {
    timestamps: true
  })
);

module.exports = ProgramsWatch;