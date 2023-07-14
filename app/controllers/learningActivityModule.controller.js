const db = require("../models");
const {
    learningActivityModule: LearningActivityModule
} = db;
var nodemailer = require('nodemailer');
const path = require('path');
const LearningActivityWatch = require("../models/learningActivityWatch.model");
const { default: mongoose } = require("mongoose");

exports.create = (req, res) => {
    const learningActivityModule = new LearningActivityModule(req.body);

    learningActivityModule.save((err, data) => {
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
            status: 'success',
            message: "LearningActivityModule created successfully!"
        });
    });
};

exports.get = async (req, res) => {
    let learningActivityModule = await LearningActivityModule.find({}).sort({createdAt:-1});
    res.status(200).send({
        status: "success",
        message: "All LearningActivityModules retrieved",
        data: learningActivityModule
    });
}

exports.getByProgramCourseModuleEmp = async (req, res) => {
    let learningActivityModule = await LearningActivityModule.find({
        courseId:req.params.courseId,
        moduleId:req.params.moduleId,
        programId:req.params.programId,
        employeeId:req.params.empId
    }).sort({createdAt:-1});
    console.log(learningActivityModule)
    res.status(200).send({
        status: "success",
        message: "All LearningActivityModules retrieved",
        data: learningActivityModule
    });
}

exports.single = async (req, res) => {
    let learningActivityModule = await LearningActivityModule.findById(req.params.id);
    res.status(200).send({
        status: "success",
        message: "Single LearningActivityModule retrieved",
        data: learningActivityModule
    });
}

exports.getByEmpCount = async (req, res) => {
    
  
  
  }

exports.update = async (req, res) => {
    LearningActivityModule.findByIdAndUpdate(req.params.id,{$set:req.body}, (err, data) => {
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
            message: "LearningActivityModule successfully Updated",
        });
    });
}

exports.delete = async (req, res) => {
    LearningActivityModule.findByIdAndDelete(req.params.id, (err, data) => {
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
            message: "LearningActivityModule successfully Deleted",
        });
    });
}
