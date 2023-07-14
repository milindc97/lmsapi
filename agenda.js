const Agenda = require("agenda");
const db = require("./app/models");
const _ = require('lodash');

const {
    questionBank: QuestionBank,
    question: Question,
    winner: Winner,
    learningActivityModule: LearningActivityModule,
    winners: Winners,
    user: User,
    group: Group,
    notificationTrans: NotificationTrans,
    course:Courses,
    programsWatch:ProgramsWatch,
    program:Program,
    allocation:Allocation,
    learningActivityWatch:LearningActivityWatch,
    module:Modules,
    coursesWatch:CoursesWatch,
    modulesWatch:ModulesWatch,
    quizScore:QuizScore
} = db;
const moment = require('moment-timezone');

const agenda = new Agenda().mongo(db.mongoose.connection);

agenda.define("top10Result", async (job) => {
    let quiz = await QuestionBank.find({
        isLearningActivity: true,
        status: 1,
        learningLiveDate: {
            $lte: moment().tz('Asia/Kolkata')
        }
    }).sort({
        learningLiveDate: -1
    });
    const learningLiveDate = moment(quiz[0].learningLiveDate).tz('Asia/Kolkata');
    const liveDate = moment(quiz[0].learningLiveDate).tz('Asia/Kolkata').add(30, 'minutes');
    let data = [];
    let finaldata = [];
    let learningActivityModule = await LearningActivityModule.find({
        questionbank: quiz[0]._id
    });
    let pData = _.groupBy(learningActivityModule, function (item) {
        return item.programId;
    });
    let count = 0;
    for (let i in pData) {
        pData[count] = _.groupBy(pData[i], function (item) {
            return item.employeeId;
        });
        count++;
        data = pData[i];
        break;
    }

    for (let i = 0; i < data.length; i++) {
        const examEndTime = moment(data[i].createdAt).tz('Asia/Kolkata');
        if (data[i].quizScore >= 70 && (liveDate > examEndTime && examEndTime > learningLiveDate)) {
            finaldata.push(data[i]);
        }
    }
    finaldata.sort(function (a, b) {
        if (a.quizScore > b.quizScore) return -1;
        if (a.quizScore < b.quizScore) return 1;

        if (a.examTime > b.examTime) return 1;
        if (a.examTime < b.examTime) return -1;

    });
    let employees = [];
    finaldata.map(fData => {
        if (employees.length < 10) {
            employees.push({
                employeeId: fData.employeeId,
                quizScoreId: fData.quizReference,
                quizScore: fData.quizScore,
                examTime: fData.examTime,
                top10: true
            });
        }
    });
    if (finaldata.length > 0) {
        if (await Winners.find({
                quizId: quiz[0]._id,
                programId: finaldata[0]?.programId,
                top10: true
            }).countDocuments() == 0) {
            const winnersData = new Winners({
                quizId: quiz[0]._id,
                quizLiveDate: learningLiveDate,
                programId: finaldata[0].programId,
                winners: employees,
                top10: true
            })
            winnersData.save();
        }
    } else {
        if (await Winners.find({
                quizId: quiz[0]._id,
                programId: data[0]?.programId,
                top10: true
            }).countDocuments() == 0) {
            const winnersData = new Winners({
                quizId: quiz[0]._id,
                quizLiveDate: learningLiveDate,
                programId: data[0].programId,
                winners: employees,
                top10: true
            })
            winnersData.save();
        }
    }
});

