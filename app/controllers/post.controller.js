const db = require("../models");
const mongoose = require("mongoose");
const { post:Post,postlikes:Postlikes,user:User,notificationTrans:NotificationTrans} = db;
const moment = require('moment-timezone');


exports.createPost = async (req, res) => {

  if(req.userData.roles == "admin" || req.userData.activeWallApproval == false){
    const post = new Post({

      message: req.body.message,
      employeeId: req.body.employeeId,
      status:1,
      likes:[],
      images:req.body.images
    });
      post.save(err => {
          if (err) {
          res.status(500).send({ message: err });
          return;
          }
  
          res.status(200).send({
          status:"success",
          message : "Post Created Successfully"
          });
      });
        
  }else{
    const post = new Post({

      message: req.body.message,
      employeeId: req.body.employeeId,
      status:0,
      likes:[],
      images:req.body.images
    });
      post.save(async (err) => {
          if (err) {
          res.status(500).send({ message: err });
          return;
          }
  
          let emp = await User.find({_id:req.body.employeeId});
          
          User.find({roles: "admin"},(err,user)=>{
            if(err){
                res.status(500).send({ status:"error", message: "Role must not be Empty" });
                return
            }

            let notTrnasAr = [];
            for(let i in user){
              notTrnasAr.push({userId:user[i]._id,title:"Post from "+emp[0]?.salutation+" "+emp[0]?.firstName+" "+emp[0]?.lastName,message:"Your action required",createdAt:moment().tz('Asia/Kolkata'),status:0});
              if(i == (user.length - 1)){
                NotificationTrans.insertMany(notTrnasAr);
                res.status(200).send({
                  status:"success",
                  message : "Please wait! Admin will approve your post."
                  });
              }
            }
            
            
            
        });
          
      });
        
  }
 
};

  exports.getSinglePost = (req,res)=>{
    const postId = mongoose.Types.ObjectId(req.params.id);
    Post.findById(postId,(err,data)=>{
        if(err){
            res.status(500).send({ status:"error", message: err });
        } else {
            res.status(200).send({
                status:"success",
                message : "Single Post retrieved",
                data: data
            });
        }
    });
  }
  


exports.updateStatusApprove = (req,res)=>{
  Post.findByIdAndUpdate(req.params.id,{$set:{status:1}},async (err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
        let user = await User.findById(data.employeeId);
        let notTrnasAr = [];
        notTrnasAr.push({
          userId: data.employeeId,
          title: "Approved Post",
          message: "Your post has been approved. Click to view details.",
          image: user.profilephoto,
          createdAt: moment().tz('Asia/Kolkata'),
          status: 0
        });
          NotificationTrans.insertMany(notTrnasAr);
          res.status(200).send({
              status:"success",
              message : "Post Approved successfully",
              data: data
          });
      }
  });
}

exports.updateStatusReject = (req,res)=>{
  Post.findByIdAndUpdate(req.params.id,{$set:{status:2}},async (err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
        let user = await User.findById(data.employeeId);
        let notTrnasAr = [];
        notTrnasAr.push({
          userId: data.employeeId,
          title: "Rejected Post",
          message: "Your post has not been approved by admin. Click to review and make required changes.",
          image: user.profilephoto,
          createdAt: moment().tz('Asia/Kolkata'),
          status: 0
        });
          NotificationTrans.insertMany(notTrnasAr);
          res.status(200).send({
              status:"success",
              message : "Post Rejected successfully",
              data: data
          });
      }
  });
}


exports.createPostLikes = async (req,res)=>{
  let post = await Postlikes.find({postId:req.body.postId,employeeId:req.body.employeeId});
  console.log(post);
  if(post.length == 0){
    const postlikes = new Postlikes({

      postId: req.body.postId,
      employeeId: req.body.employeeId
    });
      postlikes.save(err => {
          if (err) {
          res.status(500).send({ message: err });
          return;
          }
  
          res.status(200).send({
          status:"success",
          message : "Postlikes Created successfully!"
          });
      });
  }else{
    res.status(200).send({
      status:"success",
      message : "Postlikes Created successfully!"
      });
  }
  
}

exports.getAllPendingPost = (req,res)=>{
  Post.aggregate([{$match:{ status: 0}},{$lookup: {from: 'users',localField: 'employeeId',foreignField: '_id',as: 'userData'}},{$sort:{createdAt:-1}}],(err,data)=>{
    if(err){
        res.status(500).send({ status:"error", message: err });
    } else {
        res.status(200).send({
          status:"success",
          message : "All Posts retrieved",
          data: data
      });
        
    }
});
}

exports.getAllActivePost = (req,res)=>{
  Post.aggregate([{$match:{ status: 1}},{$lookup: {from: 'users',localField: 'employeeId',foreignField: '_id',as: 'userData'}},{$sort:{createdAt:-1}}],(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
        for(let i=0;i < data.length;i++){
          Postlikes.find({postId:data[i]._id},(error,pdata)=>{
            data[i]['likes']=pdata;
          })
        }
        setTimeout(() => {
          res.status(200).send({
            status:"success",
            message : "All Posts retrieved",
            data: data
          });
        }, 100);
          
      }
  });
}

exports.getAllActivePostByUser = (req,res)=>{
  Post.aggregate([{$match:{ employeeId:mongoose.Types.ObjectId(req.params.id)}},{$lookup: {from: 'users',localField: 'employeeId',foreignField: '_id',as: 'userData'}},{$sort:{createdAt:-1}}],(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
        for(let i=0;i < data.length;i++){
          Postlikes.find({postId:data[i]._id},(error,pdata)=>{
            data[i]['likes']=pdata;
          })
        }
        setTimeout(() => {
          res.status(200).send({
            status:"success",
            message : "All Posts retrieved",
            data: data
          });
        }, 100);
          
      }
  });
}


exports.deletePostLikes = (req,res)=>{
  const pId = mongoose.Types.ObjectId(req.params.pId);
  const eId = mongoose.Types.ObjectId(req.params.eId);
  Postlikes.findOneAndRemove({postId:pId,employeeId:eId},(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } 
          res.status(200).send({
              status:"success", message : "PostLikes Deleted Successfully"
          });
    
  });
}


exports.deletePost = (req,res)=>{
  Post.findByIdAndRemove(req.params.id,(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success", message : "Post Deleted Successfully"
          });
      }
  });
}

