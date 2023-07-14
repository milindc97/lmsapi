const db = require("../models");
const {
    allocation: Allocation,
    programsWatch: ProgramsWatch,
    coursesWatch: CoursesWatch,
    modulesWatch: ModulesWatch,
    quizScore: QuizScore
} = db;
const mongoose = require("mongoose");
const LearningActivityWatch = require("../models/learningActivityWatch.model");
const LearningActivityModule = require("../models/learningActivityModule.model");

const Sentry = require('@sentry/node');

const agenda = require("../../agenda.js");
const moment = require('moment-timezone');

exports.getSingleAllocation = async (req, res) => {
    if(req.params.type == 'Program'){
        let allocation = await Allocation.findById(req.params.id).populate("programData.programId").populate("employeeData.id").populate("createdBy");
        res.status(200).send({
            status: "success",
            message: "Single Allocation retrieved",
            data: allocation
        });
    }else  if(req.params.type == 'Learning Activity'){
        let allocation = await Allocation.findById(req.params.id).populate("programData.programId").populate("employeeData.id").populate("createdBy");
        res.status(200).send({
            status: "success",
            message: "Single Allocation retrieved",
            data: allocation
        });
    }else  if(req.params.type == 'Course'){
        let allocation = await Allocation.findById(req.params.id).populate("courseData.courseId").populate("employeeData.id").populate("createdBy");
        res.status(200).send({
            status: "success",
            message: "Single Allocation retrieved",
            data: allocation
        });
    }else  if(req.params.type == 'Module'){
        let allocation = await Allocation.findById(req.params.id).populate("moduleData.moduleId").populate("employeeData.id").populate("createdBy");
        res.status(200).send({
            status: "success",
            message: "Single Allocation retrieved",
            data: allocation
        });
    }
}

exports.getAllAllocation = async (req, res) => {
    let allocation = await Allocation.find({}).populate("programData.programId").populate("courseData.courseId")
        .populate("moduleData.moduleId").populate("createdBy").sort({
            createdAt: -1
        });
    res.status(200).send({
        status: "success",
        message: "All Allocation retrieved",
        data: allocation
    });
}

exports.update = async (req, res) => {
    Allocation.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, (err, data) => {
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
            message: "Allocation successfully Updated",
        });
    });
}

exports.delete = async (req, res) => {
    try{
        await agenda.now('deleteAllocation',{ data:  req.params.id, userdata: JSON.stringify(req.userData)});
    
        res.status(200).send({
          status: "success",
          message: `Deleted allocation is in progress. Notification will be received once process completed`,
        });
    } catch(error){
        Sentry.captureException(new Error('Error '+ error))
        console.log(error);
    }
}

exports.getAllocation = async (req, res) => {
    let allocation = await Allocation.findById(req.params.id).populate("programData.programId").populate("courseData.courseId")
        .populate("moduleData.moduleId").populate("employeeData.id").populate("createdBy");
    let data = [];
    for (let i in allocation.employeeData) {
        if (allocation.allocationType == 'Program') {
            let programAllocation = await ProgramsWatch.find({
                    programId: allocation.programData?.programId?._id,
                    employeeId: allocation.employeeData[i].id?._id
                }).populate("programId").populate("courses.courseId")
                .populate("courses.module.moduleId").populate("courses.module.questionbank").populate("employeeId");
            data.push(programAllocation[0]);
        } else if (allocation.allocationType == 'Course') {
            let courseAllocation = await CoursesWatch.find({
                    courseId: allocation.courseData?.courseId?._id,
                    employeeId: allocation.employeeData[i].id?._id
                }).populate("courseId").populate("modules.moduleId")
                .populate("modules.questionbank").populate("employeeId");
            data.push(courseAllocation[0]);
        } else if (allocation.allocationType == 'Module') {
            let moduleAllocation = await ModulesWatch.find({
                    moduleId: allocation.moduleData?.moduleId?._id,
                    employeeId: allocation.employeeData[i].id?._id
                }).populate("moduleId").populate("questionbank")
                .populate("employeeId")
            data.push(moduleAllocation[0]);
        }else if(allocation.allocationType == 'Learning Activity'){
            let learningActivityWatchAllocation = await LearningActivityWatch.find({
                programId: allocation.programData?.programId?._id,
                employeeId: allocation.employeeData[i].id?._id
            }).populate("programId").populate("employeeId");
        data.push(learningActivityWatchAllocation[0]);
        }
    }
    res.status(200).send({
        status: "success",
        message: "Single Allocation retrieved",
        data: data
    });
}

exports.deleteSingle = async (req, res) =>{
    await Allocation.findByIdAndDelete(req.params.id);
    res.status(200).send({
        status: "success",
        message: "Deleted Allocation retrieved",
    });
}