agenda.define("top100Result", async (job) => {
    let quiz = await QuestionBank.find({
        isLearningActivity: true,
        status: 1,
        learningLiveDate: {
            $lte: moment().tz('Asia/Kolkata')
        }
    }).sort({
        learningLiveDate: -1
    });
    const learningLiveDate = moment(quiz[0].learningLiveDate).tz('Asia/Kolkata');
    const liveDate = moment(quiz[0].learningLiveDate).tz('Asia/Kolkata').add(180, 'minutes');
    let data = [];
    let finaldata = [];
    let learningActivityModule = await LearningActivityModule.find({
        questionbank: quiz[0]._id
    });
    let pData = _.groupBy(learningActivityModule, function (item) {
        return item.programId;
    });
    let count = 0;
    for (let i in pData) {
        pData[count] = _.groupBy(pData[i], function (item) {
            return item.employeeId;
        });
        count++;
        data = pData[i];
        break;
    }
    data.map(examT => {
        const examEndTime = moment(examT.createdAt).tz('Asia/Kolkata');
        if (liveDate > examEndTime && examEndTime > learningLiveDate) {
            finaldata.push(examT);
        }
    });
    finaldata.sort(function (a, b) {
        if (a.quizScore > b.quizScore) return -1;
        if (a.quizScore < b.quizScore) return 1;

        if (a.examTime > b.examTime) return 1;
        if (a.examTime < b.examTime) return -1;

    });
    if (finaldata.length > 0 && await Winners.find({
            quizId: quiz[0]._id,
            programId: finaldata[0].programId,
            top100: true
        }).countDocuments() == 0) {
        let winners = await Winners.find({
            quizId: quiz[0]._id,
            programId: finaldata[0].programId,
            top10: true
        });
        if (winners.length > 0) {
            let top10 = winners[0]?.winners;
            let top100 = [];
            top100 = top10;
            Promise.all(finaldata.map(fData => {
                let empIndex = top100.map((res) => {
                    return res.employeeId.toString();
                }).indexOf(fData.employeeId.toString());
                if (empIndex == -1) {
                    if (top100.length < 100) {
                        top100.push({
                            employeeId: fData.employeeId,
                            quizScoreId: fData.quizReference,
                            quizScore: fData.quizScore,
                            examTime: fData.examTime,
                            top100: true
                        });
                    }
                }
            }));
            await Winners.findByIdAndUpdate(winners[0]._id, {
                $set: {
                    winners: top100,
                    top100: true
                }
            });
        }
    }
});

agenda.define("userImport", async (job) => {
    let dataArray = JSON.parse(job.attrs.data.data)
    let userData = JSON.parse(job.attrs.data.userdata);
    for (let i = 0; i < dataArray.length; i++) {
        console.log(i);
        dataArray[i].activeWallApproval = (dataArray[i].activeWallApproval == 'true' || dataArray[i].activeWallApproval == 'TRUE' || dataArray[i].activeWallApproval == true)?true : false;
        dataArray[i].status = (dataArray[i].status == 'Active' || dataArray[i].status == 'active' || dataArray[i].status == 1)?1 : 0;
        if (dataArray[i].group !== "" && dataArray[i].group !== undefined && dataArray[i].group !== null) {
            let g = dataArray[i].group.replace("G", "");
            let group = await Group.find({
                code: g
            }).limit(1).exec();
            await User.findOneAndUpdate({
                employeeCode: dataArray[i].employeeCode
            }, {
                $set: {
                    group: group[0]._id,
                    activeWallApproval: Boolean(dataArray[i].activeWallApproval)
                }
            });
        } else {
            await User.findOneAndUpdate({
                employeeCode: dataArray[i].employeeCode
            }, {
                $set: {
                    group: null,
                    activeWallApproval: Boolean(dataArray[i].activeWallApproval)
                }
            });
        }

        if (i == dataArray.length - 1) {
            let notData = {
                userId: userData._id,
                title: "Employee Import Completed",
                message: "Great! Employee data has been updated.",
                createdAt: moment().tz('Asia/Kolkata'),
                status: 0
            };
            await NotificationTrans.create(notData);
        }
    }
})

