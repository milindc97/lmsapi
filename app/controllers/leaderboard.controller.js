const db = require("../models");
const { leaderboard: Leaderboard } = db;
const mongoose = require("mongoose");


exports.createLeaderboard = (req, res) => {
  
  const leaderboard = new Leaderboard({

    name: req.body.name,
    message:req.body.message,
    designation:req.body.designation,
    photo:req.body.photo
  });

    leaderboard.save(err => {
        if (err) {
        res.status(500).send({ message: err });
        return;
        }
        res.status(200).send({
        status:"success",
        message : "Leaderboard Created successfully!"
        });
    });
  
};



exports.updateLeaderboard = (req,res)=>{
    Leaderboard.findByIdAndUpdate(req.params.id,{$set:{  name: req.body.name,
        message:req.body.message,
        designation:req.body.designation,
        photo:req.body.photo}},(err,data)=>{
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
          message : "Leaderboard Updated successfully!"
        });
      });

  });
}

exports.getSingleLeaderboard = (req,res)=>{
  const leaderboardId = mongoose.Types.ObjectId(req.params.id);
  Leaderboard.aggregate([{$match:{ _id: leaderboardId}}],(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success",
              message : "Single Leaderboard retrieved",
              data: data[0]
          });
      }
  });
}

exports.getAllLeaderboard = (req,res)=>{
  
  Leaderboard.aggregate([{$sort:{createdAt:-1}}],(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success",
              message : "All Leaderboard retrieved",
              data: data
          });
      }
  });
}


exports.deleteLeaderboard = (req,res)=>{
  Leaderboard.findByIdAndRemove(req.params.id,(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success", message : "Leaderboard Deleted Successfully"
          });
      }
  });
}
