const db = require("../models");
const {
    trainingGlimpse: TrainingGlimpse
} = db;
var nodemailer = require('nodemailer');
const path = require('path')

exports.create = (req, res) => {
    const trainingGlimpse = new TrainingGlimpse(req.body);

    trainingGlimpse.save((err, data) => {
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
            message: "TrainingGlimpse created successfully!"
        });
    });
};

exports.get = async (req, res) => {
    let trainingGlimpse = await TrainingGlimpse.find({}).sort({createdAt:-1});
    res.status(200).send({
        status: "success",
        message: "All TrainingGlimpses retrieved",
        data: trainingGlimpse
    });
}

exports.single = async (req, res) => {
    let trainingGlimpse = await TrainingGlimpse.findById(req.params.id);
    res.status(200).send({
        status: "success",
        message: "Single TrainingGlimpse retrieved",
        data: trainingGlimpse
    });
}

exports.update = async (req, res) => {
    TrainingGlimpse.findByIdAndUpdate(req.params.id,{$set:req.body}, (err, data) => {
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
            message: "TrainingGlimpse successfully Updated",
        });
    });
}

exports.delete = async (req, res) => {
    TrainingGlimpse.findByIdAndDelete(req.params.id, (err, data) => {
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
            message: "TrainingGlimpse successfully Deleted",
        });
    });
}
