const db = require("../models");
const {
    programAllocation: ProgramAllocation,
    program: Program,
    modulesWatch: ModulesWatch,
    course: Courses,
    module: Module,
    questionBank: QuestionBank,
    notification: Notification,
    notificationTrans: NotificationTrans,
    quizScore: QuizScore,
    user: User
} = db;
const mongoose = require("mongoose");
var nodemailer = require('nodemailer');
const moment = require('moment-timezone');

exports.createBulkProgramAllocation = (req, res) => {

    let ops = []

    req.body.assignedPrograms.forEach(function (prg) {
        ops.push({
            "replaceOne": {
                "filter": {
                    "uniqueId": prg.uniqueId,
                    "employeeId": prg.employeeId,
                    "type": prg.type,
                    "createdAt": prg.createdAt
                },
                "replacement": prg,
                "upsert": true
            }
        });
    });
    ProgramAllocation.bulkWrite(ops, function (err, r) {
        if (err) {
            res.status(500).send({
                status: "error",
                message: err
            });
            return;
        } else {
            // let array = [];
            // req.body.assignedPrograms.map((item) => (item.employeeId,item.type))
            //     .filter((value, index, self) =>{ if(self.indexOf(value) === index){
            //         array.push(req.body.assignedPrograms[index]);
            //     } });
            // for(let i in array){
            //     User.findById(array[i].employeeId,(err,data)=>{
            //         var transporter = nodemailer.createTransport({
            //             host: 'smtp.gmail.com',
            //             port: 465,
            //             secure: true,
            //             auth: {
            //               user: 'lndsupport@fusionmicrofinance.in',
            //               pass: 'Msquare@22'
            //             }
            //           });

            //           var mailOptions = {
            //             from: 'lndsupport@fusionmicrofinance.in',
            //             to: data.email,
            //             subject: 'New ' +array[i].type + ' allocation',
            //             html: '<!DOCTYPE html>\
            //                 <html>\
            //             <body style="margin:10px 15%;">\
            //             <div style="text-align:center;">\
            //             <a href=""><img src="https://fusionmicrofinance.com/wp-content/uploads/2021/10/cropped-FUSION-LOGO.png"/></a>\
            //             <a><img src="https://backlog.com/wp-blog-app/uploads/2019/09/Backlog-An-intro-to-resource-allocation-Blog.png"/></a>\
            //             <h1 style="color:black;font-size:40px;margin-bottom:10px">Learning comes to you.</h1>\
            //             <h3 style="color:black;letter-spacing:0.5px;font-weight:unset">View allocated '+array[i].type+' and attend the quiz for respective modules</h3>\
            //             <a href="https://gurukul.fusionmicrofinance.in/" target="_blank"><button style="background-color:#ffbc2c;color:white;border:unset;\
            //             padding:10px 20px;font-size:20px;margin-top:20px;">Start Learning</button></a>\
            //             </div>\
            //             </body>\
            //             </html>\
            //             '
            //           };

            //           transporter.sendMail(mailOptions, function(error, info){
            //             if (error) {
            //               res.status(500).send({ status:"error", message: error });
            //             } else {
            //                     res.status(200).send({
            //                         status:"success", message : "Mail Sent Successfully",data:info
            //                     });

            //             }
            //           });
            //     });

            // }
            let notTrnasAr = [];
            for (let i in req.body.assignedPrograms) {
                User.findById(req.body.assignedPrograms[i].employeeId, (err, data) => {
                    notTrnasAr.push({
                        userId: req.body.assignedPrograms[i].employeeId,
                        title: "New " + req.body.assignedPrograms[i].type + " Allocation",
                        message: "View new allocated " + req.body.assignedPrograms[i].type + " and attend the quiz for respective modules",
                        image: "",
                        createdAt: moment().tz('Asia/Kolkata'),
                        status: 0
                    });


                    if (i == (req.body.assignedPrograms.length - 1)) {
                        NotificationTrans.insertMany(notTrnasAr);
                        res.status(200).send({
                            status: "success",
                            message: "Program assign successfully",
                            data: r
                        });
                        return;
                    }
                })
            }


        }
    });
}

exports.getAssignedProgramById = (req, res) => {
    ProgramAllocation.find({
        employeeId: req.params.id,
        type: "Program"
    }, (error, qData) => {
        if (error) {
            res.status(500).send({
                status: "error",
                message: error
            });
        } else {
            res.status(200).send({
                status: "success",
                message: "Program Allocation Data retrieved",
                data: qData
            });
        }
    });
}

