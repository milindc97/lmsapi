const db = require("../models");
const {
    course: Courses,
    module: Module,
    questionBank: QuestionBank,
    program: Program,
    user: User,
    role: Role,
    audit: Audit,
    programAllocation: ProgramAllocation,
    programsWatch: ProgramsWatch,
    coursesWatch:CoursesWatch,
    modulesWatch:ModulesWatch,
    winners:Winners,
    trainingGlimpse:TrainingGlimpse,
    ceo:CEO,
    news:News,
    appversion:Appversion
} = db;
const fs = require('fs');
const path = require('path')
const formidable = require('formidable');
var request = require('request');
const mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var Jimp = require("jimp");
const moment = require('moment-timezone');
const aws = require('aws-sdk');

var html_to_pdf = require('html-pdf-node');


const agenda = require("../../agenda.js");
const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const spacesEndpoint = new aws.Endpoint('sgp1.digitaloceanspaces.com');
const s3 = new aws.S3({
    endpoint: spacesEndpoint,
    accessKeyId: 'DO00LA4AMK24BWDXUHZW',
    secretAccessKey: 'VmChyYpKhkx3HSbGBTjj382bEp3eq6fWxwlgmqx5t7I'
});

function generateString(length) {
    let result = ' ';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

exports.uploadDoc = (req, res) => {
    const form = new formidable.IncomingForm({
        allowEmptyFiles: false,
        keepExtensions: true
    });
    form.parse(req, function (err, fields, files) {
        if (fields.file !== "") {
            var filePath = files.file.filepath;
            let params = {
                Bucket: 'fusionlnd',
                Key: path.basename(filePath),
                Body: fs.createReadStream(filePath),
                ACL: 'public-read',
                ContentType:files.file.mimetype
            };
            s3.upload(params, function(err, data) {
                if (err) {
                    res.status(500).send({
                        status: "error",
                        message: err
                    });
                }
                res.status(200).send({
                    status: "success",
                    message: "File Successfully Uploaded",
                    data: {
                        url: data.Location
                    }
                });
            });
        }
    })
}

exports.uploadFile = (req, res) => {
    const form = new formidable.IncomingForm({
        allowEmptyFiles: false,
        keepExtensions: true
    });
    form.parse(req, function (err, fields, files) {
        if (fields.file !== "") {
            var oldPath = files.file.filepath;
            var newPath = path.join(__dirname, '../../uploads') +
                '/' + files.file.newFilename
            var rawData = fs.readFileSync(oldPath)

            fs.writeFile(newPath, rawData, function (err) {

                res.status(200).send({
                    status: "success",
                    message: "Successfully Uploaded",
                    data: {
                        url: files.file.newFilename
                    }
                });
            });
        } else {
            res.status(500).send({
                status: "error",
                message: "File is Missing"
            });
        }
    });
};

exports.retrieveFile = (req, res, next) => {
    try {
        
        res.status(200).sendFile(path.join(__dirname, '../../uploads/' + req.params.file));
    } catch (error) {
        res.status(500).send({
            status: "error",
            message: "File is Missing"
        });
    }
}

exports.retrieveCertificateFile = (req, res, next) => {

    try {

        res.status(200).sendFile(path.join(__dirname, '../../certificates/' + req.params.file));
    } catch (error) {
        res.status(500).send({
            status: "error",
            message: "File is Missing"
        });
    }
}

exports.downloadImageFile = (req, res, next) => {
    
    try {
        const html = `
            <html>
                <body>
                    <img width="100%" src="data:image/png;base64,${fs.readFileSync(path.join(__dirname,'../../certificates/' + req.params.file)).toString('base64')}"/>
                </body>
            </html>
        `;
        const options = { format: 'A4' };

        const file = { content: html };
        
        html_to_pdf.generatePdf(file, options).then(pdfBuffer => {
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader('Content-Disposition', 'attachment; filename=certificate.pdf')
            res.setHeader('Content-Length', pdfBuffer.length)
            return res.end(pdfBuffer);
        });
    } catch (error) {
        res.status(500).send({
            status: "error",
            message: "File is Missing"
        });
    }
}

exports.downloadCSVFile = (req, res, next) => {
    
    try {
        res.setHeader('Content-Disposition', 'attachment;filename="' + path.join(__dirname, '../../certificates/' + req.params.file));
        res.status(200).sendFile(path.join(__dirname, '../../certificates/' + req.params.file));
    } catch (error) {
        res.status(500).send({
            status: "error",
            message: "File is Missing"
        });
    }
}

function getMonthNumber(month) {
    var monthNames = [
      "Jan", "Feb", "Mar",
      "Apr", "May", "Jun", "Jul",
      "Aug", "Sep", "Oct",
      "Nov", "Dec"
    ];
  
    return monthNames.indexOf(month);
}


exports.employeeSync = (req, res) => {
    console.log("called");
    var options1 = {
        'method': 'POST',
        'url': 'https://portal.zinghr.com/2015/route/EmployeeDetails/GetEmployeeMasterDetails',
        'headers': {
            'Content-Type': 'application/json',
            'Cookie': 'BNIS___utm_is1=B60Jak8HFom44MXFX4khxaMCNMcdGYxj1CtF5/FGjzpTd7XATQQaK8QBsMyfBWhZ9d2ryUbBEUX1POTveJIHEJ7CmijMkvH2Svp17Q8dQ/wSGXonM3iPHw==; BNIS___utm_is2=zUOmM9deK1HgEcKo1NvwD9KWOQQMjoLnRQ1btVBEQCaDneEpfa2oV57yQQrUuRanUpI9w7KCZZQ='
        },
        body: JSON.stringify({
            "SubscriptionName": "FUSION",
            "Token": "2de2c5ed36884dbab906cda32caae204",
            "PageSize": "500",
            "PageNumber": "1",
            "IPAddress":"103.208.71.39"
        })
    };
    request(options1, function (error1, response1) {
        console.log("req1");
        if (error1) throw new Error(error1);
        var obj1 = JSON.parse(response1.body);
        let count = (obj1.TotalEmployeeCount / 500).toFixed(0);
        
        let promises = [];
        let data = [];
        for (let k = 0; k < (count); k++) {
            promises.push(new Promise((resolve, reject) => {
                var options = {
                    'method': 'POST',
                    'url': 'https://portal.zinghr.com/2015/route/EmployeeDetails/GetEmployeeMasterDetails',
                    'headers': {
                        'Content-Type': 'application/json',
                        'Cookie': 'BNIS___utm_is1=B60Jak8HFom44MXFX4khxaMCNMcdGYxj1CtF5/FGjzpTd7XATQQaK8QBsMyfBWhZ9d2ryUbBEUX1POTveJIHEJ7CmijMkvH2Svp17Q8dQ/wSGXonM3iPHw==; BNIS___utm_is2=zUOmM9deK1HgEcKo1NvwD9KWOQQMjoLnRQ1btVBEQCaDneEpfa2oV57yQQrUuRanUpI9w7KCZZQ='
                    },
                    body: JSON.stringify({
						"SubscriptionName": "FUSION",
						"Token": "2de2c5ed36884dbab906cda32caae204",
						"PageSize": "500",
                        "PageNumber": (k+1).toString(),
						"IPAddress":"103.208.71.39"
                    })
                };
                request(options, function (error, response) {
                    console.log("req2");
                    if (error) throw new Error(error);
                    var obj = JSON.parse(response.body);
                    if (obj?.Employees.length > 0) {
                        for (let i = 0; i < obj.Employees.length; i++) {
                            const employee = obj.Employees[i];
                            User.find({ employeeCode: employee.EmployeeCode }, async (err, dt) => {
                                if (dt.length == 0) {
                                    let department = "";
                                    let state="";
                                    let cluster="";
                                    let branch="";
                                    let designation="";
                                    for (let j = 0; j < employee.Attributes.length; j++) {
                                        if (employee.Attributes[j].AttributeTypeCode == "Department") {
                                            department = employee.Attributes[j].AttributeTypeUnitCode;
                                        }
                                        if (employee.Attributes[j].AttributeTypeCode == "State") {
                                            state = employee.Attributes[j].AttributeTypeUnitCode;
                                        }
                                        if (employee.Attributes[j].AttributeTypeCode == "Cluster") {
                                            cluster = employee.Attributes[j].AttributeTypeUnitDesc;
                                        }
                                        if (employee.Attributes[j].AttributeTypeCode == "Branch") {
                                            branch = employee.Attributes[j].AttributeTypeUnitCode;
                                        }
                                        if (employee.Attributes[j].AttributeTypeCode == "Designation") {
                                            designation = employee.Attributes[j].AttributeTypeUnitCode;
                                        }
                                    }
                                    let depInterval = setInterval(() => {
                                        if (department != "") {
                                            clearInterval(depInterval);
                                            let dateObj;
                                            if(employee.DateofBirth != "" && employee.DateofBirth != null && employee.DateofBirth != undefined){
                                                var dateString = employee.DateofBirth;
                                                var dateParts = dateString.split(" "); // split the string into an array of parts
                                                var year = dateParts[2];
                                                var month = dateParts[1];
                                                var day = dateParts[0];
                                                const dateObj = moment({ year, month: getMonthNumber(month), day }).tz('Asia/Kolkata');
                                                const timezoneOffsetInMinutes = 330; // 3 hours ahead of UTC
                                                dateObj.add(timezoneOffsetInMinutes, 'minutes');
                                            }else {
                                                dateObj = moment().tz('Asia/Kolkata');
                                            }
                                            
                                            const user = new User({
                                                salutation: employee.Salutation,
                                                firstName: employee.FirstName,
                                                lastName: employee.LastName,
                                                mobile: employee.Mobile,
                                                dob: dateObj.toISOString(),
                                                email: employee.PersonalEmail,
                                                password: bcrypt.hashSync("12345678", 8),
                                                employeeCode: employee.EmployeeCode,
                                                employeeId: employee.EmployeeID,
                                                
                                                gender: employee.Gender,
                                                department: department,
                                                stateEmp:state,
                                                cluster:cluster,
                                                designation:designation,
                                                branch:branch,
                                                roles: "user",
                                                status: (employee.EmploymentStatus == "Active") ? 1:0
            
                                            });
            
                                            user.save((err, user) => {
                                                if (err) {
                                                    res.status(500).send({
                                                        message: err
                                                    });
                                                    return;
                                                }
                                                if(i == (obj.Employees.length - 1)){
                                                    resolve(k);
                                                }
                                            });
                                        }
                                    }, 100);
                                } else {
                                    let dateObj;
                                    if(employee.DateofBirth != "" && employee.DateofBirth != null && employee.DateofBirth != undefined){
                                        var dateString = employee.DateofBirth;
                                        var dateParts = dateString.split(" "); // split the string into an array of parts
                                        var year = dateParts[2];
                                        var month = dateParts[1];
                                        var day = dateParts[0];
                                        const dateObj = moment({ year, month: getMonthNumber(month), day }).tz('Asia/Kolkata');
                                        const timezoneOffsetInMinutes = 330; // 3 hours ahead of UTC
                                        dateObj.add(timezoneOffsetInMinutes, 'minutes');
                                    }else {
                                        dateObj = moment().tz('Asia/Kolkata');
                                    }
                                    let index = employee.Attributes.map((res)=> { return res.AttributeTypeCode; }).indexOf("Designation");
                                    console.log(employee.Attributes[index].AttributeTypeUnitCode);
                                    await User.findByIdAndUpdate(dt[0]._id,{$set:{status: (employee.EmploymentStatus == "Active") ? 1:0,dob:dateObj.toISOString(),firstName: employee.FirstName,
                                    lastName: employee.LastName,salutation: employee.Salutation,designation:employee.Attributes[index].AttributeTypeUnitCode}});
                                }
                            });
                           console.log(i) 
                        }
                    }else{
                            resolve(k);

                    }
                });
            }));
        }
        Promise.all(promises).then((results) => {
            return res.status(200).send({
                status: "success",
                data:results
            });
        });
    });
};

exports.overallSnapshot =async (req, res) => {
    let courseCount = 0;
    let programCount = 0;
    let moduleCount = 0;
    let qbCount = 0;
    courseCount = await Courses.find({isLearningActivity:false}).count();
    programCount = await Program.find({isLearningActivity:false}).count();
    moduleCount = await Module.find({isLearningActivity:false}).count();
    qbCount = await QuestionBank.find({isLearningActivity:false}).count();
    res.status(200).send({
        status: "success",
        message: "Count Fetched",
        course: courseCount,
        program: programCount,
        module: moduleCount,
        qb: qbCount
    });
}

exports.overallSnapshotLearning =async (req, res) => {
    let courseCount = 0;
    let programCount = 0;
    let moduleCount = 0;
    let qbCount = 0;
    courseCount = await Courses.find({isLearningActivity:true}).count();
    programCount = await Program.find({isLearningActivity:true}).count();
    moduleCount = await Module.find({isLearningActivity:true}).count();
    qbCount = await QuestionBank.find({isLearningActivity:true}).count();
    res.status(200).send({
        status: "success",
        message: "Count Fetched",
        course: courseCount,
        program: programCount,
        module: moduleCount,
        qb: qbCount
    });
}

exports.apiLogReport = (req, res) => {

    Audit.aggregate([{
        $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userData'
        }
    }, {
        $sort: {
            createdAt: -1
        }
    }, {
        $limit: 1000
    }], (err, data) => {

        if (err) {
            res.status(500).send({
                status: "error",
                message: err
            });
            reutrn;
        }

        res.status(200).send({
            status: "success",
            message: "Audit Fetched",
            data: data
        });
    });

}