agenda.define("programAllocation", async (job) => {
    let allData = JSON.parse(job.attrs.data.data);
    let userData = JSON.parse(job.attrs.data.userdata);
    let data = [];
    let assignedProgram = [];
    for (const employee of allData.employeeData) {
        for (const program of allData.assignedPrograms) {
            let courses = await Promise.all(program.courses.map(async (res) => {
                let mod = await Courses.findById(res.courseId._id);
                mod.modules.sort((a, b) => a.index - b.index);
                mod.modules[0].unlock = true;
                return {
                    courseId: res.courseId._id,
                    index: res.index,
                    module: mod.modules
                };
            }));
            if(courses && courses.length > 0) {
              courses.sort((a, b) => a.index - b.index);
              courses[0].unlock = true;
            }
            assignedProgram.push({
              programId: program._id,
              index: allData.assignedPrograms.indexOf(program),
              isLearningActivity: program.isLearningActivity,
              employeeId: employee.id,
              courses: courses
          });
        }
    }
    for (let i in allData.employeeData) {
      console.log("Program",i)
        let prgWatch = await ProgramsWatch.find({
            isLearningActivity: false,
            employeeId: allData.employeeData[i].id
        }).sort({
            index: -1
        });
        let empData = _.filter(assignedProgram, function (o) {
            return o.employeeId == allData.employeeData[i].id
        });
        if (prgWatch.length > 0) {
            let index = prgWatch[0].index;
            let unlock = prgWatch[0].unlock;
            for (let j in empData) {
                let programWatch = await ProgramsWatch.find({
                    isLearningActivity: false,
                    programId: empData[j].programId,
                    employeeId: allData.employeeData[i].id
                });
                if (programWatch.length > 0) {
                    data.push(programWatch[0]);
                } else {
                    if (unlock) {

                        if (j == 0 && prgWatch[0].isWatch) {
                            empData[j].unlock = true;
                        } else {
                            empData[j].unlock = false;
                        }
                        index = index + 1;
                        empData[j].index = index;
                        data.push(empData[j]);
                    } else {
                        empData[j].unlock = false;
                        index = index + 1;
                        empData[j].index = index;
                        data.push(empData[j]);
                    }
                }
            }
        } else {
            empData.sort(function (a, b) {
                return a.index - b.index
            });
            for (let j in empData) {
                (j == 0)?empData[j].unlock = true: empData[j].unlock = false;
                data.push(empData[j]);
            }
        }
        if (i == (allData.employeeData.length - 1)) {
            let ops = []
            data.forEach(function (prg) {
                ops.push({
                    "replaceOne": {
                        "filter": {
                            "programId": prg.programId,
                            "employeeId": prg.employeeId,
                        },
                        "replacement": prg,
                        "upsert": true
                    }
                });
            });
            ProgramsWatch.bulkWrite(ops, async function (err, r) {
                let notTrnasAr = [];
                for (let d in data) {
                    let program = await Program.findById(data[d].programId);
                    notTrnasAr.push({
                        userId: data[d].employeeId,
                        title: "New Program Allocation",
                        message: 'New Programme "' + program.title + '" has been assigned, please complete and get certified.',
                        image: program.thumbnail,
                        createdAt: moment().tz('Asia/Kolkata'),
                        status: 0
                    });
                    if (d == (data.length - 1)) {
                        NotificationTrans.insertMany(notTrnasAr);
                        let pData = _.groupBy(assignedProgram, function (item) {
                            return item.programId;
                        });
                        let programs = [];
                        _.forEach(pData, function (value, key) {
                            programs.push(key);
                        });
                        programs.map(async prg => {
                            await Promise.all(allData.employeeData.map(async (emp, index) => {
                                let allocation = await Allocation.find({
                                    "programData.programId": prg,
                                    "employeeData.id": {
                                        $in: [emp.id]
                                    }
                                });
                                if (allocation.length > 0) {
                                    allData.employeeData.splice(index, 1);
                                }
                            }));
                            if(allData.employeeData.length > 0){
                              let allocationData = {
                                allocateBy: allData.type,
                                allocationType: 'Program',
                                "programData.programId": prg,
                                employeeData: allData.employeeData,
                                createdBy: allData.createdBy
                              }
                              const allocation = new Allocation(allocationData);
                              allocation.save()
                              let notData = {
                                userId: userData._id,
                                title: "Program Allocation Completed",
                                message: "Great! Program allocated to employees.",
                                createdAt: moment().tz('Asia/Kolkata'),
                                status: 0
                            };
                            await NotificationTrans.create(notData);
                            }
                        });
                       
                    }
                }
            });
        }
    }
})

