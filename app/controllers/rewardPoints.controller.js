const db = require("../models");
const {
    rewardPoints: RewardPoints
} = db;
var nodemailer = require('nodemailer');
const path = require('path')

exports.create = (req, res) => {
    const rewardPoints = new RewardPoints(req.body);

    rewardPoints.save((err, data) => {
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
            message: "RewardPoints created successfully!"
        });
    });
};

exports.get = async (req, res) => {
    let rewardPoints = await RewardPoints.find({}).sort({createdAt:-1});
    res.status(200).send({
        status: "success",
        message: "All RewardPointss retrieved",
        data: rewardPoints
    });
}

exports.getByEmp = async (req, res) => {
    let rewardPoints = await RewardPoints.find({employeeId:req.params.id}).sort({createdAt:-1});
    res.status(200).send({
        status: "success",
        message: "All RewardPointss retrieved",
        data: rewardPoints
    });
}

exports.getTotalByEmp = async (req, res) => {
    let cRewardPointsData = await RewardPoints.find({employeeId:req.params.id,type:"credit"}).sort({createdAt:-1});
    let dRewardPointsData = await RewardPoints.find({employeeId:req.params.id,type:"debit"}).sort({createdAt:-1});
    let total = 0;
    let cRewardPoints=0;
    let dRewardPoints=0;
    
    for(let i in cRewardPointsData){
        cRewardPoints += cRewardPointsData[i].points;
    }
    for(let i in dRewardPointsData){
        dRewardPoints += dRewardPointsData[i].points;
    }
    total = cRewardPoints - dRewardPoints;
    res.status(200).send({
        status: "success",
        message: "All RewardPointss retrieved",
        data: total
    });
}

exports.single = async (req, res) => {
    let rewardPoints = await RewardPoints.findById(req.params.id);
    res.status(200).send({
        status: "success",
        message: "Single RewardPoints retrieved",
        data: rewardPoints
    });
}

exports.update = async (req, res) => {
    RewardPoints.findByIdAndUpdate(req.params.id,{$set:req.body}, (err, data) => {
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
            message: "RewardPoints successfully Updated",
        });
    });
}

exports.delete = async (req, res) => {
    RewardPoints.findByIdAndDelete(req.params.id, (err, data) => {
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
            message: "RewardPoints successfully Deleted",
        });
    });
}
