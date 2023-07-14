const db = require("../models");
const mongoose = require("mongoose");
const { certificate:Certificates,user:User,questionBank: QuestionBank,programsWatch:ProgramsWatch} = db;
var nodemailer = require('nodemailer');

var Jimp = require("jimp");
const fs = require('fs');
const path = require('path')

exports.createCertificateData = async (req, res) => {
    let user = await User.findById(req.body.employeeId);
    const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    function generateString(length) {
        let result = '';
        const charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
    
        return result;
    }

    var uniqueId=generateString(20)+'.png';
    var fileName = path.join(__dirname, '../../assets/certificate.png');
    var certificateName = path.join(__dirname, '../../certificates/'+uniqueId);
    var fs = require('fs');
    var inStr = fs.createReadStream(fileName);
    var outStr = fs.createWriteStream(certificateName);
    inStr.pipe(outStr);
    var imageCaption = user.salutation + " " + user.firstName + " " + user.lastName;
    var department = user.department + " - " + user.stateEmp;
    var loadedImage;
    const nameFont = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK);
    const departmentFont = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
    const programFont = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);

    let prgWatch = await ProgramsWatch.aggregate([{$unwind:"$courses"},
        {$unwind:"$courses.module"},{$match:{"courses.module.quizReference":mongoose.Types.ObjectId(req.body.quizScoreId)}}
        ,{$lookup: {from: 'programs',localField: 'programId',foreignField: '_id',as: 'programData'}},{$unwind:"$programData"}]);

    let programName = prgWatch[0]?.programData?.title;
    Jimp.read(fileName).then(async function (image) {
        console.log(uniqueId);
        image.print(nameFont,0,1850,{text: imageCaption,alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE},2430,(err, image, { x, y }) => {
            image.print(departmentFont, 0, y + 50, {text: department,alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE}, 2430);
        });
        // image.print(programFont, 0, 2557, {text: '"'+programName+'"',alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE}, 2430)
        // Add the regular text
        image.print(programFont, 0, 2558, {
            text: '"'+programName+'"',
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
        }, 2430);

        // Add the bold text with a slightly darker color
        image.print(programFont, 1, 2559, {
            text: '"'+programName+'"',
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
        }, 2430);

        image.print(programFont, 2, 2560, {
            text: '"'+programName+'"',
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
        }, 2430);

        // Save the modified image
        await image.writeAsync(certificateName);
        const certificate = new Certificates({

            quizScoreId: req.body.quizScoreId,
            employeeId: req.body.employeeId,
            quizId: req.body.quizId,
            certificate: uniqueId
          });
        
          certificate.save(err => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                res.status(200).send({
                  status:"success",
                  message : "Certificate Created successfully!"
                  });
                // User.findById(req.body.employeeId,(err,data)=>{
                //     QuestionBank.findById(req.body.quizId,(err,qdata)=>{
                //         var transporter = nodemailer.createTransport({
                //         host: 'smtp.gmail.com',
                //         port: 465,
                //         secure: true,
                //         auth: {
                //           user: 'lndsupport@fusionmicrofinance.in',
                //           pass: 'Msquare@22'
                //         }
                //       });
                      
                //       var mailOptions = {
                //         from: 'lndsupport@fusionmicrofinance.in',
                //         to: data.email,
                //         subject: data.salutation + ' ' + data.firstName + ' '+ data.lastName +', here is your certificate ' +qdata.title + ' quiz',
                //         html: '<!DOCTYPE html>\
                //         <html>\
                //         <body style="margin:10px 15%">\
                //         <div style="text-align:center;">\
                //         <a href=""><img src="https://fusionmicrofinance.com/wp-content/uploads/2021/10/cropped-FUSION-LOGO.png"/></a>\
                //         </div>\
                //         <h1>Congratulations! Here is your certificate for'+qdata.title + ' quiz.</h1>\
                //         <p>Congratulations on receiving '+qdata.title + ' certificate from Fusion Microfinance! You now download your certificate.</p>\
                //         <p>Your certificate is available in an online format so that you can retreive it anywhere at any time, and easily share the details of your acheivement.</p>\
                //         <a style="cursor:pointer" href="https://gurukul.fusionmicrofinance.in/pages/certificates" target="_blank"><button style="background-color:#ffbc2c;color:white;border:unset;padding:15px 20px;font-size:20px;margin-top:20px;border-radius:25px">View Certificate</button></a>\
                //         </body>\
                //         </html>\
                //         '
                //       };
                      
                //       transporter.sendMail(mailOptions, function(error, info){
                //         if (error) {
                //           res.status(500).send({ status:"error", message: error });
                //         } else {
                //             res.status(200).send({
                //                 status:"success",
                //                 message : "Certificate Created successfully!"
                //                 });
                          
                //         }
                //       });
                //     });
                // });
                
                
            });
    }).catch(function (err) {
        console.error(err);
        res.status(200).send({
            status: "error",
            date: err
        });
    });
};

exports.getSingleCertificate = (req,res)=>{
    const certificateId = mongoose.Types.ObjectId(req.params.id);
    Certificates.aggregate([{$match:{ _id: certificateId }},{$lookup: {from: 'quizscores',localField: 'quizScoreId',foreignField: '_id',as: 'quizScoreData'}}
    ,{$lookup: {from: 'questionbanks',localField: 'quizId',foreignField: '_id',as: 'quizData'}},{$lookup: {from: 'users',localField: 'employeeId',foreignField: '_id',as: 'userData'}}],(err,data)=>{
        if(err){
            res.status(500).send({ status:"error", message: err });
        } else {
            res.status(200).send({
                status:"success",
                message : "Single Certificate retrieved",
                data: data[0]
            });
        }
    });
  }


  exports.getSingleCertificateByQuizAndEmpId = (req,res)=>{
    const quizScoreId = mongoose.Types.ObjectId(req.params.id1);
    const empId = mongoose.Types.ObjectId(req.params.id2);
    Certificates.aggregate([{$match:{ quizScoreId: quizScoreId,employeeId:empId }},{$lookup: {from: 'quizscores',localField: 'quizScoreId',foreignField: '_id',as: 'quizScoreData'}}
    ,{$lookup: {from: 'questionbanks',localField: 'quizId',foreignField: '_id',as: 'quizData'}},{$lookup: {from: 'users',localField: 'employeeId',foreignField: '_id',as: 'userData'}}],(err,data)=>{
        if(err){
            res.status(500).send({ status:"error", message: err });
        } else {
            
            res.status(200).send({
                status:"success",
                message : "Single Certificate retrieved",
                data: data[0]
            });
        }
    });
  }
  
  exports.getAllCertificates = async (req,res)=>{
    let certificates = await Certificates.find({ employeeId: req.params.id }).populate("quizId").populate("employeeId").sort({createdAt:-1});
    let data = [];
    if(certificates.length == 0){
        res.status(200).send({
            status:"success",
            message : "All Certificates retrieved",
            data: data
        });
        return
    }
    for(let i in certificates){
        let prgWatch = await ProgramsWatch.aggregate([{$unwind:"$courses"},
        {$unwind:"$courses.module"},{$match:{"courses.module.quizReference":mongoose.Types.ObjectId(certificates[i].quizScoreId)}}
        ,{$lookup: {from: 'programs',localField: 'programId',foreignField: '_id',as: 'programData'}},{$unwind:"$programData"}]);
        data.push({program:prgWatch[0]?.programData?.title,data:certificates[i]})
        if(i == (certificates.length - 1)){
            res.status(200).send({
                status:"success",
                message : "All Certificates retrieved",
                data: data
            });
            return;
        }
    }
    
        
   
  }
