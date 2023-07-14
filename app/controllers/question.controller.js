const db = require("../models");
const { question: Question, questionBank: QuestionBank } = db;

exports.createSingleQuestion = (req, res) => {
  const question = new Question({
    question: req.body.question,
    optionA: req.body.optionA,
    optionB: req.body.optionB,
    optionC: req.body.optionC,
    optionD: req.body.optionD,
    optionE: req.body.optionE,
    optionF: req.body.optionF,
    optionG: req.body.optionG,
    optionH: req.body.optionH,
    optionI: req.body.optionI,
    optionJ: req.body.optionJ,
    answer: req.body.answer,
    remark: req.body.remark
  });


  QuestionBank.findById(req.body.questionBankId,(err,data)=>{
    if (err) {
        res.status(500).send({ message: "Question Bank must not be empty" });
        return;
    }

    question.questionBankId = data._id;
    question.save(err => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        res.status(200).send({
            status:"success",
            message : "Question Created successfully!"
          });
    });
  });
};

exports.updateQuestion = (req,res)=>{
    Question.findByIdAndUpdate(req.params.id,{$set:{question: req.body.question,optionA: req.body.optionA,optionB: req.body.optionB,optionC: req.body.optionC,optionD: req.body.optionD,
        optionE: req.body.optionE,optionF: req.body.optionF,optionG: req.body.optionG,optionH: req.body.optionH,optionI: req.body.optionI,
        optionJ: req.body.optionJ,answer: req.body.answer,remark: req.body.remark}},(err,data)=>{
        if(err){
            res.status(500).send({ status:"error", message: err });
        } else {
            res.status(200).send({
                status:"success",
                message : "Question updated successfully",
                data: data
            });
        }
    });
}
exports.getSingleQuestion = (req,res)=>{
    Question.findById(req.params.id,(err,data)=>{
        if(err){
            res.status(500).send({ status:"error", message: err });
        } else {
            res.status(200).send({
                status:"success",
                message : "Single Question retrieved",
                data: data
            });
        }
    });
  }

exports.getAllQuestion = (req,res)=>{
    // TODO: Questions By QuestionBank
    Question.find({questionBankId:req.params.id},(err,data)=>{
        if(err){
            res.status(500).send({ status:"error", message: err });
        } else {
            res.status(200).send({
                status:"success",
                message : "All Questions retrieved",
                data: data
            });
        }
    });
  }


exports.deleteQuestion = (req,res)=>{
  Question.findByIdAndRemove(req.params.id,(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success", message : "Question Deleted Successfully"
          });
      }
  });
}


exports.createBulkQuestion = (req,res)=>{
    Question.insertMany(req.body.questions,(err,data)=>{
        if(err){
            res.status(500).send({ status:"error", message: err });
        } else {
            res.status(200).send({
                status:"success",
                message : "Question updated successfully",
                data: data
            });
        }
    });
}