agenda.define("learningActivityAllocation", async (job) => {
    let allData = JSON.parse(job.attrs.data.data);
    let userData = JSON.parse(job.attrs.data.userdata);
    let data = [];
    let assignedProgram = [];
    for (const employee of allData.employeeData) {
      for (const program of allData.assignedPrograms) {
        assignedProgram.push({
          programId: program._id,
          employeeId: employee.id
        });
      }
    }
  
    let ops = []
    assignedProgram.forEach(function (prg) {
      ops.push({
        "replaceOne": {
          "filter": {
            "programId": prg.programId,
            "employeeId": prg.employeeId,
          },
          "replacement": prg,
          "upsert": true
        }
      });
    });
    LearningActivityWatch.bulkWrite(ops, async function (err, r) {
      let notTrnasAr = [];
      for (let i in assignedProgram) {
        console.log("Learning Actvitiy",i)
        let program = await Program.findById(assignedProgram[i].programId);
        notTrnasAr.push({
          userId: assignedProgram[i].employeeId,
          title: "New Learning Activity Allocation",
          message: 'New Learning Activity "' + program.title + '" has been assigned, attempt to boost your knowledge and be the winner.',
          image: program.thumbnail,
          createdAt: moment().tz('Asia/Kolkata'),
          status: 0
        });
        if (i == (assignedProgram.length - 1)) {
          NotificationTrans.insertMany(notTrnasAr);
          let pData = _.groupBy(assignedProgram, function (item) {
            return item.programId;
          });
          let programs = [];
          _.forEach(pData, function (value, key) {
            programs.push(key);
          });
          programs.map(async prg=>{
            await Promise.all(allData.employeeData.map(async (emp,index)=>{
              let allocation = await Allocation.find({"programData.programId":prg,"employeeData.id":{ $in:[emp.id]}});
              if(allocation.length > 0){
                allData.employeeData.splice(index,1);
              }
            }));
            if(allData.employeeData.length > 0){
            let allocationData = {
              allocateBy: allData.type,
              allocationType: 'Learning Activity',
              "programData.programId": prg,
              employeeData: allData.employeeData,
              createdBy: allData.createdBy
            }
            const allocation = new Allocation(allocationData);
            allocation.save()
            let notData = {
              userId: userData._id,
              title: "Learning Activity Allocation Completed",
              message: "Great! Learning Activity allocated to employees.",
              createdAt: moment().tz('Asia/Kolkata'),
              status: 0
              };
              await NotificationTrans.create(notData);
          }
          });
          
        }
      }
    });
})