exports.searchProgramForEmployee = async (req, res) => {

    let searchQuery = req.body.search.toLowerCase();

    let programsWatch = await ProgramsWatch.find({isLearningActivity:false,employeeId: req.body.employeeId}).populate("programId").populate("courses.courseId").populate("courses.module.moduleId").populate("courses.module.questionbank").populate("employeeId").sort({
        index: -1
      });
      
    let searchResult = [];

    for (let i = 0; i < programsWatch.length; i++) {
        if(programsWatch[i].programId != null){
            if (programsWatch[i].programId.title.toLowerCase().indexOf(searchQuery) != -1 || programsWatch[i].programId.keywords.toLowerCase().indexOf(searchQuery) != -1) {
                searchResult.push({
                    title: programsWatch[i].programId.title,
                    desc: programsWatch[i].programId.description,
                    programid: programsWatch[i].programId._id,
                    id: programsWatch[i]._id,
                });
            }
        }
        if (i == programsWatch.length - 1) {
            res.status(200).send({
                status: "success",
                message: "Search Program Result",
                data: searchResult
            });
        }
    }
}

exports.searchLearningActivityProgramForEmployee = async (req, res) => {

    let searchQuery = req.body.search.toLowerCase();

    let programsWatch = await ProgramsWatch.find({isLearningActivity:true,employeeId: req.body.employeeId}).populate("programId").populate("courses.courseId").populate("courses.module.moduleId").populate("courses.module.questionbank").populate("employeeId").sort({
        index: -1
      });
      
    let searchResult = [];

    for (let i = 0; i < programsWatch.length; i++) {
        if(programsWatch[i].programId != null){
            if (programsWatch[i].programId.title.toLowerCase().indexOf(searchQuery) != -1 || programsWatch[i].programId.keywords.toLowerCase().indexOf(searchQuery) != -1) {
                searchResult.push({
                    title: programsWatch[i].programId.title,
                    desc: programsWatch[i].programId.description,
                    programid: programsWatch[i].programId._id,
                    id: programsWatch[i]._id,
                });
            }
        }
        if (i == programsWatch.length - 1) {
            res.status(200).send({
                status: "success",
                message: "Search Program Result",
                data: searchResult
            });
        }
    }
}