exports.getAssignedProgramByIdForCalender = (req, res) => {
    const empId = mongoose.Types.ObjectId(req.params.id);
    ProgramAllocation.find({
        employeeId: empId
    }, (error, allData) => {
        if (error) {
            res.status(500).send({
                status: "error",
                message: error
            });
            return;
        }
        let event = [];
        for (i in allData) {
            let date = moment(allData[i].createdAt).tz('Asia/Kolkata');
            if (allData[i].type == "Program") {
                Program.findById(allData[i].uniqueId, (err, data) => {
                    event.push({
                        title: data.title,
                        date: date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2),
                        color: "#7e57c2",
                        type: "Program"
                    })
                })
            } else if (allData[i].type == "Course") {
                Courses.findById(allData[i].uniqueId, (err, data) => {
                    event.push({
                        title: data.title,
                        date: date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2),
                        color: "#ef5350",
                        type: "Course"
                    })
                })
            } else if (allData[i].type == "Module") {
                Module.findById(allData[i].uniqueId, (err, data) => {
                    event.push({
                        title: data.title,
                        date: date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2),
                        color: "#ec407a",
                        type: "Module"
                    })
                })
            } else if (allData[i].type == "Quiz") {
                QuestionBank.findById(allData[i].uniqueId, (err, data) => {
                    event.push({
                        title: data.title,
                        date: date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2),
                        color: "#ab47bc",
                        type: "Quiz"
                    })
                })
            } else {

            }
        }
        setTimeout(() => {
            res.status(200).send({
                data: event
            });
        }, 500);
    });
}

exports.getAssignedProgramByIdForCalenderEmp = (req, res) => {
    const empId = mongoose.Types.ObjectId(req.params.id);
    ProgramAllocation.find({
        employeeId: empId
    }, (error, allData) => {
        if (error) {
            res.status(500).send({
                status: "error",
                message: error
            });
            return;
        }
        let event = [];

        for (i in allData) {
            let date = moment(allData[i].createdAt).tz('Asia/Kolkata');
            let ret = date.format('YYYY-MM-DD');
            let tomorrow = moment(date).add(1, 'day').tz('Asia/Kolkata');
            let ret2 = tomorrow.format('YYYY-MM-DD');
            if (allData[i].type == "Program") {
                Program.findById(allData[i].uniqueId, (err, data) => {
                    event.push({
                        start: ret,
                        end: ret2,
                        display: 'background',
                        color: "#7e57c2"
                    })
                })
            } else if (allData[i].type == "Course") {
                Courses.findById(allData[i].uniqueId, (err, data) => {
                    event.push({
                        start: ret,
                        end: ret2,
                        display: 'background',
                        color: "#ef5350"
                    })
                })
            } else if (allData[i].type == "Module") {
                Module.findById(allData[i].uniqueId, (err, data) => {
                    event.push({
                        start: ret,
                        end: ret2,
                        display: 'background',
                        color: "#ec407a"
                    })
                })
            } else if (allData[i].type == "Quiz") {
                QuestionBank.findById(allData[i].uniqueId, (err, data) => {
                    event.push({
                        start: ret,
                        end: ret2,
                        display: 'background',
                        color: "#ab47bc"
                    })
                })
            } else {

            }
        }
        setTimeout(() => {
            res.status(200).send({
                data: event
            });
        }, 500);
    });
}

exports.getAssignedProgramByIdForCalenderbyDate = (req, res) => {
    const empId = mongoose.Types.ObjectId(req.params.id);
    ProgramAllocation.find({
        employeeId: empId,
        createdAt: {
            $gte: moment(req.params.date1).tz('Asia/Kolkata'),
            $lt: moment(req.params.date2).tz('Asia/Kolkata')
        }
    }, (error, allData) => {
        if (error) {
            res.status(500).send({
                status: "error",
                message: error
            });
            return;
        }
        let event = [];
        for (i in allData) {
            if (allData[i].type == "Program") {
                Program.find({
                    _id: allData[i].uniqueId
                }, (err, data) => {
                        event.push({
                            title: data[0].title,
                            date: req.params.date1,
                            color: "#7e57c2",
                            type: "Program"
                        })
                    
                })
            } else if (allData[i].type == "Course") {
                Courses.findById({
                    _id: allData[i].uniqueId
                }, (err, data) => {
                    event.push({
                        title: data.title,
                        date: req.params.date1,
                        color: "#ef5350",
                        type: "Course"
                    })
                })
            } else if (allData[i].type == "Module") {
                Module.findById({
                    _id: allData[i].uniqueId
                }, (err, data) => {
                    event.push({
                        title: data.title,
                        date: req.params.date1,
                        color: "#ec407a",
                        type: "Module"
                    })
                })
            } else if (allData[i].type == "Quiz") {
                QuestionBank.findById({
                    _id: allData[i].uniqueId
                }, (err, data) => {
                    event.push({
                        title: data.title,
                        date: req.params.date1,
                        color: "#ab47bc",
                        type: "Quiz"
                    })
                })
            } else {

            }
        }
        setTimeout(() => {
            res.status(200).send({
                data: event
            });
        }, 500);
    });
}

