const db = require("../models");
const { support: Support,supporttransaction:SupportTransaction,role:Role,user:User,notificationTrans:NotificationTrans} = db;
const mongoose = require("mongoose");
var nodemailer = require('nodemailer');
const path = require('path')
const moment = require('moment-timezone');

exports.createSupportRequest = (req, res) => {
    const support = new Support({
        subject: req.body.subject,
        message: req.body.message,
        file: req.body.file,
        employeeId:req.body.employeeId,
        status:0
    });

    support.save(async (err,data) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        let emp = await User.find({_id:req.body.employeeId});
        
        User.find({roles:"admin"},(err,user)=>{
            if(err){
                res.status(500).send({ status:"error", message: "Role must not be Empty" });
                return
            }

            let notTrnasAr = [];
            for(let i in user){
                notTrnasAr.push({userId:user[i]._id,title:"Write to Us request submission",message:"Your support request has been submitted successfully & you will receive notification on closure.",image:user[i].profilephoto,createdAt:moment(),status:0});
                if(i == (user.length - 1)){
                    NotificationTrans.insertMany(notTrnasAr);
                    res.status(200).send({
                        status:"success",
                        message : "Please Wait! Admin will solve your query",
                        data:data
                    });
                }
            }
            
        });
      
    });
};

exports.updateSupportRequestStatus = (req,res)=>{
    Support.findByIdAndUpdate(req.params.id,{$set:{status: req.body.status,remark:req.body.remark}},async (err,data)=>{
        if(err){
            res.status(500).send({ status:"error", message: err });
        } else {
            if(req.body.status == 1){
                let user = await User.findById(data.employeeId);
                let notTrnasAr = [];
                notTrnasAr.push({
                    userId: data.employeeId,
                    title: "Write to Us request resolution",
                    message: 'Your support request has been resolved. Click to view details.',
                    image: user.profilephoto,
                    createdAt: moment(),
                    status: 0
                });
                NotificationTrans.insertMany(notTrnasAr);
            }
            res.status(200).send({
                status:"success",
                message : "Support Request Status updated successfully",
                data: data
            });
        }
    });
}

exports.getAllSupportRequest = (req,res)=>{
    Support.aggregate([{$lookup: {from: 'users',localField: 'employeeId',foreignField: '_id',as: 'usersData'}}],(err,data)=>{
        if(err){
            res.status(500).send({ status:"error", message: err });
        } else {
            res.status(200).send({
                status:"success",
                message : "Support Request retrieved",
                data: data
            });
        }
    }).sort({"createdAt":-1});
  }


exports.getAllSupportRequestByEmp = (req,res)=>{
    const empId = mongoose.Types.ObjectId(req.params.id);
    Support.aggregate([{$match:{employeeId:empId}},{$lookup: {from: 'users',localField: 'employeeId',foreignField: '_id',as: 'usersData'}}],(err,data)=>{
        if(err){
            res.status(500).send({ status:"error", message: err });
        } else {
            res.status(200).send({
                status:"success",
                message : "Support Request retrieved",
                data: data
            });
        }
    });
  }


exports.deleteSupportRequest = (req,res)=>{
  Support.findByIdAndRemove(req.params.id,(err,data)=>{
      if(err){
          res.status(500).send({ status:"error", message: err });
      } else {
          res.status(200).send({
              status:"success", message : "Support Request Deleted Successfully"
          });
      }
  });
}

exports.sendSupportEmail = (req,res)=>{
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'lndsupport@fusionmicrofinance.in',
          pass: 'Msquare@22'
        }
      });
      
      var mailOptions = {
        from: 'lndsupport@fusionmicrofinance.in',
        to: req.body.email,
        subject: 'Ticket Id: #' +Math.floor(100000 + Math.random() * 900000) + ' assigned to you',
        html: 'Hello, <br><br> Query has been delegated to you.<br><br>Subject :<br> '+ req.body.subject+'<br><br>Query :'+req.body.message+'<br><br>Supportive Document :<br><a href='+req.body.file+' target="_blank">View Supportive Document</a><br><br>Please do the needful and respond back using Employee Engagement App.<br><br> Regards,<br> LnD Team.<br>'
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          res.status(500).send({ status:"error", message: error });
        } else {
            const supportTransaction = new SupportTransaction({
                message: 'Query delegated to '+req.body.salutation+' '+ req.body.firstName+' '+req.body.lastName,
                supportId: req.body.id,
                employeeId:req.body.employeeId,
                status:0
            });
        
            supportTransaction.save((err,data) => {
                if (err) {
                  res.status(500).send({ message: err });
                  return;
                }
        
                res.status(200).send({
                    status:"success", message : "Mail Sent Successfully",data:info
                });
            });
          
        }
      });
}
exports.getAllSupportTransaction = (req,res)=>{
    const supportId = mongoose.Types.ObjectId(req.params.id);
    SupportTransaction.aggregate([{$match:{supportId:supportId}},{$lookup: {from: 'users',localField: 'employeeId',foreignField: '_id',as: 'usersData'}},{$lookup: {from: 'supports',localField: 'supportId',foreignField: '_id',as: 'supportsData'}}],(err,data)=>{
        if(err){
            res.status(500).send({ status:"error", message: err });
        } else {
            res.status(200).send({
                status:"success",
                message : "Support Transaction retrieved",
                data: data
            });
        }
    }).sort({"createdAt":-1});
  }

  exports.updateSupportTransactionStatus = (req,res)=>{
    const supportId = mongoose.Types.ObjectId(req.params.id);
    SupportTransaction.find({supportId:supportId},{$set:{status: req.body.status}},(err,data)=>{
        if(err){
            res.status(500).send({ status:"error", message: err });
        } else {
            res.status(200).send({
                status:"success",
                message : "Support Transaction Status updated successfully",
                data: data
            });
        }
    });
}