agenda.define("courseAllocation", async (job) => {
    let allData = JSON.parse(job.attrs.data.data);
    let userData = JSON.parse(job.attrs.data.userdata);
    let data = [];
  let assignedProgram = [];
  for (const employee of allData.employeeData) {
    for (const course of allData.assignedCourses) {
      let modules = await Promise.all(course.modules.map(async (res) => {
        let mod = await Modules.findById(res.moduleId._id);
        return { moduleId: res.moduleId._id, index: res.index, questionbank: mod.questionbank };
      }));
      if (modules && modules.length > 0) {
        modules.sort((a, b) => a.index - b.index);
        modules[0].unlock = true;
      }
      assignedProgram.push({
        courseId: course._id,
        index: allData.assignedCourses.indexOf(course),
        isLearningActivity: course.isLearningActivity,
        employeeId: employee.id,
        modules: modules
      });
    }
  }
  for(let i in allData.employeeData){
    console.log("Course",i)
    let courseWatch =  await CoursesWatch.find({employeeId:allData.employeeData[i].id}).sort({index:-1});
    let empData = _.filter(assignedProgram, function(o) {return o.employeeId == allData.employeeData[i].id});
    if(courseWatch.length > 0){
      let index = courseWatch[0].index;
      let unlock = courseWatch[0].unlock;
      for(let j in empData){
        let courWatch = await CoursesWatch.find({courseId:empData[j].courseId,employeeId:allData.employeeData[i].id});
        if(courWatch.length > 0){
          data.push(courWatch[0]);
        }else{
          if(unlock){
            if(j == 0 && courseWatch[0].isWatch){
              empData[j].unlock = true;
            }else{
              empData[j].unlock = false;
            }
            index = index +1;
            empData[j].index = index;
            data.push(empData[j]);
          }else{
            empData[j].unlock = false;
            index = index +1;
            empData[j].index = index;
            data.push(empData[j]);
          }
        }
      }
    }else{
      empData.sort(function(a, b){return a.index - b.index});
      for(let j in empData){
        (j == 0)?empData[j].unlock = true:empData[j].unlock = false;
        data.push(empData[j]);
      }
    }
    if(i == (allData.employeeData.length - 1)){
      let ops = []
      data.forEach(function (prg) {
          ops.push({
              "replaceOne": {
                  "filter": {
                      "courseId": prg.courseId,
                      "employeeId": prg.employeeId
                  },
                  "replacement": prg,
                  "upsert": true
              }
          });
      });
      CoursesWatch.bulkWrite(ops, async function (err, r) {
        let notTrnasAr = [];
        for (let i in data) {
            let course = await Courses.findById(data[i].courseId);
            notTrnasAr.push({
                userId: data[i].employeeId,
                title: "New Course Allocation",
                message: 'New Course "'+course.title+'" has been assigned, please complete and get certified.',
                image: course.thumbnail,
                createdAt: moment().tz('Asia/Kolkata'),
                status: 0
            });


            if (i == (data.length - 1)) {
                NotificationTrans.insertMany(notTrnasAr);
                let cData = _.groupBy(assignedProgram, function (item) {
                    return item.courseId;
                });
                let courses = [];
                _.forEach(cData, function (value, key) {
                    courses.push(key);
                });
                courses.map(async cour=>{
                    await Promise.all(allData.employeeData.map(async (emp,index)=>{
                    let allocation = await Allocation.find({"courseData.courseId":cour,"employeeData.id":{ $in:[emp.id]}});
                    if(allocation.length > 0){
                        allData.employeeData.splice(index,1);
                    }
                    }));
                    if(allData.employeeData.length > 0){
                    let allocationData = {
                        allocateBy: allData.type,
                        allocationType: 'Course',
                        "courseData.courseId": cour,
                        employeeData: allData.employeeData,
                        createdBy: allData.createdBy
                    }
                    const allocation = new Allocation(allocationData);
                    allocation.save()
                    let notData = {
                      userId: userData._id,
                      title: "Course Allocation Completed",
                      message: "Great! Course allocated to employees.",
                      createdAt: moment().tz('Asia/Kolkata'),
                      status: 0
                      };
                      await NotificationTrans.create(notData);
                  }
                });
                
            }
        }


      });
    }
  }
})