exports.searchCourseForEmployee = async (req, res) => {

    let searchQuery = req.body.search.toLowerCase();

    let coursesWatch = await CoursesWatch.find({employeeId: req.body.employeeId}).populate("courseId").populate("modules.moduleId").populate("modules.questionbank").populate("employeeId").sort({createdAt:-1});
    
    let searchResult = [];

    for (let i = 0; i < coursesWatch.length; i++) {
        if(coursesWatch[i].courseId != null){
            if (coursesWatch[i].courseId.title.toLowerCase().indexOf(searchQuery) != -1 || coursesWatch[i].courseId.keywords.toLowerCase().indexOf(searchQuery) != -1) {
                searchResult.push({
                    title: coursesWatch[i].courseId.title,
                    desc: coursesWatch[i].courseId.description,
                    courseid: coursesWatch[i].courseId._id,
                    id: coursesWatch[i]._id,
                });
            }

            
        }
        if (i == coursesWatch.length - 1) {
            res.status(200).send({
                status: "success",
                message: "Search Courses Result",
                data: searchResult
            });
        }
    }
}

exports.searchModuleForEmployee = async (req, res) => {

    let searchQuery = req.body.search.toLowerCase();

    let modulesWatch = await ModulesWatch.find({employeeId:req.body.employeeId}).populate("moduleId").populate("questionbank").populate("employeeId").sort({createdAt:-1});

    let searchResult = [];

    for (let i = 0; i < modulesWatch.length; i++) {
        if(modulesWatch[i].moduleId != null){
            if (modulesWatch[i].moduleId.title.toLowerCase().indexOf(searchQuery) != -1 || modulesWatch[i].moduleId.keywords.toLowerCase().indexOf(searchQuery) != -1) {
                searchResult.push({
                    title: modulesWatch[i].moduleId.title,
                    desc: modulesWatch[i].moduleId.description,
                    moduleid: modulesWatch[i].moduleId._id,
                    id: modulesWatch[i]._id
                });
            }

            
        }
        if (i == modulesWatch.length - 1) {
            res.status(200).send({
                status: "success",
                message: "Search Module Result",
                data: searchResult
            });
        }
    }
}