exports.getTodayAssignedProgram = (req, res) => {

    const empId = mongoose.Types.ObjectId(req.params.id);
    ProgramAllocation.aggregate([{
            $project: {
                "year": {
                    $year: "$createdAt"
                },
                "month": {
                    $month: "$createdAt"
                },
                "day": {
                    $dayOfMonth: "$createdAt"
                },
                "uniqueId": "$uniqueId",
                "employeeId": "$employeeId",
                "type": "$type"
            }
        }, {
            $match: {
                employeeId: empId,
                type: "Program",
                "year": moment().tz('Asia/Kolkata').year(),
                "month": moment().tz('Asia/Kolkata').month() + 1,
                "day": moment().tz('Asia/Kolkata').date()
            }
        }, {
            $lookup: {
                from: 'programs',
                localField: 'uniqueId',
                foreignField: '_id',
                as: 'programData'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'employeeId',
                foreignField: '_id',
                as: 'usersData'
            }
        }
    ], (err, data) => {
        if (err) {
            res.status(500).send({
                status: "error",
                message: err
            });
        } else {
            res.status(200).send({
                status: "success",
                message: "Program Allocation Data retrieved",
                data: data
            });
        }
    });
}

exports.quizCountForProgram = (req, res) => {
    const empId = mongoose.Types.ObjectId(req.params.id);
    ProgramAllocation.aggregate([{
        $match: {
            employeeId: empId,
            type: "Program"
        }
    }, {
        $lookup: {
            from: "programs",
            localField: "uniqueId",
            foreignField: "_id",
            as: "programDetails"
        }
    }], (err, data) => {
        let quizLength = 0;
        var length = 0;
        for (i in data) {
            if (data[i].programDetails[0] != undefined) {
                quizLength += data[i].programDetails[0].modules.length;
                for (j in data[i].programDetails[0].modules) {

                    Module.findById(data[i].programDetails[0].modules[j].moduleId, (err, modData) => {
                        if(modData != null){
                            const quizId = mongoose.Types.ObjectId(modData.quiz[0].quizId);;
                            QuizScore.find({
                                employeeId: empId,
                                moduleId: modData._id,
                                quizId: quizId
                            }, (err, quizData) => {
                                length += quizData.length;
    
                            })
                        }
                        
                    });
                }
            }
        }
        setTimeout(() => {
            res.status(200).send({
                quizLength: quizLength,
                completedLength: length
            });
        }, 1000)

    })
}

exports.quizCountForCourse = (req, res) => {
    const empId = mongoose.Types.ObjectId(req.params.id);
    ProgramAllocation.aggregate([{
        $match: {
            employeeId: empId,
            type: "Course"
        }
    }, {
        $lookup: {
            from: "courses",
            localField: "uniqueId",
            foreignField: "_id",
            as: "courseDetails"
        }
    }], (err, data) => {
        let quizLength = 0;
        var length = 0;
        for (i in data) {
            if (data[i].courseDetails[0] != undefined) {
                quizLength += data[i].courseDetails[0].modules.length;
                for (j in data[i].courseDetails[0].modules) {
                    Module.findById(data[i].courseDetails[0].modules[j].moduleId, (err, modData) => {
                        if(modData != null){
                            if (modData.quiz.length > 0) {
                                QuizScore.find({
                                    employeeId: empId,
                                    moduleId: modData._id,
                                    quizId: modData.quiz[0].quizId
                                }, (err, quizData) => {
                                    length += quizData.length;
    
                                })
                            }
                        }
                        

                    });
                }
            }

        }
        setTimeout(() => {
            res.status(200).send({
                quizLength: quizLength,
                completedLength: length
            });
        }, 1000)

    })
}