agenda.define("moduleAllocation", async (job) => {
    let allData = JSON.parse(job.attrs.data.data);
    let userData = JSON.parse(job.attrs.data.userdata);
    let data = [];
  let assignedProgram = [];
  for (const employee of allData.employeeData) {
    for (const module of allData.assignedModules) {
      assignedProgram.push({
        moduleId: module._id,
        index: allData.assignedModules.indexOf(module),
        employeeId: employee.id,
        questionbank: module.questionbank
      });
    }
  }
  for (let i in allData.employeeData) {
    console.log("Module",i)
    let modulesWatch = await ModulesWatch.find({
      employeeId: allData.employeeData[i].id
    }).sort({
      index: -1
    });
    let empData = _.filter(assignedProgram, function (o) {
      return o.employeeId == allData.employeeData[i].id
    });
    if (modulesWatch.length > 0) {
      let index = modulesWatch[0].index;
      let unlock = modulesWatch[0].unlock;
      for (let j in empData) {
        let mWatch = await ModulesWatch.find({
          moduleId: empData[j].moduleId,
          employeeId: allData.employeeData[i].id
        });
        if (mWatch.length > 0) {
          data.push(mWatch[0]);
        } else {
          if (unlock) {
            if (j == 0 && modulesWatch[0].isWatch) {
              empData[j].unlock = true;
            } else {
              empData[j].unlock = false;
            }
            index = index + 1;
            empData[j].index = index;
            data.push(empData[j]);
          } else {
            empData[j].unlock = false;
            index = index + 1;
            empData[j].index = index;
            data.push(empData[j]);
          }
        }
      }
    } else {
      empData.sort(function (a, b) {
        return a.index - b.index
      });
      for (let j in empData) {
        (j == 0) ? empData[j].unlock = true: empData[j].unlock = false;
        data.push(empData[j]);
      }
    }
    if (i == (allData.employeeData.length - 1)) {
      let ops = []
      data.forEach(function (prg) {
        ops.push({
          "replaceOne": {
            "filter": {
              "moduleId": prg.moduleId,
              "employeeId": prg.employeeId
            },
            "replacement": prg,
            "upsert": true
          }
        });
      });
      ModulesWatch.bulkWrite(ops, async function (err, r) {
          let notTrnasAr = [];
          for (let i in data) {
            let module = await Modules.findById(data[i].moduleId);
            notTrnasAr.push({
              userId: data[i].employeeId,
              title: "New Module Allocation",
              message: 'New Module "' + module.title + '" has been assigned, please complete and get certified.',
              image: module.thumbnail,
              createdAt: moment().tz('Asia/Kolkata'),
              status: 0
            });


            if (i == (data.length - 1)) {
              NotificationTrans.insertMany(notTrnasAr);
              let mData = _.groupBy(assignedProgram, function (item) {
                return item.moduleId;
              });
              let modules = [];
              _.forEach(mData, function (value, key) {
                modules.push(key);
              });
              modules.map(async mod => {
                await Promise.all(allData.employeeData.map(async (emp, index) => {
                  let allocation = await Allocation.find({
                    "moduleData.moduleId": mod,
                    "employeeData.id": {
                      $in: [emp.id]
                    }
                  });
                  if (allocation.length > 0) {
                    allData.employeeData.splice(index, 1);
                  }
                }));
                if(allData.employeeData.length > 0){
                let allocationData = {
                  allocateBy: allData.type,
                  allocationType: 'Module',
                  "moduleData.moduleId": mod,
                  employeeData: allData.employeeData,
                  createdBy: allData.createdBy
                }
                const allocation = new Allocation(allocationData);
                allocation.save()
              }
              let notData = {
                userId: userData._id,
                title: "Module Allocation Completed",
                message: "Great! Module allocated to employees.",
                createdAt: moment().tz('Asia/Kolkata'),
                status: 0
                };
                await NotificationTrans.create(notData);
              });
            }
          }


      });
    }
  }
})

