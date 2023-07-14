const mongoose = require("mongoose");

const QuizScore = new mongoose.Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "questionBank"
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    questionArray:{type:Array},
    examTime:{type:String},
    score:{type:Number},
    wrongAnswer:{type:Number},
    totalQuestion:{type:Number},
    correctAnswer:{type:Number},
    skipAnswer:{type:Number},
    rating:{type:Number}
});


QuizScore.set('timestamps',true);


module.exports = mongoose.model("quizScore",QuizScore);