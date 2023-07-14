const db = require("../models");
const {
    questionBank: QuestionBank,
    question: Question
} = db;

const agenda = require("../../agenda.js");
const moment = require('moment-timezone');


exports.createQuestionBank = (req, res) => {
    const questionBank = new QuestionBank({
        code: req.body.code,
        title: req.body.title,
        keywords: req.body.keywords,
        description: req.body.description,
        quizTime: req.body.quizTime,
        questionsCount: req.body.questionsCount,
        status: req.body.status,
        fusionBank: req.body.fusionBank,
        isLearningActivity: req.body.isLearningActivity,
        expiryDate: req.body.expiryDate,
        learningLiveDate: req.body.learningLiveDate,
        thumbnail: req.body.thumbnail
    });

    QuestionBank.find({
        code: req.body.code
    }, (err, dt) => {
        if (dt.length > 0) {
            res.status(200).send({
                status: "error",
                message: "Code Already Exist"
            });
        } else {
            questionBank.save(async (err, data) => {
                if (err) {
                    res.status(500).send({
                        status: "error",
                        message: err
                    });
                    return;
                } else {
                    if (req.body.isLearningActivity) {

                        const liveDate30 = moment(req.body.learningLiveDate).tz('Asia/Kolkata').add(30, 'minutes');
                        const liveDate180 = moment(req.body.learningLiveDate).tz('Asia/Kolkata').add(180, 'minutes');

                        const live30Date = moment.tz(liveDate30, 'Asia/Kolkata');
                        const live180Date = moment.tz(liveDate180, 'Asia/Kolkata');
                        await agenda.schedule(live30Date, 'top10Result', {
                            quiz: data._id.toString()
                        });
                        await agenda.schedule(live180Date, 'top100Result', {
                            quiz: data._id.toString()
                        });
                    }
                    res.status(200).send({
                        status: "success",
                        message: "Question Bank created successfully",
                        data: data
                    });
                }
            });
        }
    });
};

exports.updateQuestionBank = (req, res) => {
    QuestionBank.findByIdAndUpdate(req.params.id, {
        $set: {
            title: req.body.title,
            keywords: req.body.keywords,
            description: req.body.description,
            quizTime: req.body.quizTime,
            questionsCount: req.body.questionsCount,
            status: req.body.status,
            fusionBank: req.body.fusionBank,
            isLearningActivity: req.body.isLearningActivity,
            expiryDate: req.body.expiryDate,
            learningLiveDate: req.body.learningLiveDate,
            thumbnail: req.body.thumbnail
        }
    }, async (err, data) => {
        if (err) {
            res.status(500).send({
                status: "error",
                message: err
            });
        } else {
            if (req.body.isLearningActivity) {
                const jobs = await agenda.jobs({
                    $or:[{name: "top10Result"},{name:"top100Result"}],
                    "data.quiz": req.params.id.toString()
                });
                if (jobs.length == 0) {
                    const liveDate30 = moment(req.body.learningLiveDate).tz('Asia/Kolkata').add(30, 'minutes');
                    const liveDate180 = moment(req.body.learningLiveDate).tz('Asia/Kolkata').add(180, 'minutes');

                    const live30Date = moment.tz(liveDate30, 'Asia/Kolkata');
                    const live180Date = moment.tz(liveDate180, 'Asia/Kolkata');
                    await agenda.schedule(live30Date, 'top10Result', {
                        quiz: req.params.id.toString()
                    });
                    await agenda.schedule(live180Date, 'top100Result', {
                        quiz: req.params.id.toString()
                    });
                } else {
                    const numRemoved = await agenda.cancel({$or:[{name: "top10Result"},{name:"top100Result"}],"data.quiz": req.params.id.toString() });
                    const liveDate30 = moment(req.body.learningLiveDate).tz('Asia/Kolkata').add(30, 'minutes');
                    const liveDate180 = moment(req.body.learningLiveDate).tz('Asia/Kolkata').add(180, 'minutes');

                    const live30Date = moment.tz(liveDate30, 'Asia/Kolkata');
                    const live180Date = moment.tz(liveDate180, 'Asia/Kolkata');
                    await agenda.schedule(live30Date, 'top10Result', {
                        quiz: req.params.id
                    });
                    await agenda.schedule(live180Date, 'top100Result', {
                        quiz: req.params.id
                    });
                }
            }
            res.status(200).send({
                status: "success",
                message: "Question Bank updated successfully",
                data: data
            });
        }
    });
}

exports.getSingleQuestionBank = (req, res) => {
    QuestionBank.findById(req.params.id, (err, data) => {
        if (err) {
            res.status(500).send({
                status: "error",
                message: err
            });
        } else {
            res.status(200).send({
                status: "success",
                message: "Single Question Bank retrieved",
                data: data
            });
        }
    });
}

exports.getAllQuestionBank = (req, res) => {
    QuestionBank.find({
        isLearningActivity: false
    }, (err, data) => {
        if (err) {
            res.status(500).send({
                status: "error",
                message: err
            });
        } else {
            res.status(200).send({
                status: "success",
                message: "All Question Bank retrieved",
                data: data
            });
        }
    }).sort({
        "createdAt": -1
    });
}

exports.getAll = (req, res) => {
    QuestionBank.find({}, (err, data) => {
        if (err) {
            res.status(500).send({
                status: "error",
                message: err
            });
        } else {
            res.status(200).send({
                status: "success",
                message: "All Question Bank retrieved",
                data: data
            });
        }
    }).sort({
        "createdAt": -1
    });
}

exports.getAllActiveQuestionBank = (req, res) => {
    QuestionBank.find({
        status: 1,
        isLearningActivity: false
    }, (err, data) => {
        if (err) {
            res.status(500).send({
                status: "error",
                message: err
            });
        } else {
            res.status(200).send({
                status: "success",
                message: "All Question Bank retrieved",
                data: data
            });
        }
    });
}

