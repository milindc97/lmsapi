const db = require("../models");
const { notification: Notification, notificationTrans: NotificationTrans,user:User, role:Role,programAllocation: ProgramAllocation ,program:Program,group:Group } = db;
const moment = require('moment-timezone');

exports.createNotification = (req, res) => {
  const notification = new Notification({
    title:req.body.title,
    message:req.body.message,
    segment: req.body.segment,
    segmentId: req.body.segmentId,
    image:req.body.image,
    createdAt:moment().tz('Asia/Kolkata')
  });


    notification.save(err => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        if(req.body.segment == "All"){
            User.find({roles: "user"},(err,data)=>{
                if(err){
                    res.status(500).send({ status:"error", message: "Something went Wrong" });
                    return
                }

                let notTrnasAr = [];
                for(let i in data){
                    notTrnasAr.push({userId:data[i]._id,title:req.body.title,message:req.body.message,image:req.body.image,createdAt:moment().tz('Asia/Kolkata'),status:0});
                }
                
                NotificationTrans.insertMany(notTrnasAr);
            });
        }

        if(req.body.segment == "Program"){
            Program.find({title: req.body.segmentId},(err, prg) => {
                if (err) {
                  res.status(500).send({ message: err });
                  return;
                }
                ProgramAllocation.find({programId: prg[0]._id},(err, data) => {
                    if (err) {
                    res.status(500).send({ message: err });
                    return;
                    }

                    let notTrnasAr = [];
                    for(let i in data){
                        notTrnasAr.push({userId:data[i].employeeId,title:req.body.title,message:req.body.message,image:req.body.image,createdAt:moment().tz('Asia/Kolkata'),status:0});
                    }
                        
                    NotificationTrans.insertMany(notTrnasAr);
                });
            });
        }

        if(req.body.segment == "Department"){
            User.find({department: req.body.segmentId},(err, data) => {
                if (err) {
                  res.status(500).send({ message: err });
                  return;
                }

                let notTrnasAr = [];
                for(let i in data){
                    notTrnasAr.push({userId:data[i]._id,title:req.body.title,message:req.body.message,image:req.body.image,createdAt:moment().tz('Asia/Kolkata'),status:0});
                }
                    
                NotificationTrans.insertMany(notTrnasAr);
            });
        }

        if(req.body.segment == "Group"){
            Group.find({name: req.body.segmentId},(err, data) => {
                if (err) {
                  res.status(500).send({ message: err });
                  return;
                }
                User.find({group:data[0]._id},(err,res)=>{
                    let notTrnasAr = [];
                    for(let i in res){
                        notTrnasAr.push({userId:res[i]._id,title:req.body.title,message:req.body.message,image:req.body.image,createdAt:moment().tz('Asia/Kolkata'),status:0});
                    }
                    NotificationTrans.insertMany(notTrnasAr);
                })

                
                    
             
            });
        }
        


        res.status(200).send({
            status:"success",
            message : "Notification Created successfully!"
        });
    });
};

exports.updateNotification = (req,res)=>{
    for(let i in req.body.data){
        NotificationTrans.findByIdAndUpdate(req.body.data[i]._id,{$set:{ status: "1"}},(err, data)=>{
        });
        if(i == (req.body.data.length -1)){
            res.status(200).send({
                status:"success",
                message : "Notification Updated successfully!"
            });
        }
    }
}

exports.notificationByUserId = (req, res) => {

    NotificationTrans.find({userId: req.params.id},(err,data)=>{
        if(err){
            res.status(500).send({ status:"error", message: err });
            return
        }

        
        res.status(200).send({
            status:"success",
            message:"Notification",
            data:data
        });
        
    }).sort({createdAt:-1});
};

exports.getAllNotification = (req,res)=>{
    Notification.find({},(err,data)=>{
        if(err){
            res.status(500).send({ status:"error", message: err });
        } else {
            res.status(200).send({
                status:"success",
                message : "All Notification retrieved",
                data: data
            });
        }
    }).limit(50).sort({"createdAt":-1});
  }

  exports.getAllNotificationByUser = (req,res)=>{
    NotificationTrans.find({userId:req.params.id},(err,data)=>{
        if(err){
            res.status(500).send({ status:"error", message: err });
        } else {
            res.status(200).send({
                status:"success",
                message : "All Notification retrieved",
                data: data
            });
        }
    }).limit(50).sort({"createdAt":-1});
  }


  exports.createNotificationForAdmin = (req, res) => {
    if(req.body.segment == "Admin"){
        User.find({roles: "admin"},(err,data)=>{
            if(err){
                res.status(500).send({ status:"error", message: "Role must not be Empty" });
                return
            }

            let notTrnasAr = [];
            for(let i in data){
                notTrnasAr.push({userId:data[i]._id,title:req.body.title,message:req.body.message,createdAt:moment().tz('Asia/Kolkata'),status:0});
            }
            
            NotificationTrans.insertMany(notTrnasAr);
        });
    }
    


    res.status(200).send({
        status:"success",
        message : "Notification Created successfully!"
    });
  };

exports.clearNotificationByUserId = (req, res) => {

    NotificationTrans.updateMany({ "userId" :  req.params.id},{$set:{status:1}},(err,data)=>{
        if(err){
            res.status(500).send({ status:"error", message: err });
            return
        }

        
        res.status(200).send({
            status:"success",
            message:"Notification Cleard",
        });
        
    });
};

exports.clearNotification = (req, res) => {

    NotificationTrans.updateOne({ "_id" :  req.params.id},{$set:{status:1}},(err,data)=>{
        if(err){
            res.status(500).send({ status:"error", message: err });
            return
        }

        
        res.status(200).send({
            status:"success",
            message:"Notification Cleard",
        });
        
    });
};

