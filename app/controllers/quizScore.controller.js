const db = require("../models");
const mongoose = require("mongoose");
const { quizScore:QuizScore, user:User ,module:Module} = db;
const moment = require('moment-timezone');


exports.createQuizScore = (req, res) => {
    const quizScore = new QuizScore(req.body);

    quizScore.save((err, data) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        res.status(200).send({
            status: 'success',
            message: "QuizScore created successfully!",
            data:data
        });
    });
    
};

exports.updateQuizScore = (req,res)=>{
    QuizScore.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, (err, data) => {
        if(err){
            res.status(500).send({ status:"error", message: err });
        } 

        res.status(200).send({
            status:"success",
            message : "QuizScore Updated successfully!",
            data:data
        });
    });
}


exports.updateRating = (req,res)=>{
    QuizScore.findByIdAndUpdate(req.params.id,{$set:{rating: req.body.rating}
        },(err,data)=>{
        if(err){
            res.status(500).send({ status:"error", message: err });
        } 
        data.save(err => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.status(200).send({
            status:"success",
            message : "Rating Submitted successfully!",
            data:data
          });
        });
        

    });
}

exports.getSingleQuizScore = (req,res)=>{
  const quizScoreId = mongoose.Types.ObjectId(req.params.id);
  QuizScore.aggregate([{$match:{ _id: quizScoreId }},{ $sort : { createdAt : -1 }},{$lookup: {from: 'programs',localField: 'programId',foreignField: '_id',as: 'programsData'}},{$lookup: {from: 'modules',localField: 'moduleId',foreignField: '_id',as: 'modulesData'}},
  {$lookup: {from: 'questionbanks',localField: 'quizId',foreignField: '_id',as: 'quizData'}},{$lookup: {from: 'users',localField: 'employeeId',foreignField: '_id',as: 'userData'}}],(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success",
              message : "Single QuizScore retrieved",
              data: data[0]
          });
      }
  });
}

exports.getSingleQuizScoreByProgram = (req,res)=>{
    const prgId = mongoose.Types.ObjectId(req.params.id);
  QuizScore.aggregate([{$match:{ programId: prgId }},{ $sort : { createdAt : -1 } },{$lookup: {from: 'programs',localField: 'programId',foreignField: '_id',as: 'programsData'}},{$lookup: {from: 'modules',localField: 'moduleId',foreignField: '_id',as: 'modulesData'}},
  {$lookup: {from: 'questionbanks',localField: 'quizId',foreignField: '_id',as: 'quizData'}},{$lookup: {from: 'users',localField: 'employeeId',foreignField: '_id',as: 'userData'}}],(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success",
              message : "Single QuizScore retrieved",
              data: data[0]
          });
      }
  });
}

exports.getQuizScoreForCertifiedByQuiz = (req,res)=>{
    const quizId = mongoose.Types.ObjectId(req.params.id);
  QuizScore.aggregate([{$match:{ quizId: quizId }},{ $sort : { score : -1} },{$lookup: {from: 'programs',localField: 'programId',foreignField: '_id',as: 'programsData'}},{$lookup: {from: 'modules',localField: 'moduleId',foreignField: '_id',as: 'modulesData'}},
  {$lookup: {from: 'questionbanks',localField: 'quizId',foreignField: '_id',as: 'quizData'}},{$lookup: {from: 'users',localField: 'employeeId',foreignField: '_id',as: 'userData'}}],(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
        for(let i in data){
            data[i].examMili = ((data[i].examTime.split('.')[0] * 60000)+(data[i].examTime.split('.')[1]*1000));
            
        }
        data.sort(function(a, b){
            if (a.examMili > b.examMili) return 1;
            if (a.examMili < b.examMili) return -1;

            // If the votes number is the same between both items, sort alphabetically
            // If the first item comes first in the alphabet, move it up
            // Otherwise move it down
            if (a.score > b.score) return -1;
            if (a.score < b.score) return 1;
        });
        
          res.status(200).send({
              status:"success",
              message : "QuizScore retrieved",
              data: data
          });
      }
  });
  
}

exports.getSingleQuizScoreByEmployee = (req,res)=>{
    const empId = mongoose.Types.ObjectId(req.params.id);
  QuizScore.aggregate([{$match:{ employeeId: empId }},{ $sort : { createdAt : -1 }},{$lookup: {from: 'programs',localField: 'programId',foreignField: '_id',as: 'programsData'}},{$lookup: {from: 'modules',localField: 'moduleId',foreignField: '_id',as: 'modulesData'}},
  {$lookup: {from: 'questionbanks',localField: 'quizId',foreignField: '_id',as: 'quizData'}},{$lookup: {from: 'users',localField: 'employeeId',foreignField: '_id',as: 'userData'}}],(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success",
              message : "Single QuizScore retrieved",
              data: data[0]
          });
      }
  });
}


