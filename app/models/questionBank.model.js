const mongoose = require("mongoose");

const QuestionBank = new mongoose.Schema({
  code: {type:Number},
  title: {type:String},
  keywords: {type:String},
  isLearningActivity:{
    type:Boolean,
    default:false
  },
  description: {type:String},
  quizTime:{type:Number},
  questionsCount:{type:Number},
  status: {type:Number},
  fusionBank:{type:Boolean},
  expiryDate:{type:Date},
  thumbnail: {type:String},
  learningLiveDate:{type:Date}
});


QuestionBank.set('timestamps',true);


module.exports = mongoose.model("questionBank",QuestionBank);