exports.quizCountForModule = (req, res) => {
    const empId = mongoose.Types.ObjectId(req.params.id);
    ProgramAllocation.aggregate([{
        $match: {
            employeeId: empId,
            type: "Module"
        }
    }, {
        $lookup: {
            from: "modules",
            localField: "uniqueId",
            foreignField: "_id",
            as: "moduleDetails"
        }
    }], (err, data) => {
        let quizLength = 0;
        var length = 0;
        for (i in data) {
            if (data[i].moduleDetails[0] != undefined) {
                quizLength += data[i].moduleDetails[0].quiz.length;
                if (data[i].moduleDetails[0].quiz.length > 0) {
                    QuizScore.find({
                        employeeId: empId,
                        moduleId: data[i].moduleDetails[0]._id,
                        quizId: data[i].moduleDetails[0].quiz[0].quizId
                    }, (err, quizData) => {
                        length += quizData.length;
                    })
                }
            }
        }
        setTimeout(() => {
            res.status(200).send({
                quizLength: quizLength,
                completedLength: length
            });
        }, 1000)

    })
}

exports.quizCountForQuiz = (req, res) => {
    const empId = mongoose.Types.ObjectId(req.params.id);
    ProgramAllocation.aggregate([{
        $match: {
            employeeId: empId,
            type: "Quiz"
        }
    }, {
        $lookup: {
            from: "questionbanks",
            localField: "uniqueId",
            foreignField: "_id",
            as: "quizDetails"
        }
    }], (err, data) => {
        let length = 0;
        let quizLength = data.length;
        for (i in data) {
            if (data != undefined) {
                QuizScore.find({
                    employeeId: empId,
                    quizId: data[i].quizDetails[0]._id
                }).distinct("quizId", (err, quizData) => {
                    length += quizData.length;
                })
            }
        }
        setTimeout(() => {
            res.status(200).send({
                completedLength: length,
                quizLength: quizLength
            });
        }, 1000)

    })
}

exports.getProgramAllocation = (req, res) => {
    ProgramAllocation.aggregate([{
        $match: {
            type: "Program"
        }
    }, {
        $lookup: {
            from: "programs",
            localField: "uniqueId",
            foreignField: "_id",
            as: "programDetails"
        }
    }, {
        $lookup: {
            from: "users",
            localField: "employeeId",
            foreignField: "_id",
            as: "userDetails"
        }
    }, {
        $sort: {
            createdAt: -1
        }
    }], (error, pAData) => {
        if (error) {
            res.status(500).send({
                status: "error",
                message: error
            });
            return;
        }

        res.status(200).send({
            status: "success",
            message: "Program Allocation Retreived",
            data: pAData
        })

    });
}

exports.getCourseAllocation = (req, res) => {
    ProgramAllocation.aggregate([{
        $match: {
            type: "Course"
        }
    }, {
        $lookup: {
            from: "courses",
            localField: "uniqueId",
            foreignField: "_id",
            as: "courseDetails"
        }
    }, {
        $lookup: {
            from: "users",
            localField: "employeeId",
            foreignField: "_id",
            as: "userDetails"
        }
    }, {
        $sort: {
            createdAt: -1
        }
    }], (error, pAData) => {
        if (error) {
            res.status(500).send({
                status: "error",
                message: error
            });
            return;
        }

        res.status(200).send({
            status: "success",
            message: "Program Allocation Retreived",
            data: pAData
        })

    });
}

exports.getCourseAllocationByCourse = (req, res) => {
    const courseId = mongoose.Types.ObjectId(req.params.id);
    ProgramAllocation.aggregate([{
        $match: {
            type: "Course",
            uniqueId: courseId
        }
    }, {
        $lookup: {
            from: "courses",
            localField: "uniqueId",
            foreignField: "_id",
            as: "courseDetails"
        }
    }, {
        $lookup: {
            from: "users",
            localField: "employeeId",
            foreignField: "_id",
            as: "userDetails"
        }
    }, {
        $sort: {
            createdAt: -1
        }
    }], (error, pAData) => {
        if (error) {
            res.status(500).send({
                status: "error",
                message: error
            });
            return;
        }

        res.status(200).send({
            status: "success",
            message: "Program Allocation Retreived",
            data: pAData
        })

    });
}

