const db = require("../models");
const { news: News } = db;
const mongoose = require("mongoose");


exports.createNews = (req, res) => {
  
  const news = new News({

    description: req.body.description,
    date:req.body.date,
    photo:req.body.photo,
    type:req.body.type,
    category:req.body.category
  });

    news.save(err => {
        if (err) {
        res.status(500).send({ message: err });
        return;
        }
        res.status(200).send({
        status:"success",
        message : "News Created successfully!"
        });
    });
  
};



exports.updateNews = (req,res)=>{
    News.findByIdAndUpdate(req.params.id,{$set:{ description: req.body.description,photo:req.body.photo,
        date:req.body.date,type:req.body.type,category:req.body.category}},(err,data)=>{
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
          message : "News Updated successfully!"
        });
      });

  });
}

exports.getSingleNews = (req,res)=>{
  const newsId = mongoose.Types.ObjectId(req.params.id);
  News.aggregate([{$match:{ _id: newsId}}],(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success",
              message : "Single News retrieved",
              data: data[0]
          });
      }
  });
}

exports.getAllNews = (req,res)=>{
  
  News.aggregate([{$sort:{createdAt:-1}}],(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success",
              message : "All News retrieved",
              data: data
          });
      }
  });
}


exports.getNewsByType = async (req,res)=>{
  
  let newsLetterType = await News.find({type:req.params.type});
  res.status(200).send({
    status:"success",
    message : "All News retrieved",
    data: newsLetterType,
});
}

exports.getNewsByCategory = async (req,res)=>{
  
  let newsLetterType = await News.find({category:req.params.category});
  res.status(200).send({
    status:"success",
    message : "All News retrieved",
    data: newsLetterType,
});
}


exports.getNewsCountByType = async (req,res)=>{
  
  let newsLetterType = await News.find({type:"News Letter Link"});
  let mfinRbiType = await News.find({type:"MFIN & RBI Guidelines"});
  let trainingNewUpdateType = await News.find({type:"Training On New Update"});
  let educateMoreType = await News.find({type:"Education More"});
  res.status(200).send({
    status:"success",
    message : "All News retrieved",
    newsLetterType: newsLetterType,
    mfinRbiType:mfinRbiType,
    trainingNewUpdateType:trainingNewUpdateType,
    educateMoreType:educateMoreType
});
}



exports.deleteNews = (req,res)=>{
  News.findByIdAndRemove(req.params.id,(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success", message : "News Deleted Successfully"
          });
      }
  });
}
