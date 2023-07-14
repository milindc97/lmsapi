const db = require("../models");
const { module: Module, questionBank: QuestionBank, modulesWatch: ModulesWatch ,program:Program,course:Course,programsWatch:ProgramsWatch,
coursesWatch:CoursesWatch} = db;
const mongoose = require("mongoose");
var _ = require('lodash');

exports.createModule = async (req, res) => {
  let dt = await Module.find({code:req.body.code});

  if(dt.length > 0){
    res.status(200).send({ status: "error", message: "Code Already Exist" });
  } else {
    const module = new Module(req.body);

    module.save((err, data) => {
          if (err) {
              const error = mongooseErrorHandler(err);
              res.status(error.status || 500);
              res.json({
                  error: {
                      status: "error",
                      message: error.message
                  }
              });
  
              return;
          }
  
          res.status(200).send({
              status: 'success',
              message: "Module created successfully!",
              data: data
          });
      });
  }

  
  
};


exports.updateModule = (req,res)=>{
    Module.findByIdAndUpdate(req.params.id,{$set:req.body},(err,data)=>{
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
          message : "Module Updated successfully!"
        });
      });

  });
}

exports.getSingleModule = async (req,res)=>{
  const moduleId = mongoose.Types.ObjectId(req.params.id);
  let module = await Module.find({_id: moduleId}).populate("questionbank").sort({createdAt:-1});
  res.status(200).send({
    status:"success",
    message : "Single Module retrieved",
    data: module[0]
  });
}

exports.getAll = async (req,res)=>{
  let module = await Module.find({}).populate("questionbank").sort({createdAt:-1});
  res.status(200).send({
    status:"success",
    message : "All Modules retrieved",
    data: module
  });
}

exports.getAllModule = async (req,res)=>{
  let module = await Module.find({isLearningActivity:false}).populate("questionbank").sort({createdAt:-1});
  res.status(200).send({
    status:"success",
    message : "All Modules retrieved",
    data: module
  });
}

exports.getAllActiveModule = async (req,res)=>{
  let module = await Module.find({ status : 1,isLearningActivity:false}).populate("questionbank").sort({createdAt:-1});
  res.status(200).send({
    status:"success",
    message : "All Modules retrieved",
    data: module
  });
}


exports.getAllInctiveModule = async (req,res)=>{
  let module = await Module.find({status:0,isLearningActivity:false}).populate("questionbank").sort({createdAt:-1});
  res.status(200).send({
    status:"success",
    message : "All Modules retrieved",
    data: module
  });
}

exports.getModuleIncrementalCode = (req,res)=>{
  Module.count((err,data)=>{
    if(data == 0){
      res.status(200).send({
          status:"success",
          message : "Incremental Code Created",
          data: {
              code: 1
          }
      });
    }else{
      Module.findOne({}).sort('-code').exec(function(err,data){
        if(err){
            res.status(500).send({ status:"error", message: err });
        } else {
          let code = {code: data.code+1};
            res.status(200).send({
                status:"success",
                message : "Incremental Code Created",
                data: code
            });
        }
    });
    }
});
}


exports.deleteModule = async (req,res)=>{
  let programWatch = await ProgramsWatch.find({"courses.module.moduleId": req.params.id});

  for(let i in programWatch){
    for(let j in programWatch[i].courses){
      let sortedA = _.sortBy(programWatch[i].courses[j].module, [function(o) { return o.index; }]);
      let mrIndex = _.findIndex(sortedA, {'moduleId': mongoose.Types.ObjectId(req.params.id) });
      if(mrIndex == 0){
        if(sortedA.length > mrIndex+1){
          sortedA[mrIndex+1].unlock = true;
        }
      }else if(mrIndex > 0 && sortedA[mrIndex].unlock){
        if(sortedA.length > mrIndex+1){
          sortedA[mrIndex+1].unlock = true;
        }
      } 
      sortedA.splice(mrIndex,1);
      programWatch[i].courses[j].module = [];
      programWatch[i].courses[j].module = sortedA;
    }
    if(i == (programWatch.length - 1)){
      await ProgramsWatch.findByIdAndUpdate( mongoose.Types.ObjectId(programWatch[i]._id), {$set: {"courses":programWatch[i].courses}});
    }
  }
  // if (programWatch.length > 0) {
  //   for (let j in programWatch) {
  //     await ProgramsWatch.updateOne({_id: programWatch[j]._id}, {$pull: {"courses.$[].module": {"moduleId": req.params.id}}})
  //   }
  // }

  let course = await Course.find({"modules.moduleId": req.params.id});

  if(course.length > 0){
    for(let i in course){
      await Course.updateOne({_id: course[i]._id}, {$pull: {"modules": {"moduleId": req.params.id}}});
    }
  }
  // let courseWatch = await CoursesWatch.find({"modules.moduleId": req.params.id});

  // if (courseWatch.length > 0) {
  //   for (let j in courseWatch) {
  //     await CoursesWatch.updateOne({_id: courseWatch[j]._id}, {$pull: {"modules": {"moduleId": req.params.id}}})
  //   }
  // }

  let courseWatch = await CoursesWatch.find({"modules.moduleId": req.params.id});
  for(let i in courseWatch){
    let sortedA = _.sortBy(courseWatch[i].modules, [function(o) { return o.index; }]);
    let mrIndex = _.findIndex(sortedA, {'moduleId': mongoose.Types.ObjectId(req.params.id) });
    if(mrIndex == 0){
      if(sortedA.length > mrIndex+1){
        sortedA[mrIndex+1].unlock = true;
      }
    }else if(mrIndex > 0 && sortedA[mrIndex].unlock){
      if(sortedA.length > mrIndex+1){
        sortedA[mrIndex+1].unlock = true;
      }
    } 
    sortedA.splice(mrIndex,1);
    await CoursesWatch.findByIdAndUpdate( mongoose.Types.ObjectId(courseWatch[i]._id), {$set: {"modules":sortedA}});
  }
  let modWatch =  await ModulesWatch.find({moduleId: req.params.id});
  
  for(let i in modWatch){
    let allModByEmp = await ModulesWatch.find({employeeId:modWatch[i].employeeId,isLearningActivity:false}).sort({index:1});
    
    let mrIndex = _.findIndex(allModByEmp, {'moduleId': mongoose.Types.ObjectId(req.params.id) });
    if(mrIndex == 0){
      if(allModByEmp.length > mrIndex+1){
        await ModulesWatch.findByIdAndUpdate(mongoose.Types.ObjectId(allModByEmp[mrIndex + 1]._id),{$set:{unlock:true}});
      }
    }else if(mrIndex > 0 && allModByEmp[mrIndex].unlock){
      if(allModByEmp.length > mrIndex+1){
        await ModulesWatch.findByIdAndUpdate(mongoose.Types.ObjectId(allModByEmp[mrIndex + 1]._id),{$set:{unlock:true}});
      }
    } 
     if(i == (modWatch.length - 1)){
       await ModulesWatch.deleteMany({moduleId: req.params.id});
   }
  }


  await Module.findByIdAndRemove(req.params.id);

  res.status(200).send({
    status: "success",
    message: "Module Deleted Successfully"
  });
}