exports.getModuleAllocation = (req, res) => {
    ProgramAllocation.aggregate([{
        $match: {
            type: "Module"
        }
    }, {
        $lookup: {
            from: "modules",
            localField: "uniqueId",
            foreignField: "_id",
            as: "moduleDetails"
        }
    }, {
        $lookup: {
            from: "users",
            localField: "employeeId",
            foreignField: "_id",
            as: "userDetails"
        }
    }, {
        $sort: {
            createdAt: -1
        }
    }], (error, pAData) => {
        if (error) {
            res.status(500).send({
                status: "error",
                message: error
            });
            return;
        }

        res.status(200).send({
            status: "success",
            message: "Program Allocation Retreived",
            data: pAData
        })

    });
}

exports.getQuizAllocation = (req, res) => {
    ProgramAllocation.aggregate([{
        $match: {
            type: "Quiz"
        }
    }, {
        $lookup: {
            from: "questionbanks",
            localField: "uniqueId",
            foreignField: "_id",
            as: "quizDetails"
        }
    }, {
        $lookup: {
            from: "users",
            localField: "employeeId",
            foreignField: "_id",
            as: "userDetails"
        }
    },{
        $lookup: {
            from: "quizscores",
            localField: "uniqueId",
            foreignField: "quizId",
            as: "scoreDetails"
        }
    }, {
        $sort: {
            createdAt: -1
        }
    }], (error, pAData) => {
        if (error) {
            res.status(500).send({
                status: "error",
                message: error
            });
            return;
        }

        res.status(200).send({
            status: "success",
            message: "Program Allocation Retreived",
            data: pAData
        })

    });
}

exports.getQuizAllocationByQuiz = (req, res) => {
    const quizId = mongoose.Types.ObjectId(req.params.id);
    ProgramAllocation.aggregate([{
        $match: {
            type: "Quiz",
            uniqueId: quizId
        }
    }, {
        $lookup: {
            from: "questionbanks",
            localField: "uniqueId",
            foreignField: "_id",
            as: "quizDetails"
        }
    }, {
        $lookup: {
            from: "users",
            localField: "employeeId",
            foreignField: "_id",
            as: "userDetails"
        }
    }, {
        $sort: {
            createdAt: -1
        }
    }], (error, pAData) => {
        if (error) {
            res.status(500).send({
                status: "error",
                message: error
            });
            return;
        }

        res.status(200).send({
            status: "success",
            message: "Program Allocation Retreived",
            data: pAData
        })

    });
}

exports.getProgramCompletionStatusByEmp = async (req, res) => {
    let programsData = [];
    let programAllocation = await ProgramAllocation.find({
        employeeId: req.params.id,
        type: "Program"
    }).exec();
    for (let i in programAllocation) {
        let modulesCount = null;
        let modulesWatchedCount = null;
        let moduleWatchTime = null;
        let score = 0;
        let hours = 0;
        let minutes = 0;
        let expiredOn = "";
        let program = await Program.findById(programAllocation[i].uniqueId).exec();
        if (program != undefined) {
            let date = moment(program.expiryDate).tz('Asia/Kolkata');
            if (program.fusionBank == false) {
                if (date >= moment().tz('Asia/Kolkata')) {
                    expiredOn = program.expiryDate;
                } else {
                    expiredOn = "";
                }
            } else {
                expiredOn = "NO";
            }


            modulesCount += program.modules.length;
            let modulesWatch;
            let modules;
            for (let m = 0; m < program.modules.length; m++) {
                modules = await Module.findOne({
                    _id: program.modules[m].moduleId
                }).exec();
                if(modules != null){
                    moduleWatchTime += modules.moduleWatchTime;
                }
                
                modulesWatch = await ModulesWatch.find({
                    employeeId: req.params.id,
                    moduleId: program.modules[m].moduleId
                }).distinct("moduleId").exec();
                modulesWatchedCount += modulesWatch.length;
            }
            if (modulesCount != null && modulesWatchedCount != null && moduleWatchTime != null) {
                hours = Math.trunc(moduleWatchTime / 60);
                minutes = moduleWatchTime % 60;
                score = (modulesWatchedCount / modulesCount) * 100;
                programsData.push({
                    programData: program,
                    expiredOn: expiredOn,
                    score: score.toFixed(),
                    modulesWatchedCount: modulesWatchedCount,
                    modulesCount: modulesCount,
                    hours: hours,
                    minutes: minutes
                });
            }
        }

    }
    res.status(200).send({
        data: programsData
    });
}