exports.searchQuizForEmployee = (req, res) => {

    let searchQuery = req.body.search.toLowerCase();
    const employeeId = mongoose.Types.ObjectId(req.body.employeeId);

    ProgramAllocation.aggregate([{
        $match: {
            type: "Quiz",
            employeeId: employeeId
        }
    }, {
        $lookup: {
            from: 'questionbanks',
            localField: 'uniqueId',
            foreignField: '_id',
            as: 'quizsData'
        }
    }], (err, data) => {

        if (err) {
            res.status(500).send({
                status: "error",
                message: err
            });
            reutrn;
        }

        let searchResult = [];

        for (let i = 0; i < data.length; i++) {
            if (data[i].quizsData[0].title.toLowerCase().indexOf(searchQuery) != -1 || data[i].quizsData[0].keywords.toLowerCase().indexOf(searchQuery) != -1) {
                searchResult.push({
                    title: data[i].quizsData[0].title,
                    desc: data[i].quizsData[0].description,
                    id: data[i].quizsData[0]._id
                });
            }

            if (i == data.length - 1) {
                res.status(200).send({
                    status: "success",
                    message: "Search Module Result",
                    data: searchResult
                });
            }
        }
    });
}

exports.createCertificate = async (req, res) => {
    // const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    // function generateString(length) {
    //     let result = '';
    //     const charactersLength = characters.length;
    //     for ( let i = 0; i < length; i++ ) {
    //         result += characters.charAt(Math.floor(Math.random() * charactersLength));
    //     }
    
    //     return result;
    // }

    // var uniqueId=generateString(20)+'.png';
    // var fileName = path.join(__dirname, '../../assets/certificate.png');
    // var certificateName = path.join(__dirname, '../../certificates/'+uniqueId);
    // var fs = require('fs');
    // var inStr = fs.createReadStream(fileName);
    // var outStr = fs.createWriteStream(certificateName);
    // inStr.pipe(outStr);
    // var imageCaption = req.body.salutation + " " + req.body.firstName + " " + req.body.lastName;
    // var department = req.body.department + " - " + req.body.state;
    // var loadedImage;
    // const nameFont = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK);
    // const departmentFont = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);


    // Jimp.read(fileName).then(function (image) {
    //     console.log(uniqueId);
    //     image.print(nameFont,0,1850,{text: imageCaption,alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE},2430,(err, image, { x, y }) => {
    //         image.print(departmentFont, 0, y + 50, {text: department,alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE}, 2430);
    //         }).write(certificateName);
        
    //     res.status(200).send({
    //         status: "success",
    //         imageName:uniqueId
    //     });
    // }).catch(function (err) {
    //     console.error(err);
    //     res.status(200).send({
    //         status: "error",
    //         date: err
    //     });
    // });
}

