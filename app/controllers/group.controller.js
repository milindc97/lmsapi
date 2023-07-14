
const db = require("../models");
const { group: Group, user: User } = db;
const mongoose = require("mongoose");


exports.createGroup = (req, res) => {
  
  const group = new Group({

    name: req.body.name,
    code:req.body.code
  });

    group.save(err => {
        if (err) {
        res.status(500).send({ message: err });
        return;
        }
        res.status(200).send({
        status:"success",
        message : "Group Created successfully!"
        });
    });
  
};



exports.updateGroup = (req,res)=>{
    Group.findByIdAndUpdate(req.params.id,{$set:{ name: req.body.name}},(err,data)=>{
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
          message : "Group Updated successfully!"
        });
      });

  });
}

exports.getSingleGroup = (req,res)=>{
  const groupId = mongoose.Types.ObjectId(req.params.id);
  Group.aggregate([{$match:{ _id: groupId}}],(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success",
              message : "Single Group retrieved",
              data: data[0]
          });
      }
  });
}

exports.getAllGroup = (req,res)=>{
  
  Group.aggregate([{$sort:{createdAt:-1}}],(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success",
              message : "All Group retrieved",
              data: data
          });
      }
  });
}

exports.getAllGroupByEmpCount = async (req,res)=>{
  let group = await Group.find({}).sort({createdAt:-1});
  let data = [];
  await Promise.all(group.map(async res=>{    
    let user = await User.countDocuments({group:res._id});
    data.push({group:res,count:user});
  }));
  data.sort((a, b) => a.group.name.localeCompare(b.group.name));
  res.status(200).send({
      status:"success",
      message : "All Group retrieved",
      data: data
  });
}

exports.getGroupIncrementalCode = (req,res)=>{
 
  Group.count((err,data)=>{
    if(data == 0){
      res.status(200).send({
          status:"success",
          message : "Incremental Code Created",
          data: {
              code: 1
          }
      });
    }else{
      Group.findOne({}).sort('-code').exec(function(err,data){
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


exports.deleteGroup = (req,res)=>{
  Group.findByIdAndRemove(req.params.id,(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success", message : "Group Deleted Successfully"
          });
      }
  });
}