exports.getCourseCompletionStatusByEmp = async (req, res) => {
    let cousreData = [];
    const empId = mongoose.Types.ObjectId(req.params.id);
    let courseAllocation = await ProgramAllocation.aggregate([{
        $match: {
            employeeId: empId,
            type: "Course"
        }
    }, {
        $lookup: {
            from: "courses",
            localField: "uniqueId",
            foreignField: "_id",
            as: "courseDetails"
        }
    }]).exec();
    for (let i in courseAllocation) {
        let modulesCount = null;
        let moduleWatchTime = null;
        let modulesWatchedCount = null;
        let score = 0;
        let hours = 0;
        let minutes = 0;

        let expiredOn = "";
        if (courseAllocation[i].courseDetails[0] != undefined) {
            let date = moment(courseAllocation[i].courseDetails[0].expiryDate).tz('Asia/Kolkata');

            if (courseAllocation[i].courseDetails[0].fusionBank == false) {
                if (date >= moment().tz('Asia/Kolkata')) {
                    expiredOn = courseAllocation[i].courseDetails[0].expiryDate;
                } else {
                    expiredOn = "";
                }
            } else {
                expiredOn = "NO";
            }

            modulesCount = courseAllocation[i].courseDetails[0].modules.length;
            let modulesWatch;
            let modules;
            for (k in courseAllocation[i].courseDetails[0].modules) {
                modules = await Module.findOne({
                    _id: courseAllocation[i].courseDetails[0].modules[k].moduleId
                }).exec();
                if(modules != null){
                    moduleWatchTime += modules.moduleWatchTime;
                }
               
                
                modulesWatch = await ModulesWatch.find({
                    employeeId: req.params.id,
                    moduleId: courseAllocation[i].courseDetails[0].modules[k].moduleId
                }).distinct("moduleId").exec();
                modulesWatchedCount += modulesWatch.length;


            }
            if (modulesCount != null && modulesWatchedCount != null && moduleWatchTime != null) {
                hours = Math.trunc(moduleWatchTime / 60);
                minutes = moduleWatchTime % 60;
                score = (modulesWatchedCount / modulesCount) * 100;
                cousreData.push({
                    courseData: courseAllocation[i].courseDetails[0],
                    expiredOn: expiredOn,
                    score: score.toFixed(),
                    modulesWatchedCount: modulesWatchedCount,
                    modulesCount: modulesCount,
                    hours: hours,
                    minutes: minutes
                });

            }

        }

    }

    res.status(200).send({
        data: cousreData
    });
}

exports.getModuleCompletionStatusByEmp = async (req, res) => {
    let cousreData = [];
    const empId = mongoose.Types.ObjectId(req.params.id);
    let courseAllocation = await ProgramAllocation.aggregate([{
        $match: {
            employeeId: empId,
            type: "Module"
        }
    }, {
        $lookup: {
            from: "modules",
            localField: "uniqueId",
            foreignField: "_id",
            as: "moduleDetails"
        }
    }]).exec();
    for (let i in courseAllocation) {
        let modulesCount = null;
        let modulesWatchedCount = null;
        let score = 0;
        let hours = 0;
        let minutes = 0;
        let moduleWatchTime = null;
        let expiredOn = "";
        if (courseAllocation[i].moduleDetails[0] != undefined) {
            let date = moment(courseAllocation[i].moduleDetails[0].expiryDate).tz('Asia/Kolkata');
            if (courseAllocation[i].moduleDetails[0].fusionBank == false) {
                if (date >= moment().tz('Asia/Kolkata')) {
                    expiredOn = courseAllocation[i].moduleDetails[0].expiryDate;
                } else {
                    expiredOn = "";
                }
            } else {
                expiredOn = "NO";
            }
            modulesCount = 1;
            let modulesWatch;
            let modules;
            modules = await Module.findOne({
                _id: courseAllocation[i].moduleDetails[0]._id
            }).exec();
            moduleWatchTime += modules.moduleWatchTime;
            modulesWatch = await ModulesWatch.find({
                employeeId: req.params.id,
                moduleId: courseAllocation[i].moduleDetails[0]._id
            }).distinct("moduleId").exec();
            modulesWatchedCount += modulesWatch.length;
            if (modulesCount != null && modulesWatchedCount != null && moduleWatchTime != null) {
                hours = Math.trunc(moduleWatchTime / 60);
                minutes = moduleWatchTime % 60;
                score = (modulesWatchedCount / modulesCount) * 100;

                cousreData.push({
                    moduleData: courseAllocation[i].moduleDetails[0],
                    expiredOn: expiredOn,
                    score: score.toFixed(),
                    modulesWatchedCount: modulesWatchedCount,
                    modulesCount: modulesCount,
                    hours: hours,
                    minutes: minutes
                });

            }
        }

    }
    res.status(200).send({
        data: cousreData
    });
}