exports.getEmpDashboardData = async (req, res) =>{
    let topWinners = await Winners.find({quizLiveDate:{$lte:moment().tz('Asia/Kolkata')}}).populate("programId").populate("quizId")
    .populate("winners.employeeId").populate("winners.quizScoreId").sort({quizLiveDate:-1});
    let count = {
        totalEmp : 0,
        activeEmp : 0,
        deacEmp : 0,
        assEmp : 0
    }
    let totalEmp = await User.countDocuments({ roles: "user" });
    let activeEmp = await User.countDocuments({ roles: "user",status: 1  });
    let deacEmp =  await User.countDocuments({ roles: "user", status: 0 });
    let assEmp = await ProgramsWatch.distinct("employeeId").countDocuments();
    count = {
        totalEmp: totalEmp,
        activeEmp: activeEmp,
        deacEmp: deacEmp,
        assEmp: assEmp
    }
    let trainingGlimpse = await TrainingGlimpse.find({}).sort({createdAt:-1});
    let ceos = await CEO.find({}).sort({createdAt:-1});
    let chairman = ceos.filter((data)=> data.default == true);
    let questionBank = await QuestionBank.find({
        status: 1,
        isLearningActivity: true,
        learningLiveDate: {
            $lte: moment().tz('Asia/Kolkata')
        }
    }).sort({
        learningLiveDate: -1
    });
    let quizData = false;
    const liveDate = moment(questionBank[0].learningLiveDate).tz('Asia/Kolkata');
    const liveDate30 = moment(questionBank[0].learningLiveDate).tz('Asia/Kolkata').add(30, 'minutes');
    const date = moment().tz('Asia/Kolkata');
    if (liveDate30 > date && date > liveDate) {
        quizData = true;
    }
    let recentQuiz = { data: quizData,
        quiz: questionBank[0],
        resultTime: liveDate30}
    let fusionNews = await News.find({category:'Fusion'});
    let otherNews = await News.find({category:'Other'});
    let data = {
        topWinners: topWinners[0],
        count: count,
        trainingGlimpse: trainingGlimpse,
        ceos: ceos,
        chairman: chairman[0],
        recentQuiz: recentQuiz,
        fusionNews: fusionNews,
        otherNews:otherNews
    }
    res.status(200).send({
        status:"success",
        message : "All Employee Dashboard retrieved",
        data: data
    });
}

exports.getAllAppversion =async (req,res)=>{
  
    let appversion = await Appversion.find({}).sort({createdAt:-1}).limit(1);

    res.status(200).send({
        status:"success",
        message : "All Appversion retrieved",
        data: appversion
    });
  }