exports.updateStatusModule = (req,res)=>{
  Module.findByIdAndUpdate(req.params.id,{$set:{status:req.body.status}},(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success",
              message : "Module status successfully",
              data: data
          });
      }
  });
}

exports.getModuleWatches = (req,res)=>{
  
  ModulesWatch.aggregate([{$lookup: {from: 'modules',localField: 'moduleId',foreignField: '_id',as: 'moduleDetails'}},{$lookup: {from: 'users',localField: 'employeeId',foreignField: '_id',as: 'userDetails'}},{
    $group:
    {
      _id:"$employeeId",
      "participantsCount":{$sum:1},
      "module":{$push:"$moduleDetails"},
      "user":{$push:"$userDetails"},
      "createdAt":{$push:"$createdAt"}
    }
},{$sort:{createdAt:-1}}],(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success",
              message : "All ModulesWatches retrieved",
              data: data
          });
      }
  });
}

exports.getModuleWatchesByEmp = (req,res)=>{
  const empId = mongoose.Types.ObjectId(req.params.id);
  ModulesWatch.aggregate([{$match:{employeeId:empId}},{$lookup: {from: 'modules',localField: 'moduleId',foreignField: '_id',as: 'moduleDetails'}},{$lookup: {from: 'users',localField: 'employeeId',foreignField: '_id',as: 'userDetails'}},{
    $group:
    {
      _id:"$employeeId",
      "participantsCount":{$sum:1},
      "module":{$push:"$moduleDetails"},
      "user":{$push:"$userDetails"},
      "createdAt":{$push:"$createdAt"}
    }
},{$sort:{createdAt:-1}}],(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success",
              message : "All ModulesWatches retrieved",
              data: data
          });
      }
  });
}

exports.getModuleWatchesByEmpAndModule = (req,res)=>{
  const empId = mongoose.Types.ObjectId(req.params.id1);
  const moduleId = mongoose.Types.ObjectId(req.params.id2);
  ModulesWatch.aggregate([{$match:{employeeId:empId,moduleId:moduleId}},{$lookup: {from: 'modules',localField: 'moduleId',foreignField: '_id',as: 'moduleDetails'}},{$lookup: {from: 'users',localField: 'employeeId',foreignField: '_id',as: 'userDetails'}},{
    $group:
    {
      _id:"$employeeId",
      "participantsCount":{$sum:1},
      "module":{$push:"$moduleDetails"},
      "user":{$push:"$userDetails"},
      "createdAt":{$push:"$createdAt"},
      "moduleWatch":{$push:"$moduleWatchTime"}
    }
},{$sort:{createdAt:-1}}],(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success",
              message : "All ModulesWatches retrieved",
              data: data
          });
      }
  });
}

exports.saveModulesWatch = (req,res)=>{
  ModulesWatch.updateOne({
    moduleId: req.body.moduleId,
    employeeId:req.body.employeeId
}, {
    $set: {
      moduleWatchTime:req.body.moduleWatchTime
    }
}, {
    upsert: true
},(err,data)=>{
  if(err){
    res.status(500).send({ status:"error", message: err });
    return;
}
    res.status(200).send({
      status:"success",
      message : "Modules Watch Created successfully!",
      data:data
    });
})
}

exports.getAllModuleLearningActivity = async (req,res)=>{
  let module = await Module.find({isLearningActivity:true}).populate("questionbank").sort({createdAt:-1});
  res.status(200).send({
    status:"success",
    message : "All Modules retrieved",
    data: module
  });
}

exports.getAllActiveModuleLearningActivity = async (req,res)=>{
  let module = await Module.find({ status : 1,isLearningActivity:true}).populate("questionbank").sort({createdAt:-1});
  res.status(200).send({
    status:"success",
    message : "All Modules retrieved",
    data: module
  });
}


exports.getAllInctiveModuleLearningActivity = async (req,res)=>{
  let module = await Module.find({status:0,isLearningActivity:true}).populate("questionbank").sort({createdAt:-1});
  res.status(200).send({
    status:"success",
    message : "All Modules retrieved",
    data: module
  });
}