exports.getAllQuizScoreByEmployee = (req,res)=>{
    const empId = mongoose.Types.ObjectId(req.params.id);
  QuizScore.aggregate([{$match:{ employeeId: empId }},{ $sort : { createdAt : -1 }},{$lookup: {from: 'programs',localField: 'programId',foreignField: '_id',as: 'programsData'}},{$lookup: {from: 'modules',localField: 'moduleId',foreignField: '_id',as: 'modulesData'}},
  {$lookup: {from: 'questionbanks',localField: 'quizId',foreignField: '_id',as: 'quizData'}},{$lookup: {from: 'users',localField: 'employeeId',foreignField: '_id',as: 'userData'}}],(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success",
              message : "Single QuizScore retrieved",
              data: data
          });
      }
  });
}

exports.getMonthAndYearWiseCount = (req,res)=>{
    QuizScore.aggregate([
        {
            $project:
              {
                month: { $month: "$createdAt" },
                year: { $year: "$createdAt" },
                score: "$score",

              }
        },
        {
            $group : { 
                _id :{ 
                    month : "$month", 
                    year : "$year"
                },
                count: {
                    $sum: 1
                },
                score: { 
                    $sum: "$score" 
                }
            }
        }
    ], (err, data) => {
        if(err){
            res.status(500).send({ status:"error", message: err });
        }
        let dataM=[]
        for(i in data){
            if(data[i]._id.year == moment().tz('Asia/Kolkata').year()){
                dataM.push(data[i]);
            }
        }
        setTimeout(() => {
            res.status(200).send({
                status:"success",
                message : "Month and Year Count QuizScore retrieved",
                data: dataM
            });
        }, 500);
        
        
    });
}

exports.getSingleQuizScoreByModule = (req,res)=>{
    const modId = mongoose.Types.ObjectId(req.params.id);
  QuizScore.aggregate([{$match:{ moduleId: modId }},{ $sort : { createdAt : -1 }},{$lookup: {from: 'programs',localField: 'programId',foreignField: '_id',as: 'programsData'}},{$lookup: {from: 'modules',localField: 'moduleId',foreignField: '_id',as: 'modulesData'}},
  {$lookup: {from: 'questionbanks',localField: 'quizId',foreignField: '_id',as: 'quizData'}},{$lookup: {from: 'users',localField: 'employeeId',foreignField: '_id',as: 'userData'}}],(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success",
              message : "Single QuizScore retrieved",
              data: data[0]
          });
      }
  });
}

exports.getSingleQuizScoreByQuiz = (req,res)=>{
    const quId = mongoose.Types.ObjectId(req.params.id);
  QuizScore.aggregate([{$match:{ quizId: quId }},{ $sort : { createdAt : -1 }},{$lookup: {from: 'programs',localField: 'programId',foreignField: '_id',as: 'programsData'}},{$lookup: {from: 'modules',localField: 'moduleId',foreignField: '_id',as: 'modulesData'}},
  {$lookup: {from: 'questionbanks',localField: 'quizId',foreignField: '_id',as: 'quizData'}},{$lookup: {from: 'users',localField: 'employeeId',foreignField: '_id',as: 'userData'}}],(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success",
              message : "Single QuizScore retrieved",
              data: data[0]
          });
      }
  });
}


exports.getSingleQuizScoreByQuizAndEmp = (req,res)=>{
    const quId = mongoose.Types.ObjectId(req.params.id1);
    const empId = mongoose.Types.ObjectId(req.params.id2);
  QuizScore.aggregate([{$match:{ quizId: quId,employeeId:empId }},{ $sort : { createdAt : -1 }},{$lookup: {from: 'programs',localField: 'programId',foreignField: '_id',as: 'programsData'}},{$lookup: {from: 'modules',localField: 'moduleId',foreignField: '_id',as: 'modulesData'}},
  {$lookup: {from: 'questionbanks',localField: 'quizId',foreignField: '_id',as: 'quizData'}},{$lookup: {from: 'users',localField: 'employeeId',foreignField: '_id',as: 'userData'}}],(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success",
              message : "Single QuizScore retrieved",
              data: data[0]
          });
      }
  });
}

exports.getAllQuizScore = (req,res)=>{
  QuizScore.aggregate([{ $sort : { createdAt : -1 }},{$lookup: {from: 'programs',localField: 'programId',foreignField: '_id',as: 'programsData'}},{$lookup: {from: 'modules',localField: 'moduleId',foreignField: '_id',as: 'modulesData'}},
  {$lookup: {from: 'questionbanks',localField: 'quizId',foreignField: '_id',as: 'quizData'}},{$lookup: {from: 'users',localField: 'employeeId',foreignField: '_id',as: 'userData'}}],(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success",
              message : "All QuizScores retrieved",
              data: data
          });
      }
  });
}