exports.getAllInactiveQuestionBank = (req, res) => {
    QuestionBank.find({
        status: 0,
        isLearningActivity: false
    }, (err, data) => {
        if (err) {
            res.status(500).send({
                status: "error",
                message: err
            });
        } else {
            res.status(200).send({
                status: "success",
                message: "All Question Bank retrieved",
                data: data
            });
        }
    });
}

exports.getQuestionBankIncrementalCode = (req, res) => {
    QuestionBank.count((err, data) => {
        if (data == 0) {
            res.status(200).send({
                status: "success",
                message: "Incremental Code Created",
                data: {
                    code: 1
                }
            });
        } else {
            QuestionBank.findOne({}).sort('-code').exec(function (err, data) {
                if (err) {
                    res.status(500).send({
                        status: "error",
                        message: err
                    });
                } else {
                    let code = {
                        code: data.code + 1
                    };
                    res.status(200).send({
                        status: "success",
                        message: "Incremental Code Created",
                        data: code
                    });
                }
            });
        }
    });
}


exports.deleteQuestionBank = (req, res) => {
    QuestionBank.findByIdAndRemove(req.params.id, (err, data) => {
        if (err) {
            res.status(500).send({
                status: "error",
                message: err
            });
        } else {
            res.status(200).send({
                status: "success",
                message: "Question Bank Deleted Successfully"
            });
        }
    });
}

exports.updateStatusQuestionBank = (req, res) => {
    if (req.body.status == 1) {
        QuestionBank.findById(req.params.id, (err, qbData) => {
            Question.find({
                questionBankId: req.params.id
            }, (err, qData) => {
                if (err) {
                    res.status(500).send({
                        status: "error",
                        message: err
                    });
                } else {
                    if (qbData.questionsCount <= qData.length && qbData.quizTime !== 0) {
                        QuestionBank.findByIdAndUpdate(req.params.id, {
                            $set: {
                                status: req.body.status
                            }
                        }, (err, data) => {
                            if (err) {
                                res.status(200).send({
                                    status: "error",
                                    message: err
                                });
                            } else {
                                res.status(200).send({
                                    status: "success",
                                    message: "Question Bank status successfully",
                                    data: data
                                });
                            }
                        });

                    } else {
                        res.status(200).send({
                            status: "error",
                            message: "Please check questions count and quiz time."
                        });
                    }
                }
            });

        })
    } else {
        QuestionBank.findByIdAndUpdate(req.params.id, {
            $set: {
                status: req.body.status
            }
        }, (err, data) => {
            if (err) {
                res.status(200).send({
                    status: "error",
                    message: err
                });
            } else {
                res.status(200).send({
                    status: "error",
                    message: "Question Bank status successfully",
                    data: data
                });
            }
        });
    }

}

exports.getAllQuestionBankLearningActivity = (req, res) => {
    QuestionBank.find({
        isLearningActivity: true
    }, (err, data) => {
        if (err) {
            res.status(500).send({
                status: "error",
                message: err
            });
        } else {
            res.status(200).send({
                status: "success",
                message: "All Question Bank retrieved",
                data: data
            });
        }
    }).sort({
        "createdAt": -1
    });
}

exports.getAllActiveQuestionBankLearningActivity = (req, res) => {
    QuestionBank.find({
        status: 1,
        isLearningActivity: true
    }, (err, data) => {
        if (err) {
            res.status(500).send({
                status: "error",
                message: err
            });
        } else {
            res.status(200).send({
                status: "success",
                message: "All Question Bank retrieved",
                data: data
            });
        }
    });
}

exports.getAllInactiveQuestionBankLearningActivity = (req, res) => {
    QuestionBank.find({
        status: 0,
        isLearningActivity: true
    }, (err, data) => {
        if (err) {
            res.status(500).send({
                status: "error",
                message: err
            });
        } else {
            res.status(200).send({
                status: "success",
                message: "All Question Bank retrieved",
                data: data
            });
        }
    });
}

exports.getRecentlyOpenedQuiz = async (req, res) => {
    if (req.params.count == 10) {
        let questionBank = await QuestionBank.find({
            status: 1,
            isLearningActivity: true,
            learningLiveDate: {
                $lte: moment().tz('Asia/Kolkata')
            }
        }).sort({
            learningLiveDate: -1
        });
        let data = false;
        const liveDate = moment(questionBank[0].learningLiveDate).tz('Asia/Kolkata');
        const liveDate30 = moment(questionBank[0].learningLiveDate).tz('Asia/Kolkata').add(30, 'minutes');
        const date = moment().tz('Asia/Kolkata');
        if (liveDate30 > date && date > liveDate) {
            data = true;
        }
        res.status(200).send({
            status: "success",
            message: "All Question Bank retrieved",
            data: data,
            quiz: questionBank[0],
            resultTime: liveDate30
        });
    } else {
        let questionBank = await QuestionBank.find({
            status: 1,
            isLearningActivity: true,
            learningLiveDate: {
                $lte: moment().tz('Asia/Kolkata')
            }
        }).sort({
            learningLiveDate: -1
        });
        let data = false;
        const liveDate = moment(questionBank[0].learningLiveDate).tz('Asia/Kolkata');
        const liveDate180 = moment(questionBank[0].learningLiveDate).tz('Asia/Kolkata').add(180, 'minutes');
        const date = moment().tz('Asia/Kolkata');
        if (liveDate180 > date && date > liveDate) {
            data = true;
        }
        res.status(200).send({
            status: "success",
            message: "All Question Bank retrieved",
            data: data,
            quiz: questionBank[0],
            resultTime: liveDate180
        });
    }

}