exports.getQuizCompletionStatusByEmp = async (req, res) => {
    let quizData = [];
    const empId = mongoose.Types.ObjectId(req.params.id);
    let courseAllocation = await ProgramAllocation.aggregate([{
        $match: {
            employeeId: empId,
            type: "Quiz"
        }
    }, {
        $lookup: {
            from: "questionbanks",
            localField: "uniqueId",
            foreignField: "_id",
            as: "quizDetails"
        }
    }]).exec();
    for (let i in courseAllocation) {
        let expiredOn = "";
        if (courseAllocation[i].quizDetails[0] != undefined) {
            let date = moment(courseAllocation[i].quizDetails[0].expiryDate).tz('Asia/Kolkata');
            if (courseAllocation[i].quizDetails[0].fusionBank == false) {
                if (date >= moment().tz('Asia/Kolkata')) {
                    expiredOn = courseAllocation[i].quizDetails[0].expiryDate;
                } else {
                    expiredOn = "";
                }
            } else {
                expiredOn = "NO";
            }
            quizData.push({
                quizData: courseAllocation[i],
                expiredOn: expiredOn
            })
        }

    }

    res.status(200).send({
        data: quizData
    });
}

exports.getProgramActivity = async (req, res) => {
    let programArr = [];
    let courseAllocation = await ProgramAllocation.aggregate([{
        $match: {
            type: "Program"
        }
    }, {
        $group: {
            _id: "$uniqueId"
        }
    }, {
        $lookup: {
            from: "programs",
            localField: "_id",
            foreignField: "_id",
            as: "programDetails"
        }
    }]).exec();
    for (let i in courseAllocation) {
        let avg = 0;
        let prgCount = await ProgramAllocation.find({
            uniqueId: courseAllocation[i].programDetails[0]._id,
            type: "Program"
        }).exec();
        let modulesWatchedCount = 0;
        for (let m = 0; m < courseAllocation[i].programDetails[0].modules.length; m++) {
            let modulesWatch = await ModulesWatch.find({
                moduleId: courseAllocation[i].programDetails[0].modules[0].moduleId
            }).distinct("moduleId").exec();
            modulesWatchedCount += modulesWatch.length;
        }

        avg = (modulesWatchedCount / (courseAllocation[i].programDetails[0].modules.length * prgCount.length)) * 100;
        programArr.push({
            programDetails: courseAllocation[i].programDetails[0],
            percentage: avg.toFixed(0),
            modulesWatchedCount: modulesWatchedCount,
            modulesCount: (courseAllocation[i].programDetails[0].modules.length * prgCount.length)
        })

    }
    res.status(200).send({
        data: programArr
    });
}

exports.sendNotificationToAssEmp = (req, res) => {
    const prgId = mongoose.Types.ObjectId(req.params.id);
    ProgramAllocation.aggregate([{
        $match: {
            uniqueId: prgId,
            type: "Program"
        }
    }, {
        $lookup: {
            from: "users",
            localField: "employeeId",
            foreignField: "_id",
            as: "empDetails"
        }
    }], (err, pData) => {
        let notTrnasAr = [];
        for (let i in pData) {
            notTrnasAr.push({
                userId: pData[i].employeeId,
                title: "Reminder",
                message: "Please complete the program",
                image: "",
                createdAt: moment().tz('Asia/Kolkata'),
                status: 0
            });


            if (i == (pData.length - 1)) {
                NotificationTrans.insertMany(notTrnasAr);

                res.status(200).send({
                    status: "success",
                    message: "Notification Created successfully!"
                });
            }
        }
    })
}


exports.deleteAllocation = (req, res) => {
    ProgramAllocation.findByIdAndRemove(req.params.id, (err, data) => {
        if (err) {
            res.status(500).send({
                status: "error",
                message: err
            });
        } else {
            res.status(200).send({
                status: "success",
                message: "Allocation Deleted Successfully"
            });
        }
    });
}