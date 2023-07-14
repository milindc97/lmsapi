const db = require("../models");
const {
    mail: Mail,user:User
} = db;
var nodemailer = require('nodemailer');
const path = require('path')

exports.create = (req, res) => {
    const mail = new Mail(req.body);

    mail.save((err, data) => {
        if (err) {
            res.status(500).send({
                error: {
                    status: "error",
                    message: err
                }
            });
            return;
        }

        let attachments = [];
        for(let i in req.body.attachments){
            attachments.push({filename:req.body.attachments[i].filename,path: path.join(__dirname, '../../uploads/') + req.body.attachments[i].path})
        }

        for(let i in req.body.to){
            User.findById(req.body.to[i],(err,udata)=>{
                var transporter = nodemailer.createTransport({
                    host: 'smtp.zoho.com',
                    port: 465,
                    secure: true,
                    auth: {
                      user: 'lndcomm@fusionmicrofinance.in',
                      pass: 'RCyuC37A71YJ'
                    }
                  });
                  
                  var mailOptions = {
                    from: 'lndcomm@fusionmicrofinance.in',
                    to: udata.email,
                    subject: req.body.subject,
                    html: req.body.message,
                    attachments : attachments
                  };
                  
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        console.log(error)
                    }
                    console.log(info);
                  });
            })
            if(i == (req.body.to.length - 1)){
                res.status(200).send({
                    status: 'success',
                    message: "Mail created successfully!"
                });
            }
        }

     
       
    });
};

exports.get = async (req, res) => {
    let mail = await Mail.find({}).populate("to").sort({createdAt:-1});
    res.status(200).send({
        status: "success",
        message: "All Mails retrieved",
        data: mail
    });
}

exports.getByType = async (req, res) => {
    let mail = await Mail.find({type:req.params.type}).populate("to").sort({createdAt:-1});
    res.status(200).send({
        status: "success",
        message: "All Mails retrieved",
        data: mail
    });
}

exports.single = async (req, res) => {
    let mail = await Mail.findById(req.params.id).populate("to");
    res.status(200).send({
        status: "success",
        message: "Single Mail retrieved",
        data: mail
    });
}

exports.update = async (req, res) => {
    Mail.findByIdAndUpdate(req.params.id,{$set:req.body}, (err, data) => {
        if (err) {
            res.status(500).send({
                error: {
                    status: "error",
                    message: err
                }
            });
            return;
        }

        res.status(200).send({
            status: "success",
            message: "Mail successfully Updated",
        });
    });
}

exports.delete = async (req, res) => {
    Mail.findByIdAndDelete(req.params.id, (err, data) => {
        if (err) {
            res.status(500).send({
                error: {
                    status: "error",
                    message: err
                }
            });
            return;
        }

        res.status(200).send({
            status: "success",
            message: "Mail successfully Deleted",
        });
    });
}
