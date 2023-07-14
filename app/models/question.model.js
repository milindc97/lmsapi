const mongoose = require("mongoose");

const Question = new mongoose.Schema({
  questionBankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QuestionBank"
  },
  question: {type:String},
  optionA: {type:String},
  optionB: {type:String},
  optionC: {type:String,default:''},
  optionD: {type:String,default:''},
  optionE: {type:String,default:''},
  optionF: {type:String,default:''},
  optionG: {type:String,default:''},
  optionH: {type:String,default:''},
  optionI: {type:String,default:''},
  optionJ: {type:String,default:''},
  answer: {type:String},
  remark:{type:String}
});


Question.set('timestamps',true);


module.exports = mongoose.model("questions",Question);