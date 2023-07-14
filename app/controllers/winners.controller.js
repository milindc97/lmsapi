
const db = require("../models");
const { winners: Winners} = db;
const mongoose = require("mongoose");
const moment = require('moment-timezone');

exports.getWinners = async (req,res)=>{
    let winners = await Winners.find({quizLiveDate:{$lte:moment().tz('Asia/Kolkata')}}).populate("programId").populate("quizId")
    .populate("winners.employeeId").populate("winners.quizScoreId").sort({quizLiveDate:-1});
    res.status(200).send({
        status:"success",
        message : "Top 10 Winners retrieved",
        data: winners[0]
    });
}

exports.getAllWinners = async (req,res)=>{
    let winners = await Winners.find({}).populate("programId").populate("quizId")
    .populate("winners.employeeId").populate("winners.quizScoreId").sort({quizLiveDate:-1});
    res.status(200).send({
        status:"success",
        message : "Top 10 Winners retrieved",
        data: winners
    });
}

exports.getAllWinnersByProgramAndQuiz = async (req,res)=>{
    let winners = await Winners.find({programId:req.params.programId,quizId:req.params.quizId}).populate("programId").populate("quizId")
    .populate("winners.employeeId").populate("winners.quizScoreId");
    res.status(200).send({
        status:"success",
        message : "Top 10 Winners retrieved",
        data: winners[0]
    });
}