agenda.define("deleteAllocation", async (job) => {
  console.log("In deletion")
  console.log(job.attrs.data);
  let id = job.attrs.data.data;
  let userData = JSON.parse(job.attrs.data.userdata);
  let allocation = await Allocation.findById(id);
    if(allocation.employeeData.length == 0){
        Allocation.findByIdAndDelete(id, (err1, adata) => {
            if (err1) {
                res.status(500).send({
                    error: {
                        status: "error",
                        message: err1
                    }
                });
                return;
            }

            res.status(200).send({
                status: "success",
                message: "Allocation successfully Deleted",
            });
        });
    }
    for (let i in allocation.employeeData) {
        if (allocation.allocationType == 'Program') {
            let prgWatch = await ProgramsWatch.find({
                programId: allocation.programData.programId,
                employeeId: allocation.employeeData[i].id
            });

            const quizRefs = [];
            const unlockProgramIds = new Set();

            for (const prg of prgWatch) {
                for (const course of prg.courses) {
                    for (const mod of course.module) {
                        if (mod.quizReference) {
                            quizRefs.push(mod.quizReference);
                        }
                    }
                }

                if (prg.unlock) {
                    const allPrgByEmp = await ProgramsWatch.find({
                        employeeId: prg.employeeId,
                        isLearningActivity: false
                    }).sort({
                        index: 1
                    });

                    const prIndex = allPrgByEmp.findIndex(p => p._id.equals(prg._id));
                    if (prIndex >= 0 && prIndex < allPrgByEmp.length - 1) {
                        unlockProgramIds.add(allPrgByEmp[prIndex + 1]._id);
                    }
                }
            }

            const removeQuizScores = quizRefs.map(ref => QuizScore.findByIdAndRemove(ref));
            await Promise.all(removeQuizScores);

            const unlockPrograms = Array.from(unlockProgramIds).map(id => ProgramsWatch.findByIdAndUpdate(id, {
                $set: {
                    unlock: true
                }
            }));
            await Promise.all(unlockPrograms);

            const removePrograms = prgWatch.map(prg => ProgramsWatch.findByIdAndRemove(prg._id));
            await Promise.all(removePrograms);
        } else if (allocation.allocationType == 'Course') {
            let courWatch = await CoursesWatch.find({
                courseId: allocation.courseData.courseId,
                employeeId: allocation.employeeData[i].id
            });
            const quizRefs = [];
            const unlockCourseIds = new Set();

            for (const cour of courWatch) {
                for (const mod of cour.modules) {
                    if (mod.quizReference) {
                        quizRefs.push(mod.quizReference);
                    }
                }

                if (cour.unlock) {
                    const allCourByEmp = await CoursesWatch.find({
                        employeeId: cour.employeeId,
                        isLearningActivity: false
                    }).sort({
                        index: 1
                    });

                    const crIndex = allCourByEmp.findIndex(c => c._id.equals(cour._id));
                    if (crIndex >= 0 && crIndex < allCourByEmp.length - 1) {
                        unlockCourseIds.add(allCourByEmp[crIndex + 1]._id);
                    }
                }
            }

            const removeQuizScores = quizRefs.map(ref => QuizScore.findByIdAndRemove(ref));
            await Promise.all(removeQuizScores);

            const unlockCourses = Array.from(unlockCourseIds).map(id => CoursesWatch.findByIdAndUpdate(id, {
                $set: {
                    unlock: true
                }
            }));
            await Promise.all(unlockCourses);

            const removeCourses = courWatch.map(cour => CoursesWatch.findByIdAndRemove(cour._id));
            await Promise.all(removeCourses);

        } else if (allocation.allocationType == 'Module') {
            let modWatch = await ModulesWatch.find({
                moduleId: allocation.moduleData.moduleId,
                employeeId: allocation.employeeData[i].id
            });

            const quizRefs = [];
            const unlockModuleIds = new Set();

            for (const mod of modWatch) {
                if (mod.quizReference) {
                    quizRefs.push(mod.quizReference);  
                }

                if (mod.unlock) {
                    const allModByEmp = await ModulesWatch.find({
                        employeeId: mod.employeeId,
                        isLearningActivity: false
                    }).sort({
                        index: 1
                    });

                    const mrIndex = allModByEmp.findIndex(m => m._id.equals(mod._id));
                    if (mrIndex >= 0 && mrIndex < allModByEmp.length - 1) {
                        unlockModuleIds.add(allModByEmp[mrIndex + 1]._id);
                    }
                }
            }     
            const removeQuizScores = quizRefs.map(ref => QuizScore.findByIdAndRemove(ref));
            await Promise.all(removeQuizScores);

            const unlockModules = Array.from(unlockModuleIds).map(id => ModulesWatch.findByIdAndUpdate(id, {
                $set: {
                    unlock: true
                }
            }));
            await Promise.all(unlockModules);

            const removeModules = modWatch.map(mod => ModulesWatch.findByIdAndRemove(mod._id));
            await Promise.all(removeModules);

        } else if (allocation.allocationType == 'Learning Activity') {
            await LearningActivityWatch.findOneAndDelete({programId: allocation.programData.programId,employeeId: allocation.employeeData[i].id});
            await LearningActivityModule.findOneAndDelete({programId: allocation.programData.programId,employeeId: allocation.employeeData[i].id});
        }
        if(i == (allocation.employeeData.length - 1)){
            await Allocation.findByIdAndDelete(id);
            let notData = {
              userId: userData._id,
              title: "Allocation Deleted Succesfully",
              message: "Great! Allocation deletion process completed",
              createdAt: moment().tz('Asia/Kolkata'),
              status: 0
              };
            await NotificationTrans.create(notData);
        }
    }
})
agenda.start();


module.exports = agenda;