
const db = require("../models");
const { ceo: CEO } = db;
const mongoose = require("mongoose");


exports.createCEO =async (req, res) => {
    let isdefault = false;
    (req.body.default)?isdefault = true:isdefault=false;
    if(isdefault){
        let dt = await CEO.find({
            default: true
          });
        
          if (dt.length > 0) {
            res.status(200).send({
              status: "error",
              message: "Already Default Exist."
            });
          } else {
            const ceo = new CEO(req.body);
    
                ceo.save(err => {
                    if (err) {
                    res.status(500).send({ message: err });
                    return;
                    }
                    res.status(200).send({
                    status:"success",
                    message : "CEO Created successfully!"
                    });
                });
          }
        
    }else{
        const ceo = new CEO(req.body);
    
        ceo.save(err => {
            if (err) {
            res.status(500).send({ message: err });
            return;
            }
            res.status(200).send({
            status:"success",
            message : "CEO Created successfully!"
            });
        });
    }
    
  
};



exports.updateCEO =async (req,res)=>{
    let isdefault = false;
    (req.body.default)?isdefault = true:isdefault=false;
    if(isdefault){
    let dt = await CEO.find({
        default: true
      });
    
      if (dt.length > 1) {
        res.status(200).send({
          status: "error",
          message: "Already Default Exist."
        });
      } else {
        CEO.findByIdAndUpdate(req.params.id,{$set:req.body},(err,data)=>{
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
            message : "CEO Updated successfully!"
            });
        });

            });
            }
        }else{
            CEO.findByIdAndUpdate(req.params.id,{$set:req.body},(err,data)=>{
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
                    message : "CEO Updated successfully!"
                    });
                });

            });
        }
}

exports.getSingleCEO = (req,res)=>{
  const ceoId = mongoose.Types.ObjectId(req.params.id);
  CEO.aggregate([{$match:{ _id: ceoId}}],(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success",
              message : "Single CEO retrieved",
              data: data[0]
          });
      }
  });
}

exports.getAllCEO = (req,res)=>{
  
  CEO.aggregate([{$sort:{createdAt:-1}}],(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success",
              message : "All CEO retrieved",
              data: data
          });
      }
  });
}

exports.deleteCEO = (req,res)=>{
  CEO.findByIdAndRemove(req.params.id,(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success", message : "CEO Deleted Successfully"
          });
      }
  });
}