exports.getAllQuizScoreByScore = (req,res)=>{
    QuizScore.aggregate([{$match:{ score: req.body.score}},{ $sort : { createdAt : -1 }},{$lookup: {from: 'programs',localField: 'programId',foreignField: '_id',as: 'programsData'}},{$lookup: {from: 'modules',localField: 'moduleId',foreignField: '_id',as: 'modulesData'}},
    {$lookup: {from: 'questionbanks',localField: 'quizId',foreignField: '_id',as: 'quizData'}},{$lookup: {from: 'users',localField: 'employeeId',foreignField: '_id',as: 'userData'}}],(err,data)=>{
        if(err){
            res.status(500).send({ status:"error", message: err });
        } else {
            res.status(200).send({
                status:"success",
                message : "All QuizScores retrieved",
                data: data
            });
        }
    });
  }

exports.getOverallScore = (req,res)=>{
    const empId = mongoose.Types.ObjectId(req.params.id);
    QuizScore.find({employeeId:empId},(err,data)=>{
        let quizScore=0; 
        let overAllScore = 1;
        for(let i =0;i<data.length;i++){
            quizScore +=data[i].score;
        }
        if(quizScore != 0)
            overAllScore = quizScore/data.length;
        
        QuizScore.find({},(err,everyData)=>{
            let quizScoreEvery=0;
            let everyoneScore = 1;
            for(let i =0;i<everyData.length;i++){
                quizScoreEvery +=everyData[i].score;
            }
            if(quizScoreEvery != 0)
                everyoneScore = quizScoreEvery/everyData.length;
            if(err){
                res.status(500).send({ status:"error", message: err });
            } else {
                res.status(200).send({
                    status:"success",
                    message : "All QuizScores retrieved",
                    data: overAllScore.toFixed(),
                    everyoneData:everyoneScore.toFixed()
                });
            }
        })
       
    });
    
  }

exports.deleteQuizScore = (req,res)=>{
  QuizScore.findByIdAndRemove(req.params.id,(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success", message : "QuizScore Deleted Successfully"
          });
      }
  });
}

exports.getWeeklyData = (req,res)=>{

    
    const weeks = [];
    const firstDate = moment().tz('Asia/Kolkata').startOf('month');
    const lastDate = moment().tz('Asia/Kolkata').endOf('month');
    const numDays = lastDate.date();
    let dayOfWeekCounter = firstDate.day();


  for (let date = 1; date <= numDays; date++) {
    if (dayOfWeekCounter === 0 || weeks.length === 0) {
      weeks.push([]);
    }
    weeks[weeks.length - 1].push(date);
    dayOfWeekCounter = (dayOfWeekCounter + 1) % 7;
  }

  weeks.filter((w) => !!w.length).map((w) => ({
      start: w[0],
      end: w[w.length - 1],
      dates: w,
    }));

    let weeksCount = [];
    for(let i in weeks){
        let weekLength = weeks[i].length;
        let year = moment().tz('Asia/Kolkata').year();
        let month = moment().tz('Asia/Kolkata').month() + 1;

        let startDate = moment(month + "-" + weeks[i][0] + "-" + year, "M-D-YYYY").tz('Asia/Kolkata');
        let lastDate = moment(month + "-" + weeks[i][weekLength - 1] + "-" + year, "M-D-YYYY").tz('Asia/Kolkata');

        QuizScore.find({createdAt:{$gte:startDate,$lt:lastDate},employeeId:req.params.id} ,
            (err,data)=>{
            weeksCount.push({week:parseInt(i),count:data.length});
        });

        if(i == weeks.length-1){
            let interval = setInterval(()=>{
                weeksCount.sort(compare)
                if(weeksCount.length > 0 ){
                    res.status(200).send({data:weeksCount});
                    clearInterval(interval);
                }
            },500);
            
        }
    }

    function compare( a, b ) {
        if ( a.week < b.week ){
          return -1;
        }
        if ( a.week > b.week ){
          return 1;
        }
        return 0;
      }

}

exports.getTopEmployee = (req,res)=>{
    QuizScore.aggregate([{$group:{_id: "$employeeId",avgScore: { $avg: "$score" }}}],(err,data)=>{
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        data.sort(compare);
        
        if(data.length > 0){
            User.findById(data[0]._id,(err,userData)=>{
                res.status(200).send({
                    status:"success",
                    message : "Top Employee Fetch successfully!",
                    data:userData
                });
            })
        }
    });

    function compare( a, b ) {
        if ( a.avgScore > b.avgScore ){
          return -1;
        }
        if ( a.avgScore < b.avgScore ){
          return 1;
        }
        return 0;
      }

};

exports.getTop20Employee = (req,res)=>{
    QuizScore.aggregate([{$group:{_id: "$employeeId",avgScore: { $avg: "$score" }}},{$lookup:{from: "users", localField: "_id", foreignField: "_id", as: "userDetails"}}],(err,data)=>{
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        data.sort(compare);
        
        if(data.length > 0){
            res.status(200).send({
                status:"success",
                message : "Top Employee Fetch successfully!",
                data:data
            });
        }
    }).limit(20);

    function compare( a, b ) {
        if ( a.avgScore > b.avgScore ){
          return -1;
        }
        if ( a.avgScore < b.avgScore ){
          return 1;
        }
        return 0